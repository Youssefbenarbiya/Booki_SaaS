import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { completePayment } from "@/actions/bookings";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    console.log("Starting payment completion request");
    console.log("Request URL:", request.url);
    console.log("Request method:", request.method);
    console.log("Request headers:", Object.fromEntries([...request.headers.entries()]));
    
    // Check authentication using the correct method
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    // Log session info with sensitive parts masked
    console.log("Session in API:", {
      userId: session?.user?.id ? `${session.user.id.substring(0, 3)}...` : null,
      userRole: session?.user?.role,
      isAuthenticated: !!session?.user?.id,
      sessionKeys: session ? Object.keys(session) : null
    });
    
    if (!session?.user?.id) {
      console.log("Authentication failed: No user ID in session");
      return NextResponse.json(
        { error: "Unauthorized: User not authenticated" },
        { status: 401 }
      );
    }

    // Check authorization (user must be admin or agency staff)
    const allowedRoles = ["admin", "agency owner", "employee"];
    const userRole = session.user.role as string;
    const isAuthorized = allowedRoles.includes(userRole);
    
    console.log("Authorization check:", { 
      userRole, 
      allowedRoles, 
      isAuthorized 
    });
    
    if (!isAuthorized) {
      console.log(`Authorization failed: User role '${userRole}' not in allowed roles`);
      return NextResponse.json(
        { error: `Unauthorized: User role '${userRole}' cannot complete payments. Required roles: ${allowedRoles.join(', ')}` },
        { status: 403 }
      );
    }

    // Get request data
    let data;
    try {
      data = await request.json();
      console.log("Request data (parsed):", data);
    } catch (parseError) {
      console.error("Error parsing request JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    const { type, id } = data;
    
    console.log("Request data:", { type, id });

    if (!type || !id) {
      console.log("Invalid request: Missing type or id");
      return NextResponse.json(
        { error: "Missing required parameters: type and id are required" },
        { status: 400 }
      );
    }

    // Validate booking type
    if (!["car", "hotel", "trip"].includes(type)) {
      console.log(`Invalid booking type: ${type}`);
      return NextResponse.json(
        { error: `Invalid booking type: ${type}. Must be one of: car, hotel, trip` },
        { status: 400 }
      );
    }

    // Validate booking ID
    if (typeof id !== 'number' || isNaN(id) || id <= 0) {
      console.log(`Invalid booking ID: ${id}`);
      return NextResponse.json(
        { error: `Invalid booking ID: ${id}. Must be a positive number` },
        { status: 400 }
      );
    }

    // Complete the payment
    try {
      console.log(`Calling completePayment function with type=${type}, id=${id}`);
      const result = await completePayment(type, id);
      console.log("Payment completion successful:", result);
    } catch (completeError) {
      console.error("Error in completePayment function:", completeError);
      console.error("Error stack:", completeError instanceof Error ? completeError.stack : "No stack trace");
      
      return NextResponse.json(
        { 
          error: "Database error during payment completion", 
          details: completeError instanceof Error ? completeError.message : String(completeError)
        },
        { status: 500 }
      );
    }

    // Revalidate paths
    console.log("Revalidating paths");
    revalidatePath(`/[locale]/agency/dashboard/bookings`);
    revalidatePath(`/[locale]/agency/dashboard/bookings/${type}/${id}`);

    const successResponse = { 
      success: true,
      message: "Payment marked as complete successfully"
    };
    
    console.log("Returning success response:", successResponse);
    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Unhandled error completing payment:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    return NextResponse.json(
      { 
        error: "Failed to complete payment",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 