"use client"

import Image from "next/image"
import { User } from "lucide-react"
import { useState } from "react"

interface ProfileImageWithFallbackProps {
  src: string | null
  alt: string
  className?: string
}

export function ProfileImageWithFallback({
  src,
  alt,
  className = "h-8 w-8 rounded-full object-cover",
}: ProfileImageWithFallbackProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
        <User className="h-4 w-4 text-gray-400" />
      </div>
    )
  }

  return (
    <div className="relative h-8 w-8 rounded-full mr-2 overflow-hidden bg-gray-100">
      <Image
        src={src}
        alt={alt}
        width={32}
        height={32}
        className={className}
        onError={() => setError(true)}
      />
    </div>
  )
}
