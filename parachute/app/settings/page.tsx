import { auth } from "@/auth"
import { ConnectGmailButton, DisconnectButton, SyncGmailButton } from "@/components/auth/gmail-buttons"
import { Mail, CheckCircle2, Info } from "lucide-react"

export default async function SettingsPage() {
  const session = await auth()
  const gmailConnected = !!session?.accessToken

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage integrations and data sources.</p>
      </div>

      {/* Gmail Integration */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100">
            <Mail className="h-5 w-5 text-zinc-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Gmail</h2>
            <p className="text-zinc-500 text-sm">
              Automatically import email interactions as contact history.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          {/* Status row */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              {gmailConnected ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-zinc-700">
                    Connected as{" "}
                    <span className="font-medium">{session.user?.email}</span>
                  </span>
                </>
              ) : (
                <span className="text-sm text-zinc-500">Not connected</span>
              )}
            </div>
            {gmailConnected ? <DisconnectButton /> : <ConnectGmailButton />}
          </div>

          {/* Sync row — only shown when connected */}
          {gmailConnected && (
            <div className="px-5 py-5 space-y-3">
              <div>
                <p className="text-sm font-medium text-zinc-800">Sync emails</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Scans your last 90 days of Gmail for emails to/from any contact in Parachute.
                  Matched emails are added as interactions and update each person's last-contact
                  date. Only email subjects and metadata are read — no message bodies.
                </p>
              </div>
              <SyncGmailButton />
            </div>
          )}

          {/* What we read */}
          <div className="px-5 py-4 flex items-start gap-2 bg-zinc-50 rounded-b-xl">
            <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-500">
              Parachute requests <strong>read-only</strong> Gmail access. We read subject lines,
              sender/recipient addresses, and dates only — never message bodies. Your data is never
              shared or sold.
            </p>
          </div>
        </div>
      </section>

      {/* Future integrations placeholder */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
          Coming soon
        </h2>
        <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          {["LinkedIn", "Twitter / X", "WhatsApp", "News & Web mentions"].map(name => (
            <div key={name} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm text-zinc-500">{name}</span>
              <span className="text-xs bg-zinc-100 text-zinc-500 rounded-full px-2.5 py-0.5">
                Soon
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
