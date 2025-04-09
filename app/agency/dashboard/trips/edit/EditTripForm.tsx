import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format, startOfDay } from "date-fns"
import { cn } from "@/lib/utils"

// ... existing imports

// Update the startDate and endDate form fields
<div className="space-y-2">
  <Label htmlFor="startDate">Start Date</Label>
  <Controller
    name="startDate"
    control={control}
    render={({ field }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !field.value && "text-muted-foreground"
            )}
            id="startDate"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {field.value ? format(new Date(field.value), "PPP") : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value instanceof Date ? field.value : new Date(field.value)}
            onSelect={(date) => field.onChange(date)}
            disabled={{ before: startOfDay(new Date()) }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    )}
  />
  {errors.startDate && (
    <p className="text-xs text-destructive">
      {errors.startDate.message}
    </p>
  )}
</div>

<div className="space-y-2">
  <Label htmlFor="endDate">End Date</Label>
  <Controller
    name="endDate"
    control={control}
    render={({ field }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !field.value && "text-muted-foreground"
            )}
            id="endDate"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {field.value ? format(new Date(field.value), "PPP") : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value instanceof Date ? field.value : new Date(field.value)}
            onSelect={(date) => field.onChange(date)}
            disabled={{ 
              before: watch("startDate") ? 
                (watch("startDate") instanceof Date ? 
                  watch("startDate") : 
                  new Date(watch("startDate"))) : 
                startOfDay(new Date()) 
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    )}
  />
  {errors.endDate && (
    <p className="text-xs text-destructive">
      {errors.endDate.message}
    </p>
  )}
</div> 