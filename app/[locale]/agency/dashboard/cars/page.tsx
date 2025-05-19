import { Button } from "@/components/ui/button"
import { CarsTable } from "./cars-table"
import { columns } from "./columns"
import Link from "next/link"
import { Plus } from "lucide-react"
import { getCars } from "@/actions/cars/carActions"
import { Locale } from "@/i18n/routing"

interface CarsPageProps {
  params: Promise<{
    locale: Locale
  }>
}

export default async function CarsPage({ params }: CarsPageProps) {
  const { locale } = await params
  const { cars } = await getCars()

  // Transform the cars data so that price fields are numbers
  const formattedCars = cars.map((car) => ({
    ...car,
    agencyId: car.agencyId || "",
    originalPrice: Number(car.originalPrice),
    priceAfterDiscount: car.priceAfterDiscount
      ? Number(car.priceAfterDiscount)
      : undefined,
    discountPercentage:
      car.discountPercentage !== null ? car.discountPercentage : undefined,
    isAvailable: car.isAvailable ?? false,
    createdAt: car.createdAt || undefined,
    updatedAt: car.updatedAt || undefined,
    advancePaymentEnabled: car.advancePaymentEnabled || undefined,
    advancePaymentPercentage: car.advancePaymentPercentage || undefined,
  }))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Cars Management</h2>
        <Button asChild>
          <Link href={`/${locale}/agency/dashboard/cars/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Car
          </Link>
        </Button>
      </div>

      <CarsTable columns={columns} data={formattedCars} />
    </div>
  )
}
