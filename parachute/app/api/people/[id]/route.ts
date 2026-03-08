import { NextRequest, NextResponse } from "next/server"
import { getPersonById, updatePerson, deletePerson, PersonSchema } from "@/server/people"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const person = await getPersonById(id)
  if (!person) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(person)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const parsed = PersonSchema.partial().safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const person = await updatePerson(id, parsed.data)
  return NextResponse.json(person)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deletePerson(id)
  return NextResponse.json({ ok: true })
}
