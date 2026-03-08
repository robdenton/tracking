"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function SignalActions({ signalId, unread }: { signalId: string; unread: boolean }) {
  const router = useRouter()
  async function markRead() {
    await fetch(`/api/signals/${signalId}/read`, { method: "POST" })
    router.refresh()
  }
  if (!unread) return null
  return (
    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={markRead} title="Mark as read">
      <Check className="h-3.5 w-3.5" />
    </Button>
  )
}
