"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function CalendarDateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })

  // Handle date range changes (can be integrated with API calls in a real app)
  React.useEffect(() => {
    if (date?.from && date?.to) {
      // In a real app, this would trigger a data fetch with the date range
      console.log("Date range selected:", {
        from: format(date.from, "yyyy-MM-dd"),
        to: format(date.to, "yyyy-MM-dd"),
      })
    }
  }, [date])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
          <div className="flex items-center justify-between p-3 border-t border-border">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const today = new Date()
                  setDate({
                    from: today,
                    to: today,
                  })
                }}
              >
                Today
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const today = new Date()
                  const weekStart = addDays(today, -7)
                  setDate({
                    from: weekStart,
                    to: today,
                  })
                }}
              >
                Last 7 days
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const today = new Date()
                  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
                  setDate({
                    from: monthStart,
                    to: today,
                  })
                }}
              >
                Month
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 