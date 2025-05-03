/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CarType {
  id: number;
  model: string;
  brand: string;
  year: number;
  plateNumber: string;
  color: string;
  originalPrice: number;
  currency?: string;
  discountPercentage?: number;
  priceAfterDiscount?: number;
  isAvailable: boolean;
  images: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  seats: number;
  category: string;
  location: string;
  bookings?: any[];
}

export type CarFormValues = Omit<
  CarType,
  "id" | "createdAt" | "updatedAt" | "bookings"
>;
