// app/dashboard/flights/new/page.tsx
"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { flightSchema, FlightInput } from "@/lib/validations/flightSchema"
import { useRouter } from "next/navigation"
import { createFlight } from "@/actions/flightActions"

export default function NewFlightPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FlightInput>({
    resolver: zodResolver(flightSchema),
  })

  const [isPending, startTransition] = useTransition()

  async function onSubmit(data: FlightInput) {
    await createFlight(data)
    router.push("/admin/dashboard/flights")
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Flight</h1>
      <form
        onSubmit={handleSubmit((data) => startTransition(() => onSubmit(data)))}
        className="space-y-4"
      >
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

        <div>
          <label className="block font-medium">Departure Airport</label>
          <input
            type="text"
            {...register("departureAirport")}
            className="input input-bordered w-full"
          />
          {errors.departureAirport && (
            <p className="text-red-500">{errors.departureAirport.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Arrival Airport</label>
          <input
            type="text"
            {...register("arrivalAirport")}
            className="input input-bordered w-full"
          />
          {errors.arrivalAirport && (
            <p className="text-red-500">{errors.arrivalAirport.message}</p>
          )}
        </div>

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
          {isPending ? "Creating..." : "Create Flight"}
        </button>
      </form>
    </div>
  )
}
