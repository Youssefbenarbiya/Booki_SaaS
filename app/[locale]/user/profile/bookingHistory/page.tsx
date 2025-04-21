import { auth } from "@/auth"
import { Metadata } from "next"
import { headers } from "next/headers"
import { getBookingHistory } from "@/actions/users/getBookingHistory"
import BookingHistoryClient from "./BookingHistory"

export const metadata: Metadata = {
  title: `Booking History`,
}

export default async function BookingHistoryPage() {
  const session = await auth.api.getSession({
    query: { disableCookieCache: true },
    headers: await headers(),
  })

  if (!session) {
    // Handle the case when there's no session (e.g., redirect to signin)
    return null
  }

  const bookings = await getBookingHistory(session.user.id)

  return <BookingHistoryClient initialBookings={bookings} />
}
