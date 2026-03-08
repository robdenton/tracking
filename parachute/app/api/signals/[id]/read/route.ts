import { NextRequest, NextResponse } from "next/server"
import { markSignalRead } from "@/server/signals"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const signal = await markSignalRead(id)
  return NextResponse.json(signal)
}
