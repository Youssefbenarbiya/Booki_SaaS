import { notFound } from "next/navigation"
import { CarForm } from "../new/car-form"
import { Locale } from "@/i18n/routing"
import { getCarById } from "@/actions/cars/carActions"

interface CarEditPageProps {
  params: {
    id: string
    locale: Locale
  }
}

export default async function CarEditPage({ params }: CarEditPageProps) {
  const { id: paramId, locale } = params

  const id = Number(paramId)

  if (isNaN(id)) {
    notFound()
  }

  const { car } = await getCarById(id).catch(() => ({ car: null }))

  if (!car) {
    notFound()
  }

  // Convert string prices to numbers and ensure proper type conversion for CarType
  const carWithNumberPrices = {
    ...car,
    originalPrice: Number(car.originalPrice),
    discountPercentage: car.discountPercentage ?? undefined,
    priceAfterDiscount: car.priceAfterDiscount
      ? Number(car.priceAfterDiscount)
      : undefined,
    isAvailable: Boolean(car.isAvailable !== false), // Convert to boolean
    seats: car.seats || 4, // Ensure seats has a default value
    category: car.category || "", // Ensure category has a default value
    location: car.location || "", // Ensure location has a default value
    // Handle date fields properly
    createdAt: car.createdAt ? car.createdAt.toISOString() : undefined,
    updatedAt: car.updatedAt ? car.updatedAt.toISOString() : undefined,
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Edit Car</h2>
      <CarForm initialData={carWithNumberPrices} isEditing locale={locale} />
    </div>
  )
}
