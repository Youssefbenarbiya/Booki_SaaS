import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fileToFormData(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  return formData
}
