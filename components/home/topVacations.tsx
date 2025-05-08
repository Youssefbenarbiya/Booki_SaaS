"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function TunisiaCarousel() {
  const destinations = [
    {
      name: "Kairouan",
      image: "/assets/kairouan.jpg",
      alt: "Great Mosque of Kairouan with its distinctive architecture",
    },
    {
      name: "Mahdia",
      image: "/assets/mah.jpg",
      alt: "Street view of Mahdia with palm trees and ocean view",
    },
    {
      name: "Amphithéâtre d'El Jem",
      image: "/assets/jem.jpg",
      alt: "Ancient Roman amphitheatre ruins in El Jem",
    },
    {
      name: "Sidi Bou Said",
      image: "/assets/sidiB.jpg",
      alt: "Sidi Bou Said with its distinctive blue and white architecture",
    },
    {
      name: "Tozeur",
      image: "/assets/tozeur.jpg",
      alt: "Palm oasis landscape in Tozeur",
    },
  ];

  // Reusable PinIcon SVG
  const PinIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block w-6 h-6 text-red-600 mr-2 -mt-1"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    </svg>
  );

  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center flex items-center justify-center">
        <PinIcon />
        Top Vacation Destinations in Tunisia
      </h1>

      <Carousel
        className="w-full"
        opts={{
          loop: true,
          align: "start",
          slidesToScroll: 1,
        }}
      >
        <CarouselContent>
          {destinations.map((destination) => (
            <CarouselItem
              key={destination.name}
              className="basis-full sm:basis-1/2 md:basis-1/3"
            >
              <Card className="group overflow-hidden border-0 rounded-lg">
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
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </section>
  );
}
