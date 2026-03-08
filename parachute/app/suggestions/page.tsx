import { getSuggestions } from "@/server/suggestions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatRelative } from "@/lib/utils"
import Link from "next/link"
import { SuggestionActions } from "@/components/suggestions/suggestion-actions"
import { GenerateSuggestionsButton } from "@/components/suggestions/generate-button"

interface SearchParams { status?: string; priority?: string }

export default async function SuggestionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const suggestions = await getSuggestions({
    status: sp.status ?? "open",
    priority: sp.priority ? parseInt(sp.priority) : undefined,
  })

  const priorityLabel: Record<number, string> = { 1: "High", 2: "Medium", 3: "Low" }
  const priorityVariant: Record<number, "high" | "medium" | "low"> = { 1: "high", 2: "medium", 3: "low" }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Suggestions</h1>
          <p className="text-zinc-500 text-sm mt-1">Who should you reach out to this week, and why.</p>
        </div>
        <GenerateSuggestionsButton />
      </div>

      <div className="space-y-3">
        {suggestions.length === 0 && (
          <div className="text-center py-16 border border-dashed border-zinc-200 rounded-xl">
            <p className="text-sm text-zinc-400">No open suggestions.</p>
            <p className="text-xs text-zinc-400 mt-1">Click "Generate" to run the suggestion engine.</p>
          </div>
        )}
        {suggestions.map((s) => (
          <div key={s.id} className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs">{s.person.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/people/${s.personId}`} className="text-sm font-semibold text-zinc-900 hover:underline">{s.person.fullName}</Link>
                  <p className="text-xs text-zinc-500">{[s.person.role, s.person.company].filter(Boolean).join(" · ")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={priorityVariant[s.priority] ?? "medium"}>{priorityLabel[s.priority] ?? "Medium"}</Badge>
                {s.suggestedChannel && <Badge variant="secondary">{s.suggestedChannel}</Badge>}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">{s.title}</p>
              <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{s.reason}</p>
              {s.suggestedAction && (
                <div className="mt-2 bg-zinc-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-0.5">Suggested action</p>
                  <p className="text-sm text-zinc-700">{s.suggestedAction}</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">{formatRelative(s.createdAt)}</span>
              <SuggestionActions suggestionId={s.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
