/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Image from "next/image";
import { useTransition, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ImageUploadSection } from "@/components/ImageUploadSection";
import { fileToFormData } from "@/lib/utils";
import { uploadImages } from "@/actions/uploadActions";
import { type TripInput, updateTrip } from "@/actions/trips/tripActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Percent, DollarSign, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Import the useCurrency hook from the correct location
import { useCurrency } from "@/lib/contexts/CurrencyContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Locale } from "@/i18n/routing";

// Define currency type to fix linting issues
type Currency = {
  code: string;
  symbol: string;
  name: string;
};

// Define the currencies array locally since it's not exported from the context
const currencies: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "TND", symbol: "DT", name: "Tunisian Dinar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
];

// Define custom interface instead of extending TripInput to avoid type issues
interface ExtendedTripInput {
  name: string;
  description: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  originalPrice: number;
  discountPercentage?: number;
  priceAfterDiscount?: number;
  capacity: number;
  isAvailable: boolean;
  images: string[];
  currency: string;
  // Add all discount types
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
  activities?: {
    activityName: string;
    description?: string;
    scheduledDate?: Date;
  }[];
}

interface EditTripFormProps {
  trip: {
    id: number;
    name: string;
    description: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    originalPrice: number;
    discountPercentage?: number;
    priceAfterDiscount?: number;
    capacity: number;
    isAvailable: boolean;
    currency?: string;
    images: Array<{
      id: number;
      imageUrl: string;
    }>;
    activities: Array<{
      id: number;
      activityName: string;
      description: string;
      scheduledDate: Date | null;
    }>;
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
  };
  locale: Locale;
}

