"use client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash, Eye, ArchiveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { CarType } from "./types";
import { useRouter, useParams } from "next/navigation";
import { deleteCar } from "@/actions/cars/carActions";
import { toast } from "sonner";
import Image from "next/image";
import ArchiveCarButton from "./ArchiveCarButton";
import PublishCarButton from "./PublishCarButton";

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

      return (
        <Badge variant={badgeVariant} className={customClass}>
          {statusText}
        </Badge>
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
