import { NextResponse } from "next/server"
import { rejectTrip } from "@/actions/admin/tripApprovalActions"

export async function POST(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const tripId = parseInt(params.tripId, 10)
    if (isNaN(tripId)) {
      return NextResponse.json(
        { success: false, message: "Invalid trip ID" },
        { status: 400 }
      )
    }

    const result = await rejectTrip(tripId)

    if (result.success) {
      return NextResponse.json(
        { success: true, message: "Trip rejected successfully" },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in reject route:", error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
