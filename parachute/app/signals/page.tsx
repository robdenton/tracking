import { getSignals } from "@/server/signals"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatRelative, signalTypeLabel } from "@/lib/utils"
import Link from "next/link"
import { SignalActions } from "@/components/signals/signal-actions"
import { SignalFilters } from "@/components/signals/signal-filters"

interface SearchParams { personId?: string; type?: string; unread?: string; needsAction?: string }

export default async function SignalsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const signals = await getSignals({
    personId: sp.personId,
    type: sp.type,
    unread: sp.unread === "true" ? true : undefined,
    needsAction: sp.needsAction === "true" ? true : undefined,
  })

  const unreadCount = signals.filter(s => s.unread).length

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Signals</h1>
        <p className="text-zinc-500 text-sm mt-1">{unreadCount} unread · {signals.length} total</p>
      </div>

      <SignalFilters />

      <div className="space-y-2">
        {signals.length === 0 && (
          <div className="text-center py-16 text-zinc-400">
            <p className="text-sm">No signals yet. They'll appear here as you add contacts and activity.</p>
          </div>
        )}
        {signals.map((s) => (
          <div key={s.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${s.unread ? "bg-white border-zinc-200" : "bg-zinc-50 border-zinc-100"}`}>
            <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${s.unread ? "bg-blue-500" : "bg-zinc-300"}`} />
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs">{s.person.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/people/${s.personId}`} className="text-sm font-medium text-zinc-900 hover:underline">{s.person.fullName}</Link>
                <Badge variant="outline" className="text-xs">{signalTypeLabel[s.type] ?? s.type}</Badge>
                <span className="text-xs text-zinc-400">{formatRelative(s.occurredAt)}</span>
                {s.relevanceScore >= 8 && <Badge variant="high" className="text-xs">High relevance</Badge>}
                {s.needsAction && <Badge variant="medium" className="text-xs">Needs action</Badge>}
              </div>
              <p className="text-sm font-medium text-zinc-800 mt-1">{s.title}</p>
              {s.summary && <p className="text-sm text-zinc-500 mt-0.5 leading-relaxed">{s.summary}</p>}
              {s.sourceUrl && <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 block">{s.source ?? "Source"} ↗</a>}
            </div>
            <SignalActions signalId={s.id} unread={s.unread} />
          </div>
        ))}
      </div>
    </div>
  )
}
