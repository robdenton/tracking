import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const ValueEventSchema = z.object({
  personId: z.string(),
  type: z.string(),
  occurredAt: z.string(),
  summary: z.string().min(1),
  outcome: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = ValueEventSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const event = await prisma.valueEvent.create({
    data: { ...parsed.data, occurredAt: new Date(parsed.data.occurredAt) },
  })
  return NextResponse.json(event, { status: 201 })
}
