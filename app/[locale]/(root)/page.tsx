// app/home/page.tsx
import { Footer } from "@/components/footer/footer"
import { SearchResults } from "./search-results"
import TopVacations from "@/components/home/topVacations"
import TopDestinations from "@/components/home/topDestinations"

import HeroCarousel from "@/components/home/HeroCarousel"
import { ChatScript } from "@/components/chatbot/ChatScript"

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
      <HeroCarousel activeTab={searchType} />

      <SearchResults searchParams={resolvedParams} />
      <TopVacations />
      <TopDestinations />
      <Footer />

      {/* Chatbot */}
      <ChatScript />
    </main>
  )
}
