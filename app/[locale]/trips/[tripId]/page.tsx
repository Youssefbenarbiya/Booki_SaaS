"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  Clock,
  MapPin,
  Users,
  UtensilsCrossed,
  Wifi,
  Car,
  BedDouble,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice, getDurationInDays } from "@/lib/utils";
import Link from "next/link";
import { getTripById } from "@/actions/trips/tripActions";
import { useCurrency } from "@/lib/contexts/CurrencyContext";
import { useState, useEffect } from "react";
import React from "react";
import AgencyInfo from "@/components/common/AgencyInfo";
import dynamic from "next/dynamic";
import { ContactButton } from "@/components/chat/ContactButton";


interface TripParams {
  tripId: string;
  locale: string;
}

interface TripPageProps {
  // The type of params is explicitly a Promise that resolves to TripParams.
  params: Promise<TripParams>;
}

export default function TripDetailsPage({ params }: TripPageProps) {
  const { currency, convertPrice } = useCurrency();
  const resolvedParams = React.use(params);
  const { tripId, locale } = resolvedParams;
  // Use state to hold the trip data
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch trip data
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const tripData = await getTripById(parseInt(tripId));
        if (!tripData) {
          notFound();
        }
        setTrip(tripData);
      } catch (error) {
        console.error("Error fetching trip:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!trip) {
    notFound();
  }

  const duration = getDurationInDays(trip.startDate, trip.endDate);

  // Group activities by day
  const activitiesByDay: { [key: string]: any[] } = {};

  trip.activities.forEach((activity: any) => {
    if (!activity.scheduledDate) return;

    const date = new Date(activity.scheduledDate).toLocaleDateString();
    if (!activitiesByDay[date]) {
      activitiesByDay[date] = [];
    }
    activitiesByDay[date].push(activity);
  });

  // Calculate effective price (discounted or original)
  const hasDiscount = trip.discountPercentage && trip.discountPercentage > 0;
  const effectivePrice =
    hasDiscount && trip.priceAfterDiscount
      ? Number(trip.priceAfterDiscount)
      : Number(trip.originalPrice);

  // Convert prices to selected currency
  const tripCurrency = trip.currency || "USD";
  const convertedOriginalPrice = convertPrice(
    Number(trip.originalPrice),
    tripCurrency
  );
  const convertedEffectivePrice = convertPrice(effectivePrice, tripCurrency);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2 text-sm">
              <Badge variant="outline" className="text-gray-600">
                <Clock className="h-3 w-3 mr-1" />
                {duration} days
              </Badge>
              <Badge variant="outline" className="text-gray-600">
                <MapPin className="h-3 w-3 mr-1" />
                {trip.destination}
              </Badge>
              <Badge variant="outline" className="text-gray-600">
                <Users className="h-3 w-3 mr-1" />
                {trip.capacity} spots
              </Badge>
            </div>

            <h1 className="text-3xl font-bold lg:text-4xl">{trip.name}</h1>

            {/* Agency Info */}
            <AgencyInfo
              agencyName={trip.agency?.agencyName || "Trip Agency"}
              agencyLogo={trip.agency?.logo || null}
              locale={locale}
              showContactButton={true}
              size="md"
            />

            {/* Image Gallery */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {trip.images.slice(0, 4).map((image: any, index: number) => (
                <div
                  key={image.id}
                  className={`relative rounded-lg overflow-hidden ${
                    index === 0
                      ? "col-span-2 row-span-2 aspect-[16/9]"
                      : "aspect-square"
                  }`}
                >
                  <Image
                    src={image.imageUrl}
                    alt={`${trip.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6 sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <div>
                {hasDiscount ? (
                  <>
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(convertedEffectivePrice, { currency })}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm line-through text-gray-500">
                        {formatPrice(convertedOriginalPrice, { currency })}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {trip.discountPercentage}% off
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(convertedEffectivePrice, { currency })}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500">per person</div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col space-y-2">
              <Link href={`/${locale}/trips/${tripId}/book`} className="w-full">
                <Button size="lg" className="w-full">
                  Book Now
                </Button>
              </Link>
              
              {/* Contact Button that opens chat */}
              <ContactButton 
                postId={tripId}
                postType="trip"
                agencyName={trip.agency?.agencyName || "Agency"}
                agencyLogo={trip.agency?.logo || null}
              />
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              You won&apos;t be charged yet
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-semibold mb-4">About This Trip</h2>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {trip.description}
            </p>

            {/* Features Grid */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">
                What&apos;s Included
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <BedDouble className="h-5 w-5 text-primary" />
                  <span className="text-sm">Accommodation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  <span className="text-sm">Meals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-primary" />
                  <span className="text-sm">Transportation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-sm">Guided Tours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wifi className="h-5 w-5 text-primary" />
                  <span className="text-sm">Wi-Fi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="text-sm">Insurance</span>
                </div>
              </div>
            </div>

            {/* Itinerary Section */}
            {Object.keys(activitiesByDay).length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-6">Itinerary</h2>
                <div className="space-y-6">
                  {Object.entries(activitiesByDay).map(
                    ([date, activities], index) => (
                      <div
                        key={date}
                        className="relative pl-8 border-l-2 border-gray-200 pb-6"
                      >
                        <div className="absolute left-[-9px] top-0 bg-primary rounded-full w-4 h-4" />
                        <div className="mb-2">
                          <h3 className="text-lg font-medium">
                            Day {index + 1}:{" "}
                            {new Date(date).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                            })}
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {activities.map((activity) => (
                            <div
                              key={activity.id}
                              className="bg-gray-50 rounded-lg p-4"
                            >
                              <h4 className="font-medium text-gray-900">
                                {activity.activityName}
                              </h4>
                              {activity.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {activity.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Destination Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4">Destination</h3>

            <h4 className="font-medium text-gray-900 flex items-center mb-2">
              <MapPin className="h-4 w-4 mr-1 text-primary" />
              {trip.destination}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Explore the wonders of {trip.destination} with our carefully
              planned trip itinerary.
            </p>
            <Link
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                trip.destination
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="w-full">
                View on map
              </Button>
            </Link>
          </div>

          {/* Trip Policies */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Trip Policies</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-900">
                  Cancellation Policy
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Free cancellation up to 30 days before departure.
                  Cancellations made within 30 days may be eligible for partial
                  refund.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-900">Payment</h4>
                <p className="text-xs text-gray-600 mt-1">
                  20% deposit required at booking. Full payment due 30 days
                  before departure.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-900">
                  Travel Documents
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Valid passport required. Check visa requirements for your
                  nationality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
