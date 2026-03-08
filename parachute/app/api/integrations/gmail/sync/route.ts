import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { syncContactEmails, getGmailProfile } from "@/integrations/gmail"
import { NextResponse } from "next/server"

export async function POST() {
  const session = await auth()

  if (!session?.accessToken) {
    return NextResponse.json(
      { error: "Not connected to Gmail. Sign in with Google first." },
      { status: 401 }
    )
  }

  try {
    // Get the authenticated user's own email address (for direction detection)
    const profile = await getGmailProfile(session.accessToken)
    const myEmail = profile.emailAddress

    // Only sync active people who have email addresses
    const people = await prisma.person.findMany({
      where: { email: { not: null }, status: "active" },
      select: { id: true, fullName: true, email: true, lastInteractionAt: true },
    })

    let totalCreated = 0
    const syncedPeople: Array<{ name: string; email: string; created: number }> = []

    for (const person of people) {
      if (!person.email) continue

      let messages
      try {
        messages = await syncContactEmails(person.email, session.accessToken, myEmail)
      } catch (err) {
        console.error(`Gmail sync failed for ${person.fullName}:`, err)
        continue
      }

      let created = 0
      let latestDate = person.lastInteractionAt

      for (const msg of messages) {
        // Skip if we already have this email (keyed by Gmail message ID in metadata)
        const exists = await prisma.interaction.findFirst({
          where: {
            personId: person.id,
            metadata: { contains: msg.id },
          },
        })
        if (exists) continue

        await prisma.interaction.create({
          data: {
            personId: person.id,
            type: "email",
            occurredAt: msg.date,
            summary: msg.subject,
            direction: msg.direction,
            channel: "email",
            metadata: JSON.stringify({ gmailId: msg.id, threadId: msg.threadId }),
          },
        })

        created++
        if (!latestDate || msg.date > latestDate) {
          latestDate = msg.date
        }
      }

      // Update lastInteractionAt to the most recent email found
      if (latestDate && latestDate !== person.lastInteractionAt) {
        await prisma.person.update({
          where: { id: person.id },
          data: { lastInteractionAt: latestDate },
        })
      }

      if (created > 0) {
        syncedPeople.push({ name: person.fullName, email: person.email, created })
        totalCreated += created
      }
    }

    return NextResponse.json({
      success: true,
      gmailAccount: myEmail,
      peopleChecked: people.length,
      totalCreated,
      syncedPeople,
    })
  } catch (error) {
    console.error("Gmail sync error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    )
  }
}
