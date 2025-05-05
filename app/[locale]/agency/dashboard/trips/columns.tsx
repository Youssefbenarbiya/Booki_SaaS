/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import ArchiveTripButton from "./ArchiveTripButton";
import PublishTripButton from "./PublishTripButton";
import { ArchiveIcon } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Helper function to format price with the correct currency
const formatPriceWithCurrency = (price: string | number, currency?: string) => {
  if (!price) return "-";

  const numericPrice = typeof price === "string" ? parseFloat(price) : price;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice);
};

// Updated TripType to match the actual data structure
export type TripType = {
  id: number;
  name: string;
  destination: string;
  originalPrice: string;
  discountPercentage?: number | null;
  priceAfterDiscount?: string | null;
  isAvailable: boolean;
  status?: string;
  rejectionReason?: string | null;
  images: { imageUrl: string }[];
  createdAt: Date | null;
  updatedAt: Date | null;
  description: string | null;
  startDate: string;
  endDate: string;
  userId?: number | null;
  categoryId?: number | null;
  agencyId?: number | null;
  locationId?: number | null;
  totalDays?: number | null;
  totalNights?: number | null;
  currency?: string;
  bookings?: any[];
  groupDiscountEnabled?: boolean;
  groupDiscountPercentage?: number | null;
  timeSpecificDiscountEnabled?: boolean;
  timeSpecificDiscountPercentage?: number | null;
  childDiscountEnabled?: boolean;
  childDiscountPercentage?: number | null;
};

