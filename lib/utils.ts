import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fileToFormData(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  return formData
}

export function formatPrice(price: string | number | null | undefined): string {
  if (price === null || price === undefined) return "$0"

  const numericPrice = typeof price === "string" ? parseFloat(price) : price

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice)
}

export function getDurationInDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const startFormatted = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  const endFormatted = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  return `${startFormatted} - ${endFormatted}`
}
