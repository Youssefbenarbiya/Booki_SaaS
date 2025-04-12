"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Globe, Loader2, Search, X } from "lucide-react"
import { useCurrency } from "@/lib/contexts/CurrencyContext"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Currency = {
  code: string
  name: string
}

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchCurrencies = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          "https://api.frankfurter.dev/v1/currencies"
        )
        const data = await response.json()

        // Convert to array of currency objects
        const currencyList = Object.entries(data).map(([code, name]) => ({
          code,
          name: name as string,
        }))

        // Filter out ILS currency
        const filteredList = currencyList.filter(
          (currency) => currency.code !== "ILS"
        )

        // Add Tunisian Dinar manually
        filteredList.push({
          code: "TND",
          name: "Tunisian Dinar",
        })

        setCurrencies(filteredList)
      } catch (error) {
        console.error("Error fetching currencies:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrencies()
  }, [])

  // Common currencies to show at the top as suggested
  const suggestedCurrencies = ["TND", "USD", "EUR", "GBP"]

  // Filter suggested currencies
  const suggested = currencies.filter((c) =>
    suggestedCurrencies.includes(c.code)
  )

  // Filter currencies based on search query
  const filteredCurrencies = currencies.filter(
    (c) =>
      !suggestedCurrencies.includes(c.code) &&
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Currency name mapping for suggested currencies
  const currencyNames: Record<string, string> = {
    TND: "Tunisian Dinar",
    USD: "U.S. Dollar",
    EUR: "Euro",
  }

  // Override API names with our custom names for suggested currencies
  const getSuggestedName = (code: string) => {
    return (
      currencyNames[code] ||
      currencies.find((c) => c.code === code)?.name ||
      code
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-medium shadow-sm transition-all"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
          ) : (
            <>
              <div className="bg-blue-500 text-white p-1 rounded-full mr-1.5">
                <Globe className="h-3 w-3" />
              </div>
              <span className="text-sm">{currency}</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto p-0 rounded-lg border shadow-lg " >
        <div className="bg-blue-600 text-white p-4">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Select your currency
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/30 text-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </DialogHeader>

          <p className="text-blue-50 text-xs mt-1.5 max-w-[90%] leading-relaxed">
            Where applicable, prices will be converted to—and shown in—the
            currency you select. The currency you pay in may differ based on
            your reservation, and a service fee may also apply.
          </p>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="text-slate-600 mt-3 text-sm">
                Loading currencies...
              </span>
            </div>
          ) : (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search currencies..."
                  className="pl-8 py-1.5 h-9 text-sm border-slate-200 rounded-md focus-visible:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-5">
                {(searchQuery === "" ||
                  suggested.some(
                    (c) =>
                      c.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      c.code.toLowerCase().includes(searchQuery.toLowerCase())
                  )) && (
                  <div>
                    <h3 className="font-medium text-sm text-slate-700 mb-2">
                      Suggested for you
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {suggested
                        .filter(
                          (c) =>
                            searchQuery === "" ||
                            c.name
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            c.code
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                        )
                        .map((option) => (
                          <CurrencyOption
                            key={option.code}
                            code={option.code}
                            name={getSuggestedName(option.code)}
                            isSelected={currency === option.code}
                            onClick={() => {
                              setCurrency(option.code)
                              setIsOpen(false)
                            }}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {filteredCurrencies.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-slate-700 mb-2">
                      All currencies
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {filteredCurrencies.map((option) => (
                        <CurrencyOption
                          key={option.code}
                          code={option.code}
                          name={option.name}
                          isSelected={currency === option.code}
                          onClick={() => {
                            setCurrency(option.code)
                            setIsOpen(false)
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {searchQuery !== "" &&
                  filteredCurrencies.length === 0 &&
                  !suggested.some(
                    (c) =>
                      c.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      c.code.toLowerCase().includes(searchQuery.toLowerCase())
                  ) && (
                    <div className="text-center py-6">
                      <Search className="h-5 w-5 text-slate-400 mx-auto mb-2" />
                      <h3 className="text-sm font-medium text-slate-800">
                        No currencies found
                      </h3>
                      <p className="text-slate-500 text-xs mt-1">
                        Try a different search term
                      </p>
                    </div>
                  )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface CurrencyOptionProps {
  code: string
  name: string
  isSelected: boolean
  onClick: () => void
}

function CurrencyOption({
  code,
  name,
  isSelected,
  onClick,
}: CurrencyOptionProps) {
  return (
    <button
      className={cn(
        "flex flex-col items-start p-2.5 rounded-md text-left transition-all border",
        isSelected
          ? "bg-blue-50 border-blue-200"
          : "bg-white hover:bg-slate-50 border-slate-200"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between w-full items-center">
        <span
          className={cn(
            "font-medium text-sm",
            isSelected ? "text-blue-700" : "text-slate-800"
          )}
        >
          {name}
        </span>
        {isSelected && <Check className="h-3 w-3 text-blue-500" />}
      </div>
      <span
        className={cn(
          "text-xs mt-0.5",
          isSelected ? "text-blue-500" : "text-slate-500"
        )}
      >
        {code}
      </span>
    </button>
  )
}
