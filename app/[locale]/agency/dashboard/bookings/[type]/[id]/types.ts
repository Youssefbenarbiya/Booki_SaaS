// Type definitions for bookings
export type CarBooking = {
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
  user?: {
    id: string;
    name: string;
    email: string;
    image: string;
    phoneNumber?: string;
    address?: string;
  };
};

export type TripBooking = {
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
    advancePaymentPercentage?: number;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    image: string;
    phoneNumber?: string;
    address?: string;
  };
};

export type HotelBooking = {
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
  user?: {
    id: string;
    name: string;
    email: string;
    image: string;
    phoneNumber?: string;
    address?: string;
  };
};

export type Booking = CarBooking | TripBooking | HotelBooking;

// Type guard functions
export function isCarBooking(booking: Booking): booking is CarBooking {
  return "car" in booking;
}

export function isTripBooking(booking: Booking): booking is TripBooking {
  return "trip" in booking;
}

export function isHotelBooking(booking: Booking): booking is HotelBooking {
  return "room" in booking;
} 