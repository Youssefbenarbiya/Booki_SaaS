import { NextResponse } from "next/server"
import { approveTrip } from "@/actions/admin/ApprovalActions"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> } 
) {
  const { tripId } = await params 
  const id = parseInt(tripId, 10)
  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid trip ID" },
      { status: 400 }
    )
  }

  const result = await approveTrip(id)
  if (result.success) {
    return NextResponse.json(
      { success: true, message: "Trip approved successfully" },
      { status: 200 }
    )
  } else {
    return NextResponse.json(
      { success: false, message: result.message },
      { status: 500 }
    )
  }
}
