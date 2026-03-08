import { getPeople } from "@/server/people"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatRelative, categoryLabel, statusLabel } from "@/lib/utils"
import { Plus, Star } from "lucide-react"
import { PeopleFilters } from "@/components/people/people-filters"

interface SearchParams { search?: string; category?: string; status?: string }

export default async function PeoplePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const people = await getPeople({ search: sp.search, category: sp.category, status: sp.status })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">People</h1>
          <p className="text-zinc-500 text-sm mt-1">{people.length} contacts</p>
        </div>
        <Link href="/people/new">
          <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add person</Button>
        </Link>
      </div>

      <PeopleFilters />

      <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Person</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Category</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Strength</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Last contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {people.length === 0 && (
              <tr><td colSpan={5} className="py-12 text-center text-zinc-400 text-sm">No people found. <Link href="/people/new" className="text-zinc-700 underline">Add your first contact.</Link></td></tr>
            )}
            {people.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-50 transition-colors group">
                <td className="py-3 px-4">
                  <Link href={`/people/${p.id}`} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{p.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-zinc-900 group-hover:text-zinc-700">{p.fullName}</p>
                      <p className="text-xs text-zinc-400">{[p.role, p.company].filter(Boolean).join(" · ")}</p>
                    </div>
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <Badge variant="secondary">{categoryLabel[p.category] ?? p.category}</Badge>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < p.relationshipStrength ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={p.status as "active" | "dormant" | "watchlist"}>{statusLabel[p.status] ?? p.status}</Badge>
                </td>
                <td className="py-3 px-4 text-zinc-500 text-xs">{formatRelative(p.lastInteractionAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
