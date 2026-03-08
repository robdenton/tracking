"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransition, useCallback } from "react"

export function PeopleFilters() {
  const router = useRouter()
  const sp = useSearchParams()
  const [, startTransition] = useTransition()

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(sp.toString())
    if (value && value !== "all") params.set(key, value)
    else params.delete(key)
    startTransition(() => router.push(`/people?${params.toString()}`))
  }, [sp, router])

  return (
    <div className="flex gap-3">
      <Input
        placeholder="Search name, company..."
        defaultValue={sp.get("search") ?? ""}
        onChange={(e) => update("search", e.target.value)}
        className="max-w-xs"
      />
      <Select defaultValue={sp.get("category") ?? "all"} onValueChange={(v) => update("category", v)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          <SelectItem value="founder">Founder</SelectItem>
          <SelectItem value="marketer">Marketer</SelectItem>
          <SelectItem value="investor">Investor</SelectItem>
          <SelectItem value="operator">Operator</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue={sp.get("status") ?? "all"} onValueChange={(v) => update("status", v)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="dormant">Dormant</SelectItem>
          <SelectItem value="watchlist">Watchlist</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
