import { NextResponse } from "next/server"
import { generateSuggestions } from "@/server/suggestions"

export async function POST() {
  await generateSuggestions()
  return NextResponse.json({ ok: true })
}
