import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Metadata } from "next"
import { 
  ArrowUpRight, 
  Building, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Car, 
  Luggage,
  Hotel
} from "lucide-react"
import { CalendarDateRangePicker } from "@/components/dashboard/admin/date-range-picker"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for Booki",
}

// Fallback stats in case the API call fails
const fallbackStats = {
  revenue: {
    total: 0,
    percentChange: 0
  },
  users: {
    total: 0,
    newThisMonth: 0
  },
  agencies: {
    total: 0,
    pendingVerification: 0
  },
  bookings: {
    total: 0,
    thisWeek: 0
  },
  cars: {
    total: 0,
    pending: 0,
    mostBooked: "N/A"
  },
  trips: {
    total: 0,
    pending: 0,
    popularDestination: "N/A"
  },
  hotels: {
    total: 0,
    pending: 0,
    totalRooms: 0
  }
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  // Check if user is authenticated and is an admin
  const session =  await auth.api.getSession({
    headers: await headers(),
  })


  if (!session?.user || session.user.role !== "admin") {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/admin/dashboard`)
  }

  // Fetch stats data with error handling and proper authentication
  let stats;
  try {
    // Get the server-side cookie for authentication
    const headersList = new Headers(await headers())
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/stats`, {
      headers: headersList,
      // Include credentials to send cookies with the request
      credentials: 'include',
    })
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }
    stats = await response.json()
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    stats = fallbackStats
  }
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker />
          <Button variant="outline">Download Report</Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats?.revenue?.total || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.revenue?.percentChange > 0 ? (
                    <span className="text-green-500 flex items-center text-xs">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {stats?.revenue?.percentChange || 0}% from last month
                    </span>
                  ) : (
                    <span>No change from last month</span>
                  )}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.users?.total || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.users?.newThisMonth || '0'} new users this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Agencies
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.agencies?.total || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.agencies?.pendingVerification || '0'} pending verification
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Bookings
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.bookings?.total || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.bookings?.thisWeek || '0'} bookings this week
                </p>
              </CardContent>
            </Card>
          </div>
          
         
          
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold">
                  Cars Overview
                </CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Total Cars</div>
                  <div className="font-medium">{stats?.cars?.total || '0'}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Pending Approval</div>
                  <div className="font-medium">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      {stats?.cars?.pending || '0'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Most Booked Car</div>
                  <div className="text-xs text-muted-foreground">
                    {stats?.cars?.mostBooked || 'N/A'}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold">
                  Trips Overview
                </CardTitle>
                <Luggage className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Total Trips</div>
                  <div className="font-medium">{stats?.trips?.total || '0'}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Pending Approval</div>
                  <div className="font-medium">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      {stats?.trips?.pending || '0'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Popular Destination</div>
                  <div className="text-xs text-muted-foreground">
                    {stats?.trips?.popularDestination || 'N/A'}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold">
                  Hotels Overview
                </CardTitle>
                <Hotel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Total Hotels</div>
                  <div className="font-medium">{stats?.hotels?.total || '0'}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Pending Approval</div>
                  <div className="font-medium">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      {stats?.hotels?.pending || '0'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Total Rooms</div>
                  <div className="text-xs text-muted-foreground">
                    {stats?.hotels?.totalRooms || '0'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Analytics Content</CardTitle>
                <CardDescription>
                  This tab will contain detailed analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Analytics content will be implemented here</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Reports Content</CardTitle>
                <CardDescription>
                  This tab will contain various reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Reports content will be implemented here</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
