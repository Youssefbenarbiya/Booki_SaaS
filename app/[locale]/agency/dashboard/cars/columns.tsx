"use client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Eye,  } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { CarType } from "./types";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import ArchiveCarButton from "./ArchiveCarButton";
import PublishCarButton from "./PublishCarButton";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const columns: ColumnDef<CarType>[] = [
  {
    accessorKey: "images",
    header: "Photo",
    cell: ({ row }) => {
      const images = row.original.images as string[];
      return images && images.length > 0 ? (
        <Image
          src={images[0]}
          alt={`${row.original.brand} ${row.original.model}`}
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
    accessorKey: "brand",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Brand
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  { accessorKey: "model", header: "Model" },
  { accessorKey: "year", header: "Year" },
  { accessorKey: "plateNumber", header: "Plate Number" },
  { accessorKey: "color", header: "Color" },
  {
    accessorKey: "originalPrice",
    header: "Original Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("originalPrice"));
      return <div>{formatPrice(price)}</div>;
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
      // Use priceAfterDiscount if exists, otherwise fallback to originalPrice.
      const finalPrice = row.original.priceAfterDiscount
        ? row.original.priceAfterDiscount
        : row.original.originalPrice;
      return <div>{formatPrice(finalPrice)}</div>;
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
    cell: function Cell({ row }) {
      const car = row.original;
      const router = useRouter();
      const params = useParams();
      const locale = params.locale as string;
      const isArchived = car.status === "archived";

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/${locale}/agency/dashboard/cars/${car.id}`)
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
              router.push(`/${locale}/agency/dashboard/cars/${car.id}/details`)
            }
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">View</span>
            <Eye className="h-4 w-4" />
          </Button>

          {isArchived ? (
            <PublishCarButton carId={car.id} />
          ) : (
            <ArchiveCarButton carId={car.id} />
          )}
        </div>
      );
    },
  },
];
