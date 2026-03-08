/**
 * Gmail integration — uses the Gmail REST API with an OAuth2 access token.
 * The token comes from NextAuth (Google provider with gmail.readonly scope).
 */

const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1"

async function gmailGet(path: string, accessToken: string) {
  const res = await fetch(`${GMAIL_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 0 },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gmail API ${res.status}: ${text}`)
  }
  return res.json()
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GmailMessage {
  id: string
  threadId: string
  from: string
  to: string
  subject: string
  date: Date
  snippet: string
  direction: "inbound" | "outbound"
}

export interface GmailProfile {
  emailAddress: string
  messagesTotal: number
  threadsTotal: number
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getGmailProfile(accessToken: string): Promise<GmailProfile> {
  return gmailGet("/users/me/profile", accessToken)
}

// ─── Message list ─────────────────────────────────────────────────────────────

export async function searchMessages(
  accessToken: string,
  query: string,
  maxResults = 20
): Promise<Array<{ id: string; threadId: string }>> {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
  })
  const data = await gmailGet(`/users/me/messages?${params}`, accessToken)
  return data.messages ?? []
}

// ─── Message detail (headers only — no body) ─────────────────────────────────

interface MessageHeaders {
  subject: string
  from: string
  to: string
  date: Date
}

export async function getMessageHeaders(
  accessToken: string,
  messageId: string
): Promise<MessageHeaders | null> {
  try {
    const data = await gmailGet(
      `/users/me/messages/${messageId}?format=metadata` +
        `&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
      accessToken
    )
    const headers: Array<{ name: string; value: string }> = data.payload?.headers ?? []
    const get = (name: string) => headers.find(h => h.name === name)?.value ?? ""
    const dateStr = get("Date")

    return {
      subject: get("Subject") || "(no subject)",
      from: get("From"),
      to: get("To"),
      // internalDate is ms-since-epoch as a string; fall back if Date header is weird
      date: dateStr ? new Date(dateStr) : new Date(Number(data.internalDate)),
    }
  } catch {
    return null
  }
}

// ─── Per-contact sync ─────────────────────────────────────────────────────────

/**
 * Fetch emails to/from a specific address in the last `daysBack` days.
 * Returns a list of GmailMessage objects without fetching bodies.
 */
export async function syncContactEmails(
  personEmail: string,
  accessToken: string,
  myEmail: string,
  daysBack = 90
): Promise<GmailMessage[]> {
  // Gmail date format: YYYY/MM/DD
  const after = new Date()
  after.setDate(after.getDate() - daysBack)
  const ymd = [
    after.getFullYear(),
    String(after.getMonth() + 1).padStart(2, "0"),
    String(after.getDate()).padStart(2, "0"),
  ].join("/")

  const query = `(from:${personEmail} OR to:${personEmail}) after:${ymd}`
  const messages = await searchMessages(accessToken, query, 20)

  const results: GmailMessage[] = []

  for (const msg of messages) {
    const headers = await getMessageHeaders(accessToken, msg.id)
    if (!headers) continue

    const myEmailLower = myEmail.toLowerCase()
    const direction: "inbound" | "outbound" = headers.from
      .toLowerCase()
      .includes(myEmailLower)
      ? "outbound"
      : "inbound"

    results.push({
      id: msg.id,
      threadId: msg.threadId,
      from: headers.from,
      to: headers.to,
      subject: headers.subject,
      date: headers.date,
      snippet: "",
      direction,
    })
  }

  return results
}

// ─── Legacy stub (kept for backwards compat) ──────────────────────────────────

export async function getLastEmailForAddress(_email: string): Promise<GmailMessage | null> {
  return null
}

export async function syncContactInteractions(
  _personId: string,
  _email: string
): Promise<void> {
  // Use syncContactEmails + the /api/integrations/gmail/sync route instead
}
