import { auth } from "@/auth"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { getBookingDetail } from "@/actions/users/getBookingDetail"
import BookingDetailClient from "./BookingDetail"


export default async function BookingDetailPage({
  params: initialParams,
}: {
  params: Promise<{ type: string; id: string }>
}) {
  // Await the params before accessing their properties.
  const { type, id } = await initialParams

  const session = await auth.api.getSession({
    query: { disableCookieCache: true },
    headers: await headers(),
  })

  if (!session) {
    return null
  }

  const bookingId = parseInt(id, 10)
  if (isNaN(bookingId)) {
    notFound()
  }

  const booking = await getBookingDetail(type, bookingId, session.user.id)
  if (!booking) {
    notFound()
  }

  return <BookingDetailClient booking={booking} />
}
