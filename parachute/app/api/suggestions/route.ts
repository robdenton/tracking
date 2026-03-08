import { NextRequest, NextResponse } from "next/server"
import { getSuggestions } from "@/server/suggestions"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const status = searchParams.get("status") ?? undefined
  const priority = searchParams.get("priority") ? parseInt(searchParams.get("priority")!) : undefined
  const suggestions = await getSuggestions({ status, priority })
  return NextResponse.json(suggestions)
}
