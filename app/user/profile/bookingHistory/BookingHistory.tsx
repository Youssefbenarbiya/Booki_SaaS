"use client"

import Image from "next/image"
import { useState } from "react"
import { ChevronRight } from "lucide-react"

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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Reservations</h1>
        <div className="flex gap-4 items-center">
          <div className="flex border rounded-lg">
            <button
              className={`px-4 py-2 ${
                viewType === "list" ? "bg-gray-200" : "bg-white"
              }`}
              onClick={() => setViewType("list")}
            >
              List
            </button>
            <button
              className={`px-4 py-2 ${
                viewType === "grid" ? "bg-gray-200" : "bg-white"
              }`}
              onClick={() => setViewType("grid")}
            >
              Grid
            </button>
          </div>
          <select
            className="border rounded-lg px-4 py-2"
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

      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${
            filter === "trips" ? "bg-gray-200" : "bg-gray-100"
          }`}
          onClick={() => setFilter("trips")}
        >
          Trips
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            filter === "stays" ? "bg-gray-200" : "bg-gray-100"
          }`}
          onClick={() => setFilter("stays")}
        >
          Stays
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            filter === "cars" ? "bg-gray-200" : "bg-gray-100"
          }`}
          onClick={() => setFilter("cars")}
        >
          Rent
        </button>
      </div>

      {viewType === "list" ? (
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => (
            <div
              key={`${booking.id}-${index}`}
              className="bg-white rounded-lg border p-4 flex items-center gap-4"
            >
              <Image
                src={booking.image}
                alt={booking.name}
                width={80}
                height={80}
                className="rounded-md"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{booking.name}</h3>
                <p>
                  {booking.startDate} - {booking.endDate}
                </p>
                <p>Status: {booking.status}</p>
                <p>Total: {booking.totalPrice}</p>
              </div>
              <ChevronRight className="h-5 w-5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map((booking, index) => (
            <div
              key={`${booking.id}-${index}`}
              className="bg-white rounded-lg border p-4 flex flex-col gap-4"
            >
              <Image
                src={booking.image}
                alt={booking.name}
                width={200}
                height={150}
                className="rounded-md"
              />
              <div>
                <h3 className="font-semibold">{booking.name}</h3>
                <p>
                  {booking.startDate} - {booking.endDate}
                </p>
                <p>Status: {booking.status}</p>
                <p>Total: {booking.totalPrice}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
