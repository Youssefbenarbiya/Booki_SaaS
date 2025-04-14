"use client"

import NewTripForm from "./NewTripForm"
import { CurrencyProvider } from "@/contexts/CurrencyContext"

export default function NewTripPage() {
  return (
    <CurrencyProvider>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Trip</h1>
        <NewTripForm />
      </div>
    </CurrencyProvider>
  )
} 