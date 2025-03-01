"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"

interface PriceRangeFilterProps {
  minPrice: number
  maxPrice: number
  onChange: (min: number, max: number) => void
}

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  onChange,
}: PriceRangeFilterProps) {
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice])

  const handleSliderChange = (values: number[]) => {
    setPriceRange(values)
    onChange(values[0], values[1])
  }

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    if (value <= priceRange[1]) {
      const newRange = [value, priceRange[1]]
      setPriceRange(newRange)
      onChange(newRange[0], newRange[1])
    }
  }

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    if (value >= priceRange[0]) {
      const newRange = [priceRange[0], value]
      setPriceRange(newRange)
      onChange(newRange[0], newRange[1])
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Price Range (per night)</h3>

      <Slider
        defaultValue={priceRange}
        min={minPrice}
        max={maxPrice}
        step={10}
        onValueChange={handleSliderChange}
        className="my-6"
      />

      <div className="flex items-center justify-between">
        <div className="relative rounded-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <Input
            type="number"
            value={priceRange[0]}
            onChange={handleMinInputChange}
            className="pl-7 pr-2 w-24"
          />
        </div>
        <span className="text-gray-500">to</span>
        <div className="relative rounded-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <Input
            type="number"
            value={priceRange[1]}
            onChange={handleMaxInputChange}
            className="pl-7 pr-2 w-24"
          />
        </div>
      </div>
    </div>
  )
}
