"use client"

import { useState } from "react"
import { signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Mail, RefreshCw, LogOut, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export function ConnectGmailButton() {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    await signIn("google", { callbackUrl: "/settings" })
  }

  return (
    <Button onClick={handleConnect} disabled={loading} className="gap-2">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mail className="h-4 w-4" />
      )}
      Connect Gmail
    </Button>
  )
}

export function DisconnectButton() {
  const [loading, setLoading] = useState(false)

  const handleDisconnect = async () => {
    setLoading(true)
    await signOut({ callbackUrl: "/settings" })
  }

  return (
    <Button
      variant="outline"
      onClick={handleDisconnect}
      disabled={loading}
      className="gap-2 text-zinc-600"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Disconnect
    </Button>
  )
}

interface SyncResult {
  success: boolean
  gmailAccount?: string
  peopleChecked?: number
  totalCreated?: number
  syncedPeople?: Array<{ name: string; email: string; created: number }>
  error?: string
}

export function SyncGmailButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)

  const handleSync = async () => {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/integrations/gmail/sync", { method: "POST" })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ success: false, error: "Network error — please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleSync} disabled={loading} className="gap-2">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Syncing…
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            Sync Gmail Now
          </>
        )}
      </Button>

      {result && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            result.success
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {result.success ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle className="h-4 w-4" />
                Sync complete
              </div>
              <p className="text-green-700">
                Checked {result.peopleChecked} contacts · added{" "}
                <strong>{result.totalCreated}</strong> new interactions
              </p>
              {result.syncedPeople && result.syncedPeople.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-green-700">
                  {result.syncedPeople.map(p => (
                    <li key={p.email}>
                      {p.name} — +{p.created} email{p.created > 1 ? "s" : ""}
                    </li>
                  ))}
                </ul>
              )}
              {result.totalCreated === 0 && (
                <p className="text-green-600">Everything already up to date.</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {result.error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
