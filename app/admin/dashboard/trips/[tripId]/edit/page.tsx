import { getTripById } from "@/actions/tripActions"
import { notFound } from "next/navigation"
import EditTripForm from "./EditTripForm"

export default async function EditTripPage({
  params,
}: {
  params: { tripId: string }
}) {
  const trip = await getTripById(parseInt(params.tripId))

  if (!trip) {
    notFound()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Trip</h1>
      <EditTripForm trip={trip} />
    </div>
  )
} 