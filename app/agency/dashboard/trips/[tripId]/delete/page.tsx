"use client"

import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Placeholder function for the delete operation
// Replace with your actual implementation
async function deleteTrip(id: number) {
  try {
    const response = await fetch(`/api/trips/${id}`, {
      method: "DELETE",
    })
    
    if (!response.ok) {
      throw new Error("Failed to delete trip")
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error deleting trip:", error)
    throw error
  }
}

export default function DeleteTripPage() {
  const router = useRouter()
  const params = useParams()
  const tripId = params.tripId as string
  
  const [isLoading, setIsLoading] = useState(false)
  const [tripName, setTripName] = useState<string | null>(null)
  const [isLoadingTrip, setIsLoadingTrip] = useState(true)

  // Fetch the trip name for confirmation
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/trips/${tripId}`)
        if (response.ok) {
          const data = await response.json()
          setTripName(data.name)
        } else {
          throw new Error("Failed to fetch trip details")
        }
      } catch (error) {
        console.error("Error fetching trip:", error)
        toast.error("Could not load trip details")
      } finally {
        setIsLoadingTrip(false)
      }
    }

    fetchTripDetails()
  }, [tripId])

  async function handleDelete() {
    setIsLoading(true)
    try {
      await deleteTrip(Number(tripId))
      toast.success("Trip deleted successfully")
      router.push("/agency/dashboard/trips")
    } catch (error) {
      toast.error("Failed to delete trip")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleCancel() {
    router.back()
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Delete Trip</CardTitle>
          <CardDescription>
            Are you sure you want to delete this trip? This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTrip ? (
            <p>Loading trip details...</p>
          ) : (
            <p className="font-medium">
              You are about to delete: <span className="text-red-600">{tripName || "Unknown Trip"}</span>
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || isLoadingTrip}
          >
            {isLoading ? "Deleting..." : "Delete Trip"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 