import { getPersonById } from "@/server/people"
import { notFound } from "next/navigation"
import { PersonForm } from "@/components/people/person-form"

export default async function EditPersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const person = await getPersonById(id)
  if (!person) notFound()
  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Edit {person.fullName}</h1>
        <p className="text-zinc-500 text-sm mt-1">Update contact details and context.</p>
      </div>
      <PersonForm person={person} />
    </div>
  )
}
