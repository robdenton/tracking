import { getPersonById } from "@/server/people"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, formatRelative, categoryLabel, statusLabel, signalTypeLabel } from "@/lib/utils"
import { Star, MapPin, Mail, Phone, Linkedin, Twitter, Globe, Pencil, ExternalLink } from "lucide-react"
import { LogInteractionButton } from "@/components/people/log-interaction-button"
import { LogValueEventButton } from "@/components/people/log-value-event-button"
import { AddNoteButton } from "@/components/people/add-note-button"

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const person = await getPersonById(id)
  if (!person) notFound()

  const initials = person.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  const topics = person.topics ? person.topics.split(",").map((t) => t.trim()).filter(Boolean) : []

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">{person.fullName}</h1>
            <p className="text-zinc-500 mt-0.5">{[person.role, person.company].filter(Boolean).join(" · ")}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant={person.category as "default"}>{categoryLabel[person.category]}</Badge>
              <Badge variant={person.status as "active" | "dormant" | "watchlist"}>{statusLabel[person.status]}</Badge>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < person.relationshipStrength ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <LogInteractionButton personId={person.id} personName={person.fullName} />
          <LogValueEventButton personId={person.id} personName={person.fullName} />
          <Link href={`/people/${person.id}/edit`}>
            <Button variant="outline" size="sm"><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column: key facts */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              {person.email && <div className="flex items-center gap-2 text-zinc-600"><Mail className="h-3.5 w-3.5 shrink-0 text-zinc-400" /><span className="truncate">{person.email}</span></div>}
              {person.phone && <div className="flex items-center gap-2 text-zinc-600"><Phone className="h-3.5 w-3.5 shrink-0 text-zinc-400" /><span>{person.phone}</span></div>}
              {person.location && <div className="flex items-center gap-2 text-zinc-600"><MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" /><span>{person.location}</span></div>}
              {person.linkedinUrl && <a href={person.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline"><Linkedin className="h-3.5 w-3.5 shrink-0" />LinkedIn<ExternalLink className="h-3 w-3" /></a>}
              {person.twitterUrl && <a href={person.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sky-500 hover:underline"><Twitter className="h-3.5 w-3.5 shrink-0" />Twitter<ExternalLink className="h-3 w-3" /></a>}
              {person.website && <a href={person.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-zinc-600 hover:underline"><Globe className="h-3.5 w-3.5 shrink-0" />Website<ExternalLink className="h-3 w-3" /></a>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>About</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-600">
              {person.introducedBy && <div><span className="text-zinc-400 text-xs block">Introduced by</span>{person.introducedBy}</div>}
              {person.preferredChannel && <div><span className="text-zinc-400 text-xs block">Preferred channel</span>{person.preferredChannel}</div>}
              <div><span className="text-zinc-400 text-xs block">Last contact</span>{formatRelative(person.lastInteractionAt)}</div>
              {topics.length > 0 && (
                <div>
                  <span className="text-zinc-400 text-xs block mb-1.5">Cares about</span>
                  <div className="flex flex-wrap gap-1.5">
                    {topics.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                  </div>
                </div>
              )}
              {person.tags.length > 0 && (
                <div>
                  <span className="text-zinc-400 text-xs block mb-1.5">Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {person.tags.map(({ tag }) => <Badge key={tag.id} variant="secondary" className="text-xs">{tag.name}</Badge>)}
                  </div>
                </div>
              )}
              {person.notes && <div><span className="text-zinc-400 text-xs block">Notes</span><p className="leading-relaxed">{person.notes}</p></div>}
            </CardContent>
          </Card>
        </div>

        {/* Right column: tabbed content */}
        <div className="col-span-2">
          {/* Open suggestions */}
          {person.suggestions.length > 0 && (
            <Card className="mb-4 border-amber-200 bg-amber-50/50">
              <CardHeader><CardTitle className="text-amber-800">Suggested actions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {person.suggestions.map((s) => (
                  <div key={s.id} className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-zinc-800">{s.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{s.reason}</p>
                      {s.suggestedAction && <p className="text-xs text-amber-700 mt-1 italic">{s.suggestedAction}</p>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="interactions">
            <TabsList>
              <TabsTrigger value="interactions">Interactions ({person.interactions.length})</TabsTrigger>
              <TabsTrigger value="signals">Signals ({person.signals.length})</TabsTrigger>
              <TabsTrigger value="value">Value ({person.valueEvents.length})</TabsTrigger>
              <TabsTrigger value="notes">Notes ({person.notesList.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="interactions">
              <Card>
                <CardContent className="pt-4 space-y-3">
                  {person.interactions.length === 0 && <p className="text-sm text-zinc-400 py-4 text-center">No interactions logged yet.</p>}
                  {person.interactions.map((i) => (
                    <div key={i.id} className="flex items-start gap-3 py-2 border-b border-zinc-100 last:border-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{i.type}</Badge>
                          <span className="text-xs text-zinc-400">{formatDate(i.occurredAt)}</span>
                          {i.direction !== "n_a" && <span className="text-xs text-zinc-400">· {i.direction}</span>}
                        </div>
                        {i.summary && <p className="text-sm text-zinc-700 mt-1">{i.summary}</p>}
                        {i.requiresFollowUp && <p className="text-xs text-amber-600 mt-1">Follow-up due {i.followUpDueAt ? formatDate(i.followUpDueAt) : "—"}</p>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signals">
              <Card>
                <CardContent className="pt-4 space-y-3">
                  {person.signals.length === 0 && <p className="text-sm text-zinc-400 py-4 text-center">No signals yet.</p>}
                  {person.signals.map((s) => (
                    <div key={s.id} className="flex items-start gap-3 py-2 border-b border-zinc-100 last:border-0">
                      <div className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${s.unread ? "bg-blue-500" : "bg-zinc-300"}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">{signalTypeLabel[s.type] ?? s.type}</Badge>
                          <span className="text-xs text-zinc-400">{formatDate(s.occurredAt)}</span>
                          <span className="text-xs text-zinc-400">Relevance {s.relevanceScore}/10</span>
                        </div>
                        <p className="text-sm font-medium text-zinc-900 mt-1">{s.title}</p>
                        {s.summary && <p className="text-xs text-zinc-500 mt-0.5">{s.summary}</p>}
                        {s.sourceUrl && <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-0.5 block">Source ↗</a>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="value">
              <Card>
                <CardContent className="pt-4 space-y-3">
                  {person.valueEvents.length === 0 && <p className="text-sm text-zinc-400 py-4 text-center">No value events yet.</p>}
                  {person.valueEvents.map((v) => (
                    <div key={v.id} className="flex items-start gap-3 py-2 border-b border-zinc-100 last:border-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="active" className="text-xs">{v.type}</Badge>
                          <span className="text-xs text-zinc-400">{formatDate(v.occurredAt)}</span>
                        </div>
                        <p className="text-sm text-zinc-700 mt-1">{v.summary}</p>
                        {v.outcome && <p className="text-xs text-emerald-600 mt-0.5">Outcome: {v.outcome}</p>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <AddNoteButton personId={person.id} />
                  {person.notesList.length === 0 && <p className="text-sm text-zinc-400 py-4 text-center">No notes yet.</p>}
                  {person.notesList.map((n) => (
                    <div key={n.id} className="py-2 border-b border-zinc-100 last:border-0">
                      <p className="text-xs text-zinc-400 mb-1">{formatDate(n.createdAt)}</p>
                      <p className="text-sm text-zinc-700 whitespace-pre-wrap">{n.body}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
