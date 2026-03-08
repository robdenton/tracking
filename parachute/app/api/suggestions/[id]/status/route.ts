import { NextRequest, NextResponse } from "next/server"
import { updateSuggestionStatus } from "@/server/suggestions"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status } = await req.json()
  const s = await updateSuggestionStatus(id, status)
  return NextResponse.json(s)
}
