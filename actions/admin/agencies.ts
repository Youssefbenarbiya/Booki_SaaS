"use server"

import db from "@/db/drizzle"
import {
  user,
  agencies,
  agencyEmployees,
  trips,
  cars,
  hotel,
  blogs,
} from "@/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import {
  sendVerificationApprovalEmail,
  sendVerificationRejectionEmail,
} from "@/lib/verifyAgencyEmail"

// Server action to ban/unban a user
export async function toggleUserBan(formData: FormData) {
  const userId = formData.get("userId") as string
  const agencyId = formData.get("agencyId") as string
  const currentBanStatus = formData.get("currentBanStatus") === "true"
  const locale = (formData.get("locale") as string) || "en" // Add locale parameter with default

  // Get user
  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, userId),
  })

  if (!userRecord) {
    throw new Error("User not found")
  }

  // Update user ban status
  await db
    .update(user)
    .set({
      banned: !currentBanStatus,
      banReason: !currentBanStatus ? "Administrative action" : null,
    })
    .where(eq(user.id, userId))

  // Redirect back to the agency page with locale
  redirect(`/${locale}/admin/agencies/${agencyId}`)
}

// Server action for searching agencies
export async function searchAgencies(formData: FormData) {
  const searchTerm = formData.get("searchTerm") as string
  const locale = (formData.get("locale") as string) || "en" // Add locale parameter with default
  redirect(`/${locale}/admin/agencies?search=${encodeURIComponent(searchTerm)}`)
}

// Data fetching function for agencies list page
export async function getAgencies(search: string = "") {
  // Fetch all agencies with their users
  const allAgencies = await db.query.agencies.findMany({
    with: {
      user: true,
    },
    orderBy: (agencies, { desc }) => [desc(agencies.createdAt)],
  })

  // Filter agencies if search term is provided
  const filteredAgencies = search
    ? allAgencies.filter(
        (agency) =>
          agency.agencyName.toLowerCase().includes(search.toLowerCase()) ||
          agency.agencyUniqueId.toLowerCase().includes(search.toLowerCase()) ||
          agency.contactEmail?.toLowerCase().includes(search.toLowerCase())
      )
    : allAgencies

  return filteredAgencies
}

// Data fetching function for agency details page
export async function getAgencyDetails(id: string) {
  const agencyId = parseInt(id)

  if (isNaN(agencyId)) {
    return null
  }

  // Fetch agency details
  const agency = await db.query.agencies.findFirst({
    where: eq(agencies.id, agencyId),
    with: {
      user: true,
    },
  })

  if (!agency) {
    return null
  }

  // Fetch agency employees
  const employees = await db.query.agencyEmployees.findMany({
    where: eq(agencyEmployees.agencyId, agency.userId),
    with: {
      employee: true,
    },
  })

  // Fetch agency offers
  const agencyTrips = await db.query.trips.findMany({
    where: eq(trips.agencyId, agency.userId),
  })

  const agencyCars = await db.query.cars.findMany({
    where: eq(cars.agencyId, agency.userId),
  })

  const agencyHotels = await db.query.hotel.findMany({
    where: eq(hotel.agencyId, agency.userId),
  })

  const agencyBlogs = await db.query.blogs.findMany({
    where: eq(blogs.agencyId, agency.userId),
  })

  // Count bookings
  const tripBookingsList = await db.query.tripBookings.findMany({
    where: (fields, { inArray }) =>
      inArray(
        fields.tripId,
        agencyTrips.map((trip) => trip.id)
      ),
  })

  const carBookingsList = await db.query.carBookings.findMany({
    where: (fields, { inArray }) =>
      inArray(
        fields.car_id,
        agencyCars.map((car) => car.id)
      ),
  })

  const hotelRooms = await db.query.room.findMany({
    where: (fields, { inArray }) =>
      inArray(
        fields.hotelId,
        agencyHotels.map((hotel) => hotel.id)
      ),
  })

  const roomBookingsList = await db.query.roomBookings.findMany({
    where: (fields, { inArray }) =>
      inArray(
        fields.roomId,
        hotelRooms.map((room) => room.id)
      ),
  })

  const totalBookings =
    tripBookingsList.length + carBookingsList.length + roomBookingsList.length

  return {
    agency,
    employees,
    agencyTrips,
    agencyCars,
    agencyHotels,
    agencyBlogs,
    tripBookingsList,
    carBookingsList,
    roomBookingsList,
    totalBookings,
  }
}

