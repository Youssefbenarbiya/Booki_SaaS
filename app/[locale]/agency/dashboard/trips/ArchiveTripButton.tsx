/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArchiveIcon } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { archiveTrip, getTripById } from "@/actions/trips/tripActions"

interface ArchiveTripButtonProps {
  tripId: number
}

export default function ArchiveTripButton({ tripId }: ArchiveTripButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasBookings, setHasBookings] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  // Check if the trip has bookings when opening the dialog
  async function checkBookings() {
    setIsChecking(true)
    try {
      const trip = await getTripById(tripId)
      if (trip?.bookings && trip.bookings.length > 0) {
        setHasBookings(true)
        toast.error("This trip has bookings and cannot be archived")
      } else {
        setHasBookings(false)
        setOpen(true)
      }
    } catch (error) {
      console.error("Error checking bookings:", error)
      toast.error("Failed to check trip bookings")
    } finally {
      setIsChecking(false)
    }
  }

  async function handleArchive() {
    setIsLoading(true)
    try {
      await archiveTrip(tripId)
      toast.success("Trip archived successfully")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Failed to archive trip")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={checkBookings}
        disabled={isChecking}
        className="h-8 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
      >
        <ArchiveIcon className="h-4 w-4 mr-1" />
        {isChecking ? "Checking..." : "Archive"}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this trip?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the trip and make it unavailable for booking.
              You can restore it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="default"
                onClick={handleArchive}
                disabled={isLoading}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isLoading ? "Archiving..." : "Archive"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
