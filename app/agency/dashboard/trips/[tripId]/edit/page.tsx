/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTripById } from "@/actions/trips/tripActions"
import { notFound } from "next/navigation"
import EditTripForm from "./EditTripForm"

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ tripId: string }>
}) {
  const { tripId } = await params
  const trip = await getTripById(parseInt(tripId))

  if (!trip) {
    notFound()
  }
  const transformedTrip = {
    id: trip.id,
    name: trip.name,
    description: trip.description ?? "",
    destination: trip.destination,
    startDate: new Date(trip.startDate),
    endDate: new Date(trip.endDate),
    price: Number(trip.price),
    capacity: trip.capacity,
    isAvailable: trip.isAvailable ?? false,
    images: trip.images.map((img: any) => ({
      id: img.id,
      imageUrl: img.imageUrl,
    })),
    activities: trip.activities.map((act: any) => ({
      id: act.id,
      activityName: act.activityName,
      description: act.description ?? "",
      scheduledDate: act.scheduledDate ? new Date(act.scheduledDate) : null,
    })),
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Trip</h1>
      <EditTripForm trip={transformedTrip} />
    </div>
  )
}
