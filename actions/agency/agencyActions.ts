"use server";

import { agencies, agencyEmployees } from "@/db/schema";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { notifyAdminOfDocumentSubmission } from "@/lib/verifyAgencyEmail";

// Helper function to get the current session
async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized: No session found");
  }
  return session;
}

// Fetch current agency data
export async function getAgencyProfile() {
  try {
    const session = await getSession();

    // First check if the user is an agency owner
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, session.user.id),
    });

    if (agency) {
      return { agency };
    }

    // If not an owner, check if they're an employee
    const employeeRecord = await db.query.agencyEmployees.findFirst({
      where: eq(agencyEmployees.employeeId, session.user.id),
      with: {
        agency: true,
      },
    });

    if (employeeRecord && employeeRecord.agency) {
      return { agency: employeeRecord.agency };
    }

    return { agency: null };
  } catch (error) {
    console.error("Failed to fetch agency profile:", error);
    return { agency: null, error: "Failed to fetch agency profile" };
  }
}

// Update agency profile
export async function updateAgencyProfile(data: {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  description?: string;
  website?: string;
  logo?: string;
  country?: string;
  region?: string;
  rneDocument?: string;
  patenteDocument?: string;
  cinDocument?: string;
  verificationSubmittedAt?: string;
}) {
  try {
    const session = await getSession();

    // First check if the user is an agency owner
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, session.user.id),
    });

    if (agency) {
      // Check if this is a new document submission
      const isNewSubmission = 
        (!agency.rneDocument && data.rneDocument) || 
        (!agency.patenteDocument && data.patenteDocument) || 
        (!agency.cinDocument && data.cinDocument);
      
      // Check if documents have been changed after rejection
      const isResubmission = 
        agency.verificationStatus === "rejected" && 
        ((data.rneDocument && data.rneDocument !== agency.rneDocument) ||
         (data.patenteDocument && data.patenteDocument !== agency.patenteDocument) ||
         (data.cinDocument && data.cinDocument !== agency.cinDocument));
      
      // If verification was previously rejected and new docs are submitted, reset status
      const shouldResetStatus = agency.verificationStatus === "rejected" && 
        (isNewSubmission || isResubmission);
      
      // Determine if we need to notify the admin
      const shouldNotifyAdmin = isNewSubmission || isResubmission;

      // Prepare document fields for database update
      const rneDocument = data.rneDocument || agency.rneDocument || null;
      const patenteDocument = data.patenteDocument || agency.patenteDocument || null;
      const cinDocument = data.cinDocument || agency.cinDocument || null;
      
      // Update the agency record
      await db
        .update(agencies)
        .set({
          agencyName: data.name,
          contactEmail: data.email,
          contactPhone: data.phone || null,
          address: data.address || null,
          logo: data.logo || null,
          country: data.country || null,
          region: data.region || null,
          // Add document fields
          rneDocument,
          patenteDocument,
          cinDocument,
          // If it's a new submission or resubmission after rejection, update verification status
          verificationStatus: shouldResetStatus ? "pending" : agency.verificationStatus,
          verificationSubmittedAt: shouldNotifyAdmin 
            ? new Date() 
            : agency.verificationSubmittedAt,
          // Clear rejection reason if resubmitting
          verificationRejectionReason: shouldResetStatus 
            ? null 
            : agency.verificationRejectionReason,
          updatedAt: new Date(),
        })
        .where(eq(agencies.id, agency.id));

      // Notify admin if new documents were submitted
      if (shouldNotifyAdmin && (rneDocument || patenteDocument || cinDocument)) {
        try {
          await notifyAdminOfDocumentSubmission({
            agencyName: data.name,
            agencyId: agency.id,
            contactEmail: data.email,
            isResubmission: !!isResubmission,
            rneDocument: rneDocument || undefined,
            patenteDocument: patenteDocument || undefined,
            cinDocument: cinDocument || undefined,
          })
        } catch (error) {
          console.error("Failed to send admin notification:", error);
          // Continue even if notification fails
        }
      }

      return { success: true };
    }

    // If it's an employee, they shouldn't be able to update the agency profile
    // This is just a safety check, as the UI should prevent this
    const employeeRecord = await db.query.agencyEmployees.findFirst({
      where: eq(agencyEmployees.employeeId, session.user.id),
    });

    if (employeeRecord) {
      throw new Error("Employees cannot update the agency profile");
    }

    throw new Error("No agency found for this user");
  } catch (error) {
    console.error("Failed to update agency profile:", error);
    return { success: false, error: "Failed to update agency profile" };
  }
}
