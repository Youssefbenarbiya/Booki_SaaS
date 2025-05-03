"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { ChevronRight, Plane, Building, Car } from "lucide-react"

type BookingDisplay = {
  id: number
  type: "trip" | "stay" | "car"
  image: string
  name: string
  startDate: string
  endDate: string
  status: string
  totalPrice: string
}

export default function BookingHistoryClient({
  initialBookings = [], // Defaults to an empty array if undefined
}: {
  initialBookings?: BookingDisplay[]
}) {
  const [viewType, setViewType] = useState<"list" | "grid">("list")
  const [filter, setFilter] = useState<"all" | "trips" | "stays" | "cars">(
    "all"
  )

  // Ensure initialBookings is an array
  const bookings = Array.isArray(initialBookings) ? initialBookings : []

  // Filter bookings based on selected type
  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((booking) => {
          switch (filter) {
            case "trips":
              return booking.type === "trip"
            case "stays":
              return booking.type === "stay"
            case "cars":
              return booking.type === "car"
            default:
              return true
          }
        })

  // Get icon based on booking type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "trip":
        return <Plane className="h-4 w-4 text-blue-500" />
      case "stay":
        return <Building className="h-4 w-4 text-green-500" />
      case "car":
        return <Car className="h-4 w-4 text-orange-500" />
      default:
        return null
    }
  }

  // Get status color based on status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "text-green-600 bg-green-50 border-green-200"
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200"
      case "completed":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Reservations</h1>
        <div className="flex gap-4 items-center">
          <div className="flex border rounded-lg shadow-sm">
            <button
              className={`px-4 py-2 rounded-l-lg transition-colors ${
                viewType === "list"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
              onClick={() => setViewType("list")}
            >
              List
            </button>
            <button
              className={`px-4 py-2 rounded-r-lg transition-colors ${
                viewType === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
              onClick={() => setViewType("grid")}
            >
              Grid
            </button>
          </div>
          <select
            className="border rounded-lg px-4 py-2 shadow-sm bg-background"
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
          >
            <option value="all">All reservations</option>
            <option value="trips">Trips</option>
            <option value="stays">Stays</option>
            <option value="cars">Cars</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            filter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-card hover:bg-muted"
          }`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            filter === "trips"
              ? "bg-primary text-primary-foreground"
              : "bg-card hover:bg-muted"
          }`}
          onClick={() => setFilter("trips")}
        >
          <Plane className="h-4 w-4" /> Trips
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            filter === "stays"
              ? "bg-primary text-primary-foreground"
              : "bg-card hover:bg-muted"
          }`}
          onClick={() => setFilter("stays")}
        >
          <Building className="h-4 w-4" /> Stays
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            filter === "cars"
              ? "bg-primary text-primary-foreground"
              : "bg-card hover:bg-muted"
          }`}
          onClick={() => setFilter("cars")}
        >
          <Car className="h-4 w-4" /> Rent
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <p className="text-muted-foreground">No reservations found</p>
        </div>
      ) : viewType === "list" ? (
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => (
            <Link
              key={`${booking.id}-${index}`}
              href={`/user/profile/bookingHistory/${booking.type}/${booking.id}`}
              className="block"
            >
              <div className="bg-card rounded-lg border shadow-sm p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all hover:border-primary">
                <div className="relative min-w-[80px] h-[80px]">
                  <Image
                    src={booking.image || "/placeholder.svg"}
                    alt={booking.name}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getTypeIcon(booking.type)}
                    <h3 className="font-semibold truncate">{booking.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {booking.startDate} - {booking.endDate}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-sm px-2 py-0.5 rounded-full border ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                    <p className="font-medium">{booking.totalPrice}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map((booking, index) => (
            <Link
              key={`${booking.id}-${index}`}
              href={`/user/profile/bookingHistory/${booking.type}/${booking.id}`}
              className="block h-full"
            >
              <div className="bg-card rounded-lg border shadow-sm h-full flex flex-col cursor-pointer hover:shadow-md transition-all hover:border-primary">
                <div className="relative w-full h-[160px]">
                  <Image
                    src={booking.image || "/placeholder.svg"}
                    alt={booking.name}
                    fill
                    className="rounded-t-lg object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                    {getTypeIcon(booking.type)}
                    <span className="text-xs font-medium capitalize">
                      {booking.type}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {booking.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {booking.startDate} - {booking.endDate}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                    <p className="font-medium">{booking.totalPrice}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
