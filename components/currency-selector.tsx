"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCurrency } from "@/lib/contexts/CurrencyContext"
import { Loader2 } from "lucide-react"

type Currency = {
  code: string;
  name: string;
}

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCurrencies = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("https://api.frankfurter.dev/v1/currencies")
        const data = await response.json()
        
        // Convert to array of currency objects
        const currencyList = Object.entries(data).map(([code, name]) => ({
          code,
          name: name as string
        }))
        
        setCurrencies(currencyList)
      } catch (error) {
        console.error("Error fetching currencies:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrencies()
  }, [])

  // Common currencies to show at the top
  const popularCurrencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"]
  
  // Sort currencies to show popular ones first
  const sortedCurrencies = [...currencies].sort((a, b) => {
    const aIsPopular = popularCurrencies.includes(a.code)
    const bIsPopular = popularCurrencies.includes(b.code)
    
    if (aIsPopular && !bIsPopular) return -1
    if (!aIsPopular && bIsPopular) return 1
    return a.code.localeCompare(b.code)
  })

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 border-none bg-transparent hover:bg-white/20 text-white"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : currency}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading currencies...
          </div>
        ) : (
          sortedCurrencies.map((option) => (
            <DropdownMenuItem
              key={option.code}
              className="cursor-pointer"
              onClick={() => {
                setCurrency(option.code)
                setIsOpen(false)
              }}
            >
              <span className="mr-2">{option.code}</span>
              <span className="text-muted-foreground text-xs truncate">
                {option.name}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
