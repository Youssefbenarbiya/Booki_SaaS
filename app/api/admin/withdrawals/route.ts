import { type NextRequest, NextResponse } from "next/server"
import { withdrawalRequests } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import db from "@/db/drizzle"
import { auth } from "@/auth"
import { headers } from "next/headers"

// Get all withdrawal requests (admin only)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")

    // Get session from auth
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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
    if (status && status !== "all") {
      query = query.where(eq(withdrawalRequests.status, status))
    }

    const results = await query

    // Get total count
    let countQuery = db
      .select({ count: db.fn.count() })
      .from(withdrawalRequests)

    if (status && status !== "all") {
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
