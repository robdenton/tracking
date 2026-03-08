import { prisma } from "@/lib/prisma"
import { daysSince } from "@/lib/utils"

// ─── Suggestion generation rules ────────────────────────────────────────────
// This is purely deterministic — no AI. Rules are ordered by priority.

export async function generateSuggestions() {
  const people = await prisma.person.findMany({
    include: {
      signals: { where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, orderBy: { relevanceScore: "desc" } },
    },
  })

  for (const person of people) {
    // Rule 1: 90+ days no contact → check-in suggestion
    const days = daysSince(person.lastInteractionAt)
    if (days >= 90 && person.status !== "dormant") {
      const existing = await prisma.suggestion.findFirst({
        where: { personId: person.id, status: "open", title: { contains: "check-in" } },
      })
      if (!existing) {
        await prisma.suggestion.create({
          data: {
            personId: person.id,
            title: `${days} days since last contact — send a warm check-in`,
            reason: `You haven't spoken to ${person.fullName} in ${days} days. Keeping in touch builds trust over time.`,
            priority: days >= 180 ? 1 : 2,
            suggestedAction: "Send a short, genuine check-in message with something relevant to their world.",
            suggestedChannel: person.preferredChannel ?? "email",
            generatedFrom: JSON.stringify({ rule: "recency", daysSince: days }),
          },
        })
      }
    }

    // Rule 2: Funding signal → congratulate
    const fundingSignal = person.signals.find((s) => s.type === "funding" && s.unread)
    if (fundingSignal) {
      const existing = await prisma.suggestion.findFirst({
        where: { personId: person.id, status: "open", generatedFrom: { contains: fundingSignal.id } },
      })
      if (!existing) {
        await prisma.suggestion.create({
          data: {
            personId: person.id,
            title: `${person.fullName} raised funding — congratulate them`,
            reason: fundingSignal.summary ?? "A funding announcement is a major milestone.",
            priority: 1,
            suggestedAction: "Send a brief, warm congratulations and ask what they're hiring for.",
            suggestedChannel: person.preferredChannel ?? "linkedin",
            generatedFrom: JSON.stringify({ rule: "funding_signal", signalId: fundingSignal.id }),
          },
        })
      }
    }

    // Rule 3: Hiring signal → offer help
    const hiringSignal = person.signals.find((s) => s.type === "hiring" && s.unread)
    if (hiringSignal) {
      const existing = await prisma.suggestion.findFirst({
        where: { personId: person.id, status: "open", generatedFrom: { contains: hiringSignal.id } },
      })
      if (!existing) {
        await prisma.suggestion.create({
          data: {
            personId: person.id,
            title: `${person.fullName} is hiring — offer to help`,
            reason: hiringSignal.summary ?? "They're scaling and could use your network.",
            priority: 2,
            suggestedAction: "Ask about the role and offer introductions from your network.",
            suggestedChannel: person.preferredChannel ?? "linkedin",
            generatedFrom: JSON.stringify({ rule: "hiring_signal", signalId: hiringSignal.id }),
          },
        })
      }
    }

    // Rule 4: Challenge signal (linkedin/tweet) → thoughtful response
    const challengeSignal = person.signals.find(
      (s) => ["linkedin_post", "tweet"].includes(s.type) && s.unread && s.relevanceScore >= 7
    )
    if (challengeSignal) {
      const existing = await prisma.suggestion.findFirst({
        where: { personId: person.id, status: "open", generatedFrom: { contains: challengeSignal.id } },
      })
      if (!existing) {
        await prisma.suggestion.create({
          data: {
            personId: person.id,
            title: `${person.fullName} posted about a challenge — share your thinking`,
            reason: challengeSignal.summary ?? "High-relevance post worth engaging with thoughtfully.",
            priority: 2,
            suggestedAction: "Add a substantive comment or send them a private note with your perspective.",
            suggestedChannel: challengeSignal.type === "tweet" ? "twitter" : "linkedin",
            generatedFrom: JSON.stringify({ rule: "challenge_signal", signalId: challengeSignal.id }),
          },
        })
      }
    }

    // Rule 5: Multiple high-relevance signals this week → raise priority
    const highRelevanceCount = person.signals.filter((s) => s.relevanceScore >= 7).length
    if (highRelevanceCount >= 3) {
      await prisma.suggestion.updateMany({
        where: { personId: person.id, status: "open" },
        data: { priority: 1 },
      })
    }
  }
}

export async function getSuggestions(filters?: { status?: string; priority?: number }) {
  const where: Record<string, unknown> = {}
  if (filters?.status && filters.status !== "all") where.status = filters.status
  if (filters?.priority) where.priority = { lte: filters.priority }
  return prisma.suggestion.findMany({
    where,
    include: { person: true },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  })
}

export async function updateSuggestionStatus(id: string, status: "open" | "done" | "dismissed") {
  return prisma.suggestion.update({ where: { id }, data: { status } })
}
