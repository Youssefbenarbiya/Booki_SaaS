"use client"

import Image from "next/image"

interface PaymentSelectorProps {
  selectedPaymentMethod: "flouci" | "stripe"
  setSelectedPaymentMethod: (method: "flouci" | "stripe") => void
}

export default function PaymentSelector({
  selectedPaymentMethod,
  setSelectedPaymentMethod,
}: PaymentSelectorProps) {
  return (
    <div className="space-y-2 p-4 rounded-lg bg-gray-50 shadow-xl max-w-xs">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold">
          3
        </div>
        <h2 className="text-orange-500 font-bold text-sm">Payment Method</h2>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setSelectedPaymentMethod("flouci")}
          className={`p-3 border rounded-lg flex flex-col items-center gap-1 transition-transform transform hover:scale-105 hover:shadow-lg ${
            selectedPaymentMethod === "flouci"
              ? "border-orange-500 bg-white"
              : "border-gray-200"
          }`}
        >
          <Image
            src="/assets/payment/flouci-logo.png"
            alt="Flouci"
            width={70}
            height={25}
            className="object-contain"
          />
        </button>

        <button
          type="button"
          onClick={() => setSelectedPaymentMethod("stripe")}
          className={`p-3 border rounded-lg flex flex-col items-center gap-1 transition-transform transform hover:scale-105 hover:shadow-lg ${
            selectedPaymentMethod === "stripe"
              ? "border-orange-500 bg-white"
              : "border-gray-200"
          }`}
        >
          <Image
            src="/assets/payment/Stripe-logo.png"
            alt="Stripe"
            width={70}
            height={25}
            className="object-contain"
          />
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Your payment information is encrypted and secure.
      </p>
    </div>
  )
}
