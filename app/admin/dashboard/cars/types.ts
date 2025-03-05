export interface CarType {
  id: number
  model: string
  brand: string
  year: number
  plateNumber: string
  color: string
  price: number
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
  price: number
  isAvailable: boolean
  images?: string[]
}
