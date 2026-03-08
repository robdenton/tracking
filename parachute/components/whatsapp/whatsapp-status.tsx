"use client"

/**
 * WhatsAppStatus — live polling component for the Settings page.
 *
 * States:
 *  - loading         : first fetch in flight
 *  - offline         : daemon not running (no recent heartbeat)
 *  - qr_pending      : daemon running, waiting for QR scan
 *  - connected       : authenticated, syncing or live
 *  - disconnected    : daemon reported disconnection
 */

import { useEffect, useState, useCallback } from "react"
import {
  CheckCircle2,
  Loader2,
  WifiOff,
  RefreshCw,
  Smartphone,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatusResponse {
  status: "offline" | "qr_pending" | "connected" | "disconnected"
  phone?: string
  name?: string
  syncDone?: boolean
  lastSeen?: string | null
}

interface QrResponse {
  qr: string | null
  fresh: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5_000
const QR_SERVICE_URL = "https://api.qrserver.com/v1/create-qr-code"

// ─── Component ────────────────────────────────────────────────────────────────

interface DiscoverState {
  status: "idle" | "loading" | "done" | "error"
  message?: string
}

export function WhatsAppStatus() {
  const [statusData, setStatusData] = useState<StatusResponse | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [discover, setDiscover] = useState<DiscoverState>({ status: "idle" })

  const handleDiscover = useCallback(async () => {
    setDiscover({ status: "loading" })
    try {
      const res = await fetch("/api/integrations/whatsapp/discover", { method: "POST" })
      if (!res.ok) throw new Error("Request failed")
      setDiscover({
        status: "done",
        message: "Discovery requested — daemon will push contacts within 30 seconds. Check Discovered Contacts.",
      })
    } catch {
      setDiscover({ status: "error", message: "Failed to request discovery — is the daemon running?" })
    }
  }, [])

  // Fetch current status from Parachute API
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/whatsapp/status", {
        cache: "no-store",
      })
      if (!res.ok) throw new Error("status fetch failed")
      const data: StatusResponse = await res.json()
      setStatusData(data)

      // If QR pending, also fetch the QR string
      if (data.status === "qr_pending") {
        const qRes = await fetch("/api/integrations/whatsapp/qr", {
          cache: "no-store",
        })
        if (qRes.ok) {
          const qData: QrResponse = await qRes.json()
          if (qData.qr && qData.fresh) {
            setQrUrl(
              `${QR_SERVICE_URL}/?size=220x220&data=${encodeURIComponent(qData.qr)}`
            )
          } else {
            setQrUrl(null)
          }
        }
      } else {
        setQrUrl(null)
      }
    } catch {
      // Silently ignore — keep last state
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch + polling
  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchStatus])

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-5 py-4 text-zinc-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking connection…</span>
      </div>
    )
  }

  const status = statusData?.status ?? "offline"

  // ── Connected ─────────────────────────────────────────────────────────────
  if (status === "connected") {
    return (
      <div className="divide-y divide-zinc-100">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-zinc-700">
              Connected as{" "}
              <span className="font-medium">
                {statusData?.name ?? statusData?.phone ?? "unknown"}
              </span>
              {statusData?.phone && statusData.name && (
                <span className="text-zinc-400"> ({statusData.phone})</span>
              )}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs text-zinc-400">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
            Live
          </span>
        </div>

        {statusData?.syncDone === false && (
          <div className="flex items-center gap-2 px-5 py-3 bg-amber-50">
            <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
            <p className="text-xs text-amber-700">
              Syncing message history… this may take a minute.
            </p>
          </div>
        )}

        {statusData?.syncDone === true && (
          <div className="flex items-center gap-2 px-5 py-3 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <p className="text-xs text-green-700">
              History sync complete — new messages stream in real-time.
            </p>
          </div>
        )}

        <div className="px-5 py-5 space-y-3">
          <div>
            <p className="text-sm font-medium text-zinc-800">Discover contacts</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Scans your WhatsApp chats for people you&apos;ve messaged who aren&apos;t yet in
              Parachute. Review and add them from the{" "}
              <a href="/people/discover" className="underline">Discovered Contacts</a> page.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDiscover}
            disabled={discover.status === "loading"}
            className="gap-2"
          >
            {discover.status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Requesting…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Discover contacts
              </>
            )}
          </Button>

          {discover.status === "done" && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-500" />
              <span>
                {discover.message}{" "}
                <a href="/people/discover" className="underline font-medium">
                  Review →
                </a>
              </span>
            </div>
          )}

          {discover.status === "error" && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              {discover.message}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── QR pending ────────────────────────────────────────────────────────────
  if (status === "qr_pending") {
    return (
      <div className="divide-y divide-zinc-100">
        <div className="flex items-center gap-2 px-5 py-4">
          <Smartphone className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-zinc-700 font-medium">
            Waiting for QR scan
          </span>
        </div>

        <div className="px-5 py-5 flex flex-col items-center gap-3">
          {qrUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="WhatsApp QR code"
                width={220}
                height={220}
                className="rounded-lg border border-zinc-200"
              />
              <p className="text-xs text-zinc-500 text-center max-w-xs">
                Open WhatsApp on your phone → Settings → Linked Devices →
                Link a Device → scan this code.
              </p>
              <p className="text-xs text-zinc-400">
                QR code refreshes automatically every ~60 seconds.
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4 text-zinc-400">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <p className="text-xs">Waiting for QR code from daemon…</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Offline / disconnected (default) ─────────────────────────────────────
  return (
    <div className="divide-y divide-zinc-100">
      <div className="flex items-center gap-2 px-5 py-4">
        <WifiOff className="h-4 w-4 text-zinc-400" />
        <span className="text-sm text-zinc-500">Daemon not running</span>
      </div>

      <div className="px-5 py-4 space-y-2">
        <p className="text-xs text-zinc-500 leading-relaxed">
          Start the daemon on your computer to connect:
        </p>
        <code className="block bg-zinc-100 rounded px-3 py-2 font-mono text-[11px] text-zinc-700 whitespace-pre">
          {`cd parachute/daemon\nnpm start`}
        </code>
        <p className="text-xs text-zinc-400">
          A QR code will appear here once the daemon is running.
        </p>
      </div>
    </div>
  )
}
