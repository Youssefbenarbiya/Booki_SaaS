/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from "next";
import { getBookingDetails } from "@/actions/bookings";
import { headers } from "next/headers"
import { auth } from "@/auth"
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Car, Home, Plane, User, Phone, Mail, CreditCard, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { cancelBooking, BookingType } from "@/actions/bookings";

// Update type definitions for different booking types
type CarBooking = {
  status: string;
  id: number;
  user_id: string;
  start_date: Date;
  end_date: Date;
  total_price: string;
  car: {
    brand: string;
    model: string;
    year: string;
    color: string;
    images: string[];
    plateNumber: string;
    originalPrice: string;
    discountPercentage: number;
  };
  drivingLicense?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentDate?: Date;
};

type TripBooking = {
  status: string;
  id: number;
  userId: string;
  tripId: number;
  seatsBooked: number;
  totalPrice: string;
  bookingDate: Date | null;
  paymentId: string | null;
  paymentStatus: string | null;
  paymentMethod: string | null;
  paymentDate: Date | null;
  trip: {
    name: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    images: { imageUrl: string }[];
    activities: {
      id: number;
      activityName: string;
      description: string;
      scheduledDate?: Date;
    }[];
    originalPrice: string;
    discountPercentage: number;
  };
};

type HotelBooking = {
  status: string;
  id: number;
  userId: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: string;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentDate?: Date;
  room: {
    name: string;
    roomType: string;
    capacity: number;
    pricePerNightAdult: string;
    hotel: {
      name: string;
      address: string;
      city: string;
      images: string[];
    };
  };
};

type Booking = CarBooking | TripBooking | HotelBooking;

// Add type guard functions
function isCarBooking(booking: Booking): booking is CarBooking {
  return 'car' in booking;
}

function isTripBooking(booking: Booking): booking is TripBooking {
  return 'trip' in booking;
}

function isHotelBooking(booking: Booking): booking is HotelBooking {
  return 'room' in booking;
}

export async function generateMetadata({ params }: { params: { type: string; id: string } }): Promise<Metadata> {
  const type = params.type as BookingType;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const id = parseInt(params.id);
  
  const typeTitles = {
    car: "Car Booking",
    trip: "Trip Booking",
    hotel: "Hotel Booking",
  };
  
  return {
    title: `${typeTitles[type] || "Booking"} Details`,
    description: "View your booking details",
  };
}

