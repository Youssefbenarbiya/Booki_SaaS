import { auth } from "@/auth"
import { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { getBookingDetail } from "@/actions/users/getBookingDetail"
import BookingDetailClient from "./BookingDetail"
export async function generateMetadata({
  params: initialParams,
}: {
  params: { type: string; id: string }
}): Promise<Metadata> {
  // Await the params before using them.
  const { type, id } = await initialParams
  return {
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Booking #${id}`,
  }
}

export default async function BookingDetailPage({
  params: initialParams,
}: {
  params: { type: string; id: string }
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
