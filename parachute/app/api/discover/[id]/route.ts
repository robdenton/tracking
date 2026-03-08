import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const DismissSchema = z.object({ action: z.literal("dismiss") })

const PromoteSchema = z.object({
  action: z.literal("promote"),
  fullName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
})

const ActionSchema = z.discriminatedUnion("action", [DismissSchema, PromoteSchema])

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const discovered = await prisma.discoveredContact.findUnique({ where: { id } })
  if (!discovered) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = ActionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  if (parsed.data.action === "dismiss") {
    await prisma.discoveredContact.update({
      where: { id },
      data: { dismissed: true },
    })
    return NextResponse.json({ ok: true })
  }

  if (parsed.data.action === "promote") {
    const { fullName, email, phone, company, role } = parsed.data

    const person = await prisma.person.create({
      data: {
        fullName,
        email: email || undefined,
        phone: phone || undefined,
        company: company || undefined,
        role: role || undefined,
      },
    })

    await prisma.discoveredContact.update({
      where: { id },
      data: { dismissed: true },
    })

    return NextResponse.json({ ok: true, personId: person.id })
  }
}
