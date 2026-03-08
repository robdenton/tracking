import { PersonForm } from "@/components/people/person-form"

export default function NewPersonPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Add person</h1>
        <p className="text-zinc-500 text-sm mt-1">Add a new contact to your network.</p>
      </div>
      <PersonForm />
    </div>
  )
}
