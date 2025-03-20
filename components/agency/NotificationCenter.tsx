"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { useSession } from "@/auth-client"

type Notification = {
  id: number
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: Date
  relatedItemType?: string | null
  relatedItemId?: number | null
}

interface NotificationCenterProps {
  initialNotifications: Notification[]
  unreadCount: number
}

export function NotificationCenter({
  initialNotifications,
  unreadCount,
}: NotificationCenterProps) {
  const session = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [badgeCount, setBadgeCount] = useState(unreadCount)

  // Don't render if no session
  if (!session.data) {
    return null
  }

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(
        `/api/agency/notifications/${notificationId}/read`,
        {
          method: "POST",
        }
      )

      if (response.ok) {
        setNotifications(
          notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        )
        setBadgeCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("/api/agency/notifications/read-all", {
        method: "POST",
      })

      if (response.ok) {
        setNotifications(
          notifications.map((notification) => ({
            ...notification,
            read: true,
          }))
        )
        setBadgeCount(0)
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

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

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {badgeCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-10 border border-gray-200">
          <div className="p-3 bg-gray-50 flex justify-between items-center border-b border-gray-200">
            <h3 className="font-medium text-gray-700">Notifications</h3>
            {badgeCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-gray-500">
                No notifications yet
              </p>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`border-b border-gray-100 last:border-b-0 ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="p-4 hover:bg-gray-50 transition-colors">
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
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            }
                          )}
                        </span>
                      </div>
                      <h4 className="font-medium mt-1">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.relatedItemType === "trip" &&
                        notification.relatedItemId && (
                          <Link
                            href={`/agency/dashboard/trips/${notification.relatedItemId}`}
                            className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block"
                          >
                            View Trip
                          </Link>
                        )}
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-2 ml-3 inline-block"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="p-2 bg-gray-50 border-t border-gray-200">
            <Link
              href="/agency/dashboard/notifications"
              className="block text-center text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
