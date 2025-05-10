"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Plus,
  Minus,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { format, startOfDay } from "date-fns";
import { Calendar as UiCalendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

const tripSearchSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  startDate: z.string().min(1, "Start date is required"),
});

const hotelSearchSchema = z.object({
  city: z.string().min(1, "City is required"),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  guests: z.string().min(1, "Number of guests is required"),
});

const rentSearchSchema = z.object({
  pickupLocation: z.string().min(1, "Pickup location is required"),
  pickupDate: z.string().min(1, "Pickup date is required"),
  returnDate: z.string().min(1, "Return date is required"),
});

interface SearchFormProps {
  type: "trips" | "hotels" | "rent";
}

export function SearchForm({ type }: SearchFormProps) {
  const router = useRouter();
  const schema =
    type === "trips"
      ? tripSearchSchema
      : type === "hotels"
        ? hotelSearchSchema
        : rentSearchSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues:
      type === "trips"
        ? { destination: "", startDate: "" }
        : type === "hotels"
          ? { city: "", checkIn: "", checkOut: "", guests: "1 room, 2 adults" }
          : {
              pickupLocation: "",
              pickupDate: "",
              returnDate: "",
            },
  });

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [pickupDate, setPickupDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();

  // Guest counter state
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Dropdown states
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const destinationRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Fetch suggestions from the API based on user input
  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/search-suggestions?query=${encodeURIComponent(query)}&type=${type}`
      );
      const data = await response.json();

      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes with debounce
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: any
  ) => {
    const value = e.target.value;
    field.onChange(value);
    setSearchValue(value);

    // Debounce API calls to prevent excessive requests
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    setDebounceTimeout(timeout);

    if (value.trim() !== "") {
      setIsDestinationOpen(true);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        destinationRef.current &&
        !destinationRef.current.contains(event.target as Node)
      ) {
        setIsDestinationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update the guests field value when counts change
  const updateGuestsValue = () => {
    const childrenText =
      children > 0
        ? `, ${children} ${children === 1 ? "child" : "children"}`
        : "";
    const value = `${rooms} ${rooms === 1 ? "room" : "rooms"}, ${adults} ${adults === 1 ? "adult" : "adults"}${childrenText}`;
    form.setValue("guests", value);
    return value;
  };

  function onSubmit(data: z.infer<typeof schema>) {
    // Log the search data for debugging
    console.log("Search form submitted:", { type, data });

    // Create a new URLSearchParams object
    const searchParams = new URLSearchParams({
      type,
      ...(type === "trips"
        ? {
            destination: (data as z.infer<typeof tripSearchSchema>).destination,
            startDate:
              (data as z.infer<typeof tripSearchSchema>).startDate ||
              new Date().toISOString().split("T")[0],
          }
        : type === "hotels"
          ? {
              city: (data as z.infer<typeof hotelSearchSchema>).city,
              checkIn:
                (data as z.infer<typeof hotelSearchSchema>).checkIn ||
                new Date().toISOString().split("T")[0],
              checkOut:
                (data as z.infer<typeof hotelSearchSchema>).checkOut ||
                new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
              guests: (data as z.infer<typeof hotelSearchSchema>).guests || "1",
            }
          : {
              pickupLocation: (data as z.infer<typeof rentSearchSchema>)
                .pickupLocation,
              pickupDate:
                (data as z.infer<typeof rentSearchSchema>).pickupDate ||
                new Date().toISOString().split("T")[0],
              returnDate:
                (data as z.infer<typeof rentSearchSchema>).returnDate ||
                new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
            }),
    });

    // Log the final URL for debugging
    console.log("Search URL:", `/?${searchParams.toString()}`);

    // Navigate to the search results page
    router.push(`/?${searchParams.toString()}`);
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
                    <div className="w-full" ref={destinationRef}>
                      <FormLabel className="text-xs text-gray-500 flex justify-between items-center">
                        Destination ?{" "}
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="flex items-center justify-between cursor-pointer">
                            <Input
                              placeholder="Destinations, Hotels"
                              {...field}
                              className="border-0 p-0 bg-transparent focus:ring-0 text-sm placeholder:text-gray-400"
                              onClick={() => setIsDestinationOpen(true)}
                              onChange={(e) => handleInputChange(e, field)}
                              value={field.value}
                            />
                          </div>
                          {isDestinationOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                              <div className="max-h-64 overflow-y-auto py-1">
                                {isLoading ? (
                                  <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                                    <span className="ml-2 text-sm text-gray-500">
                                      Loading suggestions...
                                    </span>
                                  </div>
                                ) : suggestions.length > 0 ? (
                                  suggestions.map((suggestion, index) => (
                                    <div
                                      key={index}
                                      className="px-4 py-2 hover:bg-yellow-50 cursor-pointer"
                                      onClick={() => {
                                        field.onChange(suggestion);
                                        setIsDestinationOpen(false);
                                      }}
                                    >
                                      {suggestion}
                                    </div>
                                  ))
                                ) : searchValue.trim() !== "" ? (
                                  <div className="px-4 py-2 text-sm text-gray-500">
                                    No results found
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          )}
                        </div>
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
                        Check in &nbsp;
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
                              {checkInDate
                                ? format(checkInDate, "PPP")
                                : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <UiCalendar
                              mode="single"
                              selected={checkInDate}
                              onSelect={(date) => {
                                setCheckInDate(date);
                                field.onChange(
                                  date ? date.toISOString().split("T")[0] : ""
                                );
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
                        Check out &nbsp;
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
                              {checkOutDate
                                ? format(checkOutDate, "PPP")
                                : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <UiCalendar
                              mode="single"
                              selected={checkOutDate}
                              onSelect={(date) => {
                                setCheckOutDate(date);
                                field.onChange(
                                  date ? date.toISOString().split("T")[0] : ""
                                );
                              }}
                              disabled={{
                                before: checkInDate
                                  ? checkInDate
                                  : startOfDay(new Date()),
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
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              className="pl-0 text-left font-normal border-0 p-0 bg-transparent focus:ring-0 text-sm"
                            >
                              {field.value || updateGuestsValue()}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-4" align="start">
                            <div className="space-y-4">
                              <div className="text-sm font-medium">
                                {rooms} {rooms === 1 ? "room" : "rooms"},{" "}
                                {adults} {adults === 1 ? "adult" : "adults"}
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="font-medium">Adult</div>
                                <div className="flex items-center gap-3">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (adults > 1) {
                                        setAdults(adults - 1);
                                        updateGuestsValue();
                                      }
                                    }}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-5 text-center">
                                    {adults}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setAdults(adults + 1);
                                      updateGuestsValue();
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="font-medium">Child</div>
                                <div className="flex items-center gap-3">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (children > 0) {
                                        setChildren(children - 1);
                                        updateGuestsValue();
                                      }
                                    }}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-5 text-center">
                                    {children}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setChildren(children + 1);
                                      updateGuestsValue();
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="font-medium">Room</div>
                                <div className="flex items-center gap-3">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (rooms > 1) {
                                        setRooms(rooms - 1);
                                        updateGuestsValue();
                                      }
                                    }}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-5 text-center">
                                    {rooms}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setRooms(rooms + 1);
                                      updateGuestsValue();
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
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
    );
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
                    <div className="w-full" ref={destinationRef}>
                      <FormLabel className="text-xs text-gray-500 flex justify-between items-center">
                        Pick-up location{" "}
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="flex items-center justify-between cursor-pointer">
                            <Input
                              placeholder="Airport, city, address..."
                              {...field}
                              className="border-0 p-0 bg-transparent focus:ring-0 text-sm"
                              onClick={() => setIsDestinationOpen(true)}
                              onChange={(e) => handleInputChange(e, field)}
                              value={field.value}
                            />
                          </div>
                          {isDestinationOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                              <div className="max-h-64 overflow-y-auto py-1">
                                {isLoading ? (
                                  <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                                    <span className="ml-2 text-sm text-gray-500">
                                      Loading suggestions...
                                    </span>
                                  </div>
                                ) : suggestions.length > 0 ? (
                                  suggestions.map((suggestion, index) => (
                                    <div
                                      key={index}
                                      className="px-4 py-2 hover:bg-yellow-50 cursor-pointer"
                                      onClick={() => {
                                        field.onChange(suggestion);
                                        setIsDestinationOpen(false);
                                      }}
                                    >
                                      {suggestion}
                                    </div>
                                  ))
                                ) : searchValue.trim() !== "" ? (
                                  <div className="px-4 py-2 text-sm text-gray-500">
                                    No results found
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          )}
                        </div>
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
                        Date of pick-up &nbsp;
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
                              {pickupDate
                                ? format(pickupDate, "PPP")
                                : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <UiCalendar
                              mode="single"
                              selected={pickupDate}
                              onSelect={(date) => {
                                setPickupDate(date);
                                field.onChange(
                                  date ? date.toISOString().split("T")[0] : ""
                                );
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
                        Return date &nbsp;
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
                              {returnDate
                                ? format(returnDate, "PPP")
                                : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <UiCalendar
                              mode="single"
                              selected={returnDate}
                              onSelect={(date) => {
                                setReturnDate(date);
                                field.onChange(
                                  date ? date.toISOString().split("T")[0] : ""
                                );
                              }}
                              disabled={{
                                before: pickupDate
                                  ? pickupDate
                                  : startOfDay(new Date()),
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
    );
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
                  <div className="w-full" ref={destinationRef}>
                    <FormLabel className="text-xs text-gray-500 flex justify-between items-center">
                      Destination{" "}
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="flex items-center justify-between cursor-pointer">
                          <Input
                            placeholder="Where do you want to go?"
                            {...field}
                            className="border-0 p-0 bg-transparent focus:ring-0 text-sm placeholder:text-gray-400"
                            onClick={() => setIsDestinationOpen(true)}
                            onChange={(e) => handleInputChange(e, field)}
                            value={field.value}
                          />
                        </div>
                        {isDestinationOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                            <div className="max-h-64 overflow-y-auto py-1">
                              {isLoading ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                                  <span className="ml-2 text-sm text-gray-500">
                                    Loading suggestions...
                                  </span>
                                </div>
                              ) : suggestions.length > 0 ? (
                                suggestions.map((suggestion, index) => (
                                  <div
                                    key={index}
                                    className="px-4 py-2 hover:bg-yellow-50 cursor-pointer"
                                    onClick={() => {
                                      field.onChange(suggestion);
                                      setIsDestinationOpen(false);
                                    }}
                                  >
                                    {suggestion}
                                  </div>
                                ))
                              ) : searchValue.trim() !== "" ? (
                                <div className="px-4 py-2 text-sm text-gray-500">
                                  No results found
                                </div>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </div>
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
                      Start Date &nbsp;
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
                            {startDate
                              ? format(startDate, "PPP")
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <UiCalendar
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => {
                              setStartDate(date);
                              field.onChange(
                                date ? date.toISOString().split("T")[0] : ""
                              );
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
  );
}
