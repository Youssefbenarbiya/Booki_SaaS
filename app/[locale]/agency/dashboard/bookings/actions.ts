"use server"

import { redirect } from "next/navigation"
import { cancelBooking, BookingType } from "@/actions/bookings"

export async function handleCancelBooking(normalizedType: BookingType, id: number, locale: string) {
  await cancelBooking(normalizedType, id)
  redirect(`/${locale}/agency/dashboard/bookings`)
} 