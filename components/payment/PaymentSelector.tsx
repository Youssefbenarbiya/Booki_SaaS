/* eslint-disable @typescript-eslint/no-explicit-any */
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF8A00] text-white font-bold">
          3
        </div>
        <h2 className="text-[#FF8A00] font-medium">Payment Method</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setSelectedPaymentMethod("flouci")}
          className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${
            selectedPaymentMethod === "flouci"
              ? "border-[#FF8A00] bg-[#FFF8EE]"
              : "border-gray-200"
          }`}
        >
          <Image
            src="/assets/payment/flouci-logo.png"
            alt="Flouci"
            width={80}
            height={30}
            className="object-contain"
          />
        </button>

        <button
          type="button"
          onClick={() => setSelectedPaymentMethod("stripe")}
          className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${
            selectedPaymentMethod === "stripe"
              ? "border-[#FF8A00] bg-[#FFF8EE]"
              : "border-gray-200"
          }`}
        >
          <Image
            src="/assets/payment/Stripe-logo.png"
            alt="Stripe"
            width={80}
            height={30}
            className="object-contain"
          />
          <p className="text-sm text-gray-500">Coming Soon</p>
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Your payment information is encrypted and secure.
      </p>
    </div>
  )
}
