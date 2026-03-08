"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart } from "lucide-react"

export function LogValueEventButton({ personId, personName }: { personId: string; personName: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await fetch("/api/value-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personId,
        type: fd.get("type"),
        occurredAt: new Date(fd.get("occurredAt") as string).toISOString(),
        summary: fd.get("summary"),
        outcome: fd.get("outcome") || undefined,
      }),
    })
    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Heart className="h-3.5 w-3.5 mr-1" />Log value
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log value delivered to {personName}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select name="type" defaultValue="advice">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["intro","feedback","support","advice","referral","promotion","other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" name="occurredAt" defaultValue={new Date().toISOString().split("T")[0]} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>What did you do?</Label>
              <Textarea name="summary" placeholder="Described the situation and what you provided…" rows={3} required />
            </div>
            <div className="space-y-1.5">
              <Label>Outcome (optional)</Label>
              <Input name="outcome" placeholder="e.g. They made the hire, closed the deal…" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Log value"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
