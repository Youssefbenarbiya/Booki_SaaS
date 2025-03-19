import { auth } from "@/auth"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { getBookingHistory } from "@/actions/users/getBookingHistory"

export const metadata: Metadata = {
  title: `Customer Profile`,
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    query: { disableCookieCache: true },
    headers: await headers(),
  })

  if (!session) {
    return null
  }

  const userName = session.user?.name || "User"
  const userEmail = session.user?.email || "user@example.com"
  const userAdress = session.user?.address || "city, country"
  const userRole = session.user?.role || "customer"
  const userPhone = session.user?.phoneNumber || "phone number"
  const userPhoto = session.user?.image || "User"

  const allBookings = await getBookingHistory(session.user.id)
  const bookings = allBookings.slice(0, 6)

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarImage src={userPhoto} alt={userName} />
              <AvatarFallback>
                {userName.charAt(0)}
                {userName.split(" ")[1]?.charAt(0) || ""}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{userName}</h2>
            <p className="text-sm text-muted-foreground mb-4">{userRole}</p>
            <Link href="/user/profile/personal-info">
              <Button
                variant="outline"
                className="text-orange-500 border-orange-500 hover:bg-orange-50 hover:text-orange-600"
              >
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Billing Address Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-normal text-muted-foreground">
              BILLING ADDRESS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <h2 className="text-lg font-semibold">{userName}</h2>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">{userAdress}</p>
              <p className="text-muted-foreground">{userEmail}</p>
              <p className="text-muted-foreground">{userPhone}</p>
            </div>
            <Button
              variant="outline"
              className="text-orange-500 border-orange-500 hover:bg-orange-50 hover:text-orange-600"
            >
              Edit Address
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Order History */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent Order History</h2>
          <Button
            variant="ghost"
            className="text-orange-500 hover:text-orange-600 hover:bg-transparent"
          >
            View All
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Booking ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={`${booking.type}-${booking.id}`}>
                    <TableCell className="font-medium">{booking.id}</TableCell>
                    <TableCell>{booking.type}</TableCell>
                    <TableCell>
                      {new Date(booking.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{booking.totalPrice}</TableCell>
                    <TableCell>
                      <span
                        className={`${
                          booking.status === "Processing"
                            ? "text-blue-600"
                            : booking.status === "on the way"
                            ? "text-amber-600"
                            : "text-green-600"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                     
                      <Link
                        href={`/user/profile/bookingHistory/${booking.type}/${booking.id}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
