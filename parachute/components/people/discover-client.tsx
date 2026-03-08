"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Phone, MessageCircle, X, UserPlus, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { formatRelative } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiscoveredContact {
  id: string
  source: string
  name: string | null
  email: string | null
  phone: string | null
  messageCount: number
  lastSeenAt: string
}

interface Props {
  initialContacts: DiscoveredContact[]
}

// ─── Individual card ──────────────────────────────────────────────────────────

function DiscoverCard({ contact, onDismissed }: { contact: DiscoveredContact; onDismissed: (id: string) => void }) {
  const router = useRouter()
  const [expanding, setExpanding] = useState(false)
  const [dismissing, startDismiss] = useTransition()
  const [promoting, startPromote] = useTransition()

  // Form state
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

            <div className="mt-0.5 space-y-0.5">
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

// ─── Main client component ────────────────────────────────────────────────────

export function DiscoverClient({ initialContacts }: Props) {
  const [contacts, setContacts] = useState<DiscoveredContact[]>(initialContacts)

  function handleDismissed(id: string) {
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  if (contacts.length === 0) {
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
      <p className="text-zinc-500 text-sm mb-6">
        {contacts.length} contact{contacts.length !== 1 ? "s" : ""} found · Add the ones you know, discard the rest.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((c) => (
          <DiscoverCard key={c.id} contact={c} onDismissed={handleDismissed} />
        ))}
      </div>
    </div>
  )
}
