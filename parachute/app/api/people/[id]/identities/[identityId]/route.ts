import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// DELETE — remove an identity (must belong to the correct person)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; identityId: string }> }
) {
  const { id, identityId } = await params

  const identity = await prisma.identity.findUnique({ where: { id: identityId } })
  if (!identity || identity.personId !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.identity.delete({ where: { id: identityId } })
  return NextResponse.json({ ok: true })
}
