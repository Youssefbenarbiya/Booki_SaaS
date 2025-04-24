"use client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { CarType } from "./types"
import { useRouter, useParams } from "next/navigation"
import { deleteCar } from "@/actions/cars/carActions"
import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import Image from "next/image"

export const columns: ColumnDef<CarType>[] = [
  {
    accessorKey: "images",
    header: "Photo",
    cell: ({ row }) => {
      const images = row.original.images as string[]
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
      )
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
      const price = parseFloat(row.getValue("originalPrice"))
      return <div>{formatPrice(price)}</div>
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
      // Use priceAfterDiscount if exists, otherwise fallback to originalPrice.
      const finalPrice = row.original.priceAfterDiscount
        ? row.original.priceAfterDiscount
        : row.original.originalPrice
      return <div>{formatPrice(finalPrice)}</div>
    },
  },
  {
    accessorKey: "isAvailable",
    header: "Availability",
    cell: ({ row }) => {
      const isAvailable = row.getValue("isAvailable") as boolean
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
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status =
        row.original.status ||
        (row.original.isAvailable ? "active" : "inactive")

      let badgeVariant: "default" | "outline" | "secondary" | "destructive" =
        "default"
      let statusText = status || "Unknown"
      let customClass = ""

      if (status === "pending") {
        badgeVariant = "secondary"
        statusText = "Pending"
        customClass = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      } else if (status === "active") {
        badgeVariant = "default"
        statusText = "Active"
        customClass = "bg-green-100 text-green-800 hover:bg-green-200"
      } else if (status === "inactive") {
        badgeVariant = "outline"
        statusText = "Inactive"
        customClass = "bg-gray-100 text-gray-800 hover:bg-gray-200"
      } else if (status === "approved") {
        badgeVariant = "default"
        statusText = "Approved"
        customClass = "bg-green-100 text-green-800 hover:bg-green-200"
      } else if (status === "rejected") {
        badgeVariant = "destructive"
        statusText = "Rejected"
        customClass = "bg-red-100 text-red-800 hover:bg-red-200"
      }

      return (
        <Badge variant={badgeVariant} className={customClass}>
          {statusText}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const car = row.original
      const router = useRouter()
      const params = useParams()
      const locale = params.locale as string
      const [isLoading, setIsLoading] = useState(false)
      const [alertOpen, setAlertOpen] = useState(false)

      async function handleDelete() {
        setIsLoading(true)
        try {
          await deleteCar(car.id)
          toast.success("Car deleted successfully")
          setAlertOpen(false)
          router.refresh()
        } catch (error) {
          toast.error("Failed to delete car")
          console.error(error)
        } finally {
          setIsLoading(false)
        }
      }

      function handleOpenAlert() {
        setTimeout(() => {
          setAlertOpen(true)
        }, 100)
      }

      function handleAlertOpenChange(open: boolean) {
        if (!open) {
          router.refresh()
        }
        setAlertOpen(open)
      }

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/${locale}/agency/dashboard/cars/${car.id}`)
                }
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleOpenAlert}
                disabled={isLoading}
                className="text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={alertOpen} onOpenChange={handleAlertOpenChange}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {car.brand} {car.model}? This
                  action cannot be undone!
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAlertOpen(false)
                      router.refresh()
                    }}
                  >
                    Cancel
                  </Button>
                </AlertDialogCancel>
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
    },
  },
]
