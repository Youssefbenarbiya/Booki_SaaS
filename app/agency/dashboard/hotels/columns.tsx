"use client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Image from "next/image"
import DeleteHotelButton from "./DeleteHotelButton"

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
  agencyId: string | null
  rooms: any[]
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

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/agency/dashboard/hotels/${hotel.id}/edit`)}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Edit</span>
            <Pencil className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/agency/dashboard/hotels/${hotel.id}`)}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">View</span>
            <Eye className="h-4 w-4" />
          </Button>
          
          <DeleteHotelButton hotelId={hotel.id} />
        </div>
      )
    },
  },
] 