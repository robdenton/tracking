/**
 * Parachute — WhatsApp daemon
 *
 * Uses whatsapp-web.js (Puppeteer-based) to:
 *   1. Authenticate via QR code (once — session persists)
 *   2. On startup: fetch last 90 days of 1:1 message history and POST to Parachute
 *   3. Ongoing: stream new messages to Parachute in real-time
 *
 * Run from this directory:
 *   cp .env.example .env   (fill in PARACHUTE_URL and DAEMON_SECRET)
 *   npm install
 *   npm start
 */

import "dotenv/config"
import { Client, LocalAuth } from "whatsapp-web.js"
import qrcode from "qrcode-terminal"
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

const INGEST_URL = `${PARACHUTE_URL}/api/integrations/whatsapp/ingest`
const HISTORY_DAYS = 90
const HISTORY_LIMIT = 500 // max messages to fetch per chat on startup
const CHAT_DELAY_MS = 250 // small delay between chats during sync

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

client.on("qr", (qr) => {
  console.log("\n📱  Scan this QR code in WhatsApp → Linked Devices → Link a Device:\n")
  qrcode.generate(qr, { small: true })
  console.log("\nWaiting for scan…\n")
})

client.on("authenticated", () => {
  console.log("🔐  Authenticated — session saved for future runs.")
})

client.on("auth_failure", (msg) => {
  console.error("❌  Auth failed:", msg)
  process.exit(1)
})

client.on("ready", async () => {
  const info = client.info
  console.log(`\n✅  Connected as ${info.pushname} (${info.wid.user})\n`)
  await syncHistory()
  console.log("\n✅  History sync complete — listening for new messages…\n")
})

client.on("disconnected", (reason) => {
  console.error("❌  Disconnected:", reason)
  console.log("    Restarting in 10 seconds…")
  setTimeout(() => {
    client.initialize()
  }, 10_000)
})

// ─── Real-time message capture ─────────────────────────────────────────────────

// `message` = incoming; `message_create` = all (including sent by us)
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
      console.warn(`  ⚠️  Failed to fetch history for ${chat.name}:`, err)
    }
  }

  console.log(`  📊  Total messages posted to Parachute: ${totalSent}`)
}

// ─── Ingest ───────────────────────────────────────────────────────────────────

async function ingestMessage(msg: RawMessage): Promise<void> {
  // Only 1:1 personal chats — skip groups, broadcasts, status
  const contactJid = msg.fromMe ? msg.to : msg.from
  if (!isPersonalChat(contactJid)) return
  if (msg.type !== "chat") return // skip images, stickers, voice notes, etc.
  if (!msg.body?.trim()) return

  try {
    const res = await fetch(INGEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-daemon-secret": DAEMON_SECRET!,
      },
      body: JSON.stringify({
        waId: msg.waId,
        from: msg.from,
        to: msg.to,
        fromMe: msg.fromMe,
        body: msg.body,
        timestamp: msg.timestamp,
      }),
    })

    if (!res.ok && res.status !== 200) {
      console.warn(`  ⚠️  Ingest returned ${res.status} for message ${msg.waId}`)
    }
  } catch (err) {
    console.error("  ❌  Failed to POST to Parachute:", err)
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ─── Start ────────────────────────────────────────────────────────────────────

console.log("🚀  Parachute WhatsApp daemon starting…")
console.log(`    Parachute: ${PARACHUTE_URL}`)
console.log("")

client.initialize()
