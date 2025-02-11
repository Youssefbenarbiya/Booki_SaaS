import { Footer } from "@/components/footer/footer"
import { NavigationTabs } from "./navigation-tabs"
import { SearchForm } from "./search-form"
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
  searchParams: SearchParams | Promise<SearchParams>
}) {
  // Await the searchParams so that you get the actual value
  const resolvedSearchParams = await searchParams
  const searchType = resolvedSearchParams.type || "trips"

  return (
    <main>
      <div
        className="h-[400px] relative bg-cover bg-center"
        style={{
          backgroundImage: "url('/hero-bg.jpg')",
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <div className="container mx-auto px-4 pt-8 ">
          <NavigationTabs activeTab={searchType} />
          <div className="max-w-4xl mx-auto mb-12">
            <h1 className="text-4xl font-bold text-center text-white mb-8">
              Find Your Next {searchType === "trips" ? "Adventure" : "Stay"}
            </h1>
            <SearchForm type={searchType as "trips" | "hotels"} />
          </div>
        </div>
      </div>
      {/* Pass the resolved search params to the child component */}
      <SearchResults searchParams={resolvedSearchParams} />
      <Footer />
    </main>
  )
}
