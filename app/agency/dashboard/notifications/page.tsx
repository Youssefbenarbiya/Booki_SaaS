import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
// Make sure you're importing the correct function
import { getAgencyNotifications } from "@/actions/agency/notificationActions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { headers } from "next/headers"
import { auth } from "@/auth"
import db from "@/db/drizzle"
// Make sure the table name matches your schema exactly
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"

// Make sure to export the page component properly
export default async function NotificationsPage() {
  // Get the current user's session using Better-Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const userId = session?.user?.id
  let userRole = "AGENCY_OWNER"

  if (userId) {
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    })

    if (currentUser) {
      userRole = currentUser.role
    }
  }

  // Check if user has permission to see this page (agency owner or employee)
  // Fix: Use lowercase "agency_owner" and "employee" roles
  if (userRole !== "agency_owner" && userRole !== "employee") {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="mt-2">
          You don&apos;t have permission to view this page.
        </p>
      </div>
    )
  }

  // Fetch notifications
  const { notifications = [] } = await getAgencyNotifications(100) // Get more notifications for the full page

  // Group notifications by date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const todayNotifications = notifications.filter(
    (n) => new Date(n.createdAt) >= today
  )

  const thisWeekNotifications = notifications.filter(
    (n) => new Date(n.createdAt) < today && new Date(n.createdAt) >= oneWeekAgo
  )

  const earlierNotifications = notifications.filter(
    (n) => new Date(n.createdAt) < oneWeekAgo
  )

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const NotificationList = ({
    title,
    items,
  }: {
    title: string
    items: typeof notifications
  }) => (
    <div className="mb-10">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-gray-500">No notifications</p>
      ) : (
        <div className="space-y-4">
          {items.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 ${
                !notification.read ? "border-l-4 border-blue-500" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${getTypeColor(
                    notification.type
                  )}`}
                >
                  {notification.type.charAt(0).toUpperCase() +
                    notification.type.slice(1)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <h4 className="font-medium mt-2">{notification.title}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>

              {notification.relatedItemType === "trip" &&
                notification.relatedItemId && (
                  <div className="mt-3">
                    <Link
                      href={`/agency/dashboard/trips/${notification.relatedItemId}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Trip
                    </Link>
                  </div>
                )}

              {!notification.read && (
                <form
                  action={`/api/agency/notifications/${notification.id}/read`}
                  method="POST"
                  className="mt-3"
                >
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Mark as read
                  </Button>
                </form>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">
            You don&apos;t have any notifications yet.
          </p>
        </div>
      ) : (
        <>
          <NotificationList title="Today" items={todayNotifications} />
          <NotificationList title="This Week" items={thisWeekNotifications} />
          <NotificationList title="Earlier" items={earlierNotifications} />
        </>
      )}

      {notifications.length > 0 && (
        <div className="mt-10 text-center">
          <form action="/api/agency/notifications/read-all" method="POST">
            <Button type="submit" variant="outline">
              Mark all as read
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
