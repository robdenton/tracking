import { getTimeline } from "@/server/timeline"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { MessageSquare, Radio, Heart, FileText } from "lucide-react"

const kindConfig = {
  interaction: { label: "Interaction", icon: MessageSquare, color: "bg-blue-100 text-blue-600" },
  signal: { label: "Signal", icon: Radio, color: "bg-purple-100 text-purple-600" },
  value_event: { label: "Value", icon: Heart, color: "bg-emerald-100 text-emerald-600" },
  note: { label: "Note", icon: FileText, color: "bg-zinc-100 text-zinc-600" },
}

export default async function TimelinePage() {
  const items = await getTimeline(undefined, 100)

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Timeline</h1>
        <p className="text-zinc-500 text-sm mt-1">A chronological history of everything.</p>
      </div>

      <div className="relative">
        <div className="absolute left-[18px] top-0 bottom-0 w-px bg-zinc-200" />
        <div className="space-y-4">
          {items.length === 0 && (
            <div className="text-center py-16 text-zinc-400 text-sm">No activity yet. Start by logging an interaction.</div>
          )}
          {items.map((item, i) => {
            const config = kindConfig[item.kind]
            const Icon = config.icon
            const d = item.data as Record<string, unknown>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const title = (d.title ?? d.summary ?? d.body ?? `${item.kind} with ${item.personName}`) as string
            return (
              <div key={i} className="flex gap-4 pl-0">
                <div className={`relative z-10 h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 bg-white border border-zinc-200 rounded-xl p-4 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant="secondary" className="text-xs">{config.label}</Badge>
                    <Link href={`/people/${item.personId}`} className="text-sm font-medium text-zinc-900 hover:underline">{item.personName}</Link>
                    <span className="text-xs text-zinc-400 ml-auto">{formatDate(item.date)}</span>
                  </div>
                  <p className="text-sm text-zinc-700 truncate">{String(title)}</p>
                  {typeof d.type === "string" && <span className="text-xs text-zinc-400">{d.type}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
