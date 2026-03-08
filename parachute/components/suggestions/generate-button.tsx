"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export function GenerateSuggestionsButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  async function generate() {
    setLoading(true)
    await fetch("/api/suggestions/generate", { method: "POST" })
    setLoading(false)
    router.refresh()
  }
  return (
    <Button size="sm" variant="outline" onClick={generate} disabled={loading}>
      <Sparkles className="h-3.5 w-3.5 mr-1" />{loading ? "Generating…" : "Generate"}
    </Button>
  )
}
