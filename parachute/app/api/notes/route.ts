import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const NoteSchema = z.object({ personId: z.string(), body: z.string().min(1) })

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = NoteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const note = await prisma.note.create({ data: parsed.data })
  return NextResponse.json(note, { status: 201 })
}
