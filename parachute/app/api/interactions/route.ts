import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const InteractionSchema = z.object({
  personId: z.string(),
  type: z.string(),
  occurredAt: z.string(),
  summary: z.string().optional(),
  direction: z.string().default("mutual"),
  channel: z.string().optional(),
  requiresFollowUp: z.boolean().default(false),
  followUpDueAt: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = InteractionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const { followUpDueAt, ...rest } = parsed.data
  const interaction = await prisma.interaction.create({
    data: {
      ...rest,
      occurredAt: new Date(rest.occurredAt),
      followUpDueAt: followUpDueAt ? new Date(followUpDueAt) : undefined,
    },
  })
  // Update person's lastInteractionAt
  await prisma.person.update({
    where: { id: rest.personId },
    data: { lastInteractionAt: new Date(rest.occurredAt) },
  })
  return NextResponse.json(interaction, { status: 201 })
}
