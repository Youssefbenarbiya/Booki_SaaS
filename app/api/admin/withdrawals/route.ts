import { type NextRequest, NextResponse } from "next/server"
import { withdrawalRequests } from "@/db/schema"
import { eq, desc, sql } from "drizzle-orm"
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

    // Get all withdrawal requests with associated user info
    let query = db.query.withdrawalRequests.findMany({
      orderBy: [desc(withdrawalRequests.createdAt)],
      limit,
      offset,
      with: {
        user: true
      }
    });

    // Apply status filter if provided
    if (status && status !== "all") {
      query = db.query.withdrawalRequests.findMany({
        where: eq(withdrawalRequests.status, status),
        orderBy: [desc(withdrawalRequests.createdAt)],
        limit,
        offset,
        with: {
          user: true
        }
      });
    }

    // Execute the query
    const results = await query;

    // Format the results to match the expected structure
    const formattedResults = results.map(item => ({
      withdrawalRequest: {
        id: item.id,
        walletId: item.walletId,
        userId: item.userId,
        amount: item.amount,
        status: item.status,
        approvedBy: item.approvedBy,
        approvedAt: item.approvedAt,
        rejectedBy: item.rejectedBy,
        rejectedAt: item.rejectedAt,
        rejectionReason: item.rejectionReason,
        paymentMethod: item.paymentMethod,
        paymentDetails: item.paymentDetails,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      },
      userName: item.user.name,
      userEmail: item.user.email
    }));

    // Count total records
    const countQuery = status && status !== "all"
      ? db.select({ count: sql`count(*)` })
          .from(withdrawalRequests)
          .where(eq(withdrawalRequests.status, status))
      : db.select({ count: sql`count(*)` })
          .from(withdrawalRequests);

    const countResult = await countQuery;
    const totalCount = Number(countResult[0].count);

    return NextResponse.json({
      withdrawals: formattedResults,
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
