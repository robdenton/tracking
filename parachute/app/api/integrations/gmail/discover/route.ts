import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getGmailProfile, searchMessages, getMessageHeaders } from "@/integrations/gmail"
import { NextResponse } from "next/server"

// ─── Email header parser ──────────────────────────────────────────────────────

function parseEmailHeader(
  raw: string
): { name: string | null; email: string } | null {
  if (!raw) return null
  // "Jane Smith <jane@acme.com>"
  const match = raw.match(/^(.+?)\s*<([^>]+)>$/)
  if (match) {
    const name = match[1].trim().replace(/^["']|["']$/g, "") || null
    return { name, email: match[2].trim().toLowerCase() }
  }
  // "jane@acme.com" (plain)
  const plain = raw.trim()
  if (plain.includes("@")) return { name: null, email: plain.toLowerCase() }
  return null
}

// Automated/noreply patterns to skip
const SKIP_PATTERNS = [
  "noreply",
  "no-reply",
  "mailer-daemon",
  "postmaster",
  "donotreply",
  "do-not-reply",
  "notifications@",
  "notification@",
  "alerts@",
  "updates@",
]

function isAutomatedEmail(email: string): boolean {
  const lower = email.toLowerCase()
  return SKIP_PATTERNS.some((p) => lower.includes(p))
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST() {
  const session = await auth()

  if (!session?.accessToken) {
    return NextResponse.json(
      { error: "Not connected to Gmail. Sign in with Google first." },
      { status: 401 }
    )
  }

  try {
    const profile = await getGmailProfile(session.accessToken)
    const myEmail = profile.emailAddress.toLowerCase()

    // Build set of all already-known emails (Person.email + all email identities)
    const [people, identities] = await Promise.all([
      prisma.person.findMany({ select: { email: true } }),
      prisma.identity.findMany({ where: { type: "email" }, select: { value: true } }),
    ])
    const knownEmails = new Set<string>([
      ...people.map((p) => p.email?.toLowerCase()).filter(Boolean) as string[],
      ...identities.map((i) => i.value.toLowerCase()),
      myEmail,
    ])

    // Gmail date format: YYYY/MM/DD
    const after = new Date()
    after.setDate(after.getDate() - 90)
    const ymd = [
      after.getFullYear(),
      String(after.getMonth() + 1).padStart(2, "0"),
      String(after.getDate()).padStart(2, "0"),
    ].join("/")

    const query = `after:${ymd}`
    const messages = await searchMessages(session.accessToken, query, 500)

    // Accumulate unknown correspondents
    const discovered = new Map<
      string,
      { name: string | null; messageCount: number; lastSeenAt: Date }
    >()

    for (const msg of messages) {
      const headers = await getMessageHeaders(session.accessToken, msg.id)
      if (!headers) continue

      const candidates = [
        ...headers.from.split(","),
        ...headers.to.split(","),
      ]

      for (const raw of candidates) {
        const parsed = parseEmailHeader(raw.trim())
        if (!parsed) continue
        const { name, email } = parsed

        if (knownEmails.has(email)) continue
        if (isAutomatedEmail(email)) continue

        const existing = discovered.get(email)
        if (existing) {
          existing.messageCount++
          if (headers.date > existing.lastSeenAt) {
            existing.lastSeenAt = headers.date
            // Prefer a name over null
            if (name && !existing.name) existing.name = name
          }
        } else {
          discovered.set(email, { name, messageCount: 1, lastSeenAt: headers.date })
        }
      }
    }

    // Upsert into DiscoveredContact
    let newCount = 0
    for (const [email, data] of discovered) {
      const existing = await prisma.discoveredContact.findFirst({
        where: { source: "gmail", email },
      })

      if (!existing) {
        await prisma.discoveredContact.create({
          data: {
            source: "gmail",
            email,
            name: data.name,
            messageCount: data.messageCount,
            lastSeenAt: data.lastSeenAt,
          },
        })
        newCount++
      } else if (!existing.dismissed) {
        await prisma.discoveredContact.update({
          where: { id: existing.id },
          data: {
            messageCount: { increment: data.messageCount },
            lastSeenAt:
              data.lastSeenAt > existing.lastSeenAt
                ? data.lastSeenAt
                : existing.lastSeenAt,
            name: existing.name ?? data.name,
          },
        })
      }
      // If dismissed — skip, user chose to ignore
    }

    return NextResponse.json({
      success: true,
      discovered: newCount,
      scanned: messages.length,
      total: discovered.size,
    })
  } catch (error) {
    console.error("Gmail discover error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Discover failed" },
      { status: 500 }
    )
  }
}
