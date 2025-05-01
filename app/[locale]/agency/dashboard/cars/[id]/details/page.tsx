import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCarById } from "@/actions/cars/carActions";
import { Locale } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArchiveIcon } from "lucide-react";
import ArchiveCarButton from "../../ArchiveCarButton";
import PublishCarButton from "../../PublishCarButton";
import { formatPrice } from "@/lib/utils";

interface CarDetailsPageProps {
  params: {
    id: string;
    locale: Locale;
  };
}

export default async function CarDetailsPage({ params }: CarDetailsPageProps) {
  const { id: carId, locale } = params;
  const { car } = await getCarById(parseInt(carId));

  if (!car) {
    notFound();
  }

  const isArchived = car.status === "archived";
  const hasBookings = car.bookings && car.bookings.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Car Details</h1>
          {car.status && (
            <Badge
              className={`ml-2 ${
                car.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : car.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : car.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : car.status === "archived"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
          <Link
            href={`/${locale}/agency/dashboard/cars`}
            className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            Back to Cars
          </Link>
          <Link
            href={`/${locale}/agency/dashboard/cars/${car.id}`}
            className="inline-flex items-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            Edit Car
          </Link>
          {isArchived ? (
            <PublishCarButton carId={car.id} />
          ) : (
            <ArchiveCarButton carId={car.id} />
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Images Gallery */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Images</h2>
          <div className="grid grid-cols-2 gap-4">
            {car.images &&
              car.images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow duration-300"
                >
                  <Image
                    src={image}
                    alt={`${car.brand} ${car.model} image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
          </div>
        </div>

        {/* Car Details */}
        <div className="space-y-6 bg-white p-6 rounded-lg shadow">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Basic Information
            </h2>
            <div className="space-y-2 text-gray-700">
              <div>
                <span className="font-medium">Brand:</span>{" "}
                <span className="text-gray-900">{car.brand}</span>
              </div>
              <div>
                <span className="font-medium">Model:</span>{" "}
                <span className="text-gray-900">{car.model}</span>
              </div>
              <div>
                <span className="font-medium">Year:</span>{" "}
                <span className="text-gray-900">{car.year}</span>
              </div>
              <div>
                <span className="font-medium">Plate Number:</span>{" "}
                <span className="text-gray-900">{car.plateNumber}</span>
              </div>
              <div>
                <span className="font-medium">Color:</span>{" "}
                <span className="text-gray-900">{car.color}</span>
              </div>
              <div>
                <span className="font-medium">Seats:</span>{" "}
                <span className="text-gray-900">{car.seats} persons</span>
              </div>
              <div>
                <span className="font-medium">Category:</span>{" "}
                <span className="text-gray-900">{car.category}</span>
              </div>
              <div>
                <span className="font-medium">Location:</span>{" "}
                <span className="text-gray-900">{car.location}</span>
              </div>

              {/* Price Information with Discount */}
              {car.discountPercentage ? (
                <div className="space-y-1">
                  <div>
                    <span className="font-medium">Original Price:</span>{" "}
                    <span className="text-gray-400 line-through">
                      {formatPrice(car.originalPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Discounted Price:</span>{" "}
                    <span className="text-green-600 font-semibold">
                      {formatPrice(car.priceAfterDiscount || car.originalPrice)}
                      <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        {car.discountPercentage}% OFF
                      </span>
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="font-medium">Price:</span>{" "}
                  <span className="text-gray-900">
                    {formatPrice(car.originalPrice)}
                  </span>
                </div>
              )}

              <div>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    car.isAvailable
                      ? "text-green-800 bg-green-100"
                      : "text-red-800 bg-red-100"
                  }`}
                >
                  {car.isAvailable ? "Available" : "Not Available"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Section */}
      {hasBookings && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Current Bookings
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Booking ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Start Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    End Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {car.bookings &&
                  car.bookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : booking.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {booking.status?.charAt(0).toUpperCase() +
                            booking.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPrice(Number(booking.total_price))}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-800 text-sm">
              <strong>Note:</strong> This car cannot be archived while it has
              active bookings. Either wait until all bookings are completed or
              contact support for assistance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
