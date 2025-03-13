// app/home/page.tsx
import { Footer } from "@/components/footer/footer"
import { NavigationTabs } from "./navigation-tabs"
import { SearchForm } from "./search-form"
import TopVacations from "@/components/home/topVacations"
import TopDestinations from "@/components/home/topDestinations"
import { SearchResults } from "./search-results"
interface SearchParams {
  type?: string
  destination?: string
  startDate?: string
  city?: string
  checkIn?: string
  checkOut?: string
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolvedParams = await searchParams
  const searchType = resolvedParams.type || "hotels"

  return (
    <main>
      <div
        className="min-h-[600px] relative bg-cover bg-center flex items-center"
        style={{
          backgroundImage: "url('/hero-bg.jpg')",
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              <div className="absolute -top-10 left-0">
                <NavigationTabs activeTab={searchType} />
              </div>
              <SearchForm type={searchType as "trips" | "hotels" | "rent"} />
            </div>
          </div>
        </div>
      </div>
      <SearchResults searchParams={resolvedParams} />
      <TopVacations />
      <TopDestinations />
      <Footer />
    </main>
  )
}
