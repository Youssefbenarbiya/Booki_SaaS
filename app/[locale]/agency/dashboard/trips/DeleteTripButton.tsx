"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
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
import { deleteTrip } from "@/actions/trips/tripActions"

interface DeleteTripButtonProps {
  tripId: number
}

export default function DeleteTripButton({ tripId }: DeleteTripButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleDelete() {
    setIsLoading(true)
    try {
      await deleteTrip(tripId)
      toast.success("Trip deleted successfully")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Failed to delete trip")
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
        className="h-8 text-red-600 hover:text-red-800 hover:bg-red-100"
      >
        <Trash className="h-4 w-4 mr-1" />
        Delete
      </Button>
      
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              trip and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 