import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const IdentitySchema = z.object({
  type: z.enum(["email", "phone"]),
  value: z.string().min(1),
})

// GET — list all identities for a person
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const identities = await prisma.identity.findMany({
    where: { personId: id },
    orderBy: { id: "asc" },
  })
  return NextResponse.json(identities)
}

// POST — add an identity to a person
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Confirm person exists
  const person = await prisma.person.findUnique({ where: { id }, select: { id: true } })
  if (!person) return NextResponse.json({ error: "Person not found" }, { status: 404 })

  const body = await req.json()
  const parsed = IdentitySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { type, value } = parsed.data

  // Reject duplicates on this person
  const existing = await prisma.identity.findFirst({
    where: { personId: id, type, value },
  })
  if (existing) {
    return NextResponse.json({ error: "Identity already exists" }, { status: 409 })
  }

  const identity = await prisma.identity.create({
    data: { personId: id, type, value },
  })

  return NextResponse.json(identity, { status: 201 })
}
