// app/dashboard/flights/[flightId]/edit/page.tsx
import { getFlightById } from "@/actions/flightActions"
import EditFlightForm from "./EditFlightForm"

export default async function EditFlightPage({
  params,
}: {
  params: { flightId: string }
}) {
  const flight = await getFlightById(params.flightId)
  if (!flight) {
    return <p>Flight not found</p>
  }
  return <EditFlightForm flight={flight} />
}
