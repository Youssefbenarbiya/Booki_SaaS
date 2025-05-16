"use server";

import { getBookingDetails, BookingType } from "@/actions/bookings";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { 
  Booking, 
  isCarBooking, 
  isTripBooking, 
  isHotelBooking 
} from "./types";

// Server action for fetching booking data
export async function fetchBookingData(
  urlType: string,
  urlId: string,
  locale: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(`/${locale}/sign-in`);
  }

  // Normalize booking type
  const normalizedType = urlType.toLowerCase() as BookingType;

  // Validate booking type
  if (!["car", "hotel", "trip"].includes(normalizedType)) {
    return {
      isInvalidType: true,
      booking: null,
      normalizedType,
      urlType,
      locale,
    };
  }

  try {
    const id = parseInt(urlId);
    const booking = (await getBookingDetails(
      normalizedType,
      id
    )) as unknown as Booking;

    // Extract user info
    const user = booking.user;
    const userInfo = {
      userEmail: isCarBooking(booking)
        ? booking.email || user?.email
        : user?.email,
      userName: isCarBooking(booking)
        ? booking.fullName || user?.name
        : user?.name,
      userPhone: isCarBooking(booking)
        ? booking.phone || user?.phoneNumber
        : user?.phoneNumber,
    };

    // First check if payment is already completed - if so, don't show payment button
    if (booking.paymentStatus === "completed") {
      const amounts = calculateAmounts(booking, 30); // Default to 30% for calculations
      return {
        isInvalidType: false,
        booking,
        userInfo,
        isPartialPayment: false, // Payment is completed, don't show the button
        advancePercentage: 30,
        amounts,
        normalizedType,
        id,
        locale,
      };
    }

    // Check if this is a partial payment (advance payment)
    const isPartialPayment =
      booking.status === "partially_paid" ||
      booking.paymentStatus === "partial" ||
      booking.paymentStatus === "partially_paid" ||
      (isCarBooking(booking) && booking.paymentMethod?.includes("ADVANCE")) ||
      (isTripBooking(booking) && booking.paymentMethod?.includes("ADVANCE")) ||
      // Check paymentType field for trips
      (isTripBooking(booking) &&
        booking.trip.advancePaymentPercentage &&
        booking.trip.advancePaymentPercentage > 0 &&
        booking.status !== "completed") ||
      // Add check for hotel rooms with advance payment
      (isHotelBooking(booking) &&
        booking.paymentType === "advance" &&
        booking.advancePaymentPercentage &&
        booking.advancePaymentPercentage > 0 &&
        booking.status !== "completed") ||
      // For cases where the payment amount is less than the full amount (indicating partial payment)
      (isTripBooking(booking) &&
        booking.totalPrice &&
        booking.trip?.originalPrice &&
        parseFloat(booking.totalPrice) <
          parseFloat(booking.trip.originalPrice) * booking.seatsBooked);

    // Calculate the advance percentage (default to 30% if not specified)
    const advancePercentage = 
      (isHotelBooking(booking) && booking.advancePaymentPercentage) 
        ? booking.advancePaymentPercentage 
        : isTripBooking(booking) && booking.trip.advancePaymentPercentage
          ? booking.trip.advancePaymentPercentage
          : 30;

    // Calculate amounts
    const amounts = calculateAmounts(booking, advancePercentage);

    return {
      isInvalidType: false,
      booking,
      userInfo,
      isPartialPayment,
      advancePercentage,
      amounts,
      normalizedType,
      id,
      locale,
    };
  } catch (error) {
    console.error(`Error fetching ${normalizedType} booking details:`, error);
    return {
      isError: true,
      normalizedType,
      locale,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Helper function to calculate amounts
function calculateAmounts(booking: Booking, advancePercentage: number) {
  try {
    if (isCarBooking(booking)) {
      const total = parseFloat(booking.total_price);
      return {
        total,
        advanceAmount: total * (advancePercentage / 100),
        remainingAmount: total * (1 - advancePercentage / 100),
      };
    } else if (isTripBooking(booking)) {
      const originalPrice = parseFloat(booking.trip.originalPrice);
      const seats = booking.seatsBooked;
      
      let discountAmount = 0;
      if (booking.trip.discountPercentage) {
        discountAmount =
          originalPrice *
          seats *
          (booking.trip.discountPercentage / 100);
      }
      
      const totalAfterDiscount = originalPrice * seats - discountAmount;
      return {
        total: totalAfterDiscount,
        advanceAmount: totalAfterDiscount * (advancePercentage / 100),
        remainingAmount: totalAfterDiscount * (1 - advancePercentage / 100),
      };
    } else if (isHotelBooking(booking)) {
      const total = parseFloat(booking.totalPrice);
      return {
        total,
        advanceAmount: total * (advancePercentage / 100),
        remainingAmount: total * (1 - advancePercentage / 100),
      };
    }
    
    const total = parseFloat(
      // @ts-ignore
      booking.totalPrice || booking.total_price || "0"
    );
    return {
      total,
      advanceAmount: total * (advancePercentage / 100),
      remainingAmount: total * (1 - advancePercentage / 100),
    };
  } catch (error) {
    console.error("Error calculating amounts:", error);
    return { total: 0, advanceAmount: 0, remainingAmount: 0 };
  }
} 