export default function EditTripForm({ trip, locale }: EditTripFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Get the currency context
  const { currency: contextCurrency, setCurrency } = useCurrency();

  // Use the trip's currency if available, otherwise use the context currency
  const tripCurrency = trip.currency || contextCurrency || "USD";

  // Format dates for input fields
  const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  // Image states
  const [images, setImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string>("");
  const [existingImages, setExistingImages] = useState<
    Array<{ id: number; imageUrl: string }>
  >(trip.images);

  // Date states
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(trip.startDate)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(trip.endDate)
  );

  // Determine if trip has any type of discount
  const hasExistingDiscount =
    (!!trip.discountPercentage && !!trip.priceAfterDiscount) ||
    trip.groupDiscountEnabled === true ||
    trip.timeSpecificDiscountEnabled === true ||
    trip.childDiscountEnabled === true;

  // Discount states
  const [hasDiscount, setHasDiscount] = useState<boolean>(hasExistingDiscount);
  const [discountPercentage, setDiscountPercentage] = useState<number>(
    trip.discountPercentage || 0
  );
  const [originalPrice, setOriginalPrice] = useState<number>(
    trip.originalPrice
  );
  const [priceAfterDiscount, setPriceAfterDiscount] = useState<number>(
    trip.priceAfterDiscount || trip.originalPrice
  );
  const [customPercentage, setCustomPercentage] = useState<boolean>(
    !!trip.discountPercentage && ![10, 20, 30].includes(trip.discountPercentage)
  );

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

  // --- keep track of the selected currency ---
  const [selectedCurrency, setSelectedCurrency] =
    useState<string>(tripCurrency);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
    reset,
  } = useForm<ExtendedTripInput>({
    defaultValues: {
      name: trip.name,
      description: trip.description,
      destination: trip.destination,
      startDate: new Date(trip.startDate),
      endDate: new Date(trip.endDate),
      originalPrice: trip.originalPrice,
      discountPercentage: trip.discountPercentage,
      priceAfterDiscount: trip.priceAfterDiscount,
      capacity: trip.capacity,
      isAvailable: trip.isAvailable,
      currency: tripCurrency,
      groupDiscountEnabled: trip.groupDiscountEnabled,
      groupDiscountMinPeople: trip.groupDiscountMinPeople || 2,
      groupDiscountPercentage: trip.groupDiscountPercentage || 10,
      timeSpecificDiscountEnabled: trip.timeSpecificDiscountEnabled,
      timeSpecificDiscountStartTime:
        trip.timeSpecificDiscountStartTime || "08:00",
      timeSpecificDiscountEndTime: trip.timeSpecificDiscountEndTime || "10:00",
      timeSpecificDiscountDays: trip.timeSpecificDiscountDays || ["Monday"],
      timeSpecificDiscountPercentage: trip.timeSpecificDiscountPercentage || 15,
      childDiscountEnabled: trip.childDiscountEnabled,
      childDiscountPercentage: trip.childDiscountPercentage || 25,
      activities: trip.activities.map((activity) => ({
        activityName: activity.activityName,
        description: activity.description || undefined,
        scheduledDate: activity.scheduledDate || undefined,
      })),
    },
  });

  // Watch original price to update discount calculations
  const watchedOriginalPrice = watch("originalPrice");
  // Also watch currency for dynamic symbol changes
  const watchedCurrency = watch("currency");

  // Initialize form with correct values when component mounts
  useEffect(() => {
    // Correctly initialize discount states based on trip data
    setGroupDiscountEnabled(trip.groupDiscountEnabled ?? false);
    setGroupDiscountMinPeople(trip.groupDiscountMinPeople || 2);
    setGroupDiscountPercentage(trip.groupDiscountPercentage || 10);

    setTimeSpecificDiscountEnabled(trip.timeSpecificDiscountEnabled ?? false);
    setTimeSpecificDiscountStartTime(
      trip.timeSpecificDiscountStartTime || "08:00"
    );
    setTimeSpecificDiscountEndTime(trip.timeSpecificDiscountEndTime || "10:00");
    setTimeSpecificDiscountDays(trip.timeSpecificDiscountDays || ["Monday"]);
    setTimeSpecificDiscountPercentage(
      trip.timeSpecificDiscountPercentage || 15
    );

    setChildDiscountEnabled(trip.childDiscountEnabled ?? false);
    setChildDiscountPercentage(trip.childDiscountPercentage || 25);

    // Form reset with discount states
    reset({
      name: trip.name,
      description: trip.description,
      destination: trip.destination,
      startDate: new Date(trip.startDate),
      endDate: new Date(trip.endDate),
      originalPrice: trip.originalPrice,
      discountPercentage: trip.discountPercentage,
      priceAfterDiscount: trip.priceAfterDiscount,
      capacity: trip.capacity,
      isAvailable: trip.isAvailable,
      currency: tripCurrency,
      // Initialize with existing trip data or defaults
      groupDiscountEnabled: trip.groupDiscountEnabled ?? false,
      groupDiscountMinPeople: trip.groupDiscountMinPeople || 2,
      groupDiscountPercentage: trip.groupDiscountPercentage || 10,
      timeSpecificDiscountEnabled: trip.timeSpecificDiscountEnabled ?? false,
      timeSpecificDiscountStartTime:
        trip.timeSpecificDiscountStartTime || "08:00",
      timeSpecificDiscountEndTime: trip.timeSpecificDiscountEndTime || "10:00",
      timeSpecificDiscountDays: trip.timeSpecificDiscountDays || ["Monday"],
      timeSpecificDiscountPercentage: trip.timeSpecificDiscountPercentage || 15,
      childDiscountEnabled: trip.childDiscountEnabled ?? false,
      childDiscountPercentage: trip.childDiscountPercentage || 25,
      activities: trip.activities.map((activity) => ({
        activityName: activity.activityName,
        description: activity.description || undefined,
        scheduledDate: activity.scheduledDate || undefined,
      })),
    });

    // Update date states
    setStartDate(new Date(trip.startDate));
    setEndDate(new Date(trip.endDate));

    // Set UI states
    setSelectedCurrency(tripCurrency);
    if (hasExistingDiscount) {
      setHasDiscount(true);
      setDiscountPercentage(trip.discountPercentage || 0);
      setOriginalPrice(trip.originalPrice);
      setPriceAfterDiscount(trip.priceAfterDiscount || originalPrice);
      setCustomPercentage(![10, 20, 30].includes(trip.discountPercentage || 0));
    } else {
      setHasDiscount(false);
      setDiscountPercentage(0);
      setOriginalPrice(trip.originalPrice);
      setPriceAfterDiscount(trip.originalPrice);
    }

    // Debug log to see what discount data is coming from the database
    console.log("Trip discount data:", {
      groupDiscountEnabled: trip.groupDiscountEnabled,
      groupDiscountMinPeople: trip.groupDiscountMinPeople,
      groupDiscountPercentage: trip.groupDiscountPercentage,
      timeSpecificDiscountEnabled: trip.timeSpecificDiscountEnabled,
      timeSpecificDiscountDays: trip.timeSpecificDiscountDays,
      childDiscountEnabled: trip.childDiscountEnabled,
      childDiscountPercentage: trip.childDiscountPercentage,
    });
  }, [trip, hasExistingDiscount, reset, tripCurrency, originalPrice]);

  // Update original price when price changes
  useEffect(() => {
    if (watchedOriginalPrice !== undefined) {
      const price = Number(watchedOriginalPrice);
      setOriginalPrice(price);
      if (hasDiscount && discountPercentage) {
        calculatePriceAfterDiscount(price, discountPercentage);
      } else {
        setPriceAfterDiscount(price);
      }
    }
  }, [watchedOriginalPrice, discountPercentage, hasDiscount]);

  // Calculate price after discount
  const calculatePriceAfterDiscount = (price: number, percentage: number) => {
    if (!price || !percentage) {
      setPriceAfterDiscount(price || 0);
      setValue("priceAfterDiscount", undefined);
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

  // Handle deletion of existing images
  const handleDeleteExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(data: ExtendedTripInput) {
    try {
      // Gather existing image URLs
      let imageUrls = existingImages.map((img) => img.imageUrl);

      // Upload new images
      if (images.length > 0) {
        try {
          const newUrls = await Promise.all(
            images.map(async (file) => {
              const formData = await fileToFormData(file);
              return uploadImages(formData);
            })
          );
          imageUrls = [...imageUrls, ...newUrls];
        } catch (error) {
          console.error("Error uploading images:", error);
          setUploadError("Failed to upload images");
          return;
        }
      }

      // Calculate price after discount if applicable
      let finalPriceAfterDiscount = undefined;
      if (hasDiscount && data.discountPercentage) {
        finalPriceAfterDiscount = calculatePriceAfterDiscount(
          Number(data.originalPrice),
          data.discountPercentage
        );
      }

      // When currency changes, update the context
      if (data.currency && data.currency !== contextCurrency) {
        setCurrency(data.currency);
      }

      // Automatically set isAvailable to false if capacity is 0
      const isAvailable =
        Number(data.capacity) === 0 ? false : data.isAvailable;

      // Ensure discount values are passed to the database
      console.log("Submitting discount data:", {
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

      // Build final data for update
      const formattedData: TripInput = {
        ...data,
        originalPrice: Number(data.originalPrice),
        discountPercentage:
          hasDiscount && data.discountPercentage
            ? data.discountPercentage
            : undefined,
        priceAfterDiscount:
          hasDiscount && finalPriceAfterDiscount
            ? finalPriceAfterDiscount
            : undefined,
        images: imageUrls,
        // Make sure dates are Date objects
        startDate: startDate || new Date(),
        endDate: endDate || new Date(),
        // Ensure we store the currency
        currency: data.currency || "USD",
        // Use the computed isAvailable value
        isAvailable: isAvailable,
        // Add new discount types - use state values directly to ensure they're correct
        groupDiscountEnabled: groupDiscountEnabled,
        groupDiscountMinPeople: groupDiscountEnabled
          ? groupDiscountMinPeople
          : undefined,
        groupDiscountPercentage: groupDiscountEnabled
          ? groupDiscountPercentage
          : undefined,

        timeSpecificDiscountEnabled: timeSpecificDiscountEnabled,
        timeSpecificDiscountStartTime: timeSpecificDiscountEnabled
          ? timeSpecificDiscountStartTime
          : undefined,
        timeSpecificDiscountEndTime: timeSpecificDiscountEnabled
          ? timeSpecificDiscountEndTime
          : undefined,
        timeSpecificDiscountDays: timeSpecificDiscountEnabled
          ? timeSpecificDiscountDays
          : undefined,
        timeSpecificDiscountPercentage: timeSpecificDiscountEnabled
          ? timeSpecificDiscountPercentage
          : undefined,

        childDiscountEnabled: childDiscountEnabled,
        childDiscountPercentage: childDiscountEnabled
          ? childDiscountPercentage
          : undefined,
      };

      // Run your update action
      await updateTrip(trip.id, formattedData);
      router.push(`/${locale}/agency/dashboard/trips`);
      router.refresh();
    } catch (error) {
      console.error("Error updating trip:", error);
    }
  }

  // Helper to get currency symbol for the current selection
  const currentCurrencySymbol =
    currencies.find((c: Currency) => c.code === watchedCurrency)?.symbol || "$";

  return (
    <div className="max-w-5xl mx-auto my-8 px-4">
      <Card>
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
                        before: startDate ? startDate : new Date(),
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
                      {hasExistingDiscount && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Percent className="h-3 w-3 mr-1" />
                                Discount Applied
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                This trip has a {trip.discountPercentage}%
                                discount applied
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Price & Currency Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Original Price */}
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="originalPrice">Original Price</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>The base price before any discounts</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="relative">
                          {/* We can keep a currency symbol here or remove it 
                              in favor of the currency dropdown. For clarity,
                              let's remove the fixed DollarSign on the left. 
                              We'll show it dynamically in the discount summary below. */}
                          <Input
                            id="originalPrice"
                            type="number"
                            step="0.01"
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

                      {/* Currency Selector */}
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Controller
                          name="currency"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              defaultValue={tripCurrency}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedCurrency(value);
                                setValue("currency", value);
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue>
                                  {field.value ? (
                                    <>
                                      {currencies.find(
                                        (c) => c.code === field.value
                                      )?.symbol || ""}{" "}
                                      {field.value}
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
                          )}
                        />
                      </div>
                    </div>

                    {/* Apply Discount Checkbox */}
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
                            setPriceAfterDiscount(originalPrice);
                            setCustomPercentage(false);
                          } else if (hasExistingDiscount) {
                            // If discount already existed, restore
                            setDiscountPercentage(trip.discountPercentage || 0);
                            setValue(
                              "discountPercentage",
                              trip.discountPercentage
                            );
                            setPriceAfterDiscount(
                              trip.priceAfterDiscount || originalPrice
                            );
                            setValue(
                              "priceAfterDiscount",
                              trip.priceAfterDiscount
                            );
                            setCustomPercentage(
                              ![10, 20, 30].includes(
                                trip.discountPercentage || 0
                              )
                            );
                          }
                        }}
                      />
                      <Label htmlFor="hasDiscount" className="font-medium">
                        Apply Discount
                      </Label>
                      {hasExistingDiscount && !hasDiscount && (
                        <span className="text-xs text-amber-600">
                          Warning: Unchecking will remove the existing discount
                        </span>
                      )}
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
                            {/* Original Price */}
                            <div className="flex justify-between">
                              <span>Original Price:</span>
                              <span>
                                {currentCurrencySymbol}
                                {originalPrice.toFixed(2)}
                              </span>
                            </div>
                            {/* Discount */}
                            <div className="flex justify-between">
                              <span>Discount ({discountPercentage}%):</span>
                              <span className="text-red-500">
                                -{currentCurrencySymbol}
                                {(
                                  (originalPrice * discountPercentage) /
                                  100
                                ).toFixed(2)}
                              </span>
                            </div>
                            <Separator className="my-2" />
                            {/* Price After Discount */}
                            <div className="flex justify-between font-bold">
                              <span>Price After Discount:</span>
                              <span className="text-green-600">
                                {currentCurrencySymbol}
                                {priceAfterDiscount.toFixed(2)}
                              </span>
                            </div>
                            <input
                              type="hidden"
                              {...register("priceAfterDiscount")}
                              value={priceAfterDiscount}
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
                                  {currentCurrencySymbol}
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
                                    -{currentCurrencySymbol}
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
                                      Group Discount ({groupDiscountPercentage}
                                      %) - {groupDiscountMinPeople}+ people:
                                    </span>
                                    <span className="text-red-500">
                                      -{currentCurrencySymbol}
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
                                      -{currentCurrencySymbol}
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
                                      Child Discount ({childDiscountPercentage}
                                      %):
                                    </span>
                                    <span className="text-red-500">
                                      -{currentCurrencySymbol}
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
                                  discounts.push(
                                    timeSpecificDiscountPercentage
                                  );
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
                                        {currentCurrencySymbol}
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
                                        {currentCurrencySymbol}
                                        {finalPrice.toFixed(2)}{" "}
                                        {selectedCurrency}
                                      </span>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
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
                <Controller
                  name="isAvailable"
                  control={control}
                  defaultValue={trip.isAvailable}
                  render={({ field }) => (
                    <Checkbox
                      id="isAvailable"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="isAvailable">Available for Booking</Label>
              </div>
            </div>

            {/* Trip Images */}
            <div className="space-y-4">
              {/* Display existing images */}
              {existingImages.length > 0 && (
                <div className="space-y-3">
                  <Label>Current Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((img, index) => (
                      <div
                        key={`existing-${img.id}`}
                        className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden"
                      >
                        <Image
                          src={img.imageUrl || "/placeholder.svg"}
                          alt={`Trip image ${index + 1}`}
                          className="object-cover"
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => handleDeleteExistingImage(index)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload new images section */}
              <div className="border border-dashed rounded-md p-4">
                <ImageUploadSection
                  label="Add New Images"
                  images={images}
                  setImages={setImages}
                  previewUrls={newImagePreviews}
                  setPreviewUrls={setNewImagePreviews}
                  uploadError={uploadError}
                  setUploadError={setUploadError}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update Trip"}
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
