"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare } from "lucide-react"

export function LogInteractionButton({ personId, personName }: { personId: string; personName: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personId,
        type: fd.get("type"),
        occurredAt: new Date(fd.get("occurredAt") as string).toISOString(),
        summary: fd.get("summary"),
        direction: fd.get("direction"),
        requiresFollowUp: fd.get("requiresFollowUp") === "on",
        followUpDueAt: fd.get("followUpDueAt") ? new Date(fd.get("followUpDueAt") as string).toISOString() : undefined,
      }),
    })
    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <MessageSquare className="h-3.5 w-3.5 mr-1" />Log interaction
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log interaction with {personName}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select name="type" defaultValue="email">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["email","whatsapp","coffee","call","intro","dm","meeting","note","other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Direction</Label>
                <Select name="direction" defaultValue="mutual">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                    <SelectItem value="mutual">Mutual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="datetime-local" name="occurredAt" defaultValue={new Date().toISOString().slice(0,16)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Summary</Label>
              <Textarea name="summary" placeholder="What did you talk about?" rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="requiresFollowUp" id="rfu" className="rounded" />
              <Label htmlFor="rfu">Requires follow-up</Label>
              <Input type="date" name="followUpDueAt" className="ml-auto w-40" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Log interaction"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
