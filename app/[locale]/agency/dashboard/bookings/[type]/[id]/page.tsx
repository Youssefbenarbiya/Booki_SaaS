import { fetchBookingData } from "./data";
import { Booking, isCarBooking, isTripBooking, isHotelBooking } from "./types";
import { format } from "date-fns";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { handleCancelBooking } from "../../actions";
import { BookingType } from "@/actions/bookings";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "lucide-react";

// Import client components
import { 
  PaymentAlerts, 
  BackButton, 
  CancelButton,
  AdvancePaymentSection 
} from "./client-components";

// Create a binding for server action
function bindCancelAction(type: BookingType, id: number, locale: string) {
  return handleCancelBooking.bind(null, type, id, locale);
}

// Simplified booking details
function BookingDetailsCard({ booking }: { booking: Booking }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isCarBooking(booking)
            ? `${booking.car.brand} ${booking.car.model}`
            : isTripBooking(booking)
            ? booking.trip.name
            : isHotelBooking(booking)
            ? booking.room.hotel.name
            : "Booking Details"}
        </CardTitle>
        <CardDescription>
          {isCarBooking(booking)
            ? `${booking.car.year} • ${booking.car.color}`
            : isTripBooking(booking)
            ? `Destination: ${booking.trip.destination}`
            : isHotelBooking(booking)
            ? `${booking.room.name} • ${booking.room.hotel.address}`
            : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <div>
            <span className="font-medium">Status:</span>{" "}
            <span className="capitalize">{booking.status}</span>
          </div>
          
          <div>
            <span className="font-medium">
              {isCarBooking(booking)
                ? "Rental Period:"
                : isTripBooking(booking)
                ? "Trip Dates:"
                : "Stay Dates:"}
            </span>{" "}
            <span>
              {isCarBooking(booking)
                ? `${format(new Date(booking.start_date), "PPP")} - ${format(new Date(booking.end_date), "PPP")}`
                : isTripBooking(booking)
                ? `${format(new Date(booking.trip.startDate), "PPP")} - ${format(new Date(booking.trip.endDate), "PPP")}`
                : isHotelBooking(booking)
                ? `${format(new Date(booking.checkIn), "PPP")} - ${format(new Date(booking.checkOut), "PPP")}`
                : ""}
            </span>
          </div>
          
          <div>
            <span className="font-medium">Payment Status:</span>{" "}
            <span className="capitalize">{booking.paymentStatus || "pending"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Customer card
function CustomerCard({ userName, userEmail, userPhone, userImage }: { 
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userImage?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {userImage ? (
              <Image
                src={userImage}
                alt={userName || "Customer"}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              <User className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-lg">
              {userName || "Customer name not provided"}
            </h3>
            <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
              {userEmail && <div>{userEmail}</div>}
              {userPhone && <div>{userPhone}</div>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main page component
export default async function BookingDetailsPage({
  params,
  searchParams
}: {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
  params: Promise<{ type: string; id: string; locale: string }>
}) {
  // Await the promises
  const sp = await searchParams
  const { type: urlType, id: urlId, locale } = await params
  
  // Check for success or error messages in the URL
  const isUpdated = sp.updated === "true";
  const hasError = sp.error === "payment_failed";
  
  // Fetch data using our server action
  const data = await fetchBookingData(urlType, urlId, locale);
  
  // Handle invalid booking type
  if (data.isInvalidType) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-2">Invalid Booking Type</h1>
        <p className="text-muted-foreground mb-6">
          The booking type &quot;{data.urlType}&quot; is not valid. Valid types are: car,
          hotel, trip.
        </p>
        <BackButton locale={locale} />
      </div>
    );
  }
  
  // Handle error state
  if ('isError' in data) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-2">Booking Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t find the booking details you&apos;re looking for. It may have
          been deleted or you may not have permission to view it.
        </p>
        <BackButton locale={locale} />
      </div>
    );
  }
  
  // Destructure data (with proper type checking)
  const { 
    booking, 
    userInfo,
    isPartialPayment,
    advancePercentage = 30, // Default value if undefined
    amounts,
    normalizedType,
    id
  } = data;
  
  // Ensure booking is not null before proceeding
  if (!booking) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-2">Booking Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t find the booking details you&apos;re looking for.
        </p>
        <BackButton locale={locale} />
      </div>
    );
  }
  
  // Create the cancel booking action binding
  const cancelBookingAction = bindCancelAction(normalizedType, id, locale);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Destructure user info with null checks
  const userEmail = userInfo?.userEmail;
  const userName = userInfo?.userName;
  const userPhone = userInfo?.userPhone;
  const user = booking.user;

  return (
    <div className="container py-10">
      {/* Using client components for interactive parts */}
      <PaymentAlerts isUpdated={isUpdated} hasError={hasError} />
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {isCarBooking(booking)
                ? "Car Rental Details"
                : isTripBooking(booking)
                ? "Trip Booking Details"
                : "Hotel Booking Details"}
            </h1>
            <p className="text-muted-foreground">
              Booking reference: #{booking.id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <BackButton locale={locale} />
            {booking.status !== "cancelled" &&
              booking.status !== "completed" && (
                <CancelButton action={cancelBookingAction} />
              )}
          </div>
        </div>
      </div>

      {/* Show advance payment section if needed */}
      {isPartialPayment && amounts && (
        <AdvancePaymentSection
          bookingType={normalizedType}
          bookingId={id}
          locale={locale}
          advancePercentage={advancePercentage}
          advanceAmount={amounts.advanceAmount}
          remainingAmount={amounts.remainingAmount}
        />
      )}

      {/* Simplified booking details */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-1">
          <CustomerCard 
            userName={userName} 
            userEmail={userEmail}
            userPhone={userPhone}
            userImage={user?.image}
          />
        </div>
        
        <div className="md:col-span-1 lg:col-span-2">
          <BookingDetailsCard booking={booking} />
        </div>
        
        {/* Payment Summary */}
        {amounts && (
          <div className="md:col-span-2 lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(amounts.total)}</span>
                </div>
                
                {isPartialPayment && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Advance Payment ({advancePercentage}%):</span>
                        <span>{formatCurrency(amounts.advanceAmount)}</span>
                      </div>
                      <div className="flex justify-between text-amber-800 font-medium">
                        <span>Remaining to Collect:</span>
                        <span>{formatCurrency(amounts.remainingAmount)}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Payment Method: {booking.paymentMethod || "Not specified"}
                </p>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}