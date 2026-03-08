import { auth } from "@/auth"
import { ConnectGmailButton, DisconnectButton, SyncGmailButton, DiscoverGmailButton } from "@/components/auth/gmail-buttons"
import { WhatsAppStatus } from "@/components/whatsapp/whatsapp-status"
import { Mail, CheckCircle2, Info, MessageCircle, Terminal } from "lucide-react"

export default async function SettingsPage() {
  const session = await auth()
  const gmailConnected = !!session?.accessToken

  // Derive the daemon secret for display in setup instructions
  const daemonSecret = process.env.WHATSAPP_DAEMON_SECRET ?? "(set WHATSAPP_DAEMON_SECRET in .env)"
  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

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

          {gmailConnected && (
            <>
              <div className="px-5 py-5 space-y-3 border-b border-zinc-100">
                <div>
                  <p className="text-sm font-medium text-zinc-800">Sync emails</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Scans your last 90 days of Gmail for emails to/from any contact in Parachute.
                    Matched emails are added as interactions and update each person&apos;s last-contact
                    date. Only email subjects and metadata are read — no message bodies.
                  </p>
                </div>
                <SyncGmailButton />
              </div>

              <div className="px-5 py-5 space-y-3">
                <div>
                  <p className="text-sm font-medium text-zinc-800">Discover contacts</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Scans your last 90 days of Gmail for people you&apos;ve emailed who aren&apos;t yet
                    in Parachute. Review and add them from the{" "}
                    <a href="/people/discover" className="underline">Discovered Contacts</a> page.
                  </p>
                </div>
                <DiscoverGmailButton />
              </div>
            </>
          )}

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

      {/* WhatsApp Daemon */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100">
            <MessageCircle className="h-5 w-5 text-zinc-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900">WhatsApp</h2>
            <p className="text-zinc-500 text-sm">
              Local daemon that syncs message history from your personal WhatsApp account.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          {/* Live status + QR — polls every 5s */}
          <WhatsAppStatus />

          {/* Setup steps — always visible so user knows what to run */}
          <div className="px-5 py-5 space-y-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-zinc-500 shrink-0" />
              <p className="text-sm font-medium text-zinc-800">Setup (one-time)</p>
            </div>

            <ol className="space-y-3 text-xs text-zinc-600">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-[10px] font-semibold">1</span>
                <div>
                  <p className="font-medium text-zinc-700">Open a terminal in the daemon folder</p>
                  <code className="block mt-1 bg-zinc-100 rounded px-2 py-1 font-mono text-[11px]">
                    cd /path/to/parachute/daemon
                  </code>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-[10px] font-semibold">2</span>
                <div>
                  <p className="font-medium text-zinc-700">Install and configure</p>
                  <code className="block mt-1 bg-zinc-100 rounded px-2 py-1 font-mono text-[11px] whitespace-pre">
                    {`npm install\ncp .env.example .env`}
                  </code>
                  <p className="mt-1 text-zinc-500">
                    In <code className="bg-zinc-100 px-1 rounded font-mono">daemon/.env</code>, set:
                  </p>
                  <code className="block mt-1 bg-zinc-100 rounded px-2 py-1 font-mono text-[11px] whitespace-pre">
                    {`PARACHUTE_URL=${appUrl}\nDAEMON_SECRET=${daemonSecret}`}
                  </code>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-[10px] font-semibold">3</span>
                <div>
                  <p className="font-medium text-zinc-700">Start the daemon</p>
                  <code className="block mt-1 bg-zinc-100 rounded px-2 py-1 font-mono text-[11px]">
                    npm start
                  </code>
                  <p className="mt-1 text-zinc-500">
                    A QR code will appear <strong>above</strong>. Open WhatsApp → Settings →
                    Linked Devices → Link a Device → scan it. On subsequent runs no scan is
                    needed — it auto-reconnects.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Privacy note */}
          <div className="px-5 py-4 flex items-start gap-2 bg-zinc-50 rounded-b-xl">
            <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-500">
              The daemon runs <strong>on your machine</strong> and posts to Parachute over a shared
              secret. Groups and media messages are ignored. Run it from your home network for best
              results — see <code className="bg-zinc-100 px-1 rounded">daemon/README.md</code> for
              full details.
            </p>
          </div>
        </div>
      </section>

      {/* Coming soon */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
          Coming soon
        </h2>
        <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          {["LinkedIn", "Twitter / X", "News & Web mentions"].map(name => (
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
