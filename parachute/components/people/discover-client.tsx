"use client"

import { useState, useTransition, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Mail,
  Phone,
  MessageCircle,
  X,
  UserPlus,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ChevronRight,
  Trash2,
} from "lucide-react"
import { formatRelative } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type ScreeningStatus = "pending" | "keep" | "skip" | "uncertain"

interface DiscoveredContact {
  id: string
  source: string
  name: string | null
  email: string | null
  phone: string | null
  messageCount: number
  lastSeenAt: string
  screeningStatus: ScreeningStatus
  screeningReason: string | null
  screenedAt: string | null
}

type ActiveTab = "recommended" | "review" | "all"

interface Props {
  initialContacts: DiscoveredContact[]
}

// ─── Screening badge ──────────────────────────────────────────────────────────

function ScreeningBadge({ status }: { status: ScreeningStatus }) {
  if (status === "keep") {
    return (
      <span className="text-xs text-green-600 font-medium flex items-center gap-0.5 shrink-0">
        <span className="text-green-500">✓</span> Recommended
      </span>
    )
  }
  if (status === "uncertain" || status === "pending") {
    return (
      <span className="text-xs text-amber-600 font-medium flex items-center gap-0.5 shrink-0">
        <span>?</span> Needs review
      </span>
    )
  }
  // skip
  return (
    <span className="text-xs text-zinc-400 font-medium flex items-center gap-0.5 shrink-0">
      <span>✗</span> Likely noise
    </span>
  )
}

// ─── Full card (Recommended / Review / All tabs) ──────────────────────────────

function DiscoverCard({
  contact,
  onDismissed,
}: {
  contact: DiscoveredContact
  onDismissed: (id: string) => void
}) {
  const router = useRouter()
  const [expanding, setExpanding] = useState(false)
  const [dismissing, startDismiss] = useTransition()
  const [promoting, startPromote] = useTransition()

  const [fullName, setFullName] = useState(contact.name ?? "")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")

  const displayName = contact.name ?? contact.email ?? contact.phone ?? "Unknown"
  const initials = displayName
    .split(/\s+/)
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  async function handleDismiss() {
    startDismiss(async () => {
      await fetch(`/api/discover/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss" }),
      })
      onDismissed(contact.id)
    })
  }

  async function handlePromote(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) return
    startPromote(async () => {
      const res = await fetch(`/api/discover/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "promote",
          fullName: fullName.trim(),
          email: contact.email ?? undefined,
          phone: contact.phone ?? undefined,
          company: company.trim() || undefined,
          role: role.trim() || undefined,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/people/${data.personId}`)
      }
    })
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-zinc-900 truncate">{displayName}</p>
              <Badge
                variant="outline"
                className={`text-xs shrink-0 ${
                  contact.source === "gmail"
                    ? "border-blue-200 text-blue-700 bg-blue-50"
                    : "border-green-200 text-green-700 bg-green-50"
                }`}
              >
                {contact.source === "gmail" ? (
                  <Mail className="h-3 w-3 mr-1" />
                ) : (
                  <MessageCircle className="h-3 w-3 mr-1" />
                )}
                {contact.source}
              </Badge>
            </div>

            {/* Screening status + reason */}
            <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
              <ScreeningBadge status={contact.screeningStatus} />
            </div>

            {contact.screeningReason && (
              <p className="text-xs text-zinc-400 italic mt-0.5 leading-snug">
                {contact.screeningReason}
              </p>
            )}

            <div className="mt-1 space-y-0.5">
              {contact.email && (
                <p className="text-sm text-zinc-500 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-zinc-400 shrink-0" />
                  <span className="truncate">{contact.email}</span>
                </p>
              )}
              {contact.phone && (
                <p className="text-sm text-zinc-500 flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-zinc-400 shrink-0" />
                  {contact.phone}
                </p>
              )}
            </div>

            <p className="text-xs text-zinc-400 mt-1">
              {contact.messageCount} message{contact.messageCount !== 1 ? "s" : ""} ·{" "}
              last {formatRelative(new Date(contact.lastSeenAt))}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setExpanding((v) => !v)}
            className="gap-1.5 text-zinc-700"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add contact
            {expanding ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            disabled={dismissing}
            className="gap-1.5 text-zinc-400 hover:text-zinc-600"
          >
            {dismissing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            Discard
          </Button>
        </div>
      </div>

      {/* Inline add form */}
      {expanding && (
        <form
          onSubmit={handlePromote}
          className="border-t border-zinc-100 bg-zinc-50 p-4 space-y-3"
        >
          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium text-zinc-600 block mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                required
                className="w-full h-8 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-400 placeholder:text-zinc-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-zinc-600 block mb-1">Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full h-8 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-400 placeholder:text-zinc-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 block mb-1">Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="CEO"
                  className="w-full h-8 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-400 placeholder:text-zinc-400"
                />
              </div>
            </div>

            {contact.email && (
              <p className="text-xs text-zinc-400 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {contact.email} will be saved as their email
              </p>
            )}
            {contact.phone && (
              <p className="text-xs text-zinc-400 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {contact.phone} will be saved as their phone
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={promoting || !fullName.trim()} className="gap-1.5">
              {promoting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
              Save contact
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setExpanding(false)}
              className="text-zinc-500"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

// ─── Compact noise row (in the collapsed noise section) ───────────────────────

function NoiseRow({
  contact,
  onDismissed,
}: {
  contact: DiscoveredContact
  onDismissed: (id: string) => void
}) {
  const [dismissing, startDismiss] = useTransition()
  const displayName = contact.name ?? contact.email ?? contact.phone ?? "Unknown"
  const initials = displayName
    .split(/\s+/)
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  async function handleDismiss() {
    startDismiss(async () => {
      await fetch(`/api/discover/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss" }),
      })
      onDismissed(contact.id)
    })
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-4 hover:bg-zinc-50 rounded-lg">
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-700 truncate font-medium">{displayName}</p>
        {contact.screeningReason && (
          <p className="text-xs text-zinc-400 italic truncate">{contact.screeningReason}</p>
        )}
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDismiss}
        disabled={dismissing}
        className="gap-1 text-zinc-400 hover:text-zinc-600 shrink-0 h-7 px-2"
      >
        {dismissing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
      </Button>
    </div>
  )
}

