"use client"

import Image from "next/image"
import { useState } from "react"
import { ChevronRight } from "lucide-react"

export default function Dashboard() {
  const [viewType, setViewType] = useState<"list" | "grid">("list")

  const reservations = [
    {
      id: 1,
      image: "/assets/hotell.png",
      checkIn: "Thur, Dec 8",
      checkOut: "Fri, Dec 9",
      checkInTime: "12:00pm",
      checkOutTime: "11:30am",
    },
    // Add more reservations as needed
  ]

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
          <select className="border rounded-lg px-4 py-2">
            <option>All reservations</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button className="px-4 py-2 bg-gray-100 rounded-lg">Flights</button>
        <button className="px-4 py-2 bg-gray-100 rounded-lg">Stays</button>
        <button className="px-4 py-2 bg-gray-100 rounded-lg">Rent</button>
      </div>

      <div className="space-y-4">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white rounded-lg border p-4 flex items-center gap-4"
          >
            <div className="relative h-24 w-40">
              <Image
                src={reservation.image}
                alt="Hotel"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm">Check-In</div>
                  <div className="font-semibold">{reservation.checkIn}</div>
                </div>
                <div className="text-gray-300">—</div>
                <div>
                  <div className="text-sm">Check Out</div>
                  <div className="font-semibold">{reservation.checkOut}</div>
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-200" />
                  <span className="text-sm">
                    Check-In time {reservation.checkInTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-200" />
                  <span className="text-sm">
                    Check-Out time {reservation.checkOutTime}
                  </span>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
