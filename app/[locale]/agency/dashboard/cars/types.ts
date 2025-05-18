/* eslint-disable @typescript-eslint/no-explicit-any */

export type CarType = {
  id: number;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  color: string;
  originalPrice: number;
  discountPercentage?: number | null;
  priceAfterDiscount?: number | null;
  isAvailable: boolean;
  images: string[] | { imageUrl: string }[];
  agencyId: string;
  currency?: string;
  seats?: number;
  category?: string;
  location?: string;
  status?: string;
  bookings?: any[];
  createdAt?: Date;
  updatedAt?: Date;
  advancePaymentEnabled?: boolean;
  advancePaymentPercentage?: number;
};

export type CarFormValues = {
  model: string
  brand: string
  year: number
  plateNumber: string
  color: string
  originalPrice: number
  discountPercentage?: number
  priceAfterDiscount?: number
  isAvailable: boolean
  images: string[] | { imageUrl: string }[]
  currency?: string
  seats?: number
  category?: string
  location?: string
  status?: string
  advancePaymentEnabled?: boolean
  advancePaymentPercentage?: number
}
