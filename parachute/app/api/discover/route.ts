import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET — list all non-dismissed discovered contacts, ordered by message volume
export async function GET() {
  const contacts = await prisma.discoveredContact.findMany({
    where: { dismissed: false },
    orderBy: [{ messageCount: "desc" }, { lastSeenAt: "desc" }],
  })
  return NextResponse.json(contacts)
}
