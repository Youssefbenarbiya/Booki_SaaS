import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export default function TopVacation() {
  const destinations = [
    {
      name: "Kairouan",
      image:
        "/assets/kairouan.jpg",
      alt: "Great Mosque of Kairouan with its distinctive architecture",
    },
    {
      name: "Mahdia",
      image:
        "/assets/kairouan.jpg",
      alt: "Street view of Mahdia with palm trees and ocean view",
    },
    {
      name: "Amphithéâtre d'El Jem",
      image:
        "/assets/kairouan.jpg",
      alt: "Ancient Roman amphitheatre ruins in El Jem",
    },
  ]

  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Top Vacation Destinations in Tunisia
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((destination) => (
          <Card key={destination.name} className="group overflow-hidden">
            <CardContent className="p-0 relative aspect-[4/3]">
              <Image
                src={destination.image || "/placeholder.svg"}
                alt={destination.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <h2 className="absolute bottom-4 left-4 text-2xl font-semibold text-white">
                {destination.name}
              </h2>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
