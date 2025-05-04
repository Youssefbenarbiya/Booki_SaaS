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
};

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
      const discount = row.original.discountPercentage;
      return discount !== undefined && discount !== null
        ? `${discount}%`
        : "N/A";
    },
  },
  {
    accessorKey: "priceAfterDiscount",
    header: "Final Price",
    cell: ({ row }) => {
      // Use priceAfterDiscount if exists, otherwise fallback to originalPrice
      const finalPrice = row.original.priceAfterDiscount
        ? row.original.priceAfterDiscount
        : row.original.originalPrice;
      const currency = row.original.currency;
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
      const hasMoreWords = rejectionReason ? rejectionReason.split(" ").length > 2 : false;

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
                    <DialogTitle className="text-red-600">Rejection Reason</DialogTitle>
                  </DialogHeader>
                  <p className="py-4">{rejectionReason}</p>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      );
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
