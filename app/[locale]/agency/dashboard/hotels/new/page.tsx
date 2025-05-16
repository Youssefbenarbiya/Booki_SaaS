"use client";

import { useTransition, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hotelSchema, type HotelInput } from "@/lib/validations/hotelSchema";
import { useRouter, useParams } from "next/navigation";
import { createHotel } from "@/actions/hotels&rooms/hotelActions";
import { ImageUploadSection } from "@/components/ImageUploadSection";
import { fileToFormData } from "@/lib/utils";
import { uploadImages } from "@/actions/uploadActions";
import { Building, BedDouble, Plus, Trash2, MapPin, Info, Percent, DollarSign } from "lucide-react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

// Dynamically import the map component to avoid SSR issues with Leaflet
const LocationMapSelector = dynamic(
  () => import("@/components/LocationMapSelector"),
  { ssr: false }
);

// Available amenities for hotels and rooms
const HOTEL_AMENITIES = [
  "Free Parking",
  "Free Breakfast",
  "Swimming Pool",
  "Gym/Fitness Center",
  "Spa",
  "Air Conditioning",
  "Restaurant",
  "Pet Friendly",
];

const ROOM_AMENITIES = [
  "Air Conditioning",
  "TV",
  "Fridge",
  "Minibar",
  "Safe",
  "Bathtub",
  "Shower",
];

