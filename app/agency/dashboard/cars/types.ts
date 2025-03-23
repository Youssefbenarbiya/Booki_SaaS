export interface CarType {
  id: number
  model: string
  brand: string
  year: number
  plateNumber: string
  color: string
  originalPrice: number
  discountPercentage?: number | null
  priceAfterDiscount?: number | null
  images?: string[]
  isAvailable: boolean | null
  createdAt: Date | null
  updatedAt: Date | null
}

export type CarFormValues = {
  model: string
  brand: string
  year: number
  plateNumber: string
  color: string
  originalPrice: number
  discountPercentage?: number | null
  priceAfterDiscount?: number | null
  isAvailable: boolean
  images?: string[]
}
