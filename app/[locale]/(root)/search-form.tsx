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
import { format, startOfDay } from "date-fns"
import { Calendar as UiCalendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useState } from "react"

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

const rentSearchSchema = z.object({
  pickupLocation: z.string().min(1, "Pickup location is required"),
  pickupDate: z.string().min(1, "Pickup date is required"),
  returnDate: z.string().min(1, "Return date is required"),
})

interface SearchFormProps {
  type: "trips" | "hotels" | "rent"
}

export function SearchForm({ type }: SearchFormProps) {
  const router = useRouter()
  const schema =
    type === "trips"
      ? tripSearchSchema
      : type === "hotels"
      ? hotelSearchSchema
      : rentSearchSchema

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues:
      type === "trips"
        ? { destination: "", startDate: "" }
        : type === "hotels"
        ? { city: "", checkIn: "", checkOut: "", guests: "2 adults" }
        : {
            pickupLocation: "",
            pickupDate: "",
            returnDate: "",
          },
  })

  const [startDate, setStartDate] = useState<Date | undefined>()
  const [checkInDate, setCheckInDate] = useState<Date | undefined>()
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>()
  const [pickupDate, setPickupDate] = useState<Date | undefined>()
  const [returnDate, setReturnDate] = useState<Date | undefined>()

  function onSubmit(data: z.infer<typeof schema>) {
    // Log the search data for debugging
    console.log("Search form submitted:", { type, data });
    
    // Create a new URLSearchParams object
    const searchParams = new URLSearchParams({
      type,
      ...(type === "trips"
        ? {
            destination: (data as z.infer<typeof tripSearchSchema>).destination,
            startDate: (data as z.infer<typeof tripSearchSchema>).startDate || new Date().toISOString().split('T')[0],
          }
        : type === "hotels"
        ? {
            city: (data as z.infer<typeof hotelSearchSchema>).city,
            checkIn: (data as z.infer<typeof hotelSearchSchema>).checkIn || new Date().toISOString().split('T')[0],
            checkOut: (data as z.infer<typeof hotelSearchSchema>).checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
            guests: (data as z.infer<typeof hotelSearchSchema>).guests || "1",
          }
        : {
            pickupLocation: (data as z.infer<typeof rentSearchSchema>)
              .pickupLocation,
            pickupDate: (data as z.infer<typeof rentSearchSchema>).pickupDate || new Date().toISOString().split('T')[0],
            returnDate: (data as z.infer<typeof rentSearchSchema>).returnDate || new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
          }),
    });
    
    // Log the final URL for debugging
    console.log("Search URL:", `/?${searchParams.toString()}`);
    
    // Navigate to the search results page
    router.push(`/?${searchParams.toString()}`)
  }

  if (type === "hotels") {
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex flex-col md:flex-row gap-2 p-2">
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
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              className={cn(
                                "pl-0 text-left font-normal border-0 p-0 bg-transparent focus:ring-0 text-sm",
                                !checkInDate && "text-gray-400"
                              )}
                            >
                              {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <UiCalendar
                              mode="single"
                              selected={checkInDate}
                              onSelect={(date) => {
                                setCheckInDate(date)
                                field.onChange(date ? date.toISOString().split('T')[0] : '')
                              }}
                              disabled={{ before: startOfDay(new Date()) }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
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
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              className={cn(
                                "pl-0 text-left font-normal border-0 p-0 bg-transparent focus:ring-0 text-sm",
                                !checkOutDate && "text-gray-400"
                              )}
                            >
                              {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <UiCalendar
                              mode="single"
                              selected={checkOutDate}
                              onSelect={(date) => {
                                setCheckOutDate(date)
                                field.onChange(date ? date.toISOString().split('T')[0] : '')
                              }}
                              disabled={{ 
                                before: checkInDate ? checkInDate : startOfDay(new Date()) 
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
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
                        Guests
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="2 adults"
                          value={field.value || "2 adults"}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
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

  if (type === "rent") {
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex flex-col md:flex-row gap-2 p-2">
            <FormField
              control={form.control}
              name="pickupLocation"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="flex items-center h-full bg-gray-50 rounded-md px-4 py-2">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <FormLabel className="text-xs text-gray-500">
                        Pick-up location
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Airport, city, address..."
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
              name="pickupDate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="flex items-center h-full bg-gray-50 rounded-md px-4 py-2">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <FormLabel className="text-xs text-gray-500">
                        Date of pick-up
                      </FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              className={cn(
                                "pl-0 text-left font-normal border-0 p-0 bg-transparent focus:ring-0 text-sm",
                                !pickupDate && "text-gray-400"
                              )}
                            >
                              {pickupDate ? format(pickupDate, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <UiCalendar
                              mode="single"
                              selected={pickupDate}
                              onSelect={(date) => {
                                setPickupDate(date)
                                field.onChange(date ? date.toISOString().split('T')[0] : '')
                              }}
                              disabled={{ before: startOfDay(new Date()) }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="returnDate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="flex items-center h-full bg-gray-50 rounded-md px-4 py-2">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <FormLabel className="text-xs text-gray-500">
                        Return date
                      </FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              className={cn(
                                "pl-0 text-left font-normal border-0 p-0 bg-transparent focus:ring-0 text-sm",
                                !returnDate && "text-gray-400"
                              )}
                            >
                              {returnDate ? format(returnDate, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <UiCalendar
                              mode="single"
                              selected={returnDate}
                              onSelect={(date) => {
                                setReturnDate(date)
                                field.onChange(date ? date.toISOString().split('T')[0] : '')
                              }}
                              disabled={{ 
                                before: pickupDate ? pickupDate : startOfDay(new Date()) 
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-white rounded-lg border border-gray-200 shadow-sm"
      >
        <div className="flex flex-col md:flex-row gap-2 p-2">
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "pl-0 text-left font-normal border-0 p-0 bg-transparent focus:ring-0 text-sm",
                              !startDate && "text-gray-400"
                            )}
                          >
                            {startDate ? format(startDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <UiCalendar
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => {
                              setStartDate(date)
                              field.onChange(date ? date.toISOString().split('T')[0] : '')
                            }}
                            disabled={{ before: startOfDay(new Date()) }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