export default function NewHotelPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [isPending, startTransition] = useTransition();

  // Add advance payment state variables
  const [advancePaymentEnabled, setAdvancePaymentEnabled] = useState<boolean>(false);
  const [advancePaymentPercentage, setAdvancePaymentPercentage] = useState<number>(20);
  const [customAdvancePercentage, setCustomAdvancePercentage] = useState<boolean>(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HotelInput>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      amenities: [],
      rooms: [
        {
          amenities: [],
          capacity: 2,
          roomType: "double",
          pricePerNightAdult: 0,
          pricePerNightChild: 0,
          currency: "TND",
          availabilities: [],
          advancePaymentEnabled: false,
          advancePaymentPercentage: 20,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rooms",
  });

  // Get current values for latitude and longitude
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  // State for hotel images
  const [hotelImages, setHotelImages] = useState<File[]>([]);
  const [hotelImagePreviews, setHotelImagePreviews] = useState<string[]>([]);
  const [hotelUploadError, setHotelUploadError] = useState<string>("");

  // Initialize room images state with one empty array for the default room
  const [roomImages, setRoomImages] = useState<File[][]>([[]]);
  const [roomImagePreviews, setRoomImagePreviews] = useState<string[][]>([[]]);
  const [roomUploadErrors, setRoomUploadErrors] = useState<string[]>([""]);

  // Handle location selection
  const handleLocationSelected = (lat: number, lng: number) => {
    setValue("latitude", lat);
    setValue("longitude", lng);
    console.log(`Map location selected: ${lat}, ${lng}`);
  };

  async function onSubmit(data: HotelInput) {
    try {
      // Upload hotel images first
      let hotelImageUrls: string[] = [];
      if (hotelImages.length > 0) {
        try {
          hotelImageUrls = await Promise.all(
            hotelImages.map(async (file) => {
              const formData = await fileToFormData(file);
              return uploadImages(formData);
            })
          );
        } catch (error) {
          console.error("Error uploading hotel images:", error);
          setHotelUploadError("Failed to upload hotel images");
          return;
        }
      }

      // Upload room images
      const roomImageUrlsPromises = roomImages.map(async (roomImageArray) => {
        if (!Array.isArray(roomImageArray) || !roomImageArray.length) return [];

        try {
          return await Promise.all(
            roomImageArray.map(async (file) => {
              const formData = await fileToFormData(file);
              return uploadImages(formData);
            })
          );
        } catch (error) {
          console.error("Error uploading room images:", error);
          throw error;
        }
      });

      const roomImageUrls = await Promise.all(roomImageUrlsPromises);

      // Update rooms with advance payment settings
      const updatedRooms = data.rooms.map((room, index) => ({
        ...room,
        images: roomImageUrls[index] || [],
        // Make sure each room has the advance payment settings
        advancePaymentEnabled: room.advancePaymentEnabled || false,
        advancePaymentPercentage: room.advancePaymentEnabled 
          ? room.advancePaymentPercentage || 20
          : null,
      }));

      // Prepare final data with image URLs
      const formattedData = {
        ...data,
        status: "pending" as "pending" | "approved" | "rejected",
        images: hotelImageUrls,
        rooms: updatedRooms,
      };

      // Create hotel with all data
      await createHotel(formattedData);
      router.push(`/${locale}/agency/dashboard/hotels`);
      router.refresh();
    } catch (error) {
      console.error("Error creating hotel:", error);
      if (error instanceof Error) {
        setHotelUploadError(error.message);
      } else {
        setHotelUploadError("Failed to create hotel");
      }
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Hotel</h1>
          <p className="text-muted-foreground mt-2">
            Create a new hotel listing with rooms and amenities
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((data) => startTransition(() => onSubmit(data)))}
        className="space-y-8"
      >
        {/* Hotel Details Card */}
        <div className="rounded-lg border bg-card">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Building className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Hotel Details</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hotel Name</label>
                <Input type="text" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <Select
                  onValueChange={(value) => setValue("rating", parseInt(value))}
                  defaultValue={String(watch("rating") || "5")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={String(rating)}>
                        {rating} Star{rating !== 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input type="text" {...register("city")} />
                {errors.city && (
                  <p className="text-sm text-destructive">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input type="text" {...register("country")} />
                {errors.country && (
                  <p className="text-sm text-destructive">
                    {errors.country.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input type="text" {...register("address")} />
                {errors.address && (
                  <p className="text-sm text-destructive">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea {...register("description")} rows={4} />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Hotel Amenities */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Hotel Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {HOTEL_AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        value={amenity}
                        onCheckedChange={(checked) => {
                          const amenities = watch("amenities") || [];
                          if (checked) {
                            setValue("amenities", [...amenities, amenity]);
                          } else {
                            setValue(
                              "amenities",
                              amenities.filter((a) => a !== amenity)
                            );
                          }
                        }}
                      />
                      <label htmlFor={`amenity-${amenity}`} className="text-sm">
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Location Map section */}
              <div className="md:col-span-2 space-y-2 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5" />
                  <h3 className="text-lg font-medium">Hotel Location</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Select the exact location of your hotel on the map. You can
                  search for an address or click directly on the map.
                </p>
                <LocationMapSelector
                  initialLatitude={latitude}
                  initialLongitude={longitude}
                  onLocationSelected={handleLocationSelected}
                  height="400px"
                  enableSearch={true}
                />
                {errors.latitude || errors.longitude ? (
                  <p className="text-sm text-destructive">
                    Please select a valid location on the map
                  </p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <ImageUploadSection
                  label="Hotel Images"
                  images={hotelImages}
                  setImages={setHotelImages}
                  previewUrls={hotelImagePreviews}
                  setPreviewUrls={setHotelImagePreviews}
                  uploadError={hotelUploadError}
                  setUploadError={setHotelUploadError}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Section */}
        <div className="rounded-lg border bg-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BedDouble className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Rooms</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  append({
                    name: "",
                    description: "",
                    amenities: [],
                    images: [],
                    capacity: 2,
                    pricePerNightAdult: 0,
                    pricePerNightChild: 0,
                    currency: "TND",
                    roomType: "double",
                    advancePaymentEnabled: false,
                    advancePaymentPercentage: 20,
                  });
                  setRoomImages((prev) => [...prev, []]);
                  setRoomImagePreviews((prev) => [...prev, []]);
                  setRoomUploadErrors((prev) => [...prev, ""]);
                }}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Room
              </button>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border bg-card p-6 relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium">Room {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => {
                        remove(index);
                        setRoomImages((prev) => {
                          const newImages = [...prev];
                          newImages.splice(index, 1);
                          return newImages;
                        });
                        setRoomImagePreviews((prev) => {
                          const newPreviews = [...prev];
                          // Cleanup URLs before removing
                          newPreviews[index]?.forEach((url) =>
                            URL.revokeObjectURL(url)
                          );
                          newPreviews.splice(index, 1);
                          return newPreviews;
                        });
                        setRoomUploadErrors((prev) => {
                          const newErrors = [...prev];
                          newErrors.splice(index, 1);
                          return newErrors;
                        });
                      }}
                      className="btn btn-sm btn-error"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block font-medium">Room Name</label>
                      <Input type="text" {...register(`rooms.${index}.name`)} />
                      {errors.rooms?.[index]?.name && (
                        <p className="text-red-500">
                          {errors.rooms[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block font-medium">Room Type</label>
                      <Select
                        onValueChange={(value) =>
                          setValue(
                            `rooms.${index}.roomType`,
                            value as "single" | "double" | "suite" | "family"
                          )
                        }
                        defaultValue={watch(`rooms.${index}.roomType`)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="double">Double</SelectItem>
                          <SelectItem value="suite">Suite</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.rooms?.[index]?.roomType && (
                        <p className="text-red-500">
                          {errors.rooms[index]?.roomType?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block font-medium">Capacity</label>
                      <Input
                        type="number"
                        {...register(`rooms.${index}.capacity`, {
                          valueAsNumber: true,
                        })}
                      />
                      {errors.rooms?.[index]?.capacity && (
                        <p className="text-red-500">
                          {errors.rooms[index]?.capacity?.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium">
                          Price per Night (Adult)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`rooms.${index}.pricePerNightAdult`, {
                            valueAsNumber: true,
                          })}
                        />
                        {errors.rooms?.[index]?.pricePerNightAdult && (
                          <p className="text-red-500">
                            {errors.rooms[index]?.pricePerNightAdult?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block font-medium">
                          Price per Night (Child)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`rooms.${index}.pricePerNightChild`, {
                            valueAsNumber: true,
                          })}
                        />
                        {errors.rooms?.[index]?.pricePerNightChild && (
                          <p className="text-red-500">
                            {errors.rooms[index]?.pricePerNightChild?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Currency Selection */}
                    <div>
                      <label className="block font-medium">Currency</label>
                      <Select
                        onValueChange={(value) =>
                          setValue(`rooms.${index}.currency`, value)
                        }
                        defaultValue={watch(`rooms.${index}.currency`) || "TND"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TND">
                            TND (Tunisian Dinar)
                          </SelectItem>
                          <SelectItem value="USD">USD (US Dollar)</SelectItem>
                          <SelectItem value="EUR">EUR (Euro)</SelectItem>
                          <SelectItem value="GBP">
                            GBP (British Pound)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.rooms?.[index]?.currency && (
                        <p className="text-red-500">
                          {errors.rooms[index]?.currency?.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-medium">Description</label>
                      <Textarea
                        {...register(`rooms.${index}.description`)}
                        rows={2}
                      />
                      {errors.rooms?.[index]?.description && (
                        <p className="text-red-500">
                          {errors.rooms[index]?.description?.message}
                        </p>
                      )}
                    </div>

                    {/* Room Amenities */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">
                        Room Amenities
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {ROOM_AMENITIES.map((amenity) => (
                          <div
                            key={`${index}-${amenity}`}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`room-${index}-amenity-${amenity}`}
                              value={amenity}
                              onCheckedChange={(checked) => {
                                const amenities =
                                  watch(`rooms.${index}.amenities`) || [];
                                if (checked) {
                                  setValue(`rooms.${index}.amenities`, [
                                    ...amenities,
                                    amenity,
                                  ]);
                                } else {
                                  setValue(
                                    `rooms.${index}.amenities`,
                                    amenities.filter((a) => a !== amenity)
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={`room-${index}-amenity-${amenity}`}
                              className="text-sm"
                            >
                              {amenity}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Advance Payment Option */}
                    <div className="md:col-span-2 mt-4">
                      <Card className="border-2 border-muted">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <DollarSign className="h-5 w-5 mr-1" />
                            Payment Options
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`room-${index}-advancePaymentEnabled`}
                              checked={watch(`rooms.${index}.advancePaymentEnabled`)}
                              onCheckedChange={(checked) => {
                                setValue(`rooms.${index}.advancePaymentEnabled`, !!checked);
                                if (!checked) {
                                  setValue(`rooms.${index}.advancePaymentPercentage`, undefined);
                                }
                              }}
                            />
                            <Label
                              htmlFor={`room-${index}-advancePaymentEnabled`}
                              className="font-medium"
                            >
                              Allow Partial Advance Payment
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Customers can pay a percentage in advance and the rest in cash at the agency</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          {watch(`rooms.${index}.advancePaymentEnabled`) && (
                            <div className="space-y-4 pl-6 border-l-2 border-muted">
                              <div className="space-y-3">
                                <Label>Advance Payment Percentage</Label>
                                <RadioGroup
                                  value={watch(`rooms.${index}.advancePaymentPercentage`)?.toString() || "20"}
                                  onValueChange={(value) => {
                                    const percentage = Number.parseInt(value, 10);
                                    if (!isNaN(percentage)) {
                                      setValue(`rooms.${index}.advancePaymentPercentage`, percentage);
                                    }
                                  }}
                                  className="flex flex-wrap gap-2"
                                >
                                  <div className="flex items-center space-x-2 border rounded-md p-2">
                                    <RadioGroupItem value="20" id={`p20-${index}`} />
                                    <Label htmlFor={`p20-${index}`}>20%</Label>
                                  </div>
                                  <div className="flex items-center space-x-2 border rounded-md p-2">
                                    <RadioGroupItem value="30" id={`p30-${index}`} />
                                    <Label htmlFor={`p30-${index}`}>30%</Label>
                                  </div>
                                  <div className="flex items-center space-x-2 border rounded-md p-2">
                                    <RadioGroupItem value="50" id={`p50-${index}`} />
                                    <Label htmlFor={`p50-${index}`}>50%</Label>
                                  </div>
                                  <div className="flex items-center space-x-2 border rounded-md p-2">
                                    <RadioGroupItem value="custom" id={`pcustom-${index}`} />
                                    <Label htmlFor={`pcustom-${index}`}>Custom</Label>
                                  </div>
                                </RadioGroup>

                                {watch(`rooms.${index}.advancePaymentPercentage`)?.toString() === "custom" && (
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Input
                                      type="number"
                                      min="1"
                                      max="99"
                                      onChange={(e) => {
                                        const value = Number.parseInt(e.target.value, 10);
                                        if (!isNaN(value) && value >= 1 && value <= 99) {
                                          setValue(`rooms.${index}.advancePaymentPercentage`, value);
                                        }
                                      }}
                                      className="w-24"
                                    />
                                    <Percent className="h-4 w-4" />
                                  </div>
                                )}

                                <div className="bg-muted p-4 rounded-md space-y-2 mt-4">
                                  <div className="text-sm text-muted-foreground">
                                    <p>With advance payment enabled, customers will have the option to pay 
                                    {watch(`rooms.${index}.advancePaymentPercentage`)}% of the total price online
                                    and the remaining amount in cash at the hotel.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Room Images */}
                    <div className="md:col-span-2">
                      <ImageUploadSection
                        label={`Room ${index + 1} Images`}
                        images={roomImages[index] || []}
                        setImages={(action) => {
                          setRoomImages((prev) => {
                            const newRoomImages = [...prev];
                            const current = newRoomImages[index] || [];
                            newRoomImages[index] =
                              typeof action === "function"
                                ? action(current)
                                : action;
                            return newRoomImages;
                          });
                        }}
                        previewUrls={roomImagePreviews[index] || []}
                        setPreviewUrls={(action) => {
                          setRoomImagePreviews((prev) => {
                            const newRoomPreviews = [...prev];
                            const current = newRoomPreviews[index] || [];
                            newRoomPreviews[index] =
                              typeof action === "function"
                                ? action(current)
                                : action;
                            return newRoomPreviews;
                          });
                        }}
                        uploadError={roomUploadErrors[index] || ""}
                        setUploadError={(error) => {
                          const newErrors = [...roomUploadErrors];
                          newErrors[index] = error;
                          setRoomUploadErrors(newErrors);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating...
              </>
            ) : (
              "Create Hotel"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
