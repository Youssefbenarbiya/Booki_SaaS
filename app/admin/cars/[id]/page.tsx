import db from "@/db/drizzle"
import { cars } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default async function CarDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const carId = params.id

  const car = await db.query.cars.findFirst({
    where: eq(cars.id, parseInt(carId, 10)),
  })

  if (!car) {
    notFound()
  }

  const statusColor =
    {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    }[car.status] || "bg-gray-100 text-gray-800"

  return (
    <div className="container py-6 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/admin/verify-offers?tab=cars"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Car Listings
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Car details header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {car.brand} {car.model}
              </h1>
              <p className="text-gray-600">
                {car.year} • {car.color}
              </p>
            </div>
            <Badge className={statusColor}>{car.status}</Badge>
          </div>
        </div>

        {/* Car images */}
        {car.images && car.images.length > 0 && (
          <div className="p-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {car.images.map((image, index) => (
                <div
                  key={index}
                  className="relative h-48 rounded-lg overflow-hidden"
                >
                  <Image
                    src={image}
                    alt={`${car.brand} ${car.model}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Car details content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">
                Vehicle Information
              </h2>
              <div className="bg-gray-50 p-4 rounded-md grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Brand</p>
                  <p className="font-medium">{car.brand}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Model</p>
                  <p className="font-medium">{car.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year</p>
                  <p className="font-medium">{car.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Color</p>
                  <p className="font-medium">{car.color}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plate Number</p>
                  <p className="font-medium">{car.plateNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Availability</p>
                  <p className="font-medium">
                    {car.isAvailable ? "Available" : "Not Available"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-3">Pricing</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Price</span>
                  <span
                    className={
                      car.discountPercentage
                        ? "line-through text-gray-400"
                        : "font-medium"
                    }
                  >
                    $
                    {parseFloat(car.originalPrice?.toString() || "0").toFixed(
                      2
                    )}
                  </span>
                </div>

                {(car.discountPercentage ?? 0) > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600">
                        {car.discountPercentage}%
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Final Price</span>
                      <span>
                        $
                        {parseFloat(
                          car.priceAfterDiscount?.toString() || "0"
                        ).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-3">Details</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">
                    {car.createdAt
                      ? new Date(car.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {car.updatedAt
                      ? new Date(car.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium capitalize">{car.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
