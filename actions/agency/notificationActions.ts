/* eslint-disable @typescript-eslint/no-unused-vars */
"use server"

import db from "@/db/drizzle"
import { notifications, user, agencyEmployees } from "@/db/schema"
import { eq, desc, and, count } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/auth"

export async function getAgencyNotifications(limit: number = 10) {
  try {
    // Get the current user's session using Better-Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    const userId = session?.user?.id

    if (!userId) {
      return { notifications: [], unreadCount: 0 }
    }

    // Get the user's details including their role
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    })

    if (!currentUser) {
      return { notifications: [], unreadCount: 0 }
    }

    const { role } = currentUser

    // Variable to store the ID whose notifications we'll be showing
    let notificationsUserId = userId

    // Fix: Check for "employee" role
    if (role === "employee") {
      const agencyMapping = await db.query.agencyEmployees.findFirst({
        where: eq(agencyEmployees.employeeId, userId),
      })

      if (agencyMapping) {
        notificationsUserId = agencyMapping.agencyId
      } else {
        // Get all mappings for debugging purposes
        const allMappings = await db.query.agencyEmployees.findMany({})
      }
    }

    // Get all notifications for the resolved user id
    const allNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, notificationsUserId),
    })

    // Get paginated notifications
    const notificationsList = await db.query.notifications.findMany({
      where: eq(notifications.userId, notificationsUserId),
      orderBy: [desc(notifications.createdAt)],
      limit,
    })

    // Count unread notifications
    const unreadResult = await db
      .select({ value: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, notificationsUserId),
          eq(notifications.read, false)
        )
      )

    const unreadCount = unreadResult[0]?.value || 0

    return {
      notifications: notificationsList,
      unreadCount,
    }
  } catch (error) {
    console.error("Error fetching agency notifications:", error)
    return { notifications: [], unreadCount: 0 }
  }
}

// Add a helper function to debug employee-agency relationships
export async function debugEmployeeAgencyRelationship(employeeId: string) {
  try {
    // Get employee details
    const employeeUser = await db.query.user.findFirst({
      where: eq(user.id, employeeId),
    })

    if (!employeeUser) {
      return { success: false, message: "Employee not found" }
    }

    // Look up agency mapping
    const agencyMapping = await db.query.agencyEmployees.findFirst({
      where: eq(agencyEmployees.employeeId, employeeId),
    })

    if (!agencyMapping) {
      return { success: false, message: "No agency mapping found" }
    }

    const agencyId = agencyMapping.agencyId

    // Check if agency exists
    const agencyUser = await db.query.user.findFirst({
      where: eq(user.id, agencyId),
    })

    if (!agencyUser) {
      return { success: false, message: "Agency not found" }
    }

    // Check notifications for the agency
    const agencyNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, agencyId),
    })

    return {
      success: true,
      employee: {
        id: employeeUser.id,
        role: employeeUser.role,
      },
      agency: {
        id: agencyUser.id,
        role: agencyUser.role,
        notificationCount: agencyNotifications.length,
      },
    }
  } catch (error) {
    console.error("Error debugging employee-agency relationship:", error)
    return { success: false, message: "Error debugging relationship" }
  }
}

// Add any other exported functions here if needed
