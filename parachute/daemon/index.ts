/**
 * Parachute — WhatsApp daemon
 *
 * Uses whatsapp-web.js (Puppeteer-based) to:
 *   1. Authenticate via QR code — displayed in your Parachute Settings page
 *   2. On startup: fetch last 90 days of 1:1 message history and POST to Parachute
 *   3. Ongoing: stream new messages to Parachute in real-time
 *   4. Send heartbeats so the Settings page shows live connection status
 *
 * Run from this directory:
 *   cp .env.example .env   (fill in PARACHUTE_URL and DAEMON_SECRET)
 *   npm install
 *   npm start
 *
 * Then open Parachute → Settings → WhatsApp to scan the QR code.
 */

import "dotenv/config"
import { Client, LocalAuth } from "whatsapp-web.js"
import { isPersonalChat, jidToPhone } from "./phone"

// ─── Config ───────────────────────────────────────────────────────────────────

const PARACHUTE_URL = process.env.PARACHUTE_URL
const DAEMON_SECRET = process.env.DAEMON_SECRET

if (!PARACHUTE_URL || !DAEMON_SECRET) {
  console.error(
    "❌  Missing PARACHUTE_URL or DAEMON_SECRET in .env\n" +
      "    Copy .env.example → .env and fill in the values."
  )
  process.exit(1)
}

const HEADERS = {
  "Content-Type": "application/json",
  "x-daemon-secret": DAEMON_SECRET,
}

const HISTORY_DAYS = 90
const HISTORY_LIMIT = 500
const CHAT_DELAY_MS = 250
const HEARTBEAT_INTERVAL_MS = 30_000

// ─── API helpers ──────────────────────────────────────────────────────────────

async function post(path: string, body: object): Promise<void> {
  try {
    await fetch(`${PARACHUTE_URL}${path}`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(body),
    })
  } catch (err) {
    console.error(`  ❌  POST ${path} failed:`, err)
  }
}

// ─── Client ───────────────────────────────────────────────────────────────────

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "parachute" }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  },
})

// ─── Auth events ──────────────────────────────────────────────────────────────

client.on("qr", async (qr) => {
  console.log("📱  QR code ready — open Parachute → Settings → WhatsApp to scan it.")
  // POST QR to Parachute so it can display it in the browser
  await post("/api/integrations/whatsapp/qr", { qr })
  await post("/api/integrations/whatsapp/status", { status: "qr_pending" })
})

client.on("authenticated", () => {
  console.log("🔐  Authenticated — session saved.")
})

client.on("auth_failure", (msg) => {
  console.error("❌  Auth failed:", msg)
  process.exit(1)
})

client.on("ready", async () => {
  const info = client.info
  const phone = `+${info.wid.user}`
  const name = info.pushname

  console.log(`\n✅  Connected as ${name} (${phone})\n`)

  // Notify Parachute — Settings page will show "Connected"
  await post("/api/integrations/whatsapp/status", {
    status: "connected",
    phone,
    name,
    syncDone: false,
  })

  // Start heartbeat
  startHeartbeat(phone, name)

  // Sync history
  await syncHistory()

  await post("/api/integrations/whatsapp/status", {
    status: "connected",
    phone,
    name,
    syncDone: true,
  })

  console.log("\n✅  History sync complete — listening for new messages…\n")
})

client.on("disconnected", async (reason) => {
  console.error("❌  Disconnected:", reason)
  await post("/api/integrations/whatsapp/status", { status: "disconnected" })
  console.log("    Restarting in 10 seconds…")
  setTimeout(() => client.initialize(), 10_000)
})

// ─── Heartbeat ────────────────────────────────────────────────────────────────

function startHeartbeat(phone: string, name: string): void {
  setInterval(async () => {
    await post("/api/integrations/whatsapp/status", {
      status: "connected",
      phone,
      name,
    })
  }, HEARTBEAT_INTERVAL_MS)
}

// ─── Real-time message capture ─────────────────────────────────────────────────

client.on("message_create", async (msg) => {
  await ingestMessage({
    waId: msg.id._serialized,
    from: msg.from,
    to: msg.to,
    fromMe: msg.fromMe,
    body: msg.body,
    timestamp: msg.timestamp,
    type: msg.type,
  })
})

// ─── History sync ─────────────────────────────────────────────────────────────

interface RawMessage {
  waId: string
  from: string
  to: string
  fromMe: boolean
  body: string
  timestamp: number
  type: string
}

async function syncHistory(): Promise<void> {
  const cutoff = Math.floor(Date.now() / 1000) - HISTORY_DAYS * 24 * 60 * 60
  const chats = await client.getChats()
  const personal = chats.filter((c) => isPersonalChat(c.id._serialized))

  console.log(`📨  Syncing ${personal.length} personal chats (last ${HISTORY_DAYS} days)…`)

  let totalSent = 0

  for (const chat of personal) {
    try {
      const messages = await chat.fetchMessages({ limit: HISTORY_LIMIT })
      const recent = messages.filter((m) => m.timestamp >= cutoff && m.type === "chat")

      for (const msg of recent) {
        await ingestMessage({
          waId: msg.id._serialized,
          from: msg.from,
          to: msg.to,
          fromMe: msg.fromMe,
          body: msg.body,
          timestamp: msg.timestamp,
          type: msg.type,
        })
        totalSent++
      }

      if (recent.length > 0) {
        const partner = jidToPhone(chat.id._serialized)
        console.log(`  → ${chat.name || partner}: ${recent.length} messages`)
      }

      await sleep(CHAT_DELAY_MS)
    } catch (err) {
      console.warn(`  ⚠️  Failed to fetch ${chat.name}:`, err)
    }
  }

  console.log(`  📊  Total messages sent to Parachute: ${totalSent}`)
}

// ─── Ingest individual message ────────────────────────────────────────────────

async function ingestMessage(msg: RawMessage): Promise<void> {
  const contactJid = msg.fromMe ? msg.to : msg.from
  if (!isPersonalChat(contactJid)) return
  if (msg.type !== "chat") return
  if (!msg.body?.trim()) return

  await post("/api/integrations/whatsapp/ingest", {
    waId: msg.waId,
    from: msg.from,
    to: msg.to,
    fromMe: msg.fromMe,
    body: msg.body,
    timestamp: msg.timestamp,
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// ─── Start ────────────────────────────────────────────────────────────────────

console.log("🚀  Parachute WhatsApp daemon starting…")
console.log(`    Parachute: ${PARACHUTE_URL}`)
console.log("    Open Settings → WhatsApp to scan the QR code.\n")

client.initialize()
