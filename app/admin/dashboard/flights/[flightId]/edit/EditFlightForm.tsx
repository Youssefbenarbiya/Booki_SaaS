// app/dashboard/flights/[flightId]/edit/EditFlightForm.tsx
"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { flightSchema, FlightInput } from "@/lib/validations/flightSchema"
import { updateFlight } from "@/actions/flightActions"
import { useRouter } from "next/navigation"

interface EditFlightFormProps {
  flight: {
    id: string
    flightNumber: string
    departureAirport: string
    arrivalAirport: string
    departureTime: Date // coming from the server as Date objects
    arrivalTime: Date
    price: number
    availableSeats: number
  }
}

export default function EditFlightForm({ flight }: EditFlightFormProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FlightInput>({
    resolver: zodResolver(flightSchema),
    defaultValues: {
      flightNumber: flight.flightNumber,
      departureAirport: flight.departureAirport,
      arrivalAirport: flight.arrivalAirport,
      // Convert Date to an ISO string trimmed for the datetime-local input (YYYY-MM-DDTHH:MM)
      departureTime: flight.departureTime.toISOString().slice(0, 16),
      arrivalTime: flight.arrivalTime.toISOString().slice(0, 16),
      price: flight.price,
      availableSeats: flight.availableSeats,
    },
  })

  const [isPending, startTransition] = useTransition()

  async function onSubmit(data: FlightInput) {
    // updateFlight now accepts FlightFormInput; internally it transforms the dates.
    await updateFlight(flight.id, data)
    router.push(`/admin/dashboard/flights/${flight.id}`)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Flight</h1>
      <form
        onSubmit={handleSubmit((data) => startTransition(() => onSubmit(data)))}
        className="space-y-4"
      >
        {/* Your form fields */}
        <div>
          <label className="block font-medium">Flight Number</label>
          <input
            type="text"
            {...register("flightNumber")}
            className="input input-bordered w-full"
          />
          {errors.flightNumber && (
            <p className="text-red-500">{errors.flightNumber.message}</p>
          )}
        </div>
        {/* ... other fields similar to flightNumber ... */}
        <div>
          <label className="block font-medium">Departure Time</label>
          <input
            type="datetime-local"
            {...register("departureTime")}
            className="input input-bordered w-full"
          />
          {errors.departureTime && (
            <p className="text-red-500">{errors.departureTime.message}</p>
          )}
        </div>
        <div>
          <label className="block font-medium">Arrival Time</label>
          <input
            type="datetime-local"
            {...register("arrivalTime")}
            className="input input-bordered w-full"
          />
          {errors.arrivalTime && (
            <p className="text-red-500">{errors.arrivalTime.message}</p>
          )}
        </div>
        <div>
          <label className="block font-medium">Price</label>
          <input
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            className="input input-bordered w-full"
          />
          {errors.price && (
            <p className="text-red-500">{errors.price.message}</p>
          )}
        </div>
        <div>
          <label className="block font-medium">Available Seats</label>
          <input
            type="number"
            {...register("availableSeats", { valueAsNumber: true })}
            className="input input-bordered w-full"
          />
          {errors.availableSeats && (
            <p className="text-red-500">{errors.availableSeats.message}</p>
          )}
        </div>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? "Updating..." : "Update Flight"}
        </button>
      </form>
    </div>
  )
}
