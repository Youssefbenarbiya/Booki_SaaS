/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye, Pencil, ArchiveIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import ArchiveHotelButton from "./ArchiveHotelButton"
import PublishHotelButton from "./PublishHotelButton"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Define the Hotel type based on the page content
export type HotelType = {
  id: string
  name: string
  images: string[]
  rating: number
  city: string
  country: string
  description: string
  address: string
  createdAt: Date
  updatedAt: Date
  status: string
  rejectionReason?: string | null
  agencyId: string | null
  rooms: any[]
  hasBookings?: boolean
  bookings?: any[]
}

export const columns: ColumnDef<HotelType>[] = [
  {
    accessorKey: "images",
    header: "Photo",
    cell: ({ row }) => {
      const images = row.original.images
      return images && images.length > 0 ? (
        <Image
          src={images[0]}
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
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.original.rating
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-800">
          {rating}★
        </Badge>
      )
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      return `${row.original.city}, ${row.original.country}`
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status?.toLowerCase() || "pending";
      const rejectionReason = row.original.rejectionReason;
      const [showReason, setShowReason] = useState(false);
      
      let badgeVariant: "default" | "outline" | "secondary" | "destructive" = "secondary";
      let statusText = "Pending";
      let customClass = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      
      if (status === "approved") {
        badgeVariant = "default";
        statusText = "Approved";
        customClass = "bg-green-100 text-green-800 hover:bg-green-200";
      } else if (status === "rejected") {
        badgeVariant = "destructive";
        statusText = "Rejected";
      } else if (status === "pending") {
        badgeVariant = "secondary";
        statusText = "Pending";
        customClass = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
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
    accessorKey: "rooms",
    header: "Rooms",
    cell: ({ row }) => {
      const roomCount = row.original.rooms.length
      return (
        <span>
          🏨 {roomCount} Room{roomCount !== 1 ? "s" : ""}
        </span>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const hotel = row.original
      const router = useRouter()
      const params = useParams()
      const locale = params.locale as string
      const isArchived = hotel.status === "archived";
      const hasBookings = hotel.hasBookings || (hotel.bookings && hotel.bookings.length > 0);

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/${locale}/agency/dashboard/hotels/${hotel.id}/edit`)
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
              router.push(`/${locale}/agency/dashboard/hotels/${hotel.id}`)
            }
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">View</span>
            <Eye className="h-4 w-4" />
          </Button>

          {isArchived ? (
            <PublishHotelButton hotelId={hotel.id} />
          ) : hasBookings ? (
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                disabled
                className="h-8 text-gray-400 cursor-not-allowed opacity-60"
              >
                <ArchiveIcon className="h-4 w-4 mr-1" />
                Archive
              </Button>
              <div className="absolute z-50 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 right-0 bottom-full mb-2 w-48">
                This hotel has active bookings and cannot be archived. Cancel all bookings first.
              </div>
            </div>
          ) : (
            <ArchiveHotelButton hotelId={hotel.id} />
          )}
        </div>
      )
    },
  },
]
