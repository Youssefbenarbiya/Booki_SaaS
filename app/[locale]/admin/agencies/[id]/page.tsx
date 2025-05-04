import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Ban, CheckCircle, Users, FileText, X, AlertTriangle, ShieldCheck, AlertCircle } from "lucide-react"
import { getAgencyDetails, toggleUserBan, verifyAgency, rejectAgency } from "@/actions/admin/agencies"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export default async function AgencyDetailsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params

  const data = await getAgencyDetails(id)

  if (!data) {
    return notFound()
  }

  const {
    agency,
    employees,
    agencyTrips,
    agencyCars,
    agencyHotels,
    agencyBlogs,
    totalBookings,
  } = data

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link
          href={`/${locale}/admin/agencies`}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Agencies
        </Link>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Agency status:</span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-bold ${
              agency.user.banned
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {agency.user.banned ? "BANNED" : "ACTIVE"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className={`${
              agency.verificationStatus === "approved" 
                ? "border-green-200 bg-green-50" 
                : agency.verificationStatus === "rejected"
                ? "border-red-200 bg-red-50"
                : agency.rneDocument || agency.patenteDocument || agency.cinDocument
                ? "border-yellow-200 bg-yellow-50"
                : ""
            }`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {agency.verificationStatus === "approved" ? (
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  ) : agency.verificationStatus === "rejected" ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : agency.rneDocument || agency.patenteDocument || agency.cinDocument ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <FileText className="h-5 w-5 text-gray-600" />
                  )}
                  Verification Status
                </CardTitle>
                <Badge variant="outline" className={`
                  ${agency.verificationStatus === "approved" 
                    ? "bg-green-100 text-green-800 border-green-200" 
                    : agency.verificationStatus === "rejected"
                    ? "bg-red-100 text-red-800 border-red-200"
                    : agency.rneDocument || agency.patenteDocument || agency.cinDocument
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                    : "bg-gray-100 text-gray-800 border-gray-200"
                  }`}>
                  {agency.verificationStatus === "approved" 
                    ? "Verified" 
                    : agency.verificationStatus === "rejected"
                    ? "Rejected"
                    : agency.rneDocument || agency.patenteDocument || agency.cinDocument
                    ? "Pending Review"
                    : "Not Submitted"}
                </Badge>
              </div>
              <CardDescription>
                {agency.verificationStatus === "approved" 
                  ? "This agency has been verified and can operate without restrictions." 
                  : agency.verificationStatus === "rejected"
                  ? "This agency's verification request was rejected."
                  : agency.rneDocument || agency.patenteDocument || agency.cinDocument
                  ? "This agency has submitted documents pending review."
                  : "This agency has not submitted verification documents yet."}
              </CardDescription>
            </CardHeader>
            {(agency.rneDocument || agency.patenteDocument || agency.cinDocument) && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* RNE Document */}
                  <div className="border rounded-md overflow-hidden bg-white">
                    <div className="p-3 bg-gray-50 border-b">
                      <h3 className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        RNE Document
                      </h3>
                    </div>
                    <div className="p-3">
                      {agency.rneDocument ? (
                        <div className="space-y-2">
                          <div className="relative aspect-video bg-gray-100 rounded">
                            <Image 
                              src={agency.rneDocument} 
                              alt="RNE Document" 
                              fill 
                              className="object-contain"
                            />
                          </div>
                          <a 
                            href={agency.rneDocument} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            View Full Size
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Not submitted</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Patente Document */}
                  <div className="border rounded-md overflow-hidden bg-white">
                    <div className="p-3 bg-gray-50 border-b">
                      <h3 className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Patente Document
                      </h3>
                    </div>
                    <div className="p-3">
                      {agency.patenteDocument ? (
                        <div className="space-y-2">
                          <div className="relative aspect-video bg-gray-100 rounded">
                            <Image 
                              src={agency.patenteDocument} 
                              alt="Patente Document" 
                              fill 
                              className="object-contain"
                            />
                          </div>
                          <a 
                            href={agency.patenteDocument} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            View Full Size
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Not submitted</p>
                      )}
                    </div>
                  </div>
                  
                  {/* CIN Document */}
                  <div className="border rounded-md overflow-hidden bg-white">
                    <div className="p-3 bg-gray-50 border-b">
                      <h3 className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        CIN Document
                      </h3>
                    </div>
                    <div className="p-3">
                      {agency.cinDocument ? (
                        <div className="space-y-2">
                          <div className="relative aspect-video bg-gray-100 rounded">
                            <Image 
                              src={agency.cinDocument} 
                              alt="CIN Document" 
                              fill 
                              className="object-contain"
                            />
                          </div>
                          <a 
                            href={agency.cinDocument} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            View Full Size
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Not submitted</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {agency.verificationStatus === "rejected" && agency.verificationRejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <h3 className="font-medium text-red-800 mb-1">Rejection Reason:</h3>
                    <p className="text-sm text-red-700">{agency.verificationRejectionReason}</p>
                  </div>
                )}
                
                {agency.verificationStatus !== "approved" && agency.verificationStatus !== "rejected" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <form action={verifyAgency}>
                      <input type="hidden" name="agencyId" value={agency.id.toString()} />
                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Verification
                      </Button>
                    </form>
                    
                    <form action={rejectAgency} className="space-y-2">
                      <input type="hidden" name="agencyId" value={agency.id.toString()} />
                      <Textarea 
                        name="rejectionReason" 
                        placeholder="Enter reason for rejection..."
                        className="w-full text-sm"
                        required
                      />
                      <Button type="submit" variant="destructive" className="w-full">
                        <X className="h-4 w-4 mr-2" />
                        Reject Verification
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agency Information</CardTitle>
              <CardDescription>
                Registered on{" "}
                {format(new Date(agency.createdAt), "MMMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Agency Name</p>
                  <p className="font-medium">{agency.agencyName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unique ID</p>
                  <p className="font-medium">{agency.agencyUniqueId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Email</p>
                  <p className="font-medium">
                    {agency.contactEmail || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Phone</p>
                  <p className="font-medium">
                    {agency.contactPhone || "Not provided"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">
                    {agency.address || "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="employees">
            <TabsList>
              <TabsTrigger value="employees">
                <Users className="h-4 w-4 mr-2" />
                Employees ({employees.length})
              </TabsTrigger>
              <TabsTrigger value="offers">
                Offers (
                {agencyTrips.length +
                  agencyCars.length +
                  agencyHotels.length +
                  agencyBlogs.length}
                )
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employees" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agency Employees</CardTitle>
                  <CardDescription>
                    Users associated with this agency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Owner row */}
                      <TableRow key={agency.user.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {agency.user.image && (
                              <Image
                                src={agency.user.image}
                                alt={agency.user.name}
                                className="h-8 w-8 rounded-full mr-2"
                                width={32}
                                height={32}
                              />
                            )}
                            <div>
                              <div className="font-medium">
                                {agency.user.name}
                              </div>
                              <div className="text-xs text-gray-500">Owner</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{agency.user.email}</TableCell>
                        <TableCell>{agency.user.role}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              agency.user.banned
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {agency.user.banned ? "Banned" : "Active"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <form action={toggleUserBan}>
                            <input
                              type="hidden"
                              name="userId"
                              value={agency.user.id}
                            />
                            <input
                              type="hidden"
                              name="agencyId"
                              value={agency.id.toString()}
                            />
                            <input
                              type="hidden"
                              name="currentBanStatus"
                              value={agency.user.banned.toString()}
                            />
                            <Button
                              type="submit"
                              variant={
                                agency.user.banned ? "outline" : "destructive"
                              }
                              size="sm"
                            >
                              {agency.user.banned ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Unban
                                </>
                              ) : (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Ban
                                </>
                              )}
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>

                      {/* Employee rows */}
                      {employees.map((employeeRel) => {
                        const employee = employeeRel.employee
                        return (
                          <TableRow key={employee.id}>
                            <TableCell>
                              <div className="flex items-center">
                                {employee.image && (
                                  <Image
                                    src={employee.image}
                                    alt={employee.name}
                                    className="h-8 w-8 rounded-full mr-2"
                                    width={32}
                                    height={32}
                                  />
                                )}
                                <div className="font-medium">
                                  {employee.name}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{employee.email}</TableCell>
                            <TableCell>{employee.role}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  employee.banned
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {employee.banned ? "Banned" : "Active"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <form action={toggleUserBan}>
                                <input
                                  type="hidden"
                                  name="userId"
                                  value={employee.id}
                                />
                                <input
                                  type="hidden"
                                  name="agencyId"
                                  value={agency.id.toString()}
                                />
                                <input
                                  type="hidden"
                                  name="currentBanStatus"
                                  value={employee.banned.toString()}
                                />
                                <Button
                                  type="submit"
                                  variant={
                                    employee.banned ? "outline" : "destructive"
                                  }
                                  size="sm"
                                >
                                  {employee.banned ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Unban
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="h-4 w-4 mr-2" />
                                      Ban
                                    </>
                                  )}
                                </Button>
                              </form>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="offers" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agency Offers</CardTitle>
                  <CardDescription>
                    All listings published by this agency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="trips">
                    <TabsList>
                      <TabsTrigger value="trips">
                        Trips ({agencyTrips.length})
                      </TabsTrigger>
                      <TabsTrigger value="hotels">
                        Hotels ({agencyHotels.length})
                      </TabsTrigger>
                      <TabsTrigger value="cars">
                        Cars ({agencyCars.length})
                      </TabsTrigger>
                      <TabsTrigger value="blogs">
                        Blogs ({agencyBlogs.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="trips" className="mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>View</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {agencyTrips.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center text-gray-500"
                              >
                                No trips listed by this agency
                              </TableCell>
                            </TableRow>
                          ) : (
                            agencyTrips.map((trip) => (
                              <TableRow key={trip.id}>
                                <TableCell className="font-medium">
                                  {trip.name}
                                </TableCell>
                                <TableCell>{trip.destination}</TableCell>
                                <TableCell>
                                  {trip.discountPercentage ? (
                                    <div>
                                      <span className="line-through text-gray-400">
                                        $
                                        {parseFloat(
                                          trip.originalPrice.toString()
                                        ).toFixed(2)}
                                      </span>
                                      <span className="ml-2">
                                        $
                                        {parseFloat(
                                          trip.priceAfterDiscount?.toString() ||
                                            "0"
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span>
                                      $
                                      {parseFloat(
                                        trip.originalPrice.toString()
                                      ).toFixed(2)}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium
                                    ${
                                      trip.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : trip.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {trip.status.toUpperCase()}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Link
                                    href={`/${locale}/admin/trips/${trip.id}`}
                                  >
                                    <Button variant="ghost" size="sm">
                                      View
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="hotels" className="mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>View</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {agencyHotels.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center text-gray-500"
                              >
                                No hotels listed by this agency
                              </TableCell>
                            </TableRow>
                          ) : (
                            agencyHotels.map((hotel) => (
                              <TableRow key={hotel.id}>
                                <TableCell className="font-medium">
                                  {hotel.name}
                                </TableCell>
                                <TableCell>
                                  {hotel.city}, {hotel.country}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <span className="text-amber-500 mr-1">
                                      ★
                                    </span>
                                    {hotel.rating}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium
                                    ${
                                      hotel.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : hotel.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {hotel.status.toUpperCase()}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Link
                                    href={`/${locale}/admin/hotels/${hotel.id}`}
                                  >
                                    <Button variant="ghost" size="sm">
                                      View
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="cars" className="mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Brand & Model</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>View</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {agencyCars.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center text-gray-500"
                              >
                                No cars listed by this agency
                              </TableCell>
                            </TableRow>
                          ) : (
                            agencyCars.map((car) => (
                              <TableRow key={car.id}>
                                <TableCell className="font-medium">
                                  {car.brand} {car.model}
                                </TableCell>
                                <TableCell>{car.year}</TableCell>
                                <TableCell>
                                  {car.discountPercentage ? (
                                    <div>
                                      <span className="line-through text-gray-400">
                                        $
                                        {parseFloat(
                                          car.originalPrice.toString()
                                        ).toFixed(2)}
                                      </span>
                                      <span className="ml-2">
                                        $
                                        {parseFloat(
                                          car.priceAfterDiscount?.toString() ||
                                            "0"
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span>
                                      $
                                      {parseFloat(
                                        car.originalPrice.toString()
                                      ).toFixed(2)}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium
                                    ${
                                      car.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : car.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {car.status.toUpperCase()}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Link
                                    href={`/${locale}/admin/cars/${car.id}`}
                                  >
                                    <Button variant="ghost" size="sm">
                                      View
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="blogs" className="mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Published</TableHead>
                            <TableHead>Views</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>View</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {agencyBlogs.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center text-gray-500"
                              >
                                No blogs published by this agency
                              </TableCell>
                            </TableRow>
                          ) : (
                            agencyBlogs.map((blog) => (
                              <TableRow key={blog.id}>
                                <TableCell className="font-medium">
                                  {blog.title}
                                </TableCell>
                                <TableCell>
                                  {blog.published
                                    ? blog.publishedAt
                                      ? format(
                                          new Date(blog.publishedAt),
                                          "MMM d, yyyy"
                                        )
                                      : "Yes"
                                    : "Draft"}
                                </TableCell>
                                <TableCell>{blog.views || 0}</TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium
                                    ${
                                      blog.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : blog.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {blog.status.toUpperCase()}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Link
                                    href={`/${locale}/admin/blogs/${blog.id}`}
                                  >
                                    <Button variant="ghost" size="sm">
                                      View
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar / Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agency Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Listings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-700">
                        {agencyTrips.length}
                      </p>
                      <p className="text-sm text-blue-600">Trips</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-amber-700">
                        {agencyHotels.length}
                      </p>
                      <p className="text-sm text-amber-600">Hotels</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-700">
                        {agencyCars.length}
                      </p>
                      <p className="text-sm text-green-600">Cars</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-700">
                        {agencyBlogs.length}
                      </p>
                      <p className="text-sm text-purple-600">Blogs</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Performance</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-600">Total Bookings</p>
                        <p className="text-xl font-bold">{totalBookings}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-600">Total Employees</p>
                        <p className="text-xl font-bold">
                          {employees.length + 1}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-600">Member Since</p>
                        <p className="font-semibold">
                          {format(new Date(agency.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {agency.user.banned && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700">Agency is Banned</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600 mb-4">
                  This agency and its owner account have been banned from the
                  platform.
                </p>
                <p className="text-sm text-red-500">
                  Reason: {agency.user.banReason || "Administrative action"}
                </p>
                <div className="mt-4">
                  <form action={toggleUserBan} className="flex justify-center">
                    <input type="hidden" name="userId" value={agency.user.id} />
                    <input
                      type="hidden"
                      name="agencyId"
                      value={agency.id.toString()}
                    />
                    <input type="hidden" name="currentBanStatus" value="true" />
                    <Button
                      type="submit"
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Lift Ban
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          )}

          {!agency.user.banned && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle>Administrative Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={toggleUserBan} className="flex justify-center">
                  <input type="hidden" name="userId" value={agency.user.id} />
                  <input
                    type="hidden"
                    name="agencyId"
                    value={agency.id.toString()}
                  />
                  <input type="hidden" name="currentBanStatus" value="false" />
                  <Button type="submit" variant="destructive">
                    <Ban className="h-4 w-4 mr-2" />
                    Ban Agency
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
