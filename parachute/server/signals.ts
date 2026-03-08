import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const SignalSchema = z.object({
  personId: z.string(),
  type: z.string(),
  title: z.string().min(1),
  source: z.string().optional(),
  sourceUrl: z.string().optional(),
  occurredAt: z.string().datetime().optional(),
  summary: z.string().optional(),
  relevanceScore: z.number().min(1).max(10).default(5),
  needsAction: z.boolean().default(false),
})

export async function getSignals(filters?: {
  personId?: string
  type?: string
  unread?: boolean
  needsAction?: boolean
}) {
  const where: Record<string, unknown> = {}
  if (filters?.personId) where.personId = filters.personId
  if (filters?.type && filters.type !== "all") where.type = filters.type
  if (filters?.unread !== undefined) where.unread = filters.unread
  if (filters?.needsAction !== undefined) where.needsAction = filters.needsAction
  return prisma.signal.findMany({
    where,
    include: { person: true },
    orderBy: { occurredAt: "desc" },
  })
}

export async function markSignalRead(id: string) {
  return prisma.signal.update({ where: { id }, data: { unread: false } })
}

export async function createSignal(data: z.infer<typeof SignalSchema>) {
  return prisma.signal.create({
    data: {
      ...data,
      occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date(),
    },
  })
}
