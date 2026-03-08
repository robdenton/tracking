"use client"

import { useState, useRef, useEffect } from "react"
import { X, Plus } from "lucide-react"

interface Identity {
  id: string
  value: string
}

interface Props {
  personId: string
  type: "email" | "phone"
  primary: string | null       // Person.email or Person.phone — always shown, non-removable
  initial: Identity[]
  icon: React.ReactNode
}

export function ContactIdentities({ personId, type, primary, initial, icon }: Props) {
  const [items, setItems] = useState<Identity[]>(initial)
  const [adding, setAdding] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when it appears
  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  // Nothing to show and no primary — render nothing
  if (!primary && items.length === 0 && !adding) {
    return (
      <div className="flex items-center gap-2 text-zinc-400 text-sm">
        {icon}
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <Plus className="h-3 w-3" />
          add {type}
        </button>
      </div>
    )
  }

  async function handleAdd() {
    const val = inputValue.trim()
    if (!val) { setAdding(false); return }

    setSaving(true)
    // Optimistic add
    const tempId = `temp-${Date.now()}`
    setItems(prev => [...prev, { id: tempId, value: val }])
    setInputValue("")
    setAdding(false)
    setSaving(false)

    try {
      const res = await fetch(`/api/people/${personId}/identities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value: val }),
      })
      if (!res.ok) throw new Error("Failed to save")
      const created = await res.json()
      // Replace temp with real id
      setItems(prev => prev.map(i => i.id === tempId ? created : i))
    } catch {
      // Revert optimistic change
      setItems(prev => prev.filter(i => i.id !== tempId))
    }
  }

  async function handleRemove(identityId: string) {
    // Optimistic remove
    setItems(prev => prev.filter(i => i.id !== identityId))

    try {
      const res = await fetch(`/api/people/${personId}/identities/${identityId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete")
    } catch {
      // Revert — re-fetch to get accurate state
      const res = await fetch(`/api/people/${personId}/identities`)
      if (res.ok) {
        const all: Identity[] = await res.json()
        setItems(all)
      }
    }
  }

  return (
    <div className="flex items-start gap-2 text-sm">
      {/* Icon — aligns with first chip */}
      <span className="mt-0.5 shrink-0">{icon}</span>

      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
        {/* Primary chip — non-removable */}
        {primary && (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 max-w-[180px] truncate">
            <span className="truncate">{primary}</span>
          </span>
        )}

        {/* Identity alias chips */}
        {items.map(item => (
          <span
            key={item.id}
            className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 max-w-[180px]"
          >
            <span className="truncate">{item.value}</span>
            <button
              onClick={() => handleRemove(item.id)}
              className="shrink-0 rounded-full text-zinc-400 hover:text-zinc-600 transition-colors -mr-0.5"
              aria-label={`Remove ${item.value}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {/* Inline input */}
        {adding ? (
          <input
            ref={inputRef}
            type={type === "email" ? "email" : "tel"}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") { e.preventDefault(); handleAdd() }
              if (e.key === "Escape") { setAdding(false); setInputValue("") }
            }}
            onBlur={() => {
              // Short delay so click on save doesn't cancel
              setTimeout(() => {
                if (inputValue.trim()) handleAdd()
                else { setAdding(false); setInputValue("") }
              }, 150)
            }}
            disabled={saving}
            placeholder={type === "email" ? "email@example.com" : "+44 7700 900000"}
            className="h-6 rounded-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-700 outline-none focus:border-zinc-400 w-44 placeholder:text-zinc-400"
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <Plus className="h-3 w-3" />
            add
          </button>
        )}
      </div>
    </div>
  )
}
