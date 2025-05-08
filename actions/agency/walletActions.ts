"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/auth"
import { eq, desc, sql, and, sum } from "drizzle-orm"
import { agencies, agencyWallet, walletTransaction, withdrawalRequest, notifications, tripBookings, trips, roomBookings, room, hotel, carBookings, cars } from "@/db/schema"
import db from "@/db/drizzle"

/**
 * Calculate agency income from all sources (trips, rooms, cars)
 */
async function calculateAgencyIncome(agencyId: string) {
  try {
    // Calculate revenue from trip bookings - filtered by agency
    const tripBookingsRevenueResult = await db
      .select({
        revenue: sql<number>`SUM(${tripBookings.seatsBooked} * ${trips.priceAfterDiscount})`,
      })
      .from(tripBookings)
      .innerJoin(trips, eq(tripBookings.tripId, trips.id))
      .where(eq(trips.agencyId, agencyId)) // Filter by agency

    // Calculate revenue from room bookings - filtered by agency
    const roomBookingsRevenueResult = await db
      .select({
        revenue: sql<number>`
          SUM(
            DATE_PART('day', ${roomBookings.checkOut}::timestamp - ${roomBookings.checkIn}::timestamp) * 
            ${room.pricePerNightAdult}::decimal
          )
        `,
      })
      .from(roomBookings)
      .innerJoin(room, eq(roomBookings.roomId, room.id))
      .innerJoin(hotel, eq(room.hotelId, hotel.id))
      .where(eq(hotel.agencyId, agencyId)) // Filter by agency

    // Calculate revenue from car bookings - filtered by agency
    const carBookingsRevenueResult = await db
      .select({
        revenue: sql<number>`SUM(${carBookings.total_price})`,
      })
      .from(carBookings)
      .innerJoin(cars, eq(carBookings.car_id, cars.id))
      .where(eq(cars.agencyId, agencyId))

    // Parse revenue values
    const tripRevenue = Number(tripBookingsRevenueResult[0]?.revenue || 0)
    const roomRevenue = Number(roomBookingsRevenueResult[0]?.revenue || 0)
    const carRevenue = Number(carBookingsRevenueResult[0]?.revenue || 0)

    // Calculate total revenue in TND
    const totalRevenue = tripRevenue + roomRevenue + carRevenue
    
    return totalRevenue
  } catch (error) {
    console.error("Error calculating agency income:", error)
    return 0
  }
}

/**
 * Get agency wallet
 */
