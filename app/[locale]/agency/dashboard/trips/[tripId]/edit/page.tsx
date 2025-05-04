/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTripById } from "@/actions/trips/tripActions";
import { notFound } from "next/navigation";
import EditTripForm from "./EditTripForm";
import { CurrencyProvider } from "@/lib/contexts/CurrencyContext";
import { Locale } from "@/i18n/routing";

interface EditTripPageProps {
  params: Promise<{
    tripId: string;
    locale: Locale;
  }>;
}

export default async function EditTripPage({ params }: EditTripPageProps) {
  const { tripId, locale } = await params;
  const trip = await getTripById(parseInt(tripId));

  if (!trip) {
    notFound();
  }

  // Log the trip data to see what we have
  console.log("Trip data from DB:", JSON.stringify(trip, null, 2));

  // Transform the trip data to match the form's expected types
  const transformedTrip = {
    id: trip.id,
    name: trip.name,
    description: trip.description ?? "",
    destination: trip.destination,
    startDate: new Date(trip.startDate),
    endDate: new Date(trip.endDate),
    originalPrice: Number(trip.originalPrice),
    discountPercentage: trip.discountPercentage ?? null,
    priceAfterDiscount: trip.priceAfterDiscount
      ? Number(trip.priceAfterDiscount)
      : null,
    capacity: trip.capacity,
    isAvailable: trip.isAvailable ?? false,
    currency: trip.currency || "USD", // Ensure currency is passed, default to USD if not available
    // Add all additional discount fields with proper fallbacks to null
    groupDiscountEnabled: trip.groupDiscountEnabled ?? false,
    groupDiscountMinPeople: trip.groupDiscountMinPeople ?? null,
    groupDiscountPercentage: trip.groupDiscountPercentage ?? null,
    timeSpecificDiscountEnabled: trip.timeSpecificDiscountEnabled ?? false,
    timeSpecificDiscountStartTime: trip.timeSpecificDiscountStartTime ?? null,
    timeSpecificDiscountEndTime: trip.timeSpecificDiscountEndTime ?? null,
    timeSpecificDiscountDays: trip.timeSpecificDiscountDays ?? null,
    timeSpecificDiscountPercentage: trip.timeSpecificDiscountPercentage ?? null,
    childDiscountEnabled: trip.childDiscountEnabled ?? false,
    childDiscountPercentage: trip.childDiscountPercentage ?? null,
    images: trip.images.map((img: any) => ({
      id: img.id,
      imageUrl: img.imageUrl,
    })),
    activities: trip.activities.map((act: any) => ({
      id: act.id,
      activityName: act.activityName,
      description: act.description ?? "",
      scheduledDate: act.scheduledDate ? new Date(act.scheduledDate) : null,
    })),
  };

  return (
    <div className="p-6">
      <CurrencyProvider>
        <EditTripForm trip={transformedTrip} locale={locale} />
      </CurrencyProvider>
    </div>
  );
}
