"use client"

import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteHotel, getHotelById } from "@/actions/hotels&rooms/hotelActions"

export default function DeleteHotelPage() {
  const router = useRouter()
  const params = useParams()
  const hotelId = params.hotelId as string
  
  const [isLoading, setIsLoading] = useState(false)
  const [hotelName, setHotelName] = useState<string | null>(null)
  const [isLoadingHotel, setIsLoadingHotel] = useState(true)

  // Fetch the hotel name for confirmation
  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const hotel = await getHotelById(hotelId)
        if (hotel) {
          setHotelName(hotel.name)
        } else {
          throw new Error("Hotel not found")
        }
      } catch (error) {
        console.error("Error fetching hotel:", error)
        toast.error("Could not load hotel details")
      } finally {
        setIsLoadingHotel(false)
      }
    }

    fetchHotelDetails()
  }, [hotelId])

  async function handleDelete() {
    setIsLoading(true)
    try {
      await deleteHotel(hotelId)
      toast.success("Hotel deleted successfully")
      router.push("/agency/dashboard/hotels")
    } catch (error) {
      toast.error("Failed to delete hotel")
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
          <CardTitle>Delete Hotel</CardTitle>
          <CardDescription>
            Are you sure you want to delete this hotel? This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHotel ? (
            <p>Loading hotel details...</p>
          ) : (
            <p className="font-medium">
              You are about to delete: <span className="text-red-600">{hotelName || "Unknown Hotel"}</span>
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
            disabled={isLoading || isLoadingHotel}
          >
            {isLoading ? "Deleting..." : "Delete Hotel"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 