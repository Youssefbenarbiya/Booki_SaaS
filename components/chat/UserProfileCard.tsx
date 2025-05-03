/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import React, { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  getUserData,
  UserData as ServerUserData,
} from "@/actions/users/getUserData"

interface UserProfileCardProps {
  userId: string
  onClose: () => void
  fallback?: React.ReactNode
}

type UserData = ServerUserData

export default function UserProfileCard({
  userId,
  onClose,
  fallback,
}: UserProfileCardProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const { toast } = useToast()

  const fetchUserData = async () => {
    if (!userId || userId === "undefined" || userId === "null") {
      setError("Invalid user ID")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log(
        `Fetching user data for ID: ${userId} (attempt ${retryCount + 1})`
      )

      // Call the server action instead of using fetch API
      const result = await getUserData(userId)

      if (!result.success || !result.data) {
        // Create a more user-friendly error message
        const errorMessage = result.error || "Failed to load user data"
        console.error(`Error response from server action:`, result)

        // Handle specific error types
        if (errorMessage.includes("Headers is required")) {
          throw new Error("Session error: Please try refreshing the page.")
        } else if (errorMessage.includes("User not found")) {
          throw new Error(`User with ID ${userId} was not found.`)
        } else if (errorMessage.includes("Unauthorized")) {
          throw new Error("You are not authorized to view this profile.")
        } else {
          throw new Error(errorMessage)
        }
      }

      setUserData(result.data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching user data:", err)
      setError(
        err instanceof Error ? err.message : "Could not load user profile"
      )
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchUserData()
    }
  }, [userId])

  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleRetry = async () => {
    const newRetryCount = retryCount + 1
    setRetryCount(newRetryCount)

    toast({
      title: "Retrying",
      description: `Attempt ${newRetryCount}: Loading user profile...`,
      duration: 3000,
    })

    // Add a brief delay to ensure any session cookies/headers can be refreshed
    await new Promise((resolve) => setTimeout(resolve, 500))

    fetchUserData()
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">
            Customer Profile
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-6 w-48 bg-gray-200 animate-pulse mt-4" />
          <div className="h-4 w-32 bg-gray-200 animate-pulse mt-2" />
        </CardContent>
      </Card>
    )
  }

  if (error || !userData) {
    // Show fallback after 3 retry attempts
    if (retryCount >= 3 && fallback) {
      return <>{fallback}</>
    }

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">
            Customer Profile
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center text-center">
            <p className="text-red-500 mb-4">
              {error || "Failed to load user profile"}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              UserId: {userId || "Not provided"}
            </p>
            <Button
              variant="outline"
              onClick={handleRetry}
              className="flex items-center gap-2"
              disabled={retryCount >= 3}
            >
              <RefreshCw className="h-4 w-4" />
              {retryCount >= 3 ? "Max retries reached" : "Retry"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="flex justify-between items-center border-b pb-4">
        <CardTitle className="text-xl font-semibold">
          Customer Profile
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage
              src={userData.image || undefined}
              alt={userData.name}
            />
            <AvatarFallback className="bg-primary/10 text-lg">
              {getInitials(userData.name)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold">{userData.name}</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{userData.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">
                {userData.phoneNumber || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Address</p>
              <p className="text-sm text-muted-foreground">
                {userData.address || "Not provided"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
