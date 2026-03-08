/**
 * Phone number normalization utilities.
 *
 * WhatsApp JIDs look like "447912345678@c.us"
 * Person.phone fields can be "+44 7912 345678", "07912345678", "+447912345678", etc.
 *
 * Strategy: strip all non-digits, then compare the last 9 digits.
 * This handles country code prefix variations and leading zeros.
 */

/** Strip everything except digits */
export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "")
}

/**
 * Returns true if two phone strings refer to the same number.
 * Compares the trailing 9 digits after stripping non-numeric characters.
 */
export function phonesMatch(a: string, b: string): boolean {
  const na = normalizePhone(a)
  const nb = normalizePhone(b)
  if (!na || !nb || na.length < 7 || nb.length < 7) return false
  const len = Math.min(9, Math.min(na.length, nb.length))
  return na.slice(-len) === nb.slice(-len)
}

/**
 * Extract the phone number from a WhatsApp JID.
 * "447912345678@c.us" → "447912345678"
 */
export function jidToPhone(jid: string): string {
  return jid.replace(/@.*$/, "")
}

/**
 * Is this a personal (1:1) chat JID?
 * Personal chats end with @c.us; groups end with @g.us.
 */
export function isPersonalChat(jid: string): boolean {
  return jid.endsWith("@c.us")
}
