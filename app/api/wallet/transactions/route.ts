import { type NextRequest, NextResponse } from "next/server"
import { wallet, walletTransactions } from "@/db/schema"
import { eq, desc, sql } from "drizzle-orm"
import db from "@/db/drizzle"
import { auth } from "@/auth"
import { headers } from "next/headers"

// Helper function to extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Get transactions for a user's wallet
export async function GET(request: NextRequest) {
  try {
    // Get session from auth
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")

    try {
      // Find user's wallet
      const userWallet = await db.query.wallet.findFirst({
        where: eq(wallet.userId, userId),
      })

      if (!userWallet) {
        return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
      }

      // Get transactions
      const transactions = await db.query.walletTransactions.findMany({
        where: eq(walletTransactions.walletId, userWallet.id),
        orderBy: [desc(walletTransactions.createdAt)],
        limit,
        offset,
      })

      // Get total count
      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(walletTransactions)
        .where(eq(walletTransactions.walletId, userWallet.id))

      const totalCount = Number(countResult[0].count)

      return NextResponse.json({
        transactions,
        pagination: {
          total: totalCount,
          limit,
          offset,
        },
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        { 
          error: "Database error", 
          details: getErrorMessage(dbError)
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch transactions", 
        details: getErrorMessage(error)
      },
      { status: 500 }
    )
  }
}
