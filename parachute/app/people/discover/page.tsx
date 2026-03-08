import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { DiscoverClient } from "@/components/people/discover-client"

export default async function DiscoverPage() {
  const contacts = await prisma.discoveredContact.findMany({
    where: { dismissed: false },
    orderBy: [{ messageCount: "desc" }, { lastSeenAt: "desc" }],
  })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <Link
          href="/people"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to People
        </Link>

        <h1 className="text-2xl font-semibold text-zinc-900">Discovered Contacts</h1>
        <p className="text-zinc-500 text-sm mt-1">
          People you&apos;ve been emailing or messaging who aren&apos;t yet in Parachute.
        </p>
      </div>

      <DiscoverClient initialContacts={contacts.map(c => ({
        ...c,
        lastSeenAt: c.lastSeenAt.toISOString(),
      }))} />
    </div>
  )
}
