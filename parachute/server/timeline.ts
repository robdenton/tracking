import { prisma } from "@/lib/prisma"

export type TimelineItem =
  | { kind: "interaction"; date: Date; personId: string; personName: string; data: Record<string, unknown> }
  | { kind: "signal"; date: Date; personId: string; personName: string; data: Record<string, unknown> }
  | { kind: "value_event"; date: Date; personId: string; personName: string; data: Record<string, unknown> }
  | { kind: "note"; date: Date; personId: string; personName: string; data: Record<string, unknown> }

export async function getTimeline(personId?: string, limit = 50): Promise<TimelineItem[]> {
  const filter = personId ? { personId } : {}

  const [interactions, signals, valueEvents, notes] = await Promise.all([
    prisma.interaction.findMany({ where: filter, include: { person: true }, orderBy: { occurredAt: "desc" }, take: limit }),
    prisma.signal.findMany({ where: filter, include: { person: true }, orderBy: { occurredAt: "desc" }, take: limit }),
    prisma.valueEvent.findMany({ where: filter, include: { person: true }, orderBy: { occurredAt: "desc" }, take: limit }),
    prisma.note.findMany({ where: filter, include: { person: true }, orderBy: { createdAt: "desc" }, take: limit }),
  ])

  const items: TimelineItem[] = [
    ...interactions.map((i) => ({ kind: "interaction" as const, date: i.occurredAt, personId: i.personId, personName: i.person.fullName, data: i as unknown as Record<string, unknown> })),
    ...signals.map((s) => ({ kind: "signal" as const, date: s.occurredAt, personId: s.personId, personName: s.person.fullName, data: s as unknown as Record<string, unknown> })),
    ...valueEvents.map((v) => ({ kind: "value_event" as const, date: v.occurredAt, personId: v.personId, personName: v.person.fullName, data: v as unknown as Record<string, unknown> })),
    ...notes.map((n) => ({ kind: "note" as const, date: n.createdAt, personId: n.personId, personName: n.person.fullName, data: n as unknown as Record<string, unknown> })),
  ]

  return items.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit)
}
