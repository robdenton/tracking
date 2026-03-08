import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatRelative, daysSince } from "@/lib/utils"
import Link from "next/link"
import { Users, Radio, Lightbulb, Heart } from "lucide-react"

export default async function Dashboard() {
  const [
    peopleCount,
    openSuggestions,
    unreadSignals,
    recentSignals,
    dormantPeople,
    needsAttention,
    recentValueEvents,
  ] = await Promise.all([
    prisma.person.count(),
    prisma.suggestion.count({ where: { status: "open" } }),
    prisma.signal.count({ where: { unread: true } }),
    prisma.signal.findMany({
      where: { unread: true },
      include: { person: true },
      orderBy: { occurredAt: "desc" },
      take: 5,
    }),
    prisma.person.findMany({
      where: { status: "dormant" },
      orderBy: { lastInteractionAt: "asc" },
      take: 5,
    }),
    prisma.person.findMany({
      where: {
        status: "active",
        OR: [
          { lastInteractionAt: { lt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) } },
          { lastInteractionAt: null },
        ],
      },
      orderBy: [{ relationshipStrength: "desc" }],
      take: 6,
    }),
    prisma.valueEvent.findMany({
      include: { person: true },
      orderBy: { occurredAt: "desc" },
      take: 4,
    }),
  ])

  const stats = [
    { label: "People", value: peopleCount, icon: Users, href: "/people" },
    { label: "Open Suggestions", value: openSuggestions, icon: Lightbulb, href: "/suggestions" },
    { label: "Unread Signals", value: unreadSignals, icon: Radio, href: "/signals" },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Good morning</h1>
        <p className="text-zinc-500 mt-1 text-sm">Here's where your network stands today.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:border-zinc-300 transition-colors cursor-pointer">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium">{label}</p>
                    <p className="text-3xl font-semibold text-zinc-900 mt-1">{value}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-zinc-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Needs attention */}
        <Card>
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {needsAttention.length === 0 && (
              <p className="text-sm text-zinc-400">You're all caught up ✓</p>
            )}
            {needsAttention.map((p) => {
              const days = daysSince(p.lastInteractionAt)
              return (
                <Link key={p.id} href={`/people/${p.id}`} className="flex items-center gap-3 hover:bg-zinc-50 -mx-1 px-1 py-1.5 rounded-lg transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{p.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{p.fullName}</p>
                    <p className="text-xs text-zinc-500 truncate">{p.company ?? p.role ?? "—"}</p>
                  </div>
                  <span className={`text-xs tabular-nums ${days > 90 ? "text-red-500" : "text-amber-600"}`}>{days === 9999 ? "never" : `${days}d`}</span>
                </Link>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent signals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent signals</CardTitle>
            <Link href="/signals" className="text-xs text-zinc-400 hover:text-zinc-700">View all</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentSignals.length === 0 && <p className="text-sm text-zinc-400">No new signals</p>}
            {recentSignals.map((s) => (
              <div key={s.id} className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-900 leading-snug truncate">{s.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{s.person.fullName} · {formatRelative(s.occurredAt)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Dormant relationships */}
        <Card>
          <CardHeader>
            <CardTitle>Dormant relationships</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dormantPeople.length === 0 && <p className="text-sm text-zinc-400">No dormant contacts</p>}
            {dormantPeople.map((p) => (
              <Link key={p.id} href={`/people/${p.id}`} className="flex items-center gap-3 hover:bg-zinc-50 -mx-1 px-1 py-1.5 rounded-lg transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{p.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">{p.fullName}</p>
                  <p className="text-xs text-zinc-400">{p.company ?? "—"} · {formatRelative(p.lastInteractionAt)}</p>
                </div>
                <Badge variant="dormant">Dormant</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Value delivered */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Value delivered</CardTitle>
            <Heart className="h-4 w-4 text-zinc-300" />
          </CardHeader>
          <CardContent className="space-y-3">
            {recentValueEvents.length === 0 && <p className="text-sm text-zinc-400">No value events logged yet</p>}
            {recentValueEvents.map((v) => (
              <div key={v.id} className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-900 leading-snug truncate">{v.summary}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{v.person.fullName} · {formatRelative(v.occurredAt)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
