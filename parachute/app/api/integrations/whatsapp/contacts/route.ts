/**
 * POST /api/integrations/whatsapp/contacts
 *
 * Receives a bulk list of WhatsApp chat contacts from the daemon.
 * For each contact, if their phone doesn't match any existing Person,
 * upsert into DiscoveredContact for user review.
 *
 * Body: { contacts: Array<{ phone: string; name?: string }> }
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

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

const ContactSchema = z.object({
  phone: z.string().min(1),
  name: z.string().optional(),
})

const BodySchema = z.object({
  contacts: z.array(ContactSchema).min(1).max(1000),
})

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-daemon-secret")
  if (!secret || secret !== process.env.WHATSAPP_DAEMON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { contacts } = parsed.data

  // Build set of all known phones from Person + Identity
  const [people, identities] = await Promise.all([
    prisma.person.findMany({ where: { status: "active" }, select: { phone: true } }),
    prisma.identity.findMany({ where: { type: "phone" }, select: { value: true } }),
  ])
  const knownPhones = [
    ...people.map((p) => p.phone).filter(Boolean) as string[],
    ...identities.map((i) => i.value),
  ]

  let created = 0
  let updated = 0

  for (const { phone, name } of contacts) {
    // Skip if this phone matches a known person
    const isKnown = knownPhones.some((kp) => phonesMatch(phone, kp))
    if (isKnown) continue

    const existing = await prisma.discoveredContact.findFirst({
      where: { source: "whatsapp", phone },
    })

    if (!existing) {
      await prisma.discoveredContact.create({
        data: {
          source: "whatsapp",
          phone,
          name: name ?? null,
          messageCount: 1,
          lastSeenAt: new Date(),
        },
      })
      created++
    } else if (!existing.dismissed) {
      await prisma.discoveredContact.update({
        where: { id: existing.id },
        data: { name: existing.name ?? name ?? null },
      })
      updated++
    }
  }

  return NextResponse.json({ ok: true, created, updated, total: contacts.length })
}
