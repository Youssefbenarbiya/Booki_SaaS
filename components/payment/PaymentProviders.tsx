"use client"

import Image from "next/image"

interface PaymentProvidersProps {
  className?: string
}

export default function PaymentProviders({ className }: PaymentProvidersProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Image
          src="/assets/payment/flouci-logo.png"
          alt="Flouci"
          width={80}
          height={30}
          className="object-contain"
        />
        <Image
          src="/assets/payment/visa.png"
          alt="Visa"
          width={40}
          height={30}
          className="object-contain"
        />
        <Image
          src="/assets/payment/mastercard.png"
          alt="Mastercard"
          width={40}
          height={30}
          className="object-contain"
        />
      </div>
      <p className="text-xs text-gray-500">Secure payment processing</p>
    </div>
  )
} 