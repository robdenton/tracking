/**
 * POST /api/integrations/whatsapp/discover
 *
 * Called from Settings UI. Sets a flag that the daemon will pick up on its
 * next heartbeat and respond by pushing all chat contacts.
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST() {
  await prisma.setting.upsert({
    where: { key: "whatsapp_discover_pending" },
    update: { value: "1" },
    create: { key: "whatsapp_discover_pending", value: "1" },
  })

  return NextResponse.json({ ok: true, message: "Discovery requested — daemon will respond within 30 seconds." })
}
