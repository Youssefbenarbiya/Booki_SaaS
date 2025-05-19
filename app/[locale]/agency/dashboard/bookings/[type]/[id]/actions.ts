"use server";

import { completePayment, BookingType } from "@/actions/bookings";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Server action to mark a booking payment as complete
 */
export async function completeBookingPayment(formData: FormData) {
  const type = formData.get("type") as BookingType;
  const id = parseInt(formData.get("id") as string, 10);
  const locale = formData.get("locale") as string;
  
  if (!type || isNaN(id) || !locale) {
    return { success: false, error: "Missing required parameters" };
  }

  try {
    console.log(`Completing payment for ${type} booking #${id}...`);
    await completePayment(type, id);
    
    // Revalidate paths to ensure fresh data
    revalidatePath(`/${locale}/agency/dashboard/bookings`);
    revalidatePath(`/${locale}/agency/dashboard/bookings/${type}/${id}`);
    
    // Redirect to the same page to show updated status
    redirect(`/${locale}/agency/dashboard/bookings/${type}/${id}?updated=true`);
  } catch (error) {
    console.error("Error completing payment:", error);
    // Still redirect but with an error query parameter
    redirect(`/${locale}/agency/dashboard/bookings/${type}/${id}?error=payment_failed`);
  }
} 