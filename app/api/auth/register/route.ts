import { NextResponse } from "next/server";
import { user, agencies } from "@/db/schema";
import { generateAgencyId } from "@/lib/utils";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      name,
      phoneNumber,
      role,
      agencyName,
      agencyType,
      country,
      region,
    } = body;

    console.log("API received data:", {
      email,
      name,
      phoneNumber,
      role,
      agencyName,
      agencyType,
      country,
      region,
    });

    // For agency registration, validate required fields
    if (role === "agency owner" && !agencyName) {
      return NextResponse.json(
        { error: "Agency name is required for agency registration" },
        { status: 400 }
      );
    }

    // Validate agency type for agency registration
    if (role === "agency owner" && !agencyType) {
      return NextResponse.json(
        { error: "Agency type is required for agency registration" },
        { status: 400 }
      );
    }

    // Validate country is provided
    if (!country) {
      return NextResponse.json(
        { error: "Country is required" },
        { status: 400 }
      );
    }

    // Find the user by email (they should already be created by auth system)
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (!existingUser) {
      console.log("User not found with email:", email);
      return NextResponse.json(
        { error: "User not found. Please ensure you've registered first." },
        { status: 404 }
      );
    }

    // Update user with country and region information
    await db
      .update(user)
      .set({
        phoneNumber: phoneNumber,
        country: country,
        region: region || null,
      })
      .where(eq(user.id, existingUser.id))
      .execute();

    // Check if agency name already exists if registering as agency
    if (role === "agency owner" && agencyName) {
      const existingAgency = await db.query.agencies.findFirst({
        where: eq(agencies.agencyName, agencyName),
      });

      if (existingAgency) {
        return NextResponse.json(
          { error: "Agency with this name already exists" },
          { status: 409 }
        );
      }

      // Generate unique agency ID
      const agencyUniqueId = generateAgencyId();
      console.log("Generated agency ID:", agencyUniqueId);

      // Update user role to agency owner if needed
      await db
        .update(user)
        .set({
          role: "agency owner",
        })
        .where(eq(user.id, existingUser.id))
        .execute();

      // Create agency record
      await db
        .insert(agencies)
        .values({
          userId: existingUser.id,
          agencyName,
          agencyType,
          agencyUniqueId,
          contactEmail: email,
          contactPhone: phoneNumber,
          country: country,
          region: region || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute();

      console.log(
        "Agency created for user:",
        existingUser.id,
        "Type:",
        agencyType,
        "Country:",
        country
      );
    }

    return NextResponse.json(
      {
        message:
          role === "agency owner"
            ? "Agency registered successfully"
            : "User updated successfully",
        userId: existingUser.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 }
    );
  }
}