export default async function BookingDetailsPage({ params }: { params: { type: string; id: string } }) {
const session = await auth.api.getSession({
  headers: await headers(),
})

  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  const type = params.type as BookingType;
  const id = parseInt(params.id);
  
  if (!["car", "trip", "hotel"].includes(type) || isNaN(id)) {
    redirect("/bookings");
  }
  
  const booking = await getBookingDetails(type, id) as unknown as Booking;
  
  if (!booking) {
    redirect("/bookings");
  }
  
  const handleCancelBooking = async () => {
    "use server";
    
    await cancelBooking(type, id);
    redirect("/bookings");
  };
  
  return (
    <div className="container py-10">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {isCarBooking(booking) ? "Car Rental Details" : 
               isTripBooking(booking) ? "Trip Booking Details" : 
               "Hotel Booking Details"}
            </h1>
            <p className="text-muted-foreground">
              Booking reference: #{booking.id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/bookings">
              <Button variant="outline">Back to All Bookings</Button>
            </Link>
            {booking.status !== "cancelled" && booking.status !== "completed" && (
              <form action={handleCancelBooking}>
                <Button variant="destructive" type="submit">Cancel Booking</Button>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Booking Information */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>
                  {isCarBooking(booking) ? `${booking.car.brand} ${booking.car.model}` : 
                   isTripBooking(booking) ? booking.trip.name : 
                   isHotelBooking(booking) ? booking.room.hotel.name : ""}
                </CardTitle>
                <StatusBadge status={booking.status} />
              </div>
              <CardDescription>
                {isCarBooking(booking) ? `${booking.car.year} • ${booking.car.color}` :
                 isTripBooking(booking) ? `Destination: ${booking.trip.destination}` :
                 isHotelBooking(booking) ? `${booking.room.name} • ${booking.room.hotel.address}, ${booking.room.hotel.city}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative aspect-video overflow-hidden rounded-md">
                {isCarBooking(booking) && booking.car.images?.[0] ? (
                  <Image 
                    src={booking.car.images[0]} 
                    alt={`${booking.car.brand} ${booking.car.model}`} 
                    fill 
                    className="object-cover" 
                  />
                ) : isTripBooking(booking) && booking.trip.images?.[0]?.imageUrl ? (
                  <Image 
                    src={booking.trip.images[0].imageUrl} 
                    alt={booking.trip.name} 
                    fill 
                    className="object-cover" 
                  />
                ) : isHotelBooking(booking) && booking.room.hotel.images?.[0] ? (
                  <Image 
                    src={booking.room.hotel.images[0]} 
                    alt={booking.room.hotel.name} 
                    fill 
                    className="object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    {isCarBooking(booking) ? <Car className="h-12 w-12 text-muted-foreground" /> :
                     isTripBooking(booking) ? <Plane className="h-12 w-12 text-muted-foreground" /> :
                     <Home className="h-12 w-12 text-muted-foreground" />}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Booking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailsItem 
                    icon={<Calendar className="h-4 w-4" />}
                    label={isCarBooking(booking) ? "Rental Period" : isTripBooking(booking) ? "Trip Dates" : "Stay Dates"}
                    value={isCarBooking(booking) ? 
                      `${format(new Date(booking.start_date), "PPP")} - ${format(new Date(booking.end_date), "PPP")}` :
                      isTripBooking(booking) ? 
                      `${format(new Date(booking.trip.startDate), "PPP")} - ${format(new Date(booking.trip.endDate), "PPP")}` :
                      `${format(new Date(booking.checkIn), "PPP")} - ${format(new Date(booking.checkOut), "PPP")}`
                    }
                  />
                  
                  <DetailsItem 
                    icon={<CreditCard className="h-4 w-4" />}
                    label="Payment Status"
                    value={booking.paymentStatus || "pending"}
                  />
                  
                  {isCarBooking(booking) && (
                    <>
                      <DetailsItem 
                        icon={<Car className="h-4 w-4" />}
                        label="Plate Number"
                        value={booking.car.plateNumber}
                      />
                    </>
                  )}
                  
                  {isTripBooking(booking) && (
                    <>
                      <DetailsItem 
                        icon={<User className="h-4 w-4" />}
                        label="Seats Booked"
                        value={booking.seatsBooked}
                      />
                    </>
                  )}
                  
                  {isHotelBooking(booking) && (
                    <>
                      <DetailsItem 
                        icon={<Home className="h-4 w-4" />}
                        label="Room Type"
                        value={booking.room.roomType}
                      />
                      <DetailsItem 
                        icon={<User className="h-4 w-4" />}
                        label="Capacity"
                        value={`${booking.room.capacity} people`}
                      />
                    </>
                  )}
                </div>
              </div>
              
              {isTripBooking(booking) && booking.trip.activities && booking.trip.activities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Trip Activities</h3>
                  <div className="space-y-3">
                    {booking.trip.activities.map((activity) => (
                      <div key={activity.id} className="bg-muted p-3 rounded-md">
                        <h4 className="font-medium">{activity.activityName}</h4>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        {activity.scheduledDate && (
                          <p className="text-sm flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(activity.scheduledDate), "PPP")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Additional Info for Car Bookings */}
          {isCarBooking(booking) && booking.drivingLicense && (
            <Card>
              <CardHeader>
                <CardTitle>Rental Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <DetailsItem 
                    icon={<User className="h-4 w-4" />}
                    label="Full Name"
                    value={booking.fullName || session.user.name || ""}
                  />
                  {booking.phone && (
                    <DetailsItem 
                      icon={<Phone className="h-4 w-4" />}
                      label="Phone Number"
                      value={booking.phone}
                    />
                  )}
                  <DetailsItem 
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={booking.email || session.user.email || ""}
                  />
                  <DetailsItem 
                    icon={<User className="h-4 w-4" />}
                    label="Driving License"
                    value={booking.drivingLicense}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Payment Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isCarBooking(booking) && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Car Rental</span>
                      <span>${Number(booking.car.originalPrice).toFixed(2)}</span>
                    </div>
                    {booking.car.discountPercentage > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({booking.car.discountPercentage}%)</span>
                        <span>-${(Number(booking.car.originalPrice) * (booking.car.discountPercentage / 100)).toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
                
                {isTripBooking(booking) && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trip Cost (per seat)</span>
                      <span>${Number(booking.trip.originalPrice).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seats</span>
                      <span>x {booking.seatsBooked}</span>
                    </div>
                    {booking.trip.discountPercentage > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({booking.trip.discountPercentage}%)</span>
                        <span>-${(Number(booking.trip.originalPrice) * booking.seatsBooked * (booking.trip.discountPercentage / 100)).toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
                
                {isHotelBooking(booking) && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room Rate (per night/adult)</span>
                      <span>${Number(booking.room.pricePerNightAdult).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nights</span>
                      <span>{
                        Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 3600 * 24))
                      }</span>
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${isCarBooking(booking) ? Number(booking.total_price).toFixed(2) : Number(booking.totalPrice).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-muted-foreground">
                <p>Payment Method: {booking.paymentMethod || "Not specified"}</p>
                <p>Payment Date: {booking.paymentDate ? format(new Date(booking.paymentDate), "PPP") : "Not paid yet"}</p>
              </div>
              {booking.status !== "cancelled" && booking.status !== "completed" && booking.paymentStatus !== "completed" && (
                <Button className="w-full">Make Payment</Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" | "success"; icon: React.ReactNode }> = {
    pending: { variant: "outline", icon: <Clock className="h-3 w-3 mr-1" /> },
    confirmed: { variant: "default", icon: null },
    completed: { variant: "success", icon: null },
    cancelled: { variant: "destructive", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
  };

  const { variant, icon } = statusMap[status.toLowerCase()] || { variant: "outline", icon: null };

  return (
    <Badge variant={variant as any} className="flex items-center">
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function DetailsItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
} 