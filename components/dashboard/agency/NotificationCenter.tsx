"use client"

import React, { useState, useEffect } from "react"
import { Bell, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: "message" | "booking" | "system"
  title: string
  description: string
  time: Date
  read: boolean
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length

  // Fetch notifications (dummy implementation)
  useEffect(() => {
    // In a real app, fetch from an API
    const dummyNotifications: Notification[] = [
      {
        id: "1",
        type: "message",
        title: "New message",
        description: "You received a new message from a customer",
        time: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
      },
      {
        id: "2",
        type: "booking",
        title: "New booking",
        description: "Someone booked your listing",
        time: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        read: true,
      }
    ]
    
    setNotifications(dummyNotifications)
  }, [])
  
  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-auto px-2 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "p-4 text-sm relative",
                    !notification.read && "bg-muted/50"
                  )}
                >
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-muted-foreground mt-1">
                    {notification.description}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {notification.time.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </div>
                  
                  {!notification.read && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 absolute top-3 right-3"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
