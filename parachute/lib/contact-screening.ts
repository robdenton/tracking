/**
 * Contact screening using Google Gemini 2.5 Flash.
 *
 * Classifies each discovered contact as:
 *   "keep"      — real person worth staying in touch with
 *   "skip"      — noise (newsletter, automated service, bot, generic alias)
 *   "uncertain" — ambiguous; needs human review
 *
 * If GEMINI_API_KEY is not set, all contacts are returned as "uncertain".
 * Any API or parse error also falls back gracefully to "uncertain".
 */

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

const BATCH_SIZE = 50

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContactToScreen {
  id: string
  name?: string | null
  email?: string | null
  phone?: string | null
  source: string // "gmail" | "whatsapp"
  messageCount: number
}

export interface ScreeningResult {
  id: string
  status: "keep" | "skip" | "uncertain"
  reason: string // ≤15-word explanation shown on card
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are screening discovered contacts for a personal relationship manager (CRM).

Classify each contact as:
- "keep"      — real person worth staying in touch with (colleague, friend, client, collaborator)
- "skip"      — noise: newsletter, automated service, transactional email, marketing, support bot,
                generic alias (noreply, notifications, billing, support, hello, info, team, admin,
                donotreply, no-reply, mailer-daemon, postmaster, alerts, updates)
- "uncertain" — genuinely ambiguous; default to this when unsure

Key signals:
  WhatsApp source → strong "keep" signal (having someone's number implies real relationship)
  Personal email domains (gmail.com, icloud.com, me.com, protonmail.com, outlook.com personal) → lean "keep"
  Corporate email with real First Last name format → "keep"
  Generic alias or well-known transactional service (amazon, stripe, github notifications, notion, intercom, mailchimp…) → "skip"
  messageCount > 5 → lean "keep" regardless of domain
  noreply / no-reply / notification / mailer-daemon in email local part → always "skip"

Write reason in ≤15 words, present tense, no filler phrases like "Looks like" or "This appears to be".
Good examples:
  "Personal Gmail, 8 exchanges — likely a colleague or friend."
  "Automated notification email from Stripe billing system."
  "Work email, real name, frequent exchanges."
  "WhatsApp contact — personal relationship implied."
  "Generic support alias, single transactional message."

Input: JSON array of {id, name, email, phone, source, messageCount}
Output: JSON array of {id, status, reason} in the same order as the input.`

// ─── Gemini API call ──────────────────────────────────────────────────────────

async function callGemini(contacts: ContactToScreen[]): Promise<ScreeningResult[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return contacts.map((c) => ({
      id: c.id,
      status: "uncertain" as const,
      reason: "Screening not configured — add GEMINI_API_KEY to enable.",
    }))
  }

  const inputJson = JSON.stringify(
    contacts.map(({ id, name, email, phone, source, messageCount }) => ({
      id,
      name: name ?? null,
      email: email ?? null,
      phone: phone ?? null,
      source,
      messageCount,
    }))
  )

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\nContacts to classify:\n${inputJson}` }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              status: { type: "string", enum: ["keep", "skip", "uncertain"] },
              reason: { type: "string" },
            },
            required: ["id", "status", "reason"],
          },
        },
        temperature: 0.1, // low temperature for consistent classification
        thinkingConfig: { thinkingBudget: 0 }, // disable thinking for speed (classification task)
      },
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => "unknown")
    console.error(`[contact-screening] Gemini API error ${res.status}: ${errText}`)
    throw new Error(`Gemini API returned ${res.status}`)
  }

  const data = await res.json()
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]"
  const results: Array<{ id: string; status: string; reason: string }> = JSON.parse(text)

  // Validate and normalise — fall back to "uncertain" for any malformed entry
  return contacts.map((c) => {
    const r = results.find((x) => x.id === c.id)
    if (!r || !["keep", "skip", "uncertain"].includes(r.status)) {
      return { id: c.id, status: "uncertain" as const, reason: "Could not be classified." }
    }
    return {
      id: c.id,
      status: r.status as "keep" | "skip" | "uncertain",
      reason: r.reason ?? "",
    }
  })
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Classify a batch of discovered contacts.
 * Handles chunking, errors, and missing API key gracefully.
 */
export async function screenContacts(contacts: ContactToScreen[]): Promise<ScreeningResult[]> {
  if (contacts.length === 0) return []

  // Chunk into batches of BATCH_SIZE
  const chunks: ContactToScreen[][] = []
  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    chunks.push(contacts.slice(i, i + BATCH_SIZE))
  }

  const results: ScreeningResult[] = []

  for (const chunk of chunks) {
    try {
      const chunkResults = await callGemini(chunk)
      results.push(...chunkResults)
    } catch (err) {
      console.error("[contact-screening] Falling back to 'uncertain' for chunk:", err)
      // Graceful fallback — don't fail the whole request
      results.push(
        ...chunk.map((c) => ({
          id: c.id,
          status: "uncertain" as const,
          reason: "Screening failed — review manually.",
        }))
      )
    }
  }

  return results
}
