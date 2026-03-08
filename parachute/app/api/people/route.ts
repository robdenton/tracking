import { NextRequest, NextResponse } from "next/server"
import { getPeople, createPerson, PersonSchema } from "@/server/people"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const people = await getPeople({
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  })
  return NextResponse.json(people)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = PersonSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const person = await createPerson(parsed.data)
  return NextResponse.json(person, { status: 201 })
}
