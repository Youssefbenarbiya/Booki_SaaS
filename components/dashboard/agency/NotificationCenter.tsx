"use client"

import { useState, useRef, useEffect } from "react"
import { Bell } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSession } from "@/auth-client"

type NotificationType = {
  id: number
  title: string
  message: string
  read: boolean
  createdAt: Date | string
  type: "error" | "info" | "success" | "warning"
  relatedItemType?: string | null
  relatedItemId?: number | null
  userId: number
}

interface NotificationCenterProps {
  initialNotifications: NotificationType[]
  unreadCount: number
  userRole?: string
}

// Make sure to properly export the component
export default function NotificationCenter({
  initialNotifications,
  unreadCount: initialUnreadCount,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [hasNewNotifications, setHasNewNotifications] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const session = useSession()
  const userId = session.data?.user.id

  // Fetch notifications periodically
  useEffect(() => {
    // Don't fetch if not authenticated
    if (!userId) return

    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/agency/notifications/latest", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store", // Important: Prevent caching
        })

        if (response.ok) {
          const data = await response.json()

          // Check if there are new notifications
          if (data.unreadCount > unreadCount) {
            // If dropdown is closed, show indicator
            if (!isOpen) {
              setHasNewNotifications(true)
            }

            // Update notifications and count
            setNotifications(data.notifications)
            setUnreadCount(data.unreadCount)
          }
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    // Set up polling interval (every 1seconds)
    const intervalId = setInterval(fetchNotifications, 5000)

    // Clean up on component unmount
    return () => clearInterval(intervalId)
  }, [unreadCount, isOpen, userId])

  // Reset new notification indicator when opening dropdown
  useEffect(() => {
    if (isOpen) {
      setHasNewNotifications(false)
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(
        `/api/agency/notifications/${notificationId}/read`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        // Update the local state
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/agency/notifications/read-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // Update the local state
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
        setHasNewNotifications(false)
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
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className={`relative p-2 ${hasNewNotifications ? "animate-pulse" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell
          className={`h-5 w-5 ${hasNewNotifications ? "text-blue-500" : ""}`}
        />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 min-w-[1.2rem] h-5 flex items-center justify-center"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden border border-gray-200">
          <div className="p-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div>
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 ${
                      !notification.read ? "bg-blue-50" : ""
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
                    <h4 className="font-medium mt-1 text-sm">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs mt-2"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                ))}

                {notifications.length > 5 && (
                  <div className="p-2 text-center">
                    <Link
                      href="/agency/dashboard/notifications"
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => setIsOpen(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
