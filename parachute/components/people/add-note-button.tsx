"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

export function AddNoteButton({ personId }: { personId: string }) {
  const [open, setOpen] = useState(false)
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function save() {
    if (!body.trim()) return
    setLoading(true)
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId, body }),
    })
    setBody("")
    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  if (!open) return (
    <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
      <Plus className="h-3.5 w-3.5 mr-1" />Add note
    </Button>
  )

  return (
    <div className="space-y-2">
      <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write a note…" rows={3} autoFocus />
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={loading}>{loading ? "Saving…" : "Save note"}</Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  )
}
