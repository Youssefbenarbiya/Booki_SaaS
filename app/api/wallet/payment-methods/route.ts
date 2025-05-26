/* eslint-disable @typescript-eslint/no-unused-vars */
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

// GET: Fetch user's payment methods
export async function GET(request: NextRequest) {
  try {
    // Get session from auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all payment methods for the user
    const userPaymentMethods = await db.query.paymentMethods.findMany({
      where: eq(paymentMethods.userId, userId),
      orderBy: (paymentMethods, { desc }) => [
        desc(paymentMethods.isDefault),
        desc(paymentMethods.createdAt),
      ],
    });

    return NextResponse.json({
      paymentMethods: userPaymentMethods,
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      {
        error: "Error fetching payment methods",
        details: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

// POST: Create a new payment method
export async function POST(request: NextRequest) {
  try {
    // Get session from auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await request.json();

    // Validate required fields
    if (!data.type || !data.name || !data.details) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If this is the default payment method, unset any existing default
    if (data.isDefault) {
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

    // Create the new payment method
    const newPaymentMethod = await db
      .insert(paymentMethods)
      .values({
        userId,
        type: data.type,
        name: data.name,
        details: data.details,
        isDefault: data.isDefault || false,
      })
      .returning();

    return NextResponse.json({
      paymentMethod: newPaymentMethod[0],
    });
  } catch (error) {
    console.error("Error creating payment method:", error);
    return NextResponse.json(
      {
        error: "Error creating payment method",
        details: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
