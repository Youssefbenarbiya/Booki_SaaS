/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useTransition, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { createTrip, type TripInput } from "@/actions/trips/tripActions";
import { ImageUploadSection } from "@/components/ImageUploadSection";
import { fileToFormData, cn } from "@/lib/utils";
import { uploadImages } from "@/actions/uploadActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfDay } from "date-fns";

import { CalendarIcon, Percent, DollarSign, Info } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/lib/contexts/CurrencyContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define currency type for this component
type Currency = {
  code: string;
  symbol: string;
  name: string;
};

// Define available currencies array locally since it's not exported by the context
const currencies: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "TND", symbol: "DT", name: "Tunisian Dinar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
];

// Extended TripInput type to include discount and currency
interface ExtendedTripInput extends TripInput {
  discountPercentage?: number;
  currency: string;
  // Add new discount types
  groupDiscountEnabled?: boolean;
  groupDiscountMinPeople?: number;
  groupDiscountPercentage?: number;
  timeSpecificDiscountEnabled?: boolean;
  timeSpecificDiscountStartTime?: string;
  timeSpecificDiscountEndTime?: string;
  timeSpecificDiscountDays?: string[];
  timeSpecificDiscountPercentage?: number;
  childDiscountEnabled?: boolean;
  childDiscountPercentage?: number;
}

