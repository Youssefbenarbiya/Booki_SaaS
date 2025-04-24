"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronRight, MapPin, Calendar, Car, Bed, Users, CreditCard } from "lucide-react"

interface ChatResultsProps {
  data: any
  onLoadMore: (type: string) => Promise<void>
}

export function ChatResults({ data, onLoadMore }: ChatResultsProps) {
  // Check what type of results we have and render the appropriate component
  return (
    <div className="w-full space-y-4 mt-2">
      {data.hotels && data.hotels.length > 0 && (
        <HotelResults hotels={data.hotels} onLoadMore={() => onLoadMore("hotels")} />
      )}
      
      {data.trips && data.trips.length > 0 && (
        <TripResults trips={data.trips} onLoadMore={() => onLoadMore("trips")} />
      )}
      
      {data.cars && data.cars.length > 0 && (
        <CarResults cars={data.cars} onLoadMore={() => onLoadMore("cars")} />
      )}
      
      {data.rooms && data.rooms.length > 0 && (
        <RoomResults rooms={data.rooms} onLoadMore={() => onLoadMore("rooms")} />
      )}
      
      {data.bookings && data.bookings.length > 0 && (
        <BookingResults bookings={data.bookings} onLoadMore={() => onLoadMore("bookings")} />
      )}
    </div>
  )
}

