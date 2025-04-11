export interface CarType {
  id: number
  model: string
  brand: string
  year: number
  plateNumber: string
  color: string
  originalPrice: number
  discountPercentage?: number
  priceAfterDiscount?: number
  isAvailable: boolean
  images: string[]
  status?: string
  createdAt?: string
  updatedAt?: string
  seats: number
  category: string
  location: string
}

export type CarFormValues = Omit<CarType, "id" | "createdAt" | "updatedAt" | "status">
