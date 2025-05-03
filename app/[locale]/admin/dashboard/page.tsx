import {
  getDashboardStats,
  getRecentActivities,
  getBookingStatistics,
} from "@/actions/admin/dashboard"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  DollarSign,
  Hotel,
  PackageCheck,
  Users,
  Car,
  FileText,
  AlertCircle,
  Calendar,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const stats = await getDashboardStats()
  const recentActivities = await getRecentActivities()
  const bookingStats = await getBookingStatistics()

  return (
    <div className="flex-1 space-y-6 p-6 pt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Main Stats */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.users.total}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.users.customers} customers, {stats.users.agencies}{" "}
                  agencies
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  $
                  {typeof stats.revenue.total === "number"
                    ? stats.revenue.total.toFixed(2)
                    : "0.00"}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  From {stats.bookings.total} bookings
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Approvals
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.pending.total}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  <Link
                    href="/admin/verify-offers"
                    className="text-blue-500 hover:underline"
                  >
                    View all pending items
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Content
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.content.trips +
                    stats.content.hotels +
                    stats.content.cars +
                    stats.content.blogs}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  All active listings and content
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Content Categories */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Trips</CardTitle>
                <PackageCheck className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.content.trips}</div>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${
                          (stats.content.trips /
                            (stats.content.trips +
                              stats.content.hotels +
                              stats.content.cars +
                              stats.content.blogs)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-blue-500">
                    {stats.pending.trips > 0 &&
                      `${stats.pending.trips} pending`}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Hotels</CardTitle>
                <Hotel className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.content.hotels}</div>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="h-2 w-full bg-green-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${
                          (stats.content.hotels /
                            (stats.content.trips +
                              stats.content.hotels +
                              stats.content.cars +
                              stats.content.blogs)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-green-500">
                    {stats.pending.hotels > 0 &&
                      `${stats.pending.hotels} pending`}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Cars</CardTitle>
                <Car className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.content.cars}</div>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="h-2 w-full bg-amber-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${
                          (stats.content.cars /
                            (stats.content.trips +
                              stats.content.hotels +
                              stats.content.cars +
                              stats.content.blogs)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-amber-500">
                    {stats.pending.cars > 0 && `${stats.pending.cars} pending`}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Blogs</CardTitle>
                <FileText className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.content.blogs}</div>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="h-2 w-full bg-purple-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{
                        width: `${
                          (stats.content.blogs /
                            (stats.content.trips +
                              stats.content.hotels +
                              stats.content.cars +
                              stats.content.blogs)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-purple-500">
                    {stats.pending.blogs > 0 &&
                      `${stats.pending.blogs} pending`}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-6 md:grid-cols-7">
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>
                  Latest booking activities across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.tripBookings.map((booking) => (
                    <div
                      key={`trip-${booking.id}`}
                      className="flex items-center p-2 border rounded-lg"
                    >
                      <Calendar className="h-9 w-9 text-blue-500 bg-blue-50 p-2 rounded-full mr-3" />
                      <div>
                        <p className="text-sm font-medium">
                          Trip: {booking.trip?.name || "Unknown Trip"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Booked by {booking.user?.name || "Unknown"} • $
                          {Number(booking.totalPrice).toFixed(2)}
                        </p>
                      </div>
                      <Badge
                        className="ml-auto"
                        variant={
                          booking.status === "confirmed"
                            ? "default"
                            : booking.status === "pending"
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  ))}

                  {recentActivities.roomBookings.map((booking) => (
                    <div
                      key={`room-${booking.id}`}
                      className="flex items-center p-2 border rounded-lg"
                    >
                      <Hotel className="h-9 w-9 text-green-500 bg-green-50 p-2 rounded-full mr-3" />
                      <div>
                        <p className="text-sm font-medium">
                          Room: {booking.room?.name || "Unknown Room"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Booked by {booking.user?.name || "Unknown"} • $
                          {Number(booking.totalPrice).toFixed(2)}
                        </p>
                      </div>
                      <Badge
                        className="ml-auto"
                        variant={
                          booking.status === "confirmed"
                            ? "default"
                            : booking.status === "pending"
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  ))}

                  <div className="text-center pt-2">
                    <Link
                      href={`/${locale}/admin/bookings`}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View all bookings
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>New users who recently joined</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.users.map((user) => (
                    <div key={user.id} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.image || ""} alt={user.name} />
                        <AvatarFallback>
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <Badge className="ml-auto" variant="outline">
                        {user.role}
                      </Badge>
                    </div>
                  ))}

                  <div className="text-center pt-2">
                    <Link
                      href={`/${locale}/admin/users`}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View all users
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Analytics</CardTitle>
              <CardDescription>
                Statistics for bookings across all services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Trip Bookings</h4>
                  <div className="space-y-2">
                    {bookingStats.tripBookings.map((stat, i) => (
                      <div key={stat.status || i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{stat.status}</span>
                          <span className="font-medium">{stat.count}</span>
                        </div>
                        <Progress
                          value={(stat.count / stats.bookings.trips) * 100}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">Room Bookings</h4>
                  <div className="space-y-2">
                    {bookingStats.roomBookings.map((stat, i) => (
                      <div key={stat.status || i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{stat.status}</span>
                          <span className="font-medium">{stat.count}</span>
                        </div>
                        <Progress
                          value={(stat.count / stats.bookings.rooms) * 100}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">
                    Revenue Breakdown
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-500 font-medium">Trips</p>
                      <p className="text-xl font-bold">
                        $
                        {typeof stats.revenue.trips === "number"
                          ? stats.revenue.trips.toFixed(2)
                          : "0.00"}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-500 font-medium">
                        Rooms
                      </p>
                      <p className="text-xl font-bold">
                        $
                        {typeof stats.revenue.rooms === "number"
                          ? stats.revenue.rooms.toFixed(2)
                          : "0.00"}
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <p className="text-xs text-amber-500 font-medium">Cars</p>
                      <p className="text-xl font-bold">
                        $
                        {typeof stats.revenue.cars === "number"
                          ? stats.revenue.cars.toFixed(2)
                          : "0.00"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Platform Management</CardTitle>
              <CardDescription>
                Quick access to management features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link href={`/${locale}/admin/users`}>
                  <div className="border rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                    <Users className="h-8 w-8 text-slate-600 mb-2" />
                    <h3 className="font-medium">User Management</h3>
                    <p className="text-sm text-muted-foreground">
                      {stats.users.total} users
                    </p>
                  </div>
                </Link>

                <Link href={`/${locale}/admin/verify-offers`}>
                  <div className="border rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                    <AlertCircle className="h-8 w-8 text-amber-600 mb-2" />
                    <h3 className="font-medium">Pending Approvals</h3>
                    <p className="text-sm text-muted-foreground">
                      {stats.pending.total} items pending
                    </p>
                  </div>
                </Link>

                <Link href={`/${locale}/admin/bookings`}>
                  <div className="border rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                    <Calendar className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-medium">Bookings</h3>
                    <p className="text-sm text-muted-foreground">
                      {stats.bookings.total} total
                    </p>
                  </div>
                </Link>

                <Link href={`/${locale}/admin/content`}>
                  <div className="border rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                    <FileText className="h-8 w-8 text-purple-600 mb-2" />
                    <h3 className="font-medium">Content</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage platform content
                    </p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Platform health and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database Status</span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 hover:bg-green-50"
                  >
                    Online
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">API Status</span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 hover:bg-green-50"
                  >
                    Operational
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Storage Usage</span>
                  <span className="text-sm font-medium">42.8%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: "42.8%" }}
                  ></div>
                </div>
                <div className="pt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    System last updated: {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
