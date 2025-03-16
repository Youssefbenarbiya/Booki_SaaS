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
import { useRouter } from "next/navigation"
import { deleteCar } from "@/actions/carActions"
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
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      return <div>{formatPrice(price)}</div>
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
    cell: function Cell({ row }) {
      const car = row.original
      const router = useRouter()
      const [isLoading, setIsLoading] = useState(false)
      const [alertOpen, setAlertOpen] = useState(false)

      async function handleDelete() {
        setIsLoading(true)
        try {
          await deleteCar(car.id)
          toast.success("Car deleted successfully")
          setAlertOpen(false)
          // Refresh the page after deletion to clear any overlays
          router.refresh()
        } catch (error) {
          toast.error("Failed to delete car")
          console.error(error)
        } finally {
          setIsLoading(false)
        }
      }

      // Delay opening the dialog to let the dropdown close first
      function handleOpenAlert() {
        setTimeout(() => {
          setAlertOpen(true)
        }, 100)
      }

      // When the AlertDialog is closed (e.g. via backdrop click or Cancel),
      // force a refresh to ensure no overlay remains.
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
                onClick={() => router.push(`/agency/dashboard/cars/${car.id}`)}
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

          {/* Render AlertDialog outside the DropdownMenuContent */}
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
