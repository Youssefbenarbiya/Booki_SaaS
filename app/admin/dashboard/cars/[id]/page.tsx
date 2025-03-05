import { notFound } from "next/navigation"
import { getCarById } from "../../../../../actions/carActions"
import { CarForm } from "../new/car-form"

interface CarEditPageProps {
  params: Promise<{ id: string }> 
}

export default async function CarEditPage({ params }: CarEditPageProps) {
  const { id: paramId } = await params

  const id = Number(paramId)

  if (isNaN(id)) {
    notFound()
  }

  const { car } = await getCarById(id).catch(() => ({ car: null }))

  if (!car) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Edit Car</h2>
      <CarForm initialData={car} isEditing />
    </div>
  )
}