export async function getAgencyWallet() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    
    if (!session?.user?.id || session.user.role !== "AGENCY") {
      return { wallet: null, error: "Unauthorized" }
    }

    // Get the agency id from the user
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, session.user.id),
      columns: { userId: true },
    })

    if (!agency) {
      return { wallet: null, error: "Agency not found" }
    }

    // Get or create wallet for the agency
    let wallet = await db.query.agencyWallet.findFirst({
      where: eq(agencyWallet.agencyId, agency.userId),
    })

    // If wallet doesn't exist, create it
    if (!wallet) {
      const [newWallet] = await db.insert(agencyWallet).values({
        agencyId: agency.userId,
        balance: "0",
      }).returning()
      
      wallet = newWallet
    }

    // Calculate total income
    const totalIncome = await calculateAgencyIncome(agency.userId)
    
    // Get total withdrawals
    const withdrawalsResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${withdrawalRequest.amount}), 0)`,
      })
      .from(withdrawalRequest)
      .where(and(
        eq(withdrawalRequest.agencyId, agency.userId), 
        eq(withdrawalRequest.status, "approved")
      ))
    
    const totalWithdrawn = Number(withdrawalsResult[0]?.total || 0)
    
    // Calculate current balance
    const currentBalance = (totalIncome - totalWithdrawn).toFixed(2)
    
    // Update wallet balance
    await db.update(agencyWallet)
      .set({
        balance: currentBalance,
        updatedAt: new Date()
      })
      .where(eq(agencyWallet.agencyId, agency.userId))
    
    // Fetch updated wallet
    wallet = await db.query.agencyWallet.findFirst({
      where: eq(agencyWallet.agencyId, agency.userId),
    })

    return { wallet }
  } catch (error) {
    console.error("Error fetching agency wallet:", error)
    return { wallet: null, error: "Failed to fetch wallet" }
  }
}

/**
 * Get agency transactions
 */
export async function getAgencyTransactions(limit = 10) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    
    if (!session?.user?.id || session.user.role !== "AGENCY") {
      return { transactions: [], error: "Unauthorized" }
    }

    // Get the agency id from the user
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, session.user.id),
      columns: { userId: true },
    })

    if (!agency) {
      return { transactions: [], error: "Agency not found" }
    }

    // Get transactions for the agency
    const transactions = await db.query.walletTransaction.findMany({
      where: eq(walletTransaction.agencyId, agency.userId),
      orderBy: [desc(walletTransaction.createdAt)],
      limit: limit,
    })

    return { transactions }
  } catch (error) {
    console.error("Error fetching agency transactions:", error)
    return { transactions: [], error: "Failed to fetch transactions" }
  }
}

/**
 * Get agency withdrawal requests
 */
export async function getAgencyWithdrawalRequests() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    
    if (!session?.user?.id || session.user.role !== "AGENCY") {
      return { withdrawalRequests: [], error: "Unauthorized" }
    }

    // Get the agency id from the user
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, session.user.id),
      columns: { userId: true },
    })

    if (!agency) {
      return { withdrawalRequests: [], error: "Agency not found" }
    }

    // Get withdrawal requests for the agency
    const withdrawalRequests = await db.query.withdrawalRequest.findMany({
      where: eq(withdrawalRequest.agencyId, agency.userId),
      orderBy: [desc(withdrawalRequest.createdAt)],
    })

    return { withdrawalRequests }
  } catch (error) {
    console.error("Error fetching agency withdrawal requests:", error)
    return { withdrawalRequests: [], error: "Failed to fetch withdrawal requests" }
  }
}

/**
 * Create a withdrawal request
 */
export async function createWithdrawalRequest(data: {
  amount: number
  bankName: string
  accountHolderName: string
  bankAccountNumber: string
  notes?: string
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    
    if (!session?.user?.id || session.user.role !== "AGENCY") {
      return { success: false, error: "Unauthorized" }
    }

    // Get the agency
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, session.user.id),
      columns: { userId: true, agencyName: true },
    })

    if (!agency) {
      return { success: false, error: "Agency not found" }
    }

    // Get wallet and check balance
    const wallet = await db.query.agencyWallet.findFirst({
      where: eq(agencyWallet.agencyId, agency.userId),
    })

    if (!wallet) {
      return { success: false, error: "Wallet not found" }
    }

    const walletBalance = Number(wallet.balance || 0)
    if (walletBalance < data.amount) {
      return { success: false, error: "Insufficient balance" }
    }

    // Create withdrawal request
    const [newWithdrawalRequest] = await db.insert(withdrawalRequest).values({
      agencyId: agency.userId,
      amount: data.amount.toString(),
      bankName: data.bankName,
      accountHolderName: data.accountHolderName,
      bankAccountNumber: data.bankAccountNumber,
      notes: data.notes || null,
      status: "pending",
    }).returning()

    // Create notification for admin
    await db.insert(notifications).values({
      title: "New Withdrawal Request",
      message: `${agency.agencyName} has requested a withdrawal of ${data.amount.toFixed(2)} TND`,
      type: "info",
      role: "ADMIN",
      relatedItemType: "withdrawal",
      relatedItemId: newWithdrawalRequest.id,
    })

    revalidatePath("/agency/dashboard/wallet")
    return { success: true, withdrawalRequest: newWithdrawalRequest }
  } catch (error) {
    console.error("Error creating withdrawal request:", error)
    return { success: false, error: "Failed to create withdrawal request" }
  }
} 