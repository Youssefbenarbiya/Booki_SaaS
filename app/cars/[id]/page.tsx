"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getCarById } from "@/actions/carActions"
import { bookCar } from "@/actions/bookingActions"
import { ArrowLeft, Calendar, Shield, Truck, Users, Fuel, Star, Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { DatePicker } from "@/components/ui/date-picker"
import { toast } from "sonner"
import * as React from "react"

interface CarDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function CarDetailPage({ params }: CarDetailPageProps) {
  // Properly unwrap params
  const unwrappedParams = React.use(params)
  const carId = parseInt(unwrappedParams.id)
  
  const router = useRouter()
  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 3)),
  })
  const [totalDays, setTotalDays] = useState(3)
  const [totalPrice, setTotalPrice] = useState(0)
  const [isBooking, setIsBooking] = useState(false)

  // Use a stable callback function for setDateRange to prevent infinite loops
  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
  }, []);

  // Calculate total days and price when dateRange or car changes
  useEffect(() => {
    if (!car) return;
    
    if (dateRange?.from && dateRange?.to) {
      const days = Math.ceil(
        (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
      
      setTotalDays(days);
      setTotalPrice(parseFloat((days * car.price).toFixed(2)));
    }
  }, [dateRange, car]);

  // Load car data
  useEffect(() => {
    async function loadCar() {
      try {
        setLoading(true)
        const result = await getCarById(carId)
        setCar(result.car)
      } catch (err) {
        console.error("Failed to load car:", err)
        setError("Failed to load car details")
      } finally {
        setLoading(false)
      }
    }

    loadCar()
  }, [carId])

  const handleBookNow = async () => {
    if (isBooking) return;
    
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select rental dates");
      return;
    }

    try {
      setIsBooking(true);
      
      // In a real app, get this from auth context
      const userId = "user123";  
      
      const result = await bookCar({
        carId,
        userId,
        startDate: dateRange.from,
        endDate: dateRange.to,
        totalPrice
      });
      
      if (result.success) {
        toast.success("Booking confirmed!");
        setTimeout(() => {
          router.push("/cars");
        }, 1500);
      } else {
        toast.error(result.error || "Failed to book car. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("An error occurred while booking the car.");
    } finally {
      setIsBooking(false);
    }
  };

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
          <Button className="mt-4" onClick={() => router.push("/cars")}>
            Back to Cars
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => router.back()} 
        className="flex items-center text-gray-600 mb-6 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cars
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Car Details */}
        <div className="lg:col-span-2">
          <div className="relative h-96 w-full rounded-lg overflow-hidden mb-6">
            <Image
              src={car.images[0] || "/assets/Car.png"}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover"
              priority
            />
          </div>

          <h1 className="text-3xl font-bold mb-2">{car.brand} {car.model}</h1>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="mr-1 h-4 w-4" />
              {car.year}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Gauge className="mr-1 h-4 w-4" />
              Automatic
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Fuel className="mr-1 h-4 w-4" />
              Petrol
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="mr-1 h-4 w-4" />
              5 Passengers
            </div>
          </div>

          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start mb-6">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="text-gray-700">
              <p>
                Experience the luxury and power of the {car.brand} {car.model}. This {car.color} beauty 
                from {car.year} offers an exceptional driving experience with cutting-edge technology and 
                superior comfort. Whether for business or leisure, this vehicle delivers performance, style, 
                and reliability.
              </p>
            </TabsContent>
            <TabsContent value="features">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Fuel className="mt-1 mr-2 h-5 w-5 text-orange-500" />
                  <div>
                    <h3 className="font-medium">Fuel Efficiency</h3>
                    <p className="text-sm text-gray-600">Excellent fuel economy</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="mt-1 mr-2 h-5 w-5 text-orange-500" />
                  <div>
                    <h3 className="font-medium">Safety Features</h3>
                    <p className="text-sm text-gray-600">Advanced safety systems</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Truck className="mt-1 mr-2 h-5 w-5 text-orange-500" />
                  <div>
                    <h3 className="font-medium">Cargo Space</h3>
                    <p className="text-sm text-gray-600">Generous trunk capacity</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="mt-1 mr-2 h-5 w-5 text-orange-500" />
                  <div>
                    <h3 className="font-medium">Seating</h3>
                    <p className="text-sm text-gray-600">Comfortable seating for 5</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">JD</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <h4 className="font-medium">John Doe</h4>
                      <div className="ml-2 flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Rented for 3 days in April 2023</p>
                    <p className="text-gray-700">
                      Amazing car! Very comfortable and fuel efficient. The rental process was smooth
                      and I would definitely rent this car again.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">JS</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <h4 className="font-medium">Jane Smith</h4>
                      <div className="ml-2 flex">
                        {[1, 2, 3, 4].map((star) => (
                          <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <Star className="h-4 w-4 text-yellow-400" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Rented for 1 week in June 2023</p>
                    <p className="text-gray-700">
                      Good car overall. Very spacious and comfortable for long trips. Pickup and
                      drop-off were easy and convenient.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm sticky top-8">
            <h2 className="text-xl font-bold mb-4">Book this car</h2>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Rental Dates</h3>
              <DatePicker dateRange={dateRange} setDateRange={handleDateRangeChange} />
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Rental price</span>
                <span>${car.price}/day</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Days</span>
                <span>{totalDays} days</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Insurance</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
              onClick={handleBookNow}
              disabled={isBooking}
            >
              {isBooking ? "Processing..." : "Book Now"}
            </Button>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              Free cancellation up to 24 hours before pickup
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 