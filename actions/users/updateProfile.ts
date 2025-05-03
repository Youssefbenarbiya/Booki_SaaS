"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { z } from "zod";

// Schema for validating update data
const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phoneNumber: z.string().min(8).optional(),
  address: z.string().min(5).optional(),
  image: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

export async function updateUserProfile(data: UpdateProfileData) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { error: "Unauthorized access" };
    }

    // Validate the data
    const validatedData = updateProfileSchema.parse(data);

    // Filter out undefined values
    const updateData = Object.fromEntries(
      Object.entries(validatedData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(updateData).length === 0) {
      return { error: "No valid data to update" };
    }

    // Update user in database
    await db
      .update(user)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);

    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    return {
      error:
        error instanceof Error
          ? `Failed to update profile: ${error.message}`
          : "Failed to update profile",
    };
  }
}
