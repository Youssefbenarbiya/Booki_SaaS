// app/agency/dashboard/page.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Overview } from "../../../components/dashboard/agency/Overview"
import { RecentSales } from "../../../components/dashboard/agency/RecentSales"
import { getDashboardStats } from "@/actions/agency/dashboardActions"
import { formatPrice } from "@/lib/utils"
import { getAgencyNotifications } from "@/actions/agency/notificationActions"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Building2,
  Briefcase,
  CreditCard,
  DollarSign,
  FileText,
  HotelIcon,
  Plane,
  TrendingUp,
  UserCheck,
  Users,
  Car,
  Bell,
  BookOpenCheck,
  BarChart3,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
export default async function DashboardPage() {
  const stats = await getDashboardStats()
  const { notifications, unreadCount } = await getAgencyNotifications(5)

  return (
    <div className="space-y-6">
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

      {/* Top row of metric cards */}
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
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">+20.1% from last month</p>
              <TrendingUp className="h-3 w-3 text-green-500" />
            </div>
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
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Trips: {stats.bookingBreakdown.trips}
                  </span>
                  <span className="text-gray-500">
                    Rooms: {stats.bookingBreakdown.rooms}
                  </span>
                </div>
                <Progress
                  value={
                    (stats.bookingBreakdown.trips / stats.totalBookings) * 100
                  }
                  className="h-1 mt-1"
                />
              </div>
            </div>
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
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">+201 since last week</p>
              <TrendingUp className="h-3 w-3 text-green-500" />
            </div>
          </CardContent>
        </Card>

        
      </div>

      {/* Revenue breakdown and sales overview */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 shadow-sm">
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>
                  Your revenue trend over the past 12 months
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview data={stats.monthlySales} />
              </CardContent>
            </Card>
            <Card className="col-span-3 shadow-sm">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  Your most recent booking transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales sales={stats.recentSales} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm col-span-1">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.slice(0, 4).map((notification, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`rounded-full p-1.5 ${
                          !notification.read ? "bg-blue-100" : "bg-gray-100"
                        }`}
                      >
                        <Bell
                          className={`h-3 w-3 ${
                            !notification.read
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString()}{" "}
                          •
                          {new Date(notification.createdAt).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm col-span-1">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Blog Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Total Blogs</p>
                      <p className="text-2xl font-bold">
                        {stats.blogStats.total}
                      </p>
                    </div>
                    <div className="rounded-full p-2 bg-blue-50">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Published</span>
                      <span className="font-medium">
                        {stats.blogStats.published}
                      </span>
                    </div>
                    <Progress
                      value={
                        (stats.blogStats.published / stats.blogStats.total) *
                          100 || 0
                      }
                      className="h-2"
                    />

                    <div className="flex justify-between text-sm">
                      <span>Pending</span>
                      <span className="font-medium">
                        {stats.blogStats.pending}
                      </span>
                    </div>
                    <Progress
                      value={
                        (stats.blogStats.pending / stats.blogStats.total) *
                          100 || 0
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Top Performing Offerings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topPerformers.slice(0, 3).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-full p-2 ${
                            item.type === "room" ? "bg-amber-50" : "bg-blue-50"
                          }`}
                        >
                          {item.type === "room" ? (
                            <HotelIcon className="h-4 w-4 text-amber-600" />
                          ) : (
                            <Plane className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.type === "room" ? "Room" : "Trip"} •{" "}
                            {item.bookings} bookings
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium">
                        {formatPrice(item.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Revenue by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full p-2 bg-amber-50">
                      <HotelIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">Rooms</p>
                        <p className="text-sm font-medium">
                          {formatPrice(stats.revenueBreakdown.rooms)}
                        </p>
                      </div>
                      <Progress
                        value={
                          (stats.revenueBreakdown.rooms / stats.totalRevenue) *
                            100 || 0
                        }
                        className="h-2 mt-2"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded-full p-2 bg-blue-50">
                      <Plane className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">Trips</p>
                        <p className="text-sm font-medium">
                          {formatPrice(stats.revenueBreakdown.trips)}
                        </p>
                      </div>
                      <Progress
                        value={
                          (stats.revenueBreakdown.trips / stats.totalRevenue) *
                            100 || 0
                        }
                        className="h-2 mt-2"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded-full p-2 bg-green-50">
                      <Car className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">Cars</p>
                        <p className="text-sm font-medium">
                          {formatPrice(stats.revenueBreakdown.cars)}
                        </p>
                      </div>
                      <Progress
                        value={
                          (stats.revenueBreakdown.cars / stats.totalRevenue) *
                            100 || 0
                        }
                        className="h-2 mt-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Booking Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold">
                        {stats.bookingBreakdown.rooms}
                      </div>
                      <p className="text-xs text-gray-500">Rooms</p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold">
                        {stats.bookingBreakdown.trips}
                      </div>
                      <p className="text-xs text-gray-500">Trips</p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold">
                        {stats.bookingBreakdown.cars}
                      </div>
                      <p className="text-xs text-gray-500">Cars</p>
                    </div>
                  </div>

                  <div className="h-2 bg-gray-100 rounded-full flex overflow-hidden">
                    <div
                      className="bg-amber-500"
                      style={{
                        width: `${
                          (stats.bookingBreakdown.rooms / stats.totalBookings) *
                          100
                        }%`,
                      }}
                    />
                    <div
                      className="bg-blue-500"
                      style={{
                        width: `${
                          (stats.bookingBreakdown.trips / stats.totalBookings) *
                          100
                        }%`,
                      }}
                    />
                    <div
                      className="bg-green-500"
                      style={{
                        width: `${
                          (stats.bookingBreakdown.cars / stats.totalBookings) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-amber-500 rounded-full" />
                      <span>Rooms</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Trips</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Cars</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Recent Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {formatPrice(stats.totalRevenue)}
                      </p>
                      <p className="text-xs text-gray-500">Total Revenue</p>
                    </div>
                    <Badge className="px-3 py-1.5">+18.2% YoY</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Last 7 days</span>
                      <span className="font-medium">
                        {formatPrice(stats.totalRevenue * 0.21)}
                      </span>
                    </div>
                    <Progress value={21} className="h-2" />

                    <div className="flex justify-between text-sm">
                      <span>Last 30 days</span>
                      <span className="font-medium">
                        {formatPrice(stats.totalRevenue * 0.68)}
                      </span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Occupancy Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-blue-100 mb-2">
                      <span className="text-xl font-bold">
                        {stats.occupancyRate.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Average occupancy rate
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Weekdays</span>
                      <span className="font-medium">
                        {(stats.occupancyRate * 0.9).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={stats.occupancyRate * 0.9}
                      className="h-2"
                    />

                    <div className="flex justify-between text-sm">
                      <span>Weekends</span>
                      <span className="font-medium">
                        {(stats.occupancyRate * 1.2).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(stats.occupancyRate * 1.2, 100)}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Cancellations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-red-100 mb-2">
                      <span className="text-xl font-bold">
                        {stats.cancelRatio.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Cancellation rate</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xl font-bold">
                        {Math.floor(
                          stats.totalBookings * (stats.cancelRatio / 100)
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        Total cancellations
                      </p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">
                        {formatPrice(
                          stats.totalRevenue * (stats.cancelRatio / 100)
                        )}
                      </p>
                      <p className="text-xs text-gray-500">Lost revenue</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  New Business
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{stats.newHotels}</p>
                      <p className="text-xs text-gray-500">
                        New hotels this week
                      </p>
                    </div>
                    <div className="rounded-full p-2 bg-teal-50">
                      <Building2 className="h-5 w-5 text-teal-600" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {stats.recentBookingsCount}
                      </p>
                      <p className="text-xs text-gray-500">
                        New bookings this week
                      </p>
                    </div>
                    <div className="rounded-full p-2 bg-violet-50">
                      <Briefcase className="h-5 w-5 text-violet-600" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{stats.activeUsers}</p>
                      <p className="text-xs text-gray-500">Active users</p>
                    </div>
                    <div className="rounded-full p-2 bg-rose-50">
                      <Users className="h-5 w-5 text-rose-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
