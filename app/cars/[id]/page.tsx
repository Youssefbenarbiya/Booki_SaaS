"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Calendar, Check, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCarById } from "@/actions/carActions"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface CarDetailsProps {
  params: {
    id: string
  }
}

export default function CarDetails({ params }: CarDetailsProps) {
  const carId = parseInt(params.id)
  const router = useRouter()
  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)

  // Mock reviews - in a real app, these would come from the database
  const reviews = [
    {
      id: 1,
      user: {
        name: "John Doe",
        avatar: "https://i.pravatar.cc/100?img=1",
      },
      rating: 5,
      date: "2023-03-15",
      comment:
        "Amazing car, very clean and well maintained. The owner was very friendly and helpful.",
    },
    {
      id: 2,
      user: {
        name: "Jane Smith",
        avatar: "https://i.pravatar.cc/100?img=2",
      },
      rating: 4,
      date: "2023-02-28",
      comment:
        "Great car, very comfortable. Had a small issue with the pickup but overall a good experience.",
    },
    {
      id: 3,
      user: {
        name: "Michael Brown",
        avatar: "https://i.pravatar.cc/100?img=3",
      },
      rating: 5,
      date: "2023-01-10",
      comment:
        "Perfect condition, smooth drive. Will definitely rent again when I'm back in town!",
    },
  ]

  // Navigate to booking page
  const navigateToBooking = () => {
    router.push(`/cars/${carId}/booking`)
  }

  // Load car data
  useEffect(() => {
    async function loadCar() {
      try {
        setLoading(true)
        const result = await getCarById(carId)
        
        if (result.car) {
          setCar(result.car)
        } else {
          setError("Car not found")
        }
      } catch (err) {
        console.error("Failed to load car:", err)
        setError("Failed to load car details")
      } finally {
        setLoading(false)
      }
    }

    loadCar()
  }, [carId])

  // Set default car images if none are available
  const carImages = car?.images?.length
    ? car.images
    : ["/assets/Car.png", "/assets/Car.png", "/assets/Car.png"]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">Error</h2>
          <p className="mt-2">{error || "Car not found"}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => router.push("/cars")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cars
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Header with back button */}
      <div className="container mx-auto px-4 py-6">
        <Button 
          variant="outline" 
          onClick={() => router.push("/cars")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cars
        </Button>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Car Images Section */}
          <div className="lg:col-span-3">
            {/* Main image */}
            <div className="bg-amber-50 rounded-lg p-4 mb-4">
              <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden">
                <Image
                  src={carImages[activeImage]}
                  alt={`${car.brand} ${car.model}`}
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Thumbnails */}
            {carImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {carImages.map((image: string, index: number) => (
                  <div
                    key={index}
                    className={`relative h-20 w-20 rounded-md overflow-hidden cursor-pointer transition-all ${
                      activeImage === index
                        ? "ring-2 ring-orange-500"
                        : "opacity-70"
                    }`}
                    onClick={() => setActiveImage(index)}
                  >
                    <Image
                      src={image}
                      alt={`${car.brand} ${car.model} - thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Car Features */}
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Car Features</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Air Conditioning</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Bluetooth</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Navigation</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Parking Sensors</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>USB Port</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Fuel Efficient</span>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-12">
              <h3 className="text-lg font-bold mb-4">Customer Reviews</h3>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                  >
                    <div className="flex items-center mb-3">
                      <Image
                        src={review.user.avatar}
                        alt={review.user.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="ml-3">
                        <p className="font-medium">{review.user.name}</p>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-2">
                            {review.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Car Details and Booking Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sticky top-6">
              <h2 className="text-2xl font-bold">
                {car.brand} {car.model}
              </h2>
              <div className="flex items-center mt-1 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">
                  (4.8) · 24 reviews
                </span>
              </div>

              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 mb-4">
                {car.year} · {car.color}
              </Badge>

              <Separator className="my-4" />

              <div className="flex items-center mb-6">
                <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                <span>Available for instant booking</span>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-xl">
                  <span className="font-bold">${car.price}</span>
                  <span className="text-gray-500 line-through">
                    ${(car.price * 1.2).toFixed(0)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">per day, insurance included</p>
              </div>

              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white mb-4"
                onClick={navigateToBooking}
              >
                Rent Now
              </Button>

              <p className="text-xs text-gray-500 text-center">
                No charges until booking is confirmed
              </p>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">License Plate</span>
                  <span className="font-medium">{car.plateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium">
                    {car.isAvailable ? "Available" : "Currently booked"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
