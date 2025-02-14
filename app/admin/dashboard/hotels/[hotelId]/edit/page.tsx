import { getHotelById } from "@/actions/hotelActions"
import EditHotelForm from "./EditHotelForm"
import { notFound } from "next/navigation"

export default async function EditHotelPage({
  params,
}: {
  params: Promise<{ hotelId: string }>
}) {
  const hotelId = (await params).hotelId

  const hotel = await getHotelById(hotelId)

  if (!hotel) {
    notFound()
  }

  return <EditHotelForm hotel={hotel} />
}
