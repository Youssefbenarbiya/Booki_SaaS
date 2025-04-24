/* eslint-disable @typescript-eslint/no-unused-vars */
// app/agency/dashboard/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getDashboardStats } from "@/actions/agency/dashboardActions"
import { formatPrice } from "@/lib/utils"
import { getAgencyNotifications } from "@/actions/agency/notificationActions"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AgencyChartsClient } from "@/components/dashboard/AgencyChartsClient"
import {
  BookOpenCheck,
  Car,
  DollarSign,
  HotelIcon,
  Plane,
  UserCheck,
  Users,
  Bell,
} from "lucide-react"

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  const { unreadCount } = await getAgencyNotifications(5)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="py-1.5 px-4">
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            {unreadCount} unread notifications
          </Badge>
          <Badge variant="outline" className="py-1.5 px-4">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            {stats.employeeCount} employees
          </Badge>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="rounded-full p-2 bg-blue-50">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Across all services
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <div className="rounded-full p-2 bg-purple-50">
              <BookOpenCheck className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground pt-1">
              {stats.bookingBreakdown.rooms} Rooms,{" "}
              {stats.bookingBreakdown.trips} Trips,{" "}
              {stats.bookingBreakdown.cars} Cars
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <div className="rounded-full p-2 bg-green-50">
              <UserCheck className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground pt-1">
              In the last 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Hotels</CardTitle>
            <div className="rounded-full p-2 bg-amber-50">
              <HotelIcon className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.newHotels}</div>
            <p className="text-xs text-muted-foreground pt-1">
              In the last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row - Use the Client Component */}
      <AgencyChartsClient
        monthlySales={stats.monthlySales}
        salesBreakdown={stats.salesBreakdown}
      />

      {/* Recent Sales and Top Performers Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Sales Table */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              Recent bookings made through your agency.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentSales.map((sale) => (
                  <TableRow key={sale.id + sale.date.toISOString()}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarImage
                            src={sale.avatar || undefined}
                            alt="Avatar"
                          />
                          <AvatarFallback>{sale.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{sale.name}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {sale.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell capitalize">
                      <Badge variant="outline" className="text-xs">
                        {sale.type === "room" && (
                          <HotelIcon className="h-3 w-3 mr-1" />
                        )}
                        {sale.type === "trip" && (
                          <Plane className="h-3 w-3 mr-1" />
                        )}
                        {sale.type === "car" && (
                          <Car className="h-3 w-3 mr-1" />
                        )}
                        {sale.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(sale.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(sale.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                {stats.recentSales.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No recent sales found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Performers Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>
              Your most popular rooms and trips by revenue.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {stats.topPerformers.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div
                  className={`rounded-lg p-2 ${
                    item.type === "room"
                      ? "bg-amber-100"
                      : item.type === "trip"
                      ? "bg-blue-100"
                      : "bg-green-100"
                  }`}
                >
                  {item.type === "room" ? (
                    <HotelIcon className="h-5 w-5 text-amber-600" />
                  ) : item.type === "trip" ? (
                    <Plane className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Car className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div className="grid gap-1 flex-1">
                  <p className="text-sm font-medium leading-none truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.bookings} bookings
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  {formatPrice(item.revenue)}
                </div>
              </div>
            ))}
            {stats.topPerformers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No performance data yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