// ─── Noise section (collapsed by default) ─────────────────────────────────────

function NoiseSection({
  contacts,
  onDismissed,
}: {
  contacts: DiscoveredContact[]
  onDismissed: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [dismissingAll, startDismissAll] = useTransition()

  async function handleDismissAll() {
    startDismissAll(async () => {
      await Promise.all(
        contacts.map((c) =>
          fetch(`/api/discover/${c.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "dismiss" }),
          })
        )
      )
      contacts.forEach((c) => onDismissed(c.id))
    })
  }

  if (contacts.length === 0) return null

  return (
    <div className="mt-6 border border-zinc-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 transition-colors"
      >
        <ChevronRight
          className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`}
        />
        <span>
          {contacts.length} contact{contacts.length !== 1 ? "s" : ""} identified as likely noise
        </span>
        <span className="ml-auto text-xs text-zinc-400">
          {expanded ? "Hide" : "Show"}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-zinc-100">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-50">
            <p className="text-xs text-zinc-500">
              These contacts were classified as automated services, newsletters, or noise.
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismissAll}
              disabled={dismissingAll}
              className="gap-1.5 text-zinc-500 hover:text-red-600 h-7 text-xs shrink-0"
            >
              {dismissingAll ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Discard all
            </Button>
          </div>
          <div className="divide-y divide-zinc-50">
            {contacts.map((c) => (
              <NoiseRow key={c.id} contact={c} onDismissed={onDismissed} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function Tab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-zinc-900 text-white"
          : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
      }`}
    >
      {label}
      <span
        className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${
          active ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-600"
        }`}
      >
        {count}
      </span>
    </button>
  )
}

// ─── Main client component ────────────────────────────────────────────────────

export function DiscoverClient({ initialContacts }: Props) {
  const router = useRouter()
  const [contacts, setContacts] = useState<DiscoveredContact[]>(initialContacts)
  const [activeTab, setActiveTab] = useState<ActiveTab>("recommended")
  const [screening, setScreening] = useState(false)

  // Auto-screen any "pending" contacts (created before screening was deployed)
  useEffect(() => {
    const hasPending = initialContacts.some((c) => c.screeningStatus === "pending")
    if (!hasPending) return
    setScreening(true)
    fetch("/api/discover/screen", { method: "POST" })
      .then(() => router.refresh())
      .catch(() => {/* non-fatal */})
      .finally(() => setScreening(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDismissed = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // Categorise contacts
  const recommended = contacts.filter((c) => c.screeningStatus === "keep")
  const review = contacts.filter(
    (c) => c.screeningStatus === "uncertain" || c.screeningStatus === "pending"
  )
  const noise = contacts.filter((c) => c.screeningStatus === "skip")

  // Cards to render in main grid for current tab
  const gridContacts =
    activeTab === "recommended"
      ? recommended
      : activeTab === "review"
      ? review
      : contacts // "all" shows everything

  // In "all" tab, separate noise contacts to show with a badge rather than hiding them
  const gridMain =
    activeTab === "all" ? contacts.filter((c) => c.screeningStatus !== "skip") : gridContacts
  const allNoise = activeTab === "all" ? noise : noise

  // Show noise section below recommended / review tabs (not in "all" since everything is visible)
  const showNoiseSection = activeTab !== "all" && noise.length > 0

  const total = contacts.length

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-lg font-semibold text-zinc-800">All caught up</h2>
        <p className="text-zinc-500 text-sm mt-1 max-w-xs">
          No new contacts to review right now. Run a Gmail discovery scan or wait for new WhatsApp messages.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Screening in progress */}
      {screening && (
        <div className="flex items-center gap-2 mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
          <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
          <Sparkles className="h-4 w-4 text-amber-500" />
          Screening contacts with AI — this takes a few seconds…
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4">
        <Tab
          active={activeTab === "recommended"}
          onClick={() => setActiveTab("recommended")}
          label="Recommended"
          count={recommended.length}
        />
        <Tab
          active={activeTab === "review"}
          onClick={() => setActiveTab("review")}
          label="Needs Review"
          count={review.length}
        />
        <Tab
          active={activeTab === "all"}
          onClick={() => setActiveTab("all")}
          label="All"
          count={total}
        />
      </div>

      {/* Empty state for current tab */}
      {gridMain.length === 0 && !showNoiseSection && (
        <div className="py-16 text-center text-zinc-400">
          {activeTab === "recommended" ? (
            <>
              <p className="text-sm font-medium text-zinc-600">No recommendations yet</p>
              <p className="text-xs mt-1">
                {review.length > 0
                  ? "Check the 'Needs Review' tab for borderline contacts."
                  : "Run a discovery scan from Settings to find contacts."}
              </p>
            </>
          ) : activeTab === "review" ? (
            <>
              <p className="text-sm font-medium text-zinc-600">Nothing needs manual review</p>
              {recommended.length > 0 && (
                <p className="text-xs mt-1">All contacts are in Recommended or filtered as noise.</p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-zinc-600">All caught up</p>
              <p className="text-xs mt-1">No contacts to review.</p>
            </>
          )}
        </div>
      )}

      {/* Main grid */}
      {gridMain.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gridMain.map((c) => (
            <DiscoverCard key={c.id} contact={c} onDismissed={handleDismissed} />
          ))}
        </div>
      )}

      {/* In "All" tab, also show noise contacts as full cards below */}
      {activeTab === "all" && allNoise.length > 0 && (
        <div className="mt-6">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-3 px-1">
            Likely Noise ({allNoise.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allNoise.map((c) => (
              <DiscoverCard key={c.id} contact={c} onDismissed={handleDismissed} />
            ))}
          </div>
        </div>
      )}

      {/* Collapsed noise section (Recommended / Review tabs only) */}
      {showNoiseSection && (
        <NoiseSection contacts={noise} onDismissed={handleDismissed} />
      )}
    </div>
  )
}
