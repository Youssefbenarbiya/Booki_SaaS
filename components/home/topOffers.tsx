"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";

type Offer = {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  discount?: number;
  image: string;
  location: string;
  type: "trip" | "hotel" | "car";
};

export default function TopOffers() {
  const { locale = "en" } = useParams();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "all" | "trips" | "hotels" | "cars"
  >("all");

  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/offers");
        if (!response.ok) throw new Error("Failed to fetch offers");
        const data = await response.json();
        setOffers(data);
      } catch (error) {
        console.error("Error fetching offers:", error);
        // Fallback data in case the API is not ready yet
        setOffers([
          {
            id: 1,
            name: "Weekend in Djerba",
            description: "Experience the beauty of Djerba Island",
            price: 299,
            currency: "DT",
            discount: 15,
            image: "/assets/djerba.jpg",
            location: "Djerba, Tunisia",
            type: "trip",
          },
          {
            id: 2,
            name: "Luxury Stay in Tunis",
            description: "5-star accommodation in the heart of Tunis",
            price: 199,
            currency: "DT",
            discount: 10,
            image: "/assets/tunis-hotel.jpg",
            location: "Tunis, Tunisia",
            type: "hotel",
          },
          {
            id: 3,
            name: "SUV Rental",
            description: "Explore Tunisia with our comfortable SUV",
            price: 89,
            currency: "DT",
            discount: 5,
            image: "/assets/suv-rental.jpg",
            location: "Tunis, Tunisia",
            type: "car",
          },
          {
            id: 4,
            name: "Sahara Adventure",
            description: "Unforgettable desert experience",
            price: 349,
            currency: "DT",
            discount: 20,
            image: "/assets/sahara.jpg",
            location: "Southern Tunisia",
            type: "trip",
          },
          {
            id: 5,
            name: "Beachfront Resort",
            description: "Relax by the Mediterranean Sea",
            price: 249,
            currency: "DT",
            discount: 12,
            image: "/assets/beach-resort.jpg",
            location: "Hammamet, Tunisia",
            type: "hotel",
          },
          {
            id: 6,
            name: "Compact Car Rental",
            description: "Economical and fuel-efficient city car",
            price: 59,
            currency: "DT",
            discount: 8,
            image: "/assets/compact-car.jpg",
            location: "Sousse, Tunisia",
            type: "car",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Function to get the correct detail page URL based on offer type
  const getDetailPageUrl = (offer: Offer) => {
    switch (offer.type) {
      case "trip":
        return `/${locale}/trips/${offer.id}`;
      case "hotel":
        return `/${locale}/hotels/${offer.id}`;
      case "car":
        return `/${locale}/cars/${offer.id}`;
      default:
        return "#";
    }
  };

  const filteredOffers =
    activeTab === "all"
      ? offers
      : offers.filter((offer) => offer.type === activeTab);

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            <span className="relative">
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-orange-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </span>
              Special Offers
            </span>
          </h2>
          <p className="text-gray-600 mt-4">
            Discover our best deals and exclusive promotions
          </p>
        </div>

        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={(value) =>
            setActiveTab(value as "all" | "trips" | "hotels" | "cars")
          }
        >
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white shadow-sm">
              <TabsTrigger value="all" className="px-6">
                All Offers
              </TabsTrigger>
              <TabsTrigger value="trips" className="px-6">
                Trips
              </TabsTrigger>
              <TabsTrigger value="hotels" className="px-6">
                Hotels
              </TabsTrigger>
              <TabsTrigger value="cars" className="px-6">
                Car Rentals
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <Carousel
                opts={{
                  loop: true,
                  align: "start",
                }}
                className="w-full"
              >
                <CarouselContent>
                  {filteredOffers.map((offer) => (
                    <CarouselItem
                      key={offer.id}
                      className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 p-2"
                    >
                      <Card className="overflow-hidden h-full border-0 shadow-md transition-all hover:shadow-lg">
                        <Link
                          href={getDetailPageUrl(offer)}
                          className="block relative aspect-[3/2]"
                        >
                          <Image
                            src={offer.image || "/placeholder.svg"}
                            alt={offer.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          {offer.discount && (
                            <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600">
                              {offer.discount}% OFF
                            </Badge>
                          )}
                          <Badge className="absolute top-3 left-3 bg-blue-500 hover:bg-blue-600 capitalize">
                            {offer.type}
                          </Badge>
                        </Link>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg line-clamp-1">
                              {offer.name}
                            </h3>
                          </div>
                          <div className="flex items-center text-gray-500 mb-3 text-sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span className="line-clamp-1">
                              {offer.location}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2 h-10 mb-3">
                            {offer.description}
                          </p>
                          <div className="flex items-baseline justify-between">
                            <div>
                              {offer.discount ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 line-through text-sm">
                                    {offer.price} {offer.currency}
                                  </span>
                                  <span className="text-xl font-bold text-orange-600">
                                    {Math.round(
                                      offer.price * (1 - offer.discount / 100)
                                    )}{" "}
                                    {offer.currency}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xl font-bold text-orange-600">
                                  {offer.price} {offer.currency}
                                </span>
                              )}
                            </div>
                            <Link
                              href={getDetailPageUrl(offer)}
                              className="text-sm text-blue-600 font-medium hover:underline"
                            >
                              View Details
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-end gap-2 mt-4">
                  <CarouselPrevious className="static translate-y-0 bg-white border border-gray-200" />
                  <CarouselNext className="static translate-y-0 bg-white border border-gray-200" />
                </div>
              </Carousel>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
