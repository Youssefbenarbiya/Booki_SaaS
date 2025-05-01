"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArchiveIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { archiveCar, getCarById } from "@/actions/cars/carActions";

interface ArchiveCarButtonProps {
  carId: number;
}

export default function ArchiveCarButton({ carId }: ArchiveCarButtonProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasBookings, setHasBookings] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Check if the car has bookings when opening the dialog
  async function checkBookings() {
    setIsChecking(true);
    try {
      const { car } = await getCarById(carId);
      if (car?.bookings && car.bookings.length > 0) {
        setHasBookings(true);
        toast.error("This car has bookings and cannot be archived");
      } else {
        setHasBookings(false);
        setOpen(true);
      }
    } catch (error) {
      console.error("Error checking bookings:", error);
      toast.error("Failed to check car bookings");
    } finally {
      setIsChecking(false);
    }
  }

  async function handleArchive() {
    setIsLoading(true);
    try {
      await archiveCar(carId);
      toast.success("Car archived successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to archive car");
      console.error(error);
    } finally {
      setIsLoading(false);
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
            <AlertDialogTitle>Archive this car?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the car and make it unavailable for booking. You
              can restore it later if needed.
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
  );
}
