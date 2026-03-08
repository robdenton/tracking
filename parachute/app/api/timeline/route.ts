import { NextRequest, NextResponse } from "next/server"
import { getTimeline } from "@/server/timeline"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const personId = searchParams.get("personId") ?? undefined
  const limit = parseInt(searchParams.get("limit") ?? "50")
  const items = await getTimeline(personId, limit)
  return NextResponse.json(items)
}
