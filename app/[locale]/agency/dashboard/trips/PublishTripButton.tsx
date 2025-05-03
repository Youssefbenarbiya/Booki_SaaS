"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
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
import { publishTrip } from "@/actions/trips/tripActions"

interface PublishTripButtonProps {
  tripId: number
}

export default function PublishTripButton({ tripId }: PublishTripButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handlePublish() {
    setIsLoading(true)
    try {
      await publishTrip(tripId)
      toast.success("Trip published successfully")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Failed to publish trip")
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
        onClick={() => setOpen(true)}
        className="h-8 text-green-600 hover:text-green-800 hover:bg-green-100"
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Publish
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish this trip?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make the trip available for booking. It will be reviewed
              by an admin before it is fully approved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="default"
                onClick={handlePublish}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Publishing..." : "Publish"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
