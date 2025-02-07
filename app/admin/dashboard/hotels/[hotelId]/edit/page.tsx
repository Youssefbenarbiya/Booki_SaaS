import { getHotelById } from "@/actions/hotelActions"
import EditHotelForm from "./EditHotelForm"
import { notFound } from "next/navigation"

export default async function EditHotelPage({
  params,
}: {
  params: { hotelId: string }
}) {
  const hotel = await getHotelById(params.hotelId)

  if (!hotel) {
    notFound()
  }

  return <EditHotelForm hotel={hotel} />
} 