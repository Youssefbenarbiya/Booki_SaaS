import { auth } from "@/auth"
import { Metadata } from "next"
import { headers } from "next/headers"
import { UpdateUserInfo } from "./profile-form"
import { getBookingHistory } from "@/actions/getBookingHistory"
import BookingHistoryClient from "./components/BookingHistory"

export const metadata: Metadata = {
  title: `Customer Profile`,
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    query: { disableCookieCache: true },
    headers: await headers(),
  })

  if (!session) {
    // Handle no session found; for example, you could redirect to signin.
    return null
  }

  // Get the user booking history
  const userId = session.user.id
  const bookings = await getBookingHistory(userId)

  return (
    <div>
      <div className="bg-gray-100 h-[200px]">{/* Profile Banner */}</div>
      <UpdateUserInfo session={session} />
      <BookingHistoryClient initialBookings={bookings} />
    </div>
  )
}
