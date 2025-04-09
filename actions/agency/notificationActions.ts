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
    console.log(`Server action - User ID: ${userId}`)

    if (!userId) {
      console.error("No authenticated user found")
      return { notifications: [], unreadCount: 0 }
    }

    // Get the user's details including their role
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    })

    if (!currentUser) {
      console.error("User not found in database")
      return { notifications: [], unreadCount: 0 }
    }

    console.log(`Server action - User role: ${currentUser.role}`)
    const { role } = currentUser

    // Variable to store the ID whose notifications we'll be showing
    let notificationsUserId = userId

    // Fix: Check for "employee" role (lowercase) instead of "AGENCY_EMPLOYEE"
    if (role === "employee") {
      console.log(
        "Server action - User is an employee, looking for agency mapping"
      )

      const agencyMapping = await db.query.agencyEmployees.findFirst({
        where: eq(agencyEmployees.employeeId, userId),
      })

      if (agencyMapping) {
        notificationsUserId = agencyMapping.agencyId
        console.log(
          `Server action - Employee belongs to agency owner ID: ${notificationsUserId}`
        )
      } else {
        console.log("Server action - Agency mapping not found for employee")
        // For debugging, show all agency employee mappings
        const allMappings = await db.query.agencyEmployees.findMany({})
        console.log(`All mappings in database: ${JSON.stringify(allMappings)}`)
      }
    }

    // Get all notifications for the resolved user id
    const allNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, notificationsUserId),
    })

    console.log(
      `Total notifications in database for user ${notificationsUserId}: ${allNotifications.length}`
    )

    if (allNotifications.length === 0) {
      console.log("No notifications found for this user")
    } else {
      console.log(
        "Sample notification:",
        JSON.stringify(allNotifications[0], null, 2)
      )
    }

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
    console.log(
      `Unread count: ${unreadCount} out of ${notificationsList.length} retrieved`
    )

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
    console.log(
      `Debugging employee-agency relationship for user ID: ${employeeId}`
    )

    // Get employee details
    const employeeUser = await db.query.user.findFirst({
      where: eq(user.id, employeeId),
    })

    if (!employeeUser) {
      console.log("Employee user not found in database")
      return { success: false, message: "Employee not found" }
    }

    console.log(`Employee role: ${employeeUser.role}`)

    // Look up agency mapping
    const agencyMapping = await db.query.agencyEmployees.findFirst({
      where: eq(agencyEmployees.employeeId, employeeId),
    })

    if (!agencyMapping) {
      console.log("No agency mapping found for this employee")
      return { success: false, message: "No agency mapping found" }
    }

    const agencyId = agencyMapping.agencyId
    console.log(`Agency ID for this employee: ${agencyId}`)

    // Check if agency exists
    const agencyUser = await db.query.user.findFirst({
      where: eq(user.id, agencyId),
    })

    if (!agencyUser) {
      console.log("Agency user not found in database")
      return { success: false, message: "Agency not found" }
    }

    console.log(`Agency role: ${agencyUser.role}`)

    // Check notifications for the agency
    const agencyNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, agencyId),
    })

    console.log(
      `Found ${agencyNotifications.length} notifications for the agency`
    )

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
