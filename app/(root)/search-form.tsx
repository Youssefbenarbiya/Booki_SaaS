"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Search, MapPin, Calendar, Users } from "lucide-react"

const tripSearchSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  startDate: z.string().min(1, "Start date is required"),
})

const hotelSearchSchema = z.object({
  city: z.string().min(1, "City is required"),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  guests: z.string().min(1, "Number of guests is required"),
})

interface SearchFormProps {
  type: "trips" | "hotels"
}

export function SearchForm({ type }: SearchFormProps) {
  const router = useRouter()
  const schema = type === "trips" ? tripSearchSchema : hotelSearchSchema

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues:
      type === "trips"
        ? { destination: "", startDate: "" }
        : { city: "", checkIn: "", checkOut: "", guests: "" },
  })

  function onSubmit(data: z.infer<typeof schema>) {
    const searchParams = new URLSearchParams({
      type,
      ...(type === "trips"
        ? {
            destination: (data as z.infer<typeof tripSearchSchema>).destination,
            startDate: (data as z.infer<typeof tripSearchSchema>).startDate,
          }
        : {
            city: (data as z.infer<typeof hotelSearchSchema>).city,
            checkIn: (data as z.infer<typeof hotelSearchSchema>).checkIn,
            checkOut: (data as z.infer<typeof hotelSearchSchema>).checkOut,
            guests: (data as z.infer<typeof hotelSearchSchema>).guests,
          }),
    })
    router.push(`/?${searchParams.toString()}`)
  }

  if (type === "hotels") {
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white rounded-lg shadow-lg p-2"
        >
          <div className="flex flex-col md:flex-row gap-2">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="flex items-center h-full bg-gray-50 rounded-md px-4 py-2">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <FormLabel className="text-xs text-gray-500">
                        Destination ?
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Destinations, Hotels"
                          {...field}
                          className="border-0 p-0 bg-transparent focus:ring-0 text-sm placeholder:text-gray-400"
                        />
                      </FormControl>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="checkIn"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="flex items-center h-full bg-gray-50 rounded-md px-4 py-2">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <FormLabel className="text-xs text-gray-500">
                        Check in
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="border-0 p-0 bg-transparent focus:ring-0 text-sm"
                        />
                      </FormControl>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="checkOut"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="flex items-center h-full bg-gray-50 rounded-md px-4 py-2">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <FormLabel className="text-xs text-gray-500">
                        Check out
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="border-0 p-0 bg-transparent focus:ring-0 text-sm"
                        />
                      </FormControl>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guests"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="flex items-center h-full bg-gray-50 rounded-md px-4 py-2">
                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <FormLabel className="text-xs text-gray-500">
                        1 room, 2 adults
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Select Transportation"
                          {...field}
                          className="border-0 p-0 bg-transparent focus:ring-0 text-sm placeholder:text-gray-400"
                        />
                      </FormControl>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="h-full aspect-square bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </Form>
    )
  }

  // Redesigned trips search form (inspired by the hotels design)
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-lg p-2"
      >
        <div className="flex flex-col md:flex-row gap-2">
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem className="flex-1">
                <div className="flex items-center h-full bg-gray-50 rounded-md px-4 py-2">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <FormLabel className="text-xs text-gray-500">
                      Destination
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Where do you want to go?"
                        {...field}
                        className="border-0 p-0 bg-transparent focus:ring-0 text-sm placeholder:text-gray-400"
                      />
                    </FormControl>
                  </div>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex-1">
                <div className="flex items-center h-full bg-gray-50 rounded-md px-4 py-2">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <FormLabel className="text-xs text-gray-500">
                      Start Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="border-0 p-0 bg-transparent focus:ring-0 text-sm"
                      />
                    </FormControl>
                  </div>
                </div>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="h-full aspect-square bg-yellow-400 hover:bg-yellow-500 text-black"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </Form>
  )
}
