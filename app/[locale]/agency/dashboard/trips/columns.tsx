/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Pencil, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

import { Badge } from "@/components/ui/badge"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

// Helper function to format price with the correct currency
const formatPriceWithCurrency = (price: string | number, currency?: string) => {
  if (!price) return "-"

  const numericPrice = typeof price === "string" ? parseFloat(price) : price

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice)
}

// Updated TripType to match the actual data structure
export type TripType = {
  id: number
  name: string
  destination: string
  originalPrice: string
  discountPercentage?: number | null
  priceAfterDiscount?: string | null
  isAvailable: boolean
  images: { imageUrl: string }[]
  createdAt: Date | null
  updatedAt: Date | null
  description: string | null
  startDate: string
  endDate: string
  userId?: number | null
  categoryId?: number | null
  agencyId?: number | null
  locationId?: number | null
  totalDays?: number | null
  totalNights?: number | null
  currency?: string
  bookings?: any[]
}

export const columns: ColumnDef<TripType>[] = [
  {
    accessorKey: "images",
    header: "Photo",
    cell: ({ row }) => {
      const images = row.original.images
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
      )
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
      const price = row.original.originalPrice
      const currency = row.original.currency
      return <div>{formatPriceWithCurrency(price, currency)}</div>
    },
  },
  {
    accessorKey: "discountPercentage",
    header: "Discount (%)",
    cell: ({ row }) => {
      const discount = row.original.discountPercentage
      return discount !== undefined && discount !== null
        ? `${discount}%`
        : "N/A"
    },
  },
  {
    accessorKey: "priceAfterDiscount",
    header: "Final Price",
    cell: ({ row }) => {
      // Use priceAfterDiscount if exists, otherwise fallback to originalPrice
      const finalPrice = row.original.priceAfterDiscount
        ? row.original.priceAfterDiscount
        : row.original.originalPrice
      const currency = row.original.currency
      return <div>{formatPriceWithCurrency(finalPrice, currency)}</div>
    },
  },
  {
    accessorKey: "isAvailable",
    header: "Status",
    cell: ({ row }) => {
      const isAvailable = row.getValue("isAvailable") as boolean
      return (
        <Badge variant={isAvailable ? "default" : "destructive"}>
          {isAvailable ? "Available" : "Not Available"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const trip = row.original
      const router = useRouter()
      const params = useParams()
      const locale = params.locale as string

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

          <Link
            href={`/${locale}/agency/dashboard/trips/${trip.id}/delete`}
            passHref
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
            >
              <span className="sr-only">Delete</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </Button>
          </Link>
        </div>
      )
    },
  },
]
