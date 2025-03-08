"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Image from "next/image"

export type PaymentMethod = "flouci" | "stripe"

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod
  onSelect: (method: PaymentMethod) => void
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select Payment Method</h3>
      
      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) => onSelect(value as PaymentMethod)}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <div>
          <RadioGroupItem
            value="flouci"
            id="flouci"
            className="peer sr-only"
          />
          <Label
            htmlFor="flouci"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <div className="mb-3 h-12 w-12 relative">
              <Image
                src="/flouci-logo.png" 
                alt="Flouci"
                fill
                className="object-contain"
                onError={(e) => {
                  // Fallback if image not found
                  const target = e.target as HTMLImageElement
                  target.src = "https://placehold.co/100x100?text=Flouci"
                }}
              />
            </div>
            <div className="text-center font-medium">Flouci</div>
            <div className="text-center text-xs text-muted-foreground">
              Pay with Flouci wallet or card
            </div>
          </Label>
        </div>

        <div>
          <RadioGroupItem
            value="stripe"
            id="stripe"
            className="peer sr-only"
          />
          <Label
            htmlFor="stripe"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <div className="mb-3 h-12 w-12 relative">
              <Image
                src="/stripe-logo.png"
                alt="Stripe"
                fill
                className="object-contain"
                onError={(e) => {
                  // Fallback if image not found
                  const target = e.target as HTMLImageElement
                  target.src = "https://placehold.co/100x100?text=Stripe"
                }}
              />
            </div>
            <div className="text-center font-medium">Stripe</div>
            <div className="text-center text-xs text-muted-foreground">
              Pay with credit or debit card
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}