export default function NewTripForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Get the currency from the context
  const { currency: contextCurrency, setCurrency } = useCurrency();

  // Image states
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string>("");

  // Discount states
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [priceAfterDiscount, setPriceAfterDiscount] = useState<number>(0);
  const [customPercentage, setCustomPercentage] = useState<boolean>(false);

  // New discount type states
  const [groupDiscountEnabled, setGroupDiscountEnabled] =
    useState<boolean>(false);
  const [groupDiscountMinPeople, setGroupDiscountMinPeople] =
    useState<number>(2);
  const [groupDiscountPercentage, setGroupDiscountPercentage] =
    useState<number>(10);

  const [timeSpecificDiscountEnabled, setTimeSpecificDiscountEnabled] =
    useState<boolean>(false);
  const [timeSpecificDiscountStartTime, setTimeSpecificDiscountStartTime] =
    useState<string>("08:00");
  const [timeSpecificDiscountEndTime, setTimeSpecificDiscountEndTime] =
    useState<string>("10:00");
  const [timeSpecificDiscountDays, setTimeSpecificDiscountDays] = useState<
    string[]
  >(["Monday"]);
  const [timeSpecificDiscountPercentage, setTimeSpecificDiscountPercentage] =
    useState<number>(15);

  const [childDiscountEnabled, setChildDiscountEnabled] =
    useState<boolean>(false);
  const [childDiscountPercentage, setChildDiscountPercentage] =
    useState<number>(25);

  // Currency state - use context currency as default
  const [selectedCurrency, setSelectedCurrency] = useState(
    contextCurrency || "USD"
  );

  // Date states
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExtendedTripInput>({
    defaultValues: {
      isAvailable: true,
      activities: [],
      currency: contextCurrency || "USD",
      // Initialize new discount fields
      groupDiscountEnabled: false,
      groupDiscountMinPeople: 2,
      groupDiscountPercentage: 10,
      timeSpecificDiscountEnabled: false,
      timeSpecificDiscountStartTime: "08:00",
      timeSpecificDiscountEndTime: "10:00",
      timeSpecificDiscountDays: ["Monday"],
      timeSpecificDiscountPercentage: 15,
      childDiscountEnabled: false,
      childDiscountPercentage: 25,
    },
  });

  // Watch original price to update discount calculations
  const watchedOriginalPrice = watch("originalPrice");

  // Update original price when price changes
  useEffect(() => {
    if (watchedOriginalPrice) {
      const price = Number(watchedOriginalPrice);
      setOriginalPrice(price);
      calculatePriceAfterDiscount(price, discountPercentage);
    }
  }, [watchedOriginalPrice, discountPercentage]);

  // Calculate price after discount
  const calculatePriceAfterDiscount = (price: number, percentage: number) => {
    if (!price || !percentage) {
      setPriceAfterDiscount(price || 0);
      return price || 0;
    }

    const calculatedPrice = price - price * (percentage / 100);
    const roundedPrice = Math.round(calculatedPrice * 100) / 100; // Round to 2 decimal places
    setPriceAfterDiscount(roundedPrice);
    setValue("priceAfterDiscount", roundedPrice);
    return roundedPrice;
  };

  // Apply percentage discount
  const applyPercentageDiscount = (percentage: number) => {
    setDiscountPercentage(percentage);
    setValue("discountPercentage", percentage);

    const price = Number(watchedOriginalPrice) || 0;
    calculatePriceAfterDiscount(price, percentage);
  };

  // Handle currency change
  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
    setValue("currency", value);
    // Update the context currency
    setCurrency(value);
  };

  async function onSubmit(data: ExtendedTripInput) {
    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (images.length > 0) {
        try {
          imageUrls = await Promise.all(
            images.map(async (file) => {
              const formData = await fileToFormData(file);
              return uploadImages(formData);
            })
          );
        } catch (error) {
          console.error("Error uploading images:", error);
          setUploadError("Failed to upload images");
          return;
        }
      }

      // Calculate price after discount if applicable
      let finalPriceAfterDiscount = null;
      if (hasDiscount && data.discountPercentage) {
        finalPriceAfterDiscount = calculatePriceAfterDiscount(
          Number(data.originalPrice),
          data.discountPercentage
        );
      }

      // Automatically set isAvailable to false if capacity is 0
      const isAvailable =
        Number(data.capacity) === 0 ? false : data.isAvailable;

      // Log discount data before submission
      console.log("Submitting new trip with discount data:", {
        groupDiscountEnabled,
        groupDiscountMinPeople,
        groupDiscountPercentage,
        timeSpecificDiscountEnabled,
        timeSpecificDiscountStartTime,
        timeSpecificDiscountEndTime,
        timeSpecificDiscountDays,
        timeSpecificDiscountPercentage,
        childDiscountEnabled,
        childDiscountPercentage,
      });

      // Create trip with image URLs, discount info, and currency
      const formattedData = {
        ...data,
        originalPrice: Number(data.originalPrice),
        discountPercentage: hasDiscount ? data.discountPercentage : null,
        priceAfterDiscount: hasDiscount ? finalPriceAfterDiscount : null,
        currency: selectedCurrency,
        images: imageUrls,
        isAvailable: isAvailable,
        // Ensure dates are always Date objects
        startDate: startDate || new Date(data.startDate),
        endDate: endDate || new Date(data.endDate),
        // Add new discount types with explicit null values when disabled
        groupDiscountEnabled: groupDiscountEnabled,
        groupDiscountMinPeople: groupDiscountEnabled
          ? groupDiscountMinPeople
          : null,
        groupDiscountPercentage: groupDiscountEnabled
          ? groupDiscountPercentage
          : null,

        timeSpecificDiscountEnabled: timeSpecificDiscountEnabled,
        timeSpecificDiscountStartTime: timeSpecificDiscountEnabled
          ? timeSpecificDiscountStartTime
          : null,
        timeSpecificDiscountEndTime: timeSpecificDiscountEnabled
          ? timeSpecificDiscountEndTime
          : null,
        timeSpecificDiscountDays: timeSpecificDiscountEnabled
          ? timeSpecificDiscountDays
          : null,
        timeSpecificDiscountPercentage: timeSpecificDiscountEnabled
          ? timeSpecificDiscountPercentage
          : null,

        childDiscountEnabled: childDiscountEnabled,
        childDiscountPercentage: childDiscountEnabled
          ? childDiscountPercentage
          : null,
      };

      await createTrip(formattedData);
      router.push("/agency/dashboard/trips");
      router.refresh();
    } catch (error) {
      console.error("Error creating trip:", error);
    }
  }

  return (
    <div className="max-w-3xl mx-auto my-8 px-4">
      <Card>
        <CardHeader className="bg-indigo-600 text-white">
          <CardTitle>Create New Trip</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form
            onSubmit={handleSubmit((data) =>
              startTransition(() => onSubmit(data))
            )}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Trip Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" {...register("destination")} />
                {errors.destination && (
                  <p className="text-xs text-destructive">
                    {errors.destination.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        if (date) {
                          setValue("startDate", date);
                        }
                      }}
                      disabled={{ before: startOfDay(new Date()) }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.startDate && (
                  <p className="text-xs text-destructive">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        if (date) {
                          setValue("endDate", date);
                        }
                      }}
                      disabled={{
                        before: startDate ? startDate : startOfDay(new Date()),
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.endDate && (
                  <p className="text-xs text-destructive">
                    {errors.endDate.message}
                  </p>
                )}
              </div>

              {/* Pricing Section */}
              <div className="md:col-span-2">
                <Card className="border-2 border-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <DollarSign className="h-5 w-5 mr-1" />
                      Pricing Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="originalPrice">Original Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="originalPrice"
                            type="number"
                            step="0.01"
                            className="pl-9"
                            {...register("originalPrice", {
                              required: "Original price is required",
                              onChange: (e) => {
                                const price = Number(e.target.value);
                                setOriginalPrice(price);
                                if (hasDiscount && discountPercentage) {
                                  calculatePriceAfterDiscount(
                                    price,
                                    discountPercentage
                                  );
                                }
                              },
                            })}
                          />
                        </div>
                        {errors.originalPrice && (
                          <p className="text-xs text-destructive">
                            {errors.originalPrice.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={selectedCurrency}
                          defaultValue={contextCurrency || "USD"}
                          onValueChange={handleCurrencyChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              {selectedCurrency ? (
                                <>
                                  {currencies.find(
                                    (c) => c.code === selectedCurrency
                                  )?.symbol || ""}{" "}
                                  {selectedCurrency}
                                </>
                              ) : (
                                "Select Currency"
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((curr: Currency) => (
                              <SelectItem key={curr.code} value={curr.code}>
                                {curr.symbol} {curr.code} - {curr.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasDiscount"
                        checked={hasDiscount}
                        onCheckedChange={(checked) => {
                          setHasDiscount(!!checked);
                          if (!checked) {
                            setDiscountPercentage(0);
                            setValue("discountPercentage", undefined);
                            setValue("priceAfterDiscount", undefined);
                            setPriceAfterDiscount(0);
                            setCustomPercentage(false);
                          }
                        }}
                      />
                      <Label htmlFor="hasDiscount" className="font-medium">
                        Apply Discount
                      </Label>
                    </div>

                    {hasDiscount && (
                      <div className="space-y-4 pl-6 border-l-2 border-muted">
                        <div className="space-y-3">
                          <Label>Discount Percentage</Label>
                          <RadioGroup
                            value={
                              customPercentage
                                ? "custom"
                                : discountPercentage.toString()
                            }
                            onValueChange={(value) => {
                              if (value === "custom") {
                                setCustomPercentage(true);
                                return;
                              }

                              setCustomPercentage(false);
                              const percentage = Number.parseInt(value, 10);
                              applyPercentageDiscount(percentage);
                            }}
                            className="flex flex-wrap gap-2"
                          >
                            <div className="flex items-center space-x-2 border rounded-md p-2">
                              <RadioGroupItem value="10" id="r10" />
                              <Label htmlFor="r10">10%</Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-md p-2">
                              <RadioGroupItem value="20" id="r20" />
                              <Label htmlFor="r20">20%</Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-md p-2">
                              <RadioGroupItem value="30" id="r30" />
                              <Label htmlFor="r30">30%</Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-md p-2">
                              <RadioGroupItem value="custom" id="rcustom" />
                              <Label htmlFor="rcustom">Custom</Label>
                            </div>
                          </RadioGroup>

                          {customPercentage && (
                            <div className="flex items-center space-x-2 mt-2">
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                value={discountPercentage || ""}
                                onChange={(e) => {
                                  const value = Number.parseInt(
                                    e.target.value,
                                    10
                                  );
                                  if (
                                    !isNaN(value) &&
                                    value >= 0 &&
                                    value <= 100
                                  ) {
                                    applyPercentageDiscount(value);
                                  }
                                }}
                                className="w-24"
                              />
                              <Percent className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        {discountPercentage > 0 && originalPrice > 0 && (
                          <div className="bg-muted p-4 rounded-md space-y-2">
                            <div className="flex justify-between">
                              <span>Original Price:</span>
                              <span>
                                {currencies.find(
                                  (c: Currency) => c.code === selectedCurrency
                                )?.symbol || ""}
                                {originalPrice.toFixed(2)} {selectedCurrency}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Discount ({discountPercentage}%):</span>
                              <span className="text-red-500">
                                -
                                {currencies.find(
                                  (c: Currency) => c.code === selectedCurrency
                                )?.symbol || ""}
                                {(
                                  (originalPrice * discountPercentage) /
                                  100
                                ).toFixed(2)}{" "}
                                {selectedCurrency}
                              </span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold">
                              <span>Price After Discount:</span>
                              <span className="text-green-600">
                                {currencies.find(
                                  (c: Currency) => c.code === selectedCurrency
                                )?.symbol || ""}
                                {priceAfterDiscount.toFixed(2)}{" "}
                                {selectedCurrency}
                              </span>
                            </div>
                            <input
                              type="hidden"
                              {...register("priceAfterDiscount")}
                              value={priceAfterDiscount}
                            />
                            <input
                              type="hidden"
                              {...register("currency")}
                              value={selectedCurrency}
                            />
                            <input
                              type="hidden"
                              {...register("discountPercentage")}
                              value={discountPercentage}
                            />
                          </div>
                        )}

                        {/* ADDITIONAL DISCOUNT TYPES */}
                        <div className="mt-8 space-y-6">
                          <h3 className="text-md font-medium">
                            Additional Discount Types
                          </h3>

                          {/* Group Discount */}
                          <div className="space-y-4 border-l-2 border-blue-200 pl-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="groupDiscountEnabled"
                                checked={groupDiscountEnabled}
                                onCheckedChange={(checked) => {
                                  setGroupDiscountEnabled(!!checked);
                                  setValue("groupDiscountEnabled", !!checked);
                                }}
                              />
                              <Label
                                htmlFor="groupDiscountEnabled"
                                className="font-medium"
                              >
                                Group Booking Discount
                              </Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      Apply discount when booking for multiple
                                      people
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>

                            {groupDiscountEnabled && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                                <div className="space-y-2">
                                  <Label htmlFor="groupDiscountMinPeople">
                                    Minimum People
                                  </Label>
                                  <Input
                                    id="groupDiscountMinPeople"
                                    type="number"
                                    min="2"
                                    value={groupDiscountMinPeople}
                                    onChange={(e) => {
                                      const value = Number(e.target.value);
                                      if (value >= 2) {
                                        setGroupDiscountMinPeople(value);
                                        setValue(
                                          "groupDiscountMinPeople",
                                          value
                                        );
                                      }
                                    }}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="groupDiscountPercentage">
                                    Discount Percentage (Optional)
                                  </Label>
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      id="groupDiscountPercentage"
                                      type="number"
                                      min="1"
                                      max="100"
                                      value={groupDiscountPercentage}
                                      onChange={(e) => {
                                        const value = Number(e.target.value);
                                        if (value >= 1 && value <= 100) {
                                          setGroupDiscountPercentage(value);
                                          setValue(
                                            "groupDiscountPercentage",
                                            value
                                          );
                                        }
                                      }}
                                    />
                                    <Percent className="h-4 w-4" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Time-specific Discount */}
                          <div className="space-y-4 border-l-2 border-purple-200 pl-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="timeSpecificDiscountEnabled"
                                checked={timeSpecificDiscountEnabled}
                                onCheckedChange={(checked) => {
                                  setTimeSpecificDiscountEnabled(!!checked);
                                  setValue(
                                    "timeSpecificDiscountEnabled",
                                    !!checked
                                  );
                                }}
                              />
                              <Label
                                htmlFor="timeSpecificDiscountEnabled"
                                className="font-medium"
                              >
                                Time-specific Discount
                              </Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      Apply discount for specific hours on
                                      specific days
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>

                            {timeSpecificDiscountEnabled && (
                              <div className="space-y-4 pl-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="timeSpecificDiscountStartTime">
                                      Start Time
                                    </Label>
                                    <Input
                                      id="timeSpecificDiscountStartTime"
                                      type="time"
                                      value={timeSpecificDiscountStartTime}
                                      onChange={(e) => {
                                        setTimeSpecificDiscountStartTime(
                                          e.target.value
                                        );
                                        setValue(
                                          "timeSpecificDiscountStartTime",
                                          e.target.value
                                        );
                                      }}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="timeSpecificDiscountEndTime">
                                      End Time
                                    </Label>
                                    <Input
                                      id="timeSpecificDiscountEndTime"
                                      type="time"
                                      value={timeSpecificDiscountEndTime}
                                      onChange={(e) => {
                                        setTimeSpecificDiscountEndTime(
                                          e.target.value
                                        );
                                        setValue(
                                          "timeSpecificDiscountEndTime",
                                          e.target.value
                                        );
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="timeSpecificDiscountDays">
                                    Days of Week
                                  </Label>
                                  <div className="flex flex-wrap gap-2">
                                    {[
                                      "Monday",
                                      "Tuesday",
                                      "Wednesday",
                                      "Thursday",
                                      "Friday",
                                      "Saturday",
                                      "Sunday",
                                    ].map((day) => (
                                      <div
                                        key={day}
                                        className="flex items-center space-x-2 border rounded-md p-2"
                                      >
                                        <Checkbox
                                          id={`day-${day}`}
                                          checked={timeSpecificDiscountDays.includes(
                                            day
                                          )}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              const newDays = [
                                                ...timeSpecificDiscountDays,
                                                day,
                                              ];
                                              setTimeSpecificDiscountDays(
                                                newDays
                                              );
                                              setValue(
                                                "timeSpecificDiscountDays",
                                                newDays
                                              );
                                            } else {
                                              const newDays =
                                                timeSpecificDiscountDays.filter(
                                                  (d) => d !== day
                                                );
                                              setTimeSpecificDiscountDays(
                                                newDays
                                              );
                                              setValue(
                                                "timeSpecificDiscountDays",
                                                newDays
                                              );
                                            }
                                          }}
                                        />
                                        <Label htmlFor={`day-${day}`}>
                                          {day}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="timeSpecificDiscountPercentage">
                                    Discount Percentage (Optional)
                                  </Label>
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      id="timeSpecificDiscountPercentage"
                                      type="number"
                                      min="1"
                                      max="100"
                                      value={timeSpecificDiscountPercentage}
                                      onChange={(e) => {
                                        const value = Number(e.target.value);
                                        if (value >= 1 && value <= 100) {
                                          setTimeSpecificDiscountPercentage(
                                            value
                                          );
                                          setValue(
                                            "timeSpecificDiscountPercentage",
                                            value
                                          );
                                        }
                                      }}
                                      className="w-24"
                                    />
                                    <Percent className="h-4 w-4" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Child Discount */}
                          <div className="space-y-4 border-l-2 border-green-200 pl-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="childDiscountEnabled"
                                checked={childDiscountEnabled}
                                onCheckedChange={(checked) => {
                                  setChildDiscountEnabled(!!checked);
                                  setValue("childDiscountEnabled", !!checked);
                                }}
                              />
                              <Label
                                htmlFor="childDiscountEnabled"
                                className="font-medium"
                              >
                                Child Discount (Under 12)
                              </Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      Apply discount for children under 12 years
                                      old
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>

                            {childDiscountEnabled && (
                              <div className="pl-6 space-y-2">
                                <Label htmlFor="childDiscountPercentage">
                                  Discount Percentage (Optional)
                                </Label>
                                <div className="flex items-center space-x-2">
                                  <Input
                                    id="childDiscountPercentage"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={childDiscountPercentage}
                                    onChange={(e) => {
                                      const value = Number(e.target.value);
                                      if (value >= 1 && value <= 100) {
                                        setChildDiscountPercentage(value);
                                        setValue(
                                          "childDiscountPercentage",
                                          value
                                        );
                                      }
                                    }}
                                    className="w-24"
                                  />
                                  <Percent className="h-4 w-4" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Discount Summary */}
                        <div className="mt-6">
                          <div className="bg-slate-50 rounded-md p-4 space-y-3">
                            <h3 className="font-medium text-md">
                              Total Discount Summary
                            </h3>

                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                Original Price:
                              </span>
                              <span className="font-medium">
                                {currencies.find(
                                  (c: Currency) => c.code === selectedCurrency
                                )?.symbol || ""}
                                {originalPrice.toFixed(2)} {selectedCurrency}
                              </span>
                            </div>

                            {/* Regular discount */}
                            {hasDiscount && discountPercentage > 0 && (
                              <div className="flex justify-between items-center">
                                <span>
                                  Regular Discount ({discountPercentage}%):
                                </span>
                                <span className="text-red-500">
                                  -
                                  {currencies.find(
                                    (c: Currency) => c.code === selectedCurrency
                                  )?.symbol || ""}
                                  {(
                                    (originalPrice * discountPercentage) /
                                    100
                                  ).toFixed(2)}{" "}
                                  {selectedCurrency}
                                </span>
                              </div>
                            )}

                            {/* Group discount */}
                            {groupDiscountEnabled &&
                              groupDiscountPercentage > 0 && (
                                <div className="flex justify-between items-center">
                                  <span>
                                    Group Discount ({groupDiscountPercentage}%)
                                    - {groupDiscountMinPeople}+ people:
                                  </span>
                                  <span className="text-red-500">
                                    -
                                    {currencies.find(
                                      (c: Currency) =>
                                        c.code === selectedCurrency
                                    )?.symbol || ""}
                                    {(
                                      (originalPrice *
                                        groupDiscountPercentage) /
                                      100
                                    ).toFixed(2)}{" "}
                                    {selectedCurrency}
                                  </span>
                                </div>
                              )}

                            {/* Time-specific discount */}
                            {timeSpecificDiscountEnabled &&
                              timeSpecificDiscountPercentage > 0 && (
                                <div className="flex justify-between items-center">
                                  <span>
                                    Time Discount (
                                    {timeSpecificDiscountPercentage}%):
                                  </span>
                                  <span className="text-red-500">
                                    -
                                    {currencies.find(
                                      (c: Currency) =>
                                        c.code === selectedCurrency
                                    )?.symbol || ""}
                                    {(
                                      (originalPrice *
                                        timeSpecificDiscountPercentage) /
                                      100
                                    ).toFixed(2)}{" "}
                                    {selectedCurrency}
                                  </span>
                                </div>
                              )}

                            {/* Child discount */}
                            {childDiscountEnabled &&
                              childDiscountPercentage > 0 && (
                                <div className="flex justify-between items-center">
                                  <span>
                                    Child Discount ({childDiscountPercentage}%):
                                  </span>
                                  <span className="text-red-500">
                                    -
                                    {currencies.find(
                                      (c: Currency) =>
                                        c.code === selectedCurrency
                                    )?.symbol || ""}
                                    {(
                                      (originalPrice *
                                        childDiscountPercentage) /
                                      100
                                    ).toFixed(2)}{" "}
                                    {selectedCurrency}
                                  </span>
                                </div>
                              )}

                            <Separator className="my-2" />

                            {/* Calculate the maximum possible discount */}
                            {(() => {
                              // Get all applicable discount percentages
                              const discounts = [];
                              if (hasDiscount && discountPercentage > 0) {
                                discounts.push(discountPercentage);
                              }
                              if (
                                groupDiscountEnabled &&
                                groupDiscountPercentage > 0
                              ) {
                                discounts.push(groupDiscountPercentage);
                              }
                              if (
                                timeSpecificDiscountEnabled &&
                                timeSpecificDiscountPercentage > 0
                              ) {
                                discounts.push(timeSpecificDiscountPercentage);
                              }
                              if (
                                childDiscountEnabled &&
                                childDiscountPercentage > 0
                              ) {
                                discounts.push(childDiscountPercentage);
                              }

                              // If no discounts are active, show original price
                              if (discounts.length === 0) {
                                return (
                                  <div className="flex justify-between items-center font-bold">
                                    <span>Price After Discount:</span>
                                    <span className="text-green-600">
                                      {currencies.find(
                                        (c: Currency) =>
                                          c.code === selectedCurrency
                                      )?.symbol || ""}
                                      {originalPrice.toFixed(2)}{" "}
                                      {selectedCurrency}
                                    </span>
                                  </div>
                                );
                              }

                              // Find the maximum discount
                              const maxDiscount = Math.max(...discounts);
                              const finalPrice =
                                originalPrice -
                                (originalPrice * maxDiscount) / 100;

                              return (
                                <>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="italic">
                                      Note: Only the highest discount will be
                                      applied
                                    </span>
                                    <span className="font-medium">
                                      {maxDiscount}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center font-bold">
                                    <span>Price After Discount:</span>
                                    <span className="text-green-600">
                                      {currencies.find(
                                        (c: Currency) =>
                                          c.code === selectedCurrency
                                      )?.symbol || ""}
                                      {finalPrice.toFixed(2)} {selectedCurrency}
                                    </span>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" {...register("capacity")} />
                {errors.capacity && (
                  <p className="text-xs text-destructive">
                    {errors.capacity.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  rows={3}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 flex items-center space-x-2">
                <Checkbox id="isAvailable" {...register("isAvailable")} />
                <Label htmlFor="isAvailable">Available for Booking</Label>
              </div>
            </div>

            {/* Trip Images */}
            <div className="space-y-2">
              <Label>Trip Images</Label>
              <div className="border border-dashed rounded-md p-4">
                <ImageUploadSection
                  label="Upload Images"
                  images={images}
                  setImages={setImages}
                  previewUrls={imagePreviews}
                  setPreviewUrls={setImagePreviews}
                  uploadError={uploadError}
                  setUploadError={setUploadError}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Trip"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
