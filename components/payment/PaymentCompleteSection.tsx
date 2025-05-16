"use client";

import { AlertCircle } from "lucide-react";
import MarkPaymentCompleteButton from "./MarkPaymentCompleteButton";

interface PaymentCompleteSectionProps {
  bookingType: string;
  bookingId: number;
  locale: string;
  advancePercentage: number;
  advanceAmount: number;
  remainingAmount: number;
  formattedAdvanceAmount: string;
  formattedRemainingAmount: string;
}

export default function PaymentCompleteSection({
  bookingType,
  bookingId,
  locale,
  advancePercentage,
  advanceAmount,
  remainingAmount,
  formattedAdvanceAmount,
  formattedRemainingAmount
}: PaymentCompleteSectionProps) {
  // Add debug logging to help diagnose issues
  console.log("PaymentCompleteSection rendered with:", {
    bookingType,
    bookingId,
    advancePercentage,
    remainingAmount,
    locale
  });
  
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg mb-8 shadow-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-6 w-6 text-amber-500" />
        </div>
        <div className="ml-4">
          <h3 className="text-xl font-bold text-amber-800">
            Pending Cash Payment
          </h3>
          <div className="mt-2 text-amber-700">
            <p className="text-lg">
              Customer has only paid {advancePercentage}% advance payment ({formattedAdvanceAmount}).
            </p>
            <p className="mt-2 font-medium">
              Remaining amount to collect: <span className="text-lg font-bold">{formattedRemainingAmount}</span>
            </p>
            <div className="mt-6">
              <MarkPaymentCompleteButton
                bookingType={bookingType}
                bookingId={bookingId}
                locale={locale}
              />
              <p className="text-sm text-amber-600 mt-2 text-center">Click this button after collecting the remaining payment in cash</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 