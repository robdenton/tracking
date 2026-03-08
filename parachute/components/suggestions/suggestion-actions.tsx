"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

export function SuggestionActions({ suggestionId }: { suggestionId: string }) {
  const router = useRouter()
  async function update(status: "done" | "dismissed") {
    await fetch(`/api/suggestions/${suggestionId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    router.refresh()
  }
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => update("done")}><Check className="h-3.5 w-3.5 mr-1" />Done</Button>
      <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-zinc-600" onClick={() => update("dismissed")}><X className="h-3.5 w-3.5 mr-1" />Dismiss</Button>
    </div>
  )
}
