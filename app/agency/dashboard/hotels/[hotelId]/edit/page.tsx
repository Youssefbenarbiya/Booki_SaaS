// app/agency/dashboard/hotels/[hotelId]/edit/page.tsx

import { getHotelById } from "@/actions/hotelActions"
import EditHotelForm from "./EditHotelForm"
import { notFound } from "next/navigation"

export default async function EditHotelPage({
  params,
}: {
  params: Promise<{ hotelId: string }>
}) {
  const { hotelId } = await params

  const hotel = await getHotelById(hotelId)

  if (!hotel) {
    notFound()
  }

  return <EditHotelForm hotel={hotel} />
}

// export default async function EditHotelPage() {
//   return (
//     <div>
//       <h1>Edit Hotel</h1>
//     </div>
//   )
// }
