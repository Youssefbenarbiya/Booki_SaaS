"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/auth"
import { eq, desc } from "drizzle-orm"
import { agencies, agencyWallet, walletTransaction, withdrawalRequest, notifications } from "@/db/schema"
import { db } from "@/db"

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
        balance: 0,
      }).returning()
      
      wallet = newWallet
    }

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

    if (wallet.balance < data.amount) {
      return { success: false, error: "Insufficient balance" }
    }

    // Create withdrawal request
    const [newWithdrawalRequest] = await db.insert(withdrawalRequest).values({
      agencyId: agency.userId,
      amount: data.amount,
      bankName: data.bankName,
      accountHolderName: data.accountHolderName,
      bankAccountNumber: data.bankAccountNumber,
      notes: data.notes || null,
      status: "pending",
    }).returning()

    // Create notification for admin
    await db.insert(notifications).values({
      title: "New Withdrawal Request",
      message: `${agency.agencyName} has requested a withdrawal of $${data.amount.toFixed(2)}`,
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