// Server action to verify an agency
export async function verifyAgency(formData: FormData) {
  const agencyId = formData.get("agencyId") as string
  const locale = (formData.get("locale") as string) || "en"

  const numericAgencyId = parseInt(agencyId)
  if (isNaN(numericAgencyId)) {
    throw new Error("Invalid agency ID")
  }

  // Get the agency
  const agency = await db.query.agencies.findFirst({
    where: eq(agencies.id, numericAgencyId),
  })

  if (!agency) {
    throw new Error("Agency not found")
  }

  // Update verification status
  await db
    .update(agencies)
    .set({
      isVerified: true,
      verificationStatus: "approved",
      verificationReviewedAt: new Date(),
    })
    .where(eq(agencies.id, numericAgencyId))

  // Send confirmation email to the agency
  if (agency.contactEmail) {
    try {
      await sendVerificationApprovalEmail({
        agencyName: agency.agencyName,
        contactEmail: agency.contactEmail,
      })
    } catch (error) {
      console.error("Failed to send verification approval email:", error)
      // Continue even if email fails
    }
  }

  // Redirect back to the agency details page
  redirect(`/${locale}/admin/agencies/${agencyId}`)
}

// Server action to reject agency verification
export async function rejectAgency(formData: FormData) {
  const agencyId = formData.get("agencyId") as string
  const rejectionReason = formData.get("rejectionReason") as string
  const locale = (formData.get("locale") as string) || "en"

  const numericAgencyId = parseInt(agencyId)
  if (isNaN(numericAgencyId)) {
    throw new Error("Invalid agency ID")
  }

  if (!rejectionReason || rejectionReason.trim() === "") {
    throw new Error("Rejection reason is required")
  }

  // Get the agency
  const agency = await db.query.agencies.findFirst({
    where: eq(agencies.id, numericAgencyId),
  })

  if (!agency) {
    throw new Error("Agency not found")
  }

  // Update verification status
  await db
    .update(agencies)
    .set({
      isVerified: false,
      verificationStatus: "rejected",
      verificationRejectionReason: rejectionReason,
      verificationReviewedAt: new Date(),
    })
    .where(eq(agencies.id, numericAgencyId))

  // Send rejection email to the agency
  if (agency.contactEmail) {
    try {
      await sendVerificationRejectionEmail({
        agencyName: agency.agencyName,
        contactEmail: agency.contactEmail,
        rejectionReason: rejectionReason,
      })
    } catch (error) {
      console.error("Failed to send verification rejection email:", error)
      // Continue even if email fails
    }
  }

  // Redirect back to the agency details page
  redirect(`/${locale}/admin/agencies/${agencyId}`)
}

// Server action to unverify an agency
export async function unverifyAgency(formData: FormData) {
  const agencyId = formData.get("agencyId") as string
  const locale = (formData.get("locale") as string) || "en"

  const numericAgencyId = parseInt(agencyId)
  if (isNaN(numericAgencyId)) {
    throw new Error("Invalid agency ID")
  }

  // Get the agency
  const agency = await db.query.agencies.findFirst({
    where: eq(agencies.id, numericAgencyId),
  })

  if (!agency) {
    throw new Error("Agency not found")
  }

  // Update verification status
  await db
    .update(agencies)
    .set({
      isVerified: false,
      verificationStatus: "pending",
      verificationReviewedAt: new Date(),
    })
    .where(eq(agencies.id, numericAgencyId))

  // Redirect back to the agency details page
  redirect(`/${locale}/admin/agencies/${agencyId}`)
}
