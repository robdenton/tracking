/**
 * GET  /api/integrations/whatsapp/qr  — fetch current QR code string (for UI to render)
 * POST /api/integrations/whatsapp/qr  — daemon posts new QR when one is generated
 *
 * QR codes expire quickly (~60s), so we store the timestamp alongside.
 * The UI should only render a QR if it's fresh (< 55 seconds old).
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// ─── GET — fetch QR for rendering in browser ─────────────────────────────────

export async function GET() {
  const [qrRow, tsRow] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "whatsapp_qr" } }),
    prisma.setting.findUnique({ where: { key: "whatsapp_qr_at" } }),
  ])

  if (!qrRow?.value || !tsRow?.value) {
    return NextResponse.json({ qr: null, fresh: false })
  }

  const ageMs = Date.now() - new Date(tsRow.value).getTime()
  const fresh = ageMs < 55_000 // QR valid ~60s; give 5s buffer

  return NextResponse.json({ qr: qrRow.value, fresh })
}

// ─── POST — daemon posts QR string ───────────────────────────────────────────

const QrSchema = z.object({ qr: z.string().min(10) })

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-daemon-secret")
  if (!secret || secret !== process.env.WHATSAPP_DAEMON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = QrSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const now = new Date().toISOString()

  await prisma.$transaction([
    prisma.setting.upsert({
      where: { key: "whatsapp_qr" },
      update: { value: parsed.data.qr },
      create: { key: "whatsapp_qr", value: parsed.data.qr },
    }),
    prisma.setting.upsert({
      where: { key: "whatsapp_qr_at" },
      update: { value: now },
      create: { key: "whatsapp_qr_at", value: now },
    }),
    // Mark status as waiting for scan
    prisma.setting.upsert({
      where: { key: "whatsapp_status" },
      update: { value: "qr_pending" },
      create: { key: "whatsapp_status", value: "qr_pending" },
    }),
  ])

  return NextResponse.json({ ok: true })
}
