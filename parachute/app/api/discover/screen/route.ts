/**
 * POST /api/discover/screen
 *
 * Screens all DiscoveredContacts with screeningStatus = "pending" using the
 * Gemini LLM classifier. Called automatically on first visit to /people/discover
 * to handle contacts created before the screening feature was deployed.
 *
 * Safe to call multiple times — only affects "pending" records.
 */

import { prisma } from "@/lib/prisma"
import { screenContacts } from "@/lib/contact-screening"
import { NextResponse } from "next/server"

export async function POST() {
  const pending = await prisma.discoveredContact.findMany({
    where: { dismissed: false, screeningStatus: "pending" },
    select: { id: true, name: true, email: true, phone: true, source: true, messageCount: true },
  })

  if (pending.length === 0) {
    return NextResponse.json({ ok: true, screened: 0 })
  }

  const results = await screenContacts(pending)

  await Promise.all(
    results.map((r) =>
      prisma.discoveredContact.update({
        where: { id: r.id },
        data: { screeningStatus: r.status, screeningReason: r.reason, screenedAt: new Date() },
      })
    )
  )

  return NextResponse.json({ ok: true, screened: results.length })
}
