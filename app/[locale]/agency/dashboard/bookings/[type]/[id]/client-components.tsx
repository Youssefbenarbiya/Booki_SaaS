"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";
import PaymentCompleteSection from "@/components/payment/PaymentCompleteSection";
import Link from "next/link";
import { BookingType } from "@/actions/bookings";

// PaymentAlert component for success/error messages
export function PaymentAlerts({ 
  isUpdated, 
  hasError 
}: { 
  isUpdated: boolean; 
  hasError: boolean;
}) {
  return (
    <>
      {isUpdated && (
        <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Payment Completed</AlertTitle>
          <AlertDescription>
            You have successfully marked this payment as completed.
          </AlertDescription>
        </Alert>
      )}
      
      {hasError && (
        <Alert className="mb-4 bg-red-50 border-red-200 text-red-800">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was a problem processing the payment completion. Please try again.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

// BackButton component
export function BackButton({ locale }: { locale: string }) {
  return (
    <Link href={`/${locale}/agency/dashboard/bookings`}>
      <Button variant="outline">Back to All Bookings</Button>
    </Link>
  );
}

// CancelButton component
export function CancelButton({ action }: { action: () => void }) {
  return (
    <form action={action}>
      <Button variant="destructive" type="submit">
        Cancel Booking
      </Button>
    </form>
  );
}

// AdvancePaymentSection component
export function AdvancePaymentSection({ 
  bookingType,
  bookingId,
  locale,
  advancePercentage,
  advanceAmount,
  remainingAmount,
}: { 
  bookingType: BookingType;
  bookingId: number;
  locale: string;
  advancePercentage: number;
  advanceAmount: number;
  remainingAmount: number;
}) {
  return (
    <PaymentCompleteSection
      bookingType={bookingType.toString()}
      bookingId={bookingId}
      locale={locale}
      advancePercentage={advancePercentage}
      advanceAmount={advanceAmount}
      remainingAmount={remainingAmount}
      formattedAdvanceAmount={`$${advanceAmount.toFixed(2)}`}
      formattedRemainingAmount={`$${remainingAmount.toFixed(2)}`}
    />
  );
} 