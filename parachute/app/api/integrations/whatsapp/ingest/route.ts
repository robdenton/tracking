/**
 * POST /api/integrations/whatsapp/ingest
 *
 * Receives individual WhatsApp message payloads from the local daemon.
 * Authenticated by a shared secret in the x-daemon-secret header.
 *
 * Body:
 *   waId      string   msg.id._serialized — used for deduplication
 *   from      string   JID e.g. "447912345678@c.us"
 *   to        string   JID of recipient
 *   fromMe    boolean  true if sent by the user
 *   body      string   message text
 *   timestamp number   Unix seconds
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// ─── Phone matching (mirrors daemon/phone.ts) ─────────────────────────────────

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "")
}

function phonesMatch(a: string, b: string): boolean {
  const na = normalizePhone(a)
  const nb = normalizePhone(b)
  if (!na || !nb || na.length < 7 || nb.length < 7) return false
  const len = Math.min(9, Math.min(na.length, nb.length))
  return na.slice(-len) === nb.slice(-len)
}

function jidToPhone(jid: string): string {
  return jid.replace(/@.*$/, "")
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const IngestSchema = z.object({
  waId: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  fromMe: z.boolean(),
  body: z.string().min(1),
  timestamp: z.number(),
  contactName: z.string().optional(),
})

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const secret = req.headers.get("x-daemon-secret")
  if (!secret || secret !== process.env.WHATSAPP_DAEMON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let data: z.infer<typeof IngestSchema>
  try {
    const body = await req.json()
    data = IngestSchema.parse(body)
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const { waId, from, to, fromMe, body, timestamp, contactName } = data

  // ── Determine contact JID ─────────────────────────────────────────────────
  // If fromMe=true, the contact is in `to`. Otherwise the contact is in `from`.
  const contactJid = fromMe ? to : from
  if (!contactJid.endsWith("@c.us")) {
    // Skip groups (@g.us), broadcasts, status — only personal chats
    return NextResponse.json({ skipped: "group or broadcast" })
  }

  const contactPhone = jidToPhone(contactJid)

  // ── Find matching Person (Person.phone + all phone identities) ───────────
  const people = await prisma.person.findMany({
    where: { status: "active" },
    select: {
      id: true,
      phone: true,
      lastInteractionAt: true,
      identities: { where: { type: "phone" }, select: { value: true } },
    },
  })

  const person = people.find((p) => {
    if (p.phone && phonesMatch(contactPhone, p.phone)) return true
    return p.identities.some((id) => phonesMatch(contactPhone, id.value))
  })

  if (!person) {
    // Unknown contact — buffer in DiscoveredContact for user review
    const occurredAt = new Date(timestamp * 1000)
    const existingDiscovered = await prisma.discoveredContact.findFirst({
      where: { source: "whatsapp", phone: contactPhone },
    })
    if (!existingDiscovered) {
      await prisma.discoveredContact.create({
        data: {
          source: "whatsapp",
          phone: contactPhone,
          name: contactName ?? null,
          messageCount: 1,
          lastSeenAt: occurredAt,
        },
      })
    } else if (!existingDiscovered.dismissed) {
      await prisma.discoveredContact.update({
        where: { id: existingDiscovered.id },
        data: {
          messageCount: { increment: 1 },
          lastSeenAt:
            occurredAt > existingDiscovered.lastSeenAt
              ? occurredAt
              : existingDiscovered.lastSeenAt,
          name: existingDiscovered.name ?? contactName ?? null,
        },
      })
    }
    return NextResponse.json({ skipped: "no matching person" })
  }

  // ── Deduplication ─────────────────────────────────────────────────────────
  const existing = await prisma.interaction.findFirst({
    where: {
      personId: person.id,
      metadata: { contains: waId },
    },
    select: { id: true },
  })

  if (existing) {
    return NextResponse.json({ skipped: "already exists" })
  }

  // ── Create Interaction ────────────────────────────────────────────────────
  const occurredAt = new Date(timestamp * 1000)
  const summary = body.slice(0, 120)
  const direction = fromMe ? "outbound" : "inbound"

  await prisma.interaction.create({
    data: {
      personId: person.id,
      type: "whatsapp",
      occurredAt,
      summary,
      direction,
      channel: "whatsapp",
      metadata: JSON.stringify({ waId, from, to }),
    },
  })

  // ── Update lastInteractionAt ───────────────────────────────────────────────
  if (!person.lastInteractionAt || occurredAt > person.lastInteractionAt) {
    await prisma.person.update({
      where: { id: person.id },
      data: { lastInteractionAt: occurredAt },
    })
  }

  return NextResponse.json({ created: true, personId: person.id })
}
