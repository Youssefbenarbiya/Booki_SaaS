"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface BookTripButtonProps {
  tripId: number
  variant?: "button" | "inline"
  className?: string
}

export default function BookTripButton({
  tripId,
  variant = "button",
  className = "",
}: BookTripButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [travelers, setTravelers] = useState("1")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const router = useRouter()

  const handleBookTrip = async () => {
    setIsLoading(true)

    // Here you would implement the actual booking logic
    // For example calling a server action to create a booking

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    setIsOpen(false)

    // Navigate to booking form with the collected information
    router.push(
      `/trips/${tripId}/book?travelers=${travelers}&date=${date?.toISOString()}`
    )
  }

  return (
    <>
      {variant === "button" ? (
        <Button
          onClick={() => setIsOpen(true)}
          className={cn("w-full", className)}
          size="lg"
        >
          Book This Trip
        </Button>
      ) : (
        <span
          onClick={() => setIsOpen(true)}
          className={cn("cursor-pointer", className)}
        >
          Book Now
        </span>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book Your Trip</DialogTitle>
            <DialogDescription>
              Fill in the details to continue your booking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="travelers" className="text-right">
                Travelers
              </Label>
              <Select value={travelers} onValueChange={setTravelers}>
                <SelectTrigger className="w-full col-span-3">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "traveler" : "travelers"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full col-span-3 justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Special requests
              </Label>
              <Input
                id="notes"
                className="col-span-3"
                placeholder="Any special requirements?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleBookTrip} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue to Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
