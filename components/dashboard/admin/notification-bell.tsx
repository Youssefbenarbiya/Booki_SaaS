"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

// Type for notifications
type AdminNotification = {
  id: number
  title: string
  message: string
  type: string
  entityId: string
  entityType: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/notifications?limit=10', {
        credentials: 'include', // Include credentials for auth
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to fetch notifications')
      }
      
      const data = await response.json()
      
      // Check if data has the right structure
      if (!data.data || !Array.isArray(data.data)) {
        console.error('Invalid response format:', data)
        return
      }
      
      setNotifications(data.data)
      setUnreadCount(data.data.filter((n: AdminNotification) => !n.isRead).length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mark a notification as read
  const markAsRead = async (id: number) => {
    try {
      // Ensure we're sending a valid ID
      if (typeof id !== 'number' || isNaN(id)) {
        console.error('Invalid notification ID:', id)
        return
      }
      
      // Make the API request
      const response = await fetch('/api/admin/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
        credentials: 'include', // Include credentials for auth
      })
      
      // Check if response is OK and parse the result
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to mark notification as read')
      }
      
      // Update local state only after successful API call
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true } 
            : notification
        )
      )
      
      // Update unread count
      if (unreadCount > 0) {
        setUnreadCount(prev => prev - 1)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include', // Include credentials for auth
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to mark all notifications as read')
      }
      
      // Update local state only after successful API call
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Fetch notifications on mount and when popover opens
  useEffect(() => {
    fetchNotifications()
    // Set up polling for new notifications (every 30 seconds)
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Additional fetch when popover opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      fetchNotifications()
    }
  }

  // Get icon color based on notification type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'agency_verification':
        return 'text-blue-500'
      case 'new_trip':
        return 'text-green-500'
      case 'new_car':
        return 'text-purple-500'
      case 'new_hotel':
        return 'text-orange-500'
      case 'new_blog':
        return 'text-pink-500'
      default:
        return 'text-gray-500'
    }
  }

  // Get icon based on entity type
  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'agency':
        return '🏢'
      case 'trip':
        return '✈️'
      case 'car':
        return '🚗'
      case 'hotel':
        return '🏨'
      case 'blog':
        return '📝'
      default:
        return '📌'
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0">
          <CardHeader className="pb-2 pt-4">
            <div className="flex justify-between items-center">
              <CardTitle>Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </div>
            <CardDescription>
              {isLoading 
                ? 'Loading notifications...' 
                : notifications.length > 0
                  ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                  : 'No new notifications'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={cn(
                        "flex gap-4 p-4 transition-colors hover:bg-muted cursor-pointer",
                        !notification.isRead && "bg-muted/50"
                      )}
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                    >
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        getTypeColor(notification.type)
                      )}>
                        <span className="text-lg">{getEntityIcon(notification.entityType)}</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium leading-none">
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="bg-blue-500 h-2 w-2 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-center p-4">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href="/admin/notifications">View all notifications</a>
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
