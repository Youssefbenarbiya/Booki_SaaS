"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

interface SearchFilterBarProps {
  initialCity?: string
  initialCheckIn?: string
  initialCheckOut?: string
}

export function SearchFilterBar({
  initialCity = "",
  initialCheckIn,
  initialCheckOut,
}: SearchFilterBarProps) {
  const router = useRouter()
  const [city, setCity] = useState(initialCity)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (initialCheckIn && initialCheckOut) {
      return {
        from: new Date(initialCheckIn),
        to: new Date(initialCheckOut),
      }
    }
    return undefined
  })

  const handleSearch = () => {
    // Build the search query parameters
    const searchParams = new URLSearchParams()

    searchParams.set("type", "hotels")

    if (city) {
      searchParams.set("city", city)
    }

    if (dateRange?.from) {
      searchParams.set("checkIn", format(dateRange.from, "yyyy-MM-dd"))
    }

    if (dateRange?.to) {
      searchParams.set("checkOut", format(dateRange.to, "yyyy-MM-dd"))
    }

    // Prevent scrolling to top when updating the search
    router.push(`/?${searchParams.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="space-y-2">
        <Label htmlFor="city">Destination</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            id="city"
            placeholder="Where are you going?"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Dates</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM dd, yyyy")} -
                    {format(dateRange.to, "MMM dd, yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "MMM dd, yyyy")
                )
              ) : (
                <span>Select dates</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              initialFocus
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button className="w-full" onClick={handleSearch}>
        Update Search
      </Button>
    </div>
  )
}
