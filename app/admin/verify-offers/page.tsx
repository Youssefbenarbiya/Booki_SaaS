/* eslint-disable @typescript-eslint/no-explicit-any */
import { trips, cars, hotel } from "@/db/schema"
import { eq } from "drizzle-orm"
import db from "@/db/drizzle"
import { TripApprovalActions } from "@/components/dashboard/admin/TripApprovalActions"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CarApprovalActions } from "@/components/dashboard/admin/CarApprovalActions"
import { HotelApprovalActions } from "@/components/dashboard/admin/HotelApprovalActions"

export default async function VerifyOffersPage() {
  const pendingTrips = await db.query.trips.findMany({
    where: eq(trips.status, "pending"),
  })

  const pendingCars = await db.query.cars.findMany({
    where: eq(cars.status, "pending"),
  })

  const pendingHotels = await db.query.hotel.findMany({
    where: eq(hotel.status, "pending"),
  })

  const totalPending =
    pendingTrips.length + pendingCars.length + pendingHotels.length

  // Generic component to display offers of any type
  const OfferTable = ({
    offers,
    type,
    ApprovalComponent,
  }: {
    offers: any[]
    type: string
    ApprovalComponent: any
  }) => (
    <div className="bg-white rounded-md shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              View
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {offers.map((offer) => (
            <tr key={offer.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {offer.name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {type === "trip" ? (
                    <>
                      {offer.destination}
                      <br />
                      {new Date(offer.startDate).toLocaleDateString()} -{" "}
                      {new Date(offer.endDate).toLocaleDateString()}
                    </>
                  ) : type === "car" ? (
                    <>
                      {offer.brand} {offer.model}
                      <br />
                      {offer.location}
                    </>
                  ) : (
                    <>
                      {offer.location}
                      <br />
                      {offer.roomType || "Standard Room"}
                    </>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {offer.discountPercentage && offer.discountPercentage > 0 ? (
                    <>
                      <span className="line-through text-gray-400 mr-2">
                        $
                        {parseFloat(
                          offer.originalPrice?.toString() || "0"
                        ).toFixed(2)}
                      </span>
                      <span>
                        $
                        {parseFloat(
                          offer.priceAfterDiscount?.toString() || "0"
                        ).toFixed(2)}
                        <span className="text-xs text-green-600 ml-1">
                          ({offer.discountPercentage}% off)
                        </span>
                      </span>
                    </>
                  ) : (
                    <span>
                      $
                      {parseFloat(
                        offer.originalPrice?.toString() || "0"
                      ).toFixed(2)}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link
                  href={`/admin/${type}s/${offer.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  View Details
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ApprovalComponent offerId={offer.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Verify Offers</h1>

      {totalPending === 0 && (
        <div className="text-center py-12 bg-white rounded-md shadow">
          <p className="text-gray-500">No pending offers to verify</p>
        </div>
      )}

      {totalPending > 0 && (
        <Tabs defaultValue="trips">
          <TabsList className="mb-4">
            <TabsTrigger value="trips">
              Trips ({pendingTrips.length})
            </TabsTrigger>
            <TabsTrigger value="cars">Cars ({pendingCars.length})</TabsTrigger>
            <TabsTrigger value="hotel">
              Hotels ({pendingHotels.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trips">
            <h2 className="text-xl font-semibold mb-4">Pending Trips</h2>
            {pendingTrips.length > 0 ? (
              <OfferTable
                offers={pendingTrips}
                type="trip"
                ApprovalComponent={TripApprovalActions}
              />
            ) : (
              <div className="text-center py-6 bg-white rounded-md shadow">
                <p className="text-gray-500">No pending trips to verify</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cars">
            <h2 className="text-xl font-semibold mb-4">Pending Cars</h2>
            {pendingCars.length > 0 ? (
              <OfferTable
                offers={pendingCars}
                type="car"
                ApprovalComponent={CarApprovalActions}
              />
            ) : (
              <div className="text-center py-6 bg-white rounded-md shadow">
                <p className="text-gray-500">No pending cars to verify</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="hotel">
            <h2 className="text-xl font-semibold mb-4">Pending Hotels</h2>
            {pendingHotels.length > 0 ? (
              <OfferTable
                offers={pendingHotels}
                type="hotel"
                ApprovalComponent={HotelApprovalActions}
              />
            ) : (
              <div className="text-center py-6 bg-white rounded-md shadow">
                <p className="text-gray-500">No pending hotels to verify</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
