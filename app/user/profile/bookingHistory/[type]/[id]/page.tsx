import { auth } from "@/auth"
import { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { getBookingDetail } from "@/actions/users/getBookingDetail"
import BookingDetailClient from "./BookingDetail"

export async function generateMetadata({
  params,
}: {
  params: { type: string; id: string }
}): Promise<Metadata> {
  return {
    title: `${
      params.type.charAt(0).toUpperCase() + params.type.slice(1)
    } Booking #${params.id}`,
  }
}

export default async function BookingDetailPage({
  params,
}: {
  params: { type: string; id: string }
}) {
  const session = await auth.api.getSession({
    query: { disableCookieCache: true },
    headers: await headers(),
  })

  if (!session) {
    return null
  }

  const bookingId = parseInt(params.id, 10)
  if (isNaN(bookingId)) {
    notFound()
  }

  const booking = await getBookingDetail(
    params.type,
    bookingId,
    session.user.id
  )

  if (!booking) {
    notFound()
  }

  return <BookingDetailClient booking={booking} />
}
