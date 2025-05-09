import { type NextRequest, NextResponse } from "next/server"
import { wallet, walletTransactions } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import db from "@/db/drizzle"

// Get transactions for a user's wallet
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
      .select({ count: db.fn.count() })
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
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}