// Hotel Results Component
function HotelResults({ hotels, onLoadMore }: { hotels: any[], onLoadMore: () => Promise<void> }) {
  const router = useRouter();
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Hotels</h3>
        <Button variant="link" size="sm" onClick={onLoadMore} className="text-xs">
          Show more <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {hotels.map((hotel, index) => (
          <Card key={index} className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row">
              <div className="relative h-32 w-full sm:w-32 sm:h-auto">
                {hotel.images && hotel.images[0] ? (
                  <Image 
                    src={hotel.images[0]} 
                    alt={hotel.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                    <Bed className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-sm">{hotel.name}</h3>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{hotel.city}, {hotel.country}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-xs">
                      {hotel.rating}★
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {hotel.amenities && hotel.amenities.slice(0, 3).map((amenity: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0">
                      {amenity}
                    </Badge>
                  ))}
                  {hotel.amenities && hotel.amenities.length > 3 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      +{hotel.amenities.length - 3} more
                    </Badge>
                  )}
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <Link href={`/en/hotels/${hotel.id}`}>
                    <Button size="sm" className="bg-orange-400 hover:bg-orange-500 text-black text-xs">
                      View details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Trip Results Component
function TripResults({ trips, onLoadMore }: { trips: any[], onLoadMore: () => Promise<void> }) {
  const router = useRouter();
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Trips</h3>
        <Button variant="link" size="sm" onClick={onLoadMore} className="text-xs">
          Show more <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {trips.map((trip, index) => (
          <Card key={index} className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-sm">{trip.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {trip.currency} {trip.priceAfterDiscount || trip.originalPrice}
                </Badge>
              </div>
              
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{trip.destination}</span>
              </div>
              
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                <span>
                  {new Date(trip.startDate).toLocaleDateString()} - 
                  {new Date(trip.endDate).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <Users className="h-3 w-3 mr-1" />
                <span>Capacity: {trip.capacity}</span>
              </div>
              
              {trip.discountPercentage > 0 && (
                <Badge className="mt-2 bg-green-100 text-green-800 text-xs border-green-200">
                  {trip.discountPercentage}% OFF
                </Badge>
              )}
              
              <div className="mt-3 flex justify-between items-center">
                <Link href={`/en/trips/${trip.id}`}>
                  <Button size="sm" className="bg-orange-400 hover:bg-orange-500 text-black text-xs">
                    View details
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Car Results Component
function CarResults({ cars, onLoadMore }: { cars: any[], onLoadMore: () => Promise<void> }) {
  const router = useRouter();
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Cars</h3>
        <Button variant="link" size="sm" onClick={onLoadMore} className="text-xs">
          Show more <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {cars.map((car, index) => (
          <Card key={index} className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row">
              <div className="relative h-32 w-full sm:w-32 sm:h-auto">
                {car.images && car.images[0] ? (
                  <Image 
                    src={car.images[0]} 
                    alt={`${car.brand} ${car.model}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                    <Car className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 p-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm">{car.brand} {car.model}</h3>
                  <Badge variant="outline" className="text-xs">
                    {car.currency} {car.priceAfterDiscount || car.originalPrice}/day
                  </Badge>
                </div>
                
                <div className="mt-1 text-xs text-gray-500">
                  <div className="flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{car.location}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <div className="flex items-center">
                      <span className="text-xs">Color: {car.color}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs">Year: {car.year}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs">Category: {car.category}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs">Seats: {car.seats}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <Link href={`/en/cars/${car.id}`}>
                    <Button size="sm" className="bg-orange-400 hover:bg-orange-500 text-black text-xs">
                      View details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Room Results Component
function RoomResults({ rooms, onLoadMore }: { rooms: any[], onLoadMore: () => Promise<void> }) {
  const router = useRouter();
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Rooms</h3>
        <Button variant="link" size="sm" onClick={onLoadMore} className="text-xs">
          Show more <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {rooms.map((room, index) => (
          <Card key={index} className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-sm">{room.name}</h3>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    {room.currency} {room.pricePerNightAdult}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">per night</p>
                </div>
              </div>
              
              <div className="mt-1 text-xs text-gray-500">
                <p>Type: {room.roomType}</p>
                <p className="mt-1">Capacity: {room.capacity} guests</p>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-1">
                {room.amenities && room.amenities.slice(0, 3).map((amenity: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0">
                    {amenity}
                  </Badge>
                ))}
                {room.amenities && room.amenities.length > 3 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    +{room.amenities.length - 3} more
                  </Badge>
                )}
              </div>
              
              <div className="mt-3 flex justify-between items-center">
                <Link href={`/en/hotels/${room.hotelId}`}>
                  <Button size="sm" className="bg-orange-400 hover:bg-orange-500 text-black text-xs">
                    Check availability
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Booking Results Component
function BookingResults({ bookings, onLoadMore }: { bookings: any[], onLoadMore: () => Promise<void> }) {
  const router = useRouter();
  
  const getBookingDetailLink = (booking: any) => {
    if (booking.type === 'hotel') {
      return `/en/hotels/${booking.roomId.split('-')[0]}`; // Assuming roomId format includes hotel ID
    } else if (booking.type === 'car') {
      return `/en/cars/${booking.car_id}`;
    } else if (booking.type === 'trip') {
      return `/en/trips/${booking.tripId}`;
    }
    return '#';
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Your Bookings</h3>
        <Button variant="link" size="sm" onClick={onLoadMore} className="text-xs">
          Show more <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {bookings.map((booking, index) => (
          <Card key={index} className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  {booking.type === 'hotel' && <Bed className="h-4 w-4 mr-1" />}
                  {booking.type === 'car' && <Car className="h-4 w-4 mr-1" />}
                  {booking.type === 'trip' && <MapPin className="h-4 w-4 mr-1" />}
                  <h3 className="font-medium text-sm capitalize">{booking.type} Booking</h3>
                </div>
                <Badge className={`text-xs ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800 border-green-200' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {booking.status}
                </Badge>
              </div>
              
              <div className="mt-2 text-xs">
                {booking.type === 'hotel' && (
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {new Date(booking.checkIn).toLocaleDateString()} - 
                        {new Date(booking.checkOut).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
                
                {booking.type === 'car' && (
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {new Date(booking.start_date).toLocaleDateString()} - 
                        {new Date(booking.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
                
                {booking.type === 'trip' && (
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      <span>Seats: {booking.seatsBooked}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center mt-1">
                  <CreditCard className="h-3 w-3 mr-1" />
                  <span>Payment: {booking.paymentStatus || 'Pending'}</span>
                </div>
              </div>
              
              <div className="mt-3 flex justify-between items-center">
                <Link href={getBookingDetailLink(booking)}>
                  <Button size="sm" className="bg-orange-400 hover:bg-orange-500 text-black text-xs">
                    View details
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 