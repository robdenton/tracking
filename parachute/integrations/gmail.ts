// Gmail integration stub
// Future: use Gmail API (OAuth2) to fetch last email per contact
// and populate Interaction records automatically

export interface GmailMessage {
  id: string
  threadId: string
  from: string
  to: string
  subject: string
  date: Date
  snippet: string
}

export async function getLastEmailForAddress(_email: string): Promise<GmailMessage | null> {
  // TODO: implement with googleapis package
  // const gmail = google.gmail({ version: 'v1', auth })
  // const res = await gmail.users.messages.list({ userId: 'me', q: `from:${email} OR to:${email}` })
  console.warn("Gmail integration not yet implemented — returning mock data")
  return null
}

export async function syncContactInteractions(_personId: string, _email: string): Promise<void> {
  // TODO: fetch recent threads, create Interaction records
}