// Status cell component 
function StatusCell({ status, rejectionReason }: { 
  status: string; 
  rejectionReason: string | null | undefined;
}) {
  const [showReason, setShowReason] = useState(false);

  let badgeVariant: "default" | "outline" | "secondary" | "destructive" =
    "default";
  let statusText = status || "Unknown";
  let customClass = "";

  if (status === "pending") {
    badgeVariant = "secondary";
    statusText = "Pending";
    customClass = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
  } else if (status === "active") {
    badgeVariant = "default";
    statusText = "Active";
    customClass = "bg-green-100 text-green-800 hover:bg-green-200";
  } else if (status === "inactive") {
    badgeVariant = "outline";
    statusText = "Inactive";
    customClass = "bg-gray-100 text-gray-800 hover:bg-gray-200";
  } else if (status === "approved") {
    badgeVariant = "default";
    statusText = "Approved";
    customClass = "bg-green-100 text-green-800 hover:bg-green-200";
  } else if (status === "rejected") {
    badgeVariant = "destructive";
    statusText = "Rejected";
    customClass = "bg-red-100 text-red-800 hover:bg-red-200";
  } else if (status === "archived") {
    badgeVariant = "outline";
    statusText = "Archived";
    customClass = "bg-amber-100 text-amber-800 hover:bg-amber-200";
  }

  // Get first two words if rejection reason exists
  const twoWords = rejectionReason?.split(" ").slice(0, 2).join(" ");
  const hasMoreWords = rejectionReason
    ? rejectionReason.split(" ").length > 2
    : false;

  return (
    <div className="flex flex-col">
      <Badge variant={badgeVariant} className={customClass}>
        {statusText}
      </Badge>

      {status === "rejected" && rejectionReason && (
        <>
          <div className="text-xs text-red-600 mt-1">
            {twoWords}
            {hasMoreWords && (
              <button
                onClick={() => setShowReason(true)}
                className="ml-1 text-blue-500 hover:underline"
              >
                ...view more
              </button>
            )}
          </div>

          <Dialog open={showReason} onOpenChange={setShowReason}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-600">
                  Rejection Reason
                </DialogTitle>
              </DialogHeader>
              <p className="py-4">{rejectionReason}</p>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

export const columns: ColumnDef<TripType>[] = [
  {
    accessorKey: "images",
    header: "Photo",
    cell: ({ row }) => {
      const images = row.original.images;
      return images && images.length > 0 ? (
        <Image
          src={images[0].imageUrl}
          alt={row.original.name}
          className="w-16 h-16 object-cover rounded"
          width={64}
          height={64}
        />
      ) : (
        <span>No Photo</span>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "destination",
    header: "Destination",
  },
  {
    accessorKey: "originalPrice",
    header: "Original Price",
    cell: ({ row }) => {
      const price = row.original.originalPrice;
      const currency = row.original.currency;
      return <div>{formatPriceWithCurrency(price, currency)}</div>;
    },
  },
  {
    accessorKey: "discountPercentage",
    header: "Discount (%)",
    cell: ({ row }) => {
      const trip = row.original;

      // Get highest discount from all available discount types
      const discounts = [];

      // Regular discount
      if (
        trip.discountPercentage !== undefined &&
        trip.discountPercentage !== null
      ) {
        discounts.push(trip.discountPercentage);
      }

      // Group discount
      if (trip.groupDiscountEnabled && trip.groupDiscountPercentage) {
        discounts.push(trip.groupDiscountPercentage);
      }

      // Time-specific discount
      if (
        trip.timeSpecificDiscountEnabled &&
        trip.timeSpecificDiscountPercentage
      ) {
        discounts.push(trip.timeSpecificDiscountPercentage);
      }

      // Child discount
      if (trip.childDiscountEnabled && trip.childDiscountPercentage) {
        discounts.push(trip.childDiscountPercentage);
      }

      if (discounts.length === 0) {
        return "N/A";
      }

      // Find the highest discount percentage
      const highestDiscount = Math.max(...discounts);
      return `${highestDiscount}%`;
    },
  },
  {
    accessorKey: "priceAfterDiscount",
    header: "Final Price",
    cell: ({ row }) => {
      const trip = row.original;
      const originalPrice =
        typeof trip.originalPrice === "string"
          ? parseFloat(trip.originalPrice)
          : trip.originalPrice;

      // Get highest discount from all available discount types
      const discounts = [];

      // Regular discount
      if (
        trip.discountPercentage !== undefined &&
        trip.discountPercentage !== null
      ) {
        discounts.push(trip.discountPercentage);
      }

      // Group discount
      if (trip.groupDiscountEnabled && trip.groupDiscountPercentage) {
        discounts.push(trip.groupDiscountPercentage);
      }

      // Time-specific discount
      if (
        trip.timeSpecificDiscountEnabled &&
        trip.timeSpecificDiscountPercentage
      ) {
        discounts.push(trip.timeSpecificDiscountPercentage);
      }

      // Child discount
      if (trip.childDiscountEnabled && trip.childDiscountPercentage) {
        discounts.push(trip.childDiscountPercentage);
      }

      // Calculate final price based on highest discount
      let finalPrice;
      if (discounts.length > 0) {
        const highestDiscount = Math.max(...discounts);
        finalPrice = originalPrice - (originalPrice * highestDiscount) / 100;
      } else if (trip.priceAfterDiscount) {
        // Use existing discounted price if available
        finalPrice = parseFloat(trip.priceAfterDiscount);
      } else {
        // Default to original price
        finalPrice = originalPrice;
      }

      const currency = trip.currency;
      return <div>{formatPriceWithCurrency(finalPrice, currency)}</div>;
    },
  },
  {
    accessorKey: "isAvailable",
    header: "Availability",
    cell: ({ row }) => {
      const isAvailable = row.getValue("isAvailable") as boolean;
      return (
        <Badge
          variant={isAvailable ? "default" : "destructive"}
          className={
            isAvailable
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }
        >
          {isAvailable ? "Available" : "Not Available"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status =
        row.original.status ||
        (row.original.isAvailable ? "active" : "inactive");
      const rejectionReason = row.original.rejectionReason;
      
      return <StatusCell status={status} rejectionReason={rejectionReason} />;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const trip = row.original;
      const router = useRouter();
      const params = useParams();
      const locale = params.locale as string;
      const isArchived = trip.status === "archived";
      const hasBookings = trip.bookings && trip.bookings.length > 0;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/${locale}/agency/dashboard/trips/${trip.id}/edit`)
            }
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Edit</span>
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/${locale}/agency/dashboard/trips/${trip.id}`)
            }
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">View</span>
            <Eye className="h-4 w-4" />
          </Button>

          {isArchived ? (
            <PublishTripButton tripId={trip.id} />
          ) : hasBookings ? (
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="h-8 text-gray-400 cursor-not-allowed"
              title="This trip has bookings and cannot be archived"
            >
              <ArchiveIcon className="h-4 w-4 mr-1" />
              Archive
            </Button>
          ) : (
            <ArchiveTripButton tripId={trip.id} />
          )}
        </div>
      );
    },
  },
];
