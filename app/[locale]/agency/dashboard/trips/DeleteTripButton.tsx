/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
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
import { archiveTrip } from "@/actions/trips/tripActions";

interface ArchiveTripButtonProps {
  tripId: number;
}

export default function ArchiveTripButton({ tripId }: ArchiveTripButtonProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleArchive() {
    setIsLoading(true);
    try {
      await archiveTrip(tripId);
      toast.success("Trip archived successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to archive trip");
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
        onClick={() => setOpen(true)}
        className="h-8 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
      >
        <ArchiveIcon className="h-4 w-4 mr-1" />
        Archive
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
  );
}
