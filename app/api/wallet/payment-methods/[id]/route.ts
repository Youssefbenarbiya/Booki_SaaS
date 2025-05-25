import { type NextRequest, NextResponse } from "next/server";
import { paymentMethods } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import db from "@/db/drizzle";
import { auth } from "@/auth";
import { headers } from "next/headers";

// Helper function to extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// PUT: Update a payment method
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session from auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const methodId = parseInt(params.id);

    if (isNaN(methodId)) {
      return NextResponse.json(
        { error: "Invalid payment method ID" },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.type || !data.name || !data.details) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the payment method exists and belongs to the user
    const existingMethod = await db.query.paymentMethods.findFirst({
      where: and(
        eq(paymentMethods.id, methodId),
        eq(paymentMethods.userId, userId)
      ),
    });

    if (!existingMethod) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      );
    }

    // If this is being set as default, unset any existing default
    if (data.isDefault && !existingMethod.isDefault) {
      await db
        .update(paymentMethods)
        .set({ isDefault: false })
        .where(
          and(
            eq(paymentMethods.userId, userId),
            eq(paymentMethods.isDefault, true)
          )
        );
    }

    // Update the payment method
    const updatedMethod = await db
      .update(paymentMethods)
      .set({
        type: data.type,
        name: data.name,
        details: data.details,
        isDefault: data.isDefault,
        updatedAt: new Date(),
      })
      .where(eq(paymentMethods.id, methodId))
      .returning();

    return NextResponse.json({
      paymentMethod: updatedMethod[0],
    });
  } catch (error) {
    console.error("Error updating payment method:", error);
    return NextResponse.json(
      {
        error: "Error updating payment method",
        details: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete a payment method
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session from auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const methodId = parseInt(params.id);

    if (isNaN(methodId)) {
      return NextResponse.json(
        { error: "Invalid payment method ID" },
        { status: 400 }
      );
    }

    // Check if the payment method exists and belongs to the user
    const existingMethod = await db.query.paymentMethods.findFirst({
      where: and(
        eq(paymentMethods.id, methodId),
        eq(paymentMethods.userId, userId)
      ),
    });

    if (!existingMethod) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      );
    }

    // Delete the payment method
    await db.delete(paymentMethods).where(eq(paymentMethods.id, methodId));

    return NextResponse.json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return NextResponse.json(
      {
        error: "Error deleting payment method",
        details: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
