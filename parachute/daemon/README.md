# Parachute — WhatsApp Daemon

A local Node.js service that connects to your personal WhatsApp account (via WhatsApp Web) and streams messages into Parachute as interaction records.

## How it works

- Uses [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) — the same Puppeteer-based engine as WhatsApp Web in your browser
- Authenticates once via QR code → session persists (no re-scan needed on restart)
- On startup: syncs last 90 days of 1:1 message history for all contacts
- Ongoing: streams new messages to Parachute in real-time
- Only reads **personal (1:1) text messages** — groups, media, and status are ignored
- Message body is truncated to 120 chars for storage (subject-line level, like Gmail)

## ⚠️ Important

This uses WhatsApp's unofficial web protocol. It is **not endorsed by Meta** and technically violates WhatsApp's Terms of Service. To minimise detection risk:
- **Run it on your home machine** (not a cloud server)
- **Never use it to send messages** to contacts
- If you notice unusual WhatsApp behaviour, stop the daemon and disconnect via WhatsApp → Linked Devices

## Setup

### 1. Install dependencies

```bash
cd daemon
npm install
```

### 2. Configure

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Local development (run Parachute with `npm run dev` first)
PARACHUTE_URL=http://localhost:3000

# Or point at your production Vercel deployment
# PARACHUTE_URL=https://parachute-three.vercel.app

# Must match WHATSAPP_DAEMON_SECRET in Parachute's .env / Vercel
DAEMON_SECRET=your-secret-here
```

Get the `DAEMON_SECRET` value from your Parachute `.env` file (`WHATSAPP_DAEMON_SECRET`).

### 3. Start

```bash
npm start
```

A QR code will appear in your terminal. Open WhatsApp on your phone:
- **iPhone**: Settings → Linked Devices → Link a Device
- **Android**: ⋮ (three dots) → Linked Devices → Link a Device

Scan the QR code. After a few seconds you'll see:

```
✅  Connected as Rob (447912345678)
📨  Syncing 42 personal chats (last 90 days)…
  → Sarah Johnson: 23 messages
  → James Chen: 11 messages
  ...
✅  History sync complete — listening for new messages…
```

The daemon is now running. Leave the terminal window open (or use `pm2` / `screen` to run it in the background).

### 4. Run in background (optional)

Using `pm2`:

```bash
npm install -g pm2
pm2 start "npm start" --name parachute-whatsapp
pm2 save
pm2 startup  # auto-start on login
```

Or simply use a `screen` session:

```bash
screen -S parachute-wa
npm start
# Ctrl+A, D to detach
```

## Verify it's working

1. Go to Parachute → any contact with a matching phone number
2. Check their **Interactions** tab — WhatsApp messages should appear
3. Send yourself a test message → it should appear in Parachute within a few seconds

## Disconnect

To remove the WhatsApp link entirely:
1. Stop the daemon (`Ctrl+C` or `pm2 stop parachute-whatsapp`)
2. Delete the session: `rm -rf .wwebjs_auth/`
3. Remove the linked device in WhatsApp: Settings → Linked Devices → tap the device → Log out

## Troubleshooting

| Problem | Fix |
|---------|-----|
| QR keeps regenerating | WhatsApp Web session expired — re-scan the QR |
| "Missing DAEMON_SECRET" error | Check `.env` file exists and has the correct value |
| Messages not appearing in Parachute | Ensure Parachute is running (`npm run dev`) and the contact has a matching phone number |
| Connection drops frequently | Check your internet. The daemon auto-reconnects after 10 seconds. |
