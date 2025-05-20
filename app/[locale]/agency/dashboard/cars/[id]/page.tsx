import { notFound } from "next/navigation"
import { CarForm } from "../new/car-form"
import { Locale } from "@/i18n/routing"
import { getCarById } from "@/actions/cars/carActions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

interface CarEditPageProps {
  params: Promise<{
    id: string
    locale: Locale
  }>
}

export default async function CarEditPage({ params }: CarEditPageProps) {
  const { id: paramId, locale } = await params

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
    advancePaymentEnabled: car.advancePaymentEnabled ?? undefined, // Convert null to undefined
    advancePaymentPercentage: car.advancePaymentPercentage ?? undefined, // Convert null to undefined
    seats: car.seats || 4, // Ensure seats has a default value
    category: car.category || "", // Ensure category has a default value
    location: car.location || "", // Ensure location has a default value
    // Handle agencyId to ensure it's not null
    agencyId: car.agencyId || "",
    // Convert null dates to undefined to match CarType
    createdAt: car.createdAt || undefined, // Convert null to undefined
    updatedAt: car.updatedAt || undefined, // Convert null to undefined
    // Ensure other potential nullable fields match CarType expectations
    images: car.images || [],
    agency: car.agency || null,
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Edit Car</h2>
        <Link href={`/${locale}/agency/dashboard/cars/${id}/details`}>
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        </Link>
      </div>
      <CarForm initialData={carWithNumberPrices} isEditing locale={locale} />
    </div>
  )
}
