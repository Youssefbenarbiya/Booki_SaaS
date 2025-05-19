"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface MarkPaymentCompleteButtonProps {
  bookingType: string;
  bookingId: number;
  locale: string;
}

export default function MarkPaymentCompleteButton({
  bookingType,
  bookingId,
  locale
}: MarkPaymentCompleteButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalize booking type to ensure it matches the expected values
  const normalizeBookingType = (type: string): "car" | "hotel" | "trip" => {
    type = type.toLowerCase();
    if (type === "cars") return "car";
    if (type === "hotels") return "hotel";
    if (type === "trips") return "trip";
    if (["car", "hotel", "trip"].includes(type)) return type as "car" | "hotel" | "trip";
    
    // Default to "car" if unknown (though this should be avoided)
    console.warn(`Unknown booking type: ${type}, defaulting to "car"`);
    return "car";
  };

  async function handleClick() {
    setIsLoading(true);
    setError(null);
    
    try {
      // Normalize the booking type
      const normalizedType = normalizeBookingType(bookingType);
      
      // Add detailed debugging
      console.log('Sending payment completion request:', { 
        type: normalizedType, 
        id: bookingId,
        endpoint: '/api/bookings/complete-payment'
      });
      
      const response = await fetch(`/api/bookings/complete-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: normalizedType,
          id: bookingId,
        }),
      });

      // Log the raw response status and headers for debugging
      console.log('Response status:', response.status);
      
      // Parse response JSON and log it
      let data;
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      try {
        data = responseText ? JSON.parse(responseText) : {};
        console.log('Parsed JSON response:', data);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!response.ok) {
        const errorMessage = data.error || data.details || 'Failed to complete payment';
        console.error('API reported an error:', errorMessage, data);
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Payment completion successful, redirecting...');
      toast.success("Payment marked as complete successfully");
      
      // On success, redirect to the same page with success parameter
      router.push(`/${locale}/agency/dashboard/bookings/${normalizedType}/${bookingId}?updated=true`);
      router.refresh();
    } catch (error) {
      console.error('Error completing payment:', error);
      
      // Display error message via toast
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete payment';
      toast.error(errorMessage);
      
      // Set error state to display in UI
      setError(errorMessage);
      
      // Don't redirect with error param anymore, just set loading state back to false
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 mb-4 rounded-md text-sm">
          Error: {error}
        </div>
      )}
      <Button
        onClick={handleClick}
        className="bg-green-600 hover:bg-green-700 text-white py-6 px-8 text-lg font-semibold w-full"
        size="lg"
        disabled={isLoading}
      >
        <CheckCircle className="mr-2 h-6 w-6" />
        {isLoading ? "PROCESSING..." : "MARK CASH PAYMENT RECEIVED"}
      </Button>
    </div>
  );
} 