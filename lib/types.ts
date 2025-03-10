export interface Trip {
  id: number
  name: string
  description: string | null
  destination: string
  startDate: string
  endDate: string
  price: string
  capacity: number
  isAvailable: boolean
  images: Array<{
    id: number
    imageUrl: string
  }>
}

export interface Room {
  id: string
  name: string
  description: string
  capacity: number
  pricePerNightAdult: string
  pricePerNightChild: string
  roomType: string
  hotel: {
    id: string
    name: string
    address: string
    images: string[]
  }
}

export interface Car {
  id: number
  model: string
  brand: string
  year: number
  plateNumber: string
  color: string
  price: number
  images: string[]
}
