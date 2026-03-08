/**
 * GET  /api/integrations/whatsapp/status  — read current connection state (public, for UI polling)
 * POST /api/integrations/whatsapp/status  — daemon updates its state (requires daemon secret)
 *
 * Stored keys in Setting table:
 *   whatsapp_status     "connected" | "disconnected" | "qr_pending"
 *   whatsapp_phone      "+447912345678"
 *   whatsapp_name       "Rob"
 *   whatsapp_last_seen  ISO string of last daemon heartbeat
 *   whatsapp_sync_done  "true" | "false" — whether initial history sync completed
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// ─── GET — poll from Settings UI ─────────────────────────────────────────────

export async function GET() {
  const rows = await prisma.setting.findMany({
    where: { key: { startsWith: "whatsapp_" } },
  })

  const data = Object.fromEntries(rows.map((r) => [r.key, r.value]))

  const lastSeen = data.whatsapp_last_seen
    ? new Date(data.whatsapp_last_seen)
    : null

  // Consider daemon alive if heartbeat within last 90 seconds
  const alive = lastSeen
    ? Date.now() - lastSeen.getTime() < 90_000
    : false

  const status = alive ? (data.whatsapp_status ?? "disconnected") : "disconnected"

  return NextResponse.json({
    status,
    phone: data.whatsapp_phone ?? null,
    name: data.whatsapp_name ?? null,
    lastSeen: lastSeen?.toISOString() ?? null,
    syncDone: data.whatsapp_sync_done === "true",
  })
}

// ─── POST — daemon updates its state ─────────────────────────────────────────

const StatusSchema = z.object({
  status: z.enum(["connected", "disconnected", "qr_pending"]),
  phone: z.string().optional(),
  name: z.string().optional(),
  syncDone: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-daemon-secret")
  if (!secret || secret !== process.env.WHATSAPP_DAEMON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = StatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const { status, phone, name, syncDone } = parsed.data
  const now = new Date().toISOString()

  const upserts = [
    prisma.setting.upsert({
      where: { key: "whatsapp_status" },
      update: { value: status },
      create: { key: "whatsapp_status", value: status },
    }),
    prisma.setting.upsert({
      where: { key: "whatsapp_last_seen" },
      update: { value: now },
      create: { key: "whatsapp_last_seen", value: now },
    }),
  ]

  if (phone !== undefined) {
    upserts.push(
      prisma.setting.upsert({
        where: { key: "whatsapp_phone" },
        update: { value: phone },
        create: { key: "whatsapp_phone", value: phone },
      })
    )
  }
  if (name !== undefined) {
    upserts.push(
      prisma.setting.upsert({
        where: { key: "whatsapp_name" },
        update: { value: name },
        create: { key: "whatsapp_name", value: name },
      })
    )
  }
  if (syncDone !== undefined) {
    upserts.push(
      prisma.setting.upsert({
        where: { key: "whatsapp_sync_done" },
        update: { value: String(syncDone) },
        create: { key: "whatsapp_sync_done", value: String(syncDone) },
      })
    )
  }

  await prisma.$transaction(upserts)

  // Check if a contact-discovery scan was requested from the Settings UI
  const discoverPending = await prisma.setting.findUnique({
    where: { key: "whatsapp_discover_pending" },
  })
  const discoverContacts = discoverPending?.value === "1"

  if (discoverContacts) {
    // Clear the flag — daemon will do exactly one scan
    await prisma.setting.update({
      where: { key: "whatsapp_discover_pending" },
      data: { value: "0" },
    })
  }

  return NextResponse.json({ ok: true, discoverContacts })
}
