import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ArchiveTripButton from "../ArchiveTripButton";
import PublishTripButton from "../PublishTripButton";
import { getTripById } from "@/actions/trips/tripActions";
import { Locale } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArchiveIcon } from "lucide-react";

// Helper function to format price with the correct currency
const formatPriceWithCurrency = (price: string | number, currency?: string) => {
  if (!price) return "-";

  const numericPrice = typeof price === "string" ? parseFloat(price) : price;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice);
};

interface TripDetailsPageProps {
  params: {
    tripId: string;
    locale: Locale;
  };
}

export default async function TripDetailsPage({
  params,
}: TripDetailsPageProps) {
  const { tripId, locale } = params;
  const trip = await getTripById(parseInt(tripId));

  if (!trip) {
    notFound();
  }

  const isArchived = trip.status === "archived";
  const hasBookings = trip.bookings && trip.bookings.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Trip Details</h1>
          {trip.status && (
            <Badge
              className={`ml-2 ${
                trip.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : trip.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : trip.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : trip.status === "archived"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
          <Link
            href={`/${locale}/agency/dashboard/trips`}
            className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            Back to Trips
          </Link>
          <Link
            href={`/${locale}/agency/dashboard/trips/${trip.id}/edit`}
            className="inline-flex items-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            Edit Trip
          </Link>
          {isArchived ? (
            <PublishTripButton tripId={trip.id} />
          ) : hasBookings ? (
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="text-gray-400 cursor-not-allowed px-4 py-2"
              title="This trip has bookings and cannot be archived"
            >
              <ArchiveIcon className="h-4 w-4 mr-1" />
              Archive
            </Button>
          ) : (
            <ArchiveTripButton tripId={trip.id} />
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Images Gallery */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Images</h2>
          <div className="grid grid-cols-2 gap-4">
            {trip.images.map((image, index) => (
              <div
                key={image.id}
                className="relative aspect-video rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow duration-300"
              >
                <Image
                  src={image.imageUrl}
                  alt={`${trip.name} image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Trip Details */}
        <div className="space-y-6 bg-white p-6 rounded-lg shadow">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Basic Information
            </h2>
            <div className="space-y-2 text-gray-700">
              <div>
                <span className="font-medium">Name:</span>{" "}
                <span className="text-gray-900">{trip.name}</span>
              </div>
              <div>
                <span className="font-medium">Destination:</span>{" "}
                <span className="text-gray-900">{trip.destination}</span>
              </div>

              {/* Price Information with Discount */}
              {trip.discountPercentage ? (
                <div className="space-y-1">
                  <div>
                    <span className="font-medium">Original Price:</span>{" "}
                    <span className="text-gray-400 line-through">
                      {formatPriceWithCurrency(
                        trip.originalPrice,
                        trip.currency
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Discounted Price:</span>{" "}
                    <span className="text-green-600 font-semibold">
                      {formatPriceWithCurrency(
                        trip.priceAfterDiscount || trip.originalPrice,
                        trip.currency
                      )}
                      <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        {trip.discountPercentage}% OFF
                      </span>
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="font-medium">Price:</span>{" "}
                  <span className="text-gray-900">
                    {formatPriceWithCurrency(trip.originalPrice, trip.currency)}
                  </span>
                </div>
              )}

              <div>
                <span className="font-medium">Capacity:</span>{" "}
                <span className="text-gray-900">{trip.capacity} persons</span>
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    trip.isAvailable
                      ? "text-green-800 bg-green-100"
                      : "text-red-800 bg-red-100"
                  }`}
                >
                  {trip.isAvailable ? "Available" : "Not Available"}
                </span>
              </div>
              <div>
                <span className="font-medium">Duration:</span>{" "}
                <span className="text-gray-900">
                  {new Date(trip.startDate).toLocaleDateString()} -{" "}
                  {new Date(trip.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Description
            </h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {trip.description}
            </p>
          </div>

          {/* Activities Section */}
          {trip.activities.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Activities
              </h2>
              <div className="space-y-4">
                {trip.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <h3 className="font-medium text-gray-800">
                      {activity.activityName}
                    </h3>
                    {activity.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                    )}
                    {activity.scheduledDate && (
                      <p className="text-sm text-gray-500 mt-2">
                        Scheduled for:{" "}
                        {new Date(activity.scheduledDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
