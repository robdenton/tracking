"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useTransition, useCallback } from "react"

export function SignalFilters() {
  const router = useRouter()
  const sp = useSearchParams()
  const [, startTransition] = useTransition()

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(sp.toString())
    if (value && value !== "all") params.set(key, value)
    else params.delete(key)
    startTransition(() => router.push(`/signals?${params.toString()}`))
  }, [sp, router])

  return (
    <div className="flex gap-3 flex-wrap">
      <Select defaultValue={sp.get("type") ?? "all"} onValueChange={v => update("type", v)}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Signal type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {["funding","product_launch","hiring","linkedin_post","tweet","podcast","blog","job_change","speaking","time_based","news"].map(t =>
            <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
          )}
        </SelectContent>
      </Select>
      <Button variant={sp.get("unread") === "true" ? "default" : "outline"} size="sm" onClick={() => update("unread", sp.get("unread") === "true" ? "" : "true")}>
        Unread only
      </Button>
      <Button variant={sp.get("needsAction") === "true" ? "default" : "outline"} size="sm" onClick={() => update("needsAction", sp.get("needsAction") === "true" ? "" : "true")}>
        Needs action
      </Button>
    </div>
  )
}
