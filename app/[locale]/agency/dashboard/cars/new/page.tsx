import { CarForm } from "./car-form"
import { Locale } from "@/i18n/routing"

interface NewCarPageProps {
  params: Promise<{
    locale: Locale
  }>
}

export default async function NewCarPage({ params }: NewCarPageProps) {
  const { locale } = await params

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Add New Car</h2>
      <CarForm locale={locale} />
    </div>
  )
}
