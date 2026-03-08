import { NextRequest, NextResponse } from "next/server"
import { getSignals, createSignal, SignalSchema } from "@/server/signals"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const signals = await getSignals({
    personId: searchParams.get("personId") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    unread: searchParams.get("unread") === "true" ? true : undefined,
    needsAction: searchParams.get("needsAction") === "true" ? true : undefined,
  })
  return NextResponse.json(signals)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = SignalSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const signal = await createSignal(parsed.data)
  return NextResponse.json(signal, { status: 201 })
}
