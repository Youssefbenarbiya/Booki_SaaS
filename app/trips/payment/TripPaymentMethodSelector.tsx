"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export type PaymentMethod = "flouci" | "stripe"

interface TripPaymentMethodSelectorProps {
  selectedMethod: PaymentMethod
  onSelect: (method: PaymentMethod) => void
}

export function TripPaymentMethodSelector({
  selectedMethod,
  onSelect,
}: TripPaymentMethodSelectorProps) {
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
              <div className="h-full w-full flex items-center justify-center">
                <svg viewBox="0 0 100 100" width="48" height="48">
                  <circle cx="50" cy="50" r="45" fill="#0066cc" />
                  <text
                    x="50%" 
                    y="55%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fontSize="50"
                    fill="white"
                    fontWeight="bold"
                  >
                    F
                  </text>
                </svg>
              </div>
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
              <div className="h-full w-full flex items-center justify-center">
                <svg viewBox="0 0 100 100" width="48" height="48">
                  <rect width="100" height="100" rx="10" fill="#6772e5" />
                  <path d="M50,35 L60,50 L50,65 L40,50 Z" fill="white" />
                </svg>
              </div>
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
