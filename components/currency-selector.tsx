"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCurrency, currencies } from "@/contexts/CurrencyContext"

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-2 border-none bg-transparent hover:bg-transparent hover:text-foreground">
          {currency.code}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        {currencies.map((option) => (
          <DropdownMenuItem
            key={option.code}
            className="cursor-pointer"
            onClick={() => {
              setCurrency(option)
              setIsOpen(false)
            }}
          >
            <span className="mr-2">{option.symbol}</span>
            {option.code} - {option.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
