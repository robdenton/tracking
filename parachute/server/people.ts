import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const PersonSchema = z.object({
  fullName: z.string().min(1),
  company: z.string().optional(),
  role: z.string().optional(),
  category: z.enum(["founder", "marketer", "investor", "operator", "other"]).default("other"),
  relationshipStrength: z.number().min(1).max(5).default(3),
  notes: z.string().optional(),
  topics: z.string().optional(),
  introducedBy: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  linkedinUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  website: z.string().optional(),
  preferredChannel: z.string().optional(),
  status: z.enum(["active", "dormant", "watchlist"]).default("active"),
  tags: z.array(z.string()).optional(),
})

export type PersonInput = z.infer<typeof PersonSchema>

export async function getPeople(filters?: {
  search?: string
  category?: string
  status?: string
  minStrength?: number
}) {
  const where: Record<string, unknown> = {}
  if (filters?.category && filters.category !== "all") where.category = filters.category
  if (filters?.status && filters.status !== "all") where.status = filters.status
  if (filters?.minStrength) where.relationshipStrength = { gte: filters.minStrength }

  const people = await prisma.person.findMany({
    where,
    include: { tags: { include: { tag: true } } },
    orderBy: [{ relationshipStrength: "desc" }, { lastInteractionAt: "desc" }],
  })

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    return people.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.company?.toLowerCase().includes(q) ||
        p.role?.toLowerCase().includes(q)
    )
  }
  return people
}

export async function getPersonById(id: string) {
  return prisma.person.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      interactions: { orderBy: { occurredAt: "desc" } },
      signals: { orderBy: { occurredAt: "desc" }, take: 10 },
      valueEvents: { orderBy: { occurredAt: "desc" } },
      suggestions: { where: { status: "open" }, orderBy: { priority: "asc" } },
      notesList: { orderBy: { createdAt: "desc" } },
      identities: { orderBy: { id: "asc" } },
    },
  })
}

export async function createPerson(data: PersonInput) {
  const { tags, ...personData } = data
  const person = await prisma.person.create({ data: personData })
  if (tags?.length) {
    for (const tagName of tags) {
      const tag = await prisma.tag.upsert({ where: { name: tagName }, update: {}, create: { name: tagName } })
      await prisma.personTag.create({ data: { personId: person.id, tagId: tag.id } })
    }
  }
  return person
}

export async function updatePerson(id: string, data: Partial<PersonInput>) {
  const { tags, ...personData } = data
  const person = await prisma.person.update({ where: { id }, data: personData })
  if (tags !== undefined) {
    await prisma.personTag.deleteMany({ where: { personId: id } })
    for (const tagName of tags) {
      const tag = await prisma.tag.upsert({ where: { name: tagName }, update: {}, create: { name: tagName } })
      await prisma.personTag.create({ data: { personId: id, tagId: tag.id } })
    }
  }
  return person
}

export async function deletePerson(id: string) {
  return prisma.person.delete({ where: { id } })
}
