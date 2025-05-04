/* eslint-disable @typescript-eslint/no-explicit-any */
export type CarType = {
  id: number;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  color: string;
  originalPrice: string | number;
  discountPercentage?: number | null;
  priceAfterDiscount?: string | number | null;
  isAvailable: boolean;
  status?: string;
  rejectionReason?: string | null;
  images: string[] | { imageUrl: string }[];
  seats: number;
  category: string;
  currency?: string;
  location: string;
};

export type CarFormValues = Omit<
  CarType,
  "id" | "createdAt" | "updatedAt" | "bookings"
>;
