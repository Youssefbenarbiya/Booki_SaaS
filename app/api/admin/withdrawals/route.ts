import { type NextRequest, NextResponse } from "next/server"
import { withdrawalRequests } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import db from "@/db/drizzle"

// Get all withdrawal requests (admin only)
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    const userRole = request.headers.get("x-user-role")
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")

    if (!userId || userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Build query
    let query = db
      .select({
        withdrawalRequest: withdrawalRequests,
        userName: db.query.user.name,
        userEmail: db.query.user.email,
      })
      .from(withdrawalRequests)
      .leftJoin(db.query.user, eq(withdrawalRequests.userId, db.query.user.id))
      .orderBy(desc(withdrawalRequests.createdAt))
      .limit(limit)
      .offset(offset)

    // Add status filter if provided
    if (status) {
      query = query.where(eq(withdrawalRequests.status, status))
    }

    const results = await query

    // Get total count
    let countQuery = db
      .select({ count: db.fn.count() })
      .from(withdrawalRequests)

    if (status) {
      countQuery = countQuery.where(eq(withdrawalRequests.status, status))
    }

    const countResult = await countQuery
    const totalCount = Number(countResult[0].count)

    return NextResponse.json({
      withdrawals: results,
      pagination: {
        total: totalCount,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch withdrawal requests" },
      { status: 500 }
    )
  }
}
