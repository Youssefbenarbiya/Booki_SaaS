import { NextRequest, NextResponse } from "next/server";
import { 
  rejectTrip, 
  rejectCar, 
  rejectHotel, 
  rejectBlog 
} from "@/actions/admin/ApprovalActions";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const session = await auth.api.getSession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { type, id, reason } = body;

    if (!type || !id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let result;

    // Call the appropriate rejection function based on type
    switch (type) {
      case "trip":
        result = await rejectTrip(Number(id), reason);
        break;
      case "car":
        result = await rejectCar(Number(id), reason);
        break;
      case "hotel":
        result = await rejectHotel(id, reason);
        break;
      case "blog":
        result = await rejectBlog(Number(id), reason);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid offer type" },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.message || "Offer rejected successfully"
      });
    } else {
      return NextResponse.json(
        { error: result.message || "Failed to reject offer" }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in reject-offer API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" }, 
      { status: 500 }
    );
  }
} 