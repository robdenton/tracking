"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

interface PersonFormData {
  id?: string; fullName?: string; company?: string | null; role?: string | null; category?: string
  relationshipStrength?: number; notes?: string | null; topics?: string | null; introducedBy?: string | null
  location?: string | null; email?: string | null; phone?: string | null; linkedinUrl?: string | null; twitterUrl?: string | null
  website?: string | null; preferredChannel?: string | null; status?: string; tags?: Array<{ tag: { name: string } }>
}

export function PersonForm({ person }: { person?: PersonFormData }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState(person?.tags?.map((t) => t.tag.name).join(", ") ?? "")
  const [strength, setStrength] = useState(person?.relationshipStrength ?? 3)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      fullName: fd.get("fullName") as string,
      company: fd.get("company") as string || undefined,
      role: fd.get("role") as string || undefined,
      category: fd.get("category") as string,
      relationshipStrength: strength,
      notes: fd.get("notes") as string || undefined,
      topics: fd.get("topics") as string || undefined,
      introducedBy: fd.get("introducedBy") as string || undefined,
      location: fd.get("location") as string || undefined,
      email: fd.get("email") as string || undefined,
      phone: fd.get("phone") as string || undefined,
      linkedinUrl: fd.get("linkedinUrl") as string || undefined,
      twitterUrl: fd.get("twitterUrl") as string || undefined,
      website: fd.get("website") as string || undefined,
      preferredChannel: fd.get("preferredChannel") as string || undefined,
      status: fd.get("status") as string,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    }
    const url = person?.id ? `/api/people/${person.id}` : "/api/people"
    const method = person?.id ? "PATCH" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    const data = await res.json()
    setLoading(false)
    router.push(`/people/${person?.id ?? data.id}`)
    router.refresh()
  }

  const f = (name: string, label: string, type = "text", placeholder = "") => (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} defaultValue={person?.[name as keyof PersonFormData] as string ?? ""} />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-5 grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="fullName">Full name *</Label>
            <Input id="fullName" name="fullName" required defaultValue={person?.fullName ?? ""} placeholder="Jane Smith" />
          </div>
          {f("company", "Company", "text", "Acme Inc")}
          {f("role", "Role", "text", "CEO")}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select name="category" defaultValue={person?.category ?? "other"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["founder","marketer","investor","operator","other"].map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select name="status" defaultValue={person?.status ?? "active"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
                <SelectItem value="watchlist">Watchlist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Relationship strength: {strength}</Label>
            <input type="range" min={1} max={5} value={strength} onChange={e => setStrength(Number(e.target.value))} className="w-full" />
          </div>
          <div className="space-y-1.5">
            <Label>Preferred channel</Label>
            <Select name="preferredChannel" defaultValue={person?.preferredChannel ?? "email"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["email","linkedin","twitter","whatsapp","phone","in_person"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 grid grid-cols-2 gap-4">
          <h3 className="col-span-2 text-sm font-semibold text-zinc-700">Contact details</h3>
          {f("email", "Email", "email")}
          {f("phone", "Phone")}
          {f("location", "Location", "text", "London, UK")}
          {f("linkedinUrl", "LinkedIn URL")}
          {f("twitterUrl", "Twitter/X URL")}
          {f("website", "Website")}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-700">Context</h3>
          <div className="space-y-1.5">
            <Label htmlFor="topics">Topics they care about (comma-separated)</Label>
            <Input id="topics" name="topics" placeholder="growth, B2B SaaS, hiring" defaultValue={person?.topics ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label>Tags (comma-separated)</Label>
            <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="angel, advisor, vip" />
          </div>
          {f("introducedBy", "Introduced by")}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={4} placeholder="Anything worth remembering…" defaultValue={person?.notes ?? ""} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : person?.id ? "Save changes" : "Add person"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
