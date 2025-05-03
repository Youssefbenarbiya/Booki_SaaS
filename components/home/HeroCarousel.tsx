"use client"

import { useState, useEffect, useMemo } from "react"
import { NavigationTabs } from "@/app/[locale]/(root)/navigation-tabs"
import { SearchForm } from "@/app/[locale]/(root)/search-form"

interface HeroCarouselProps {
  activeTab: string
}

export default function HeroCarousel({ activeTab }: HeroCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(false)

  // Use only the images that are available in the public directory
  const heroImages = useMemo(
    () => [
      "/hero-bg.jpg",
      "/hero-bg2.jpg",
      "/hero-bg3.jpg",
      "/hero-bg4.jpg",
      "/hero-bg5.jpg",
    ],
    []
  )

  // Preload images
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = heroImages.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new window.Image()
          img.src = src
          img.onload = resolve
          img.onerror = reject
        })
      })

      try {
        await Promise.all(imagePromises)
        setImagesLoaded(true)
      } catch (error) {
        console.error("Failed to preload images:", error)
        // Continue even if some images fail to load
        setImagesLoaded(true)
      }
    }

    preloadImages()
  }, [heroImages])

  // Auto cycle through images after they're loaded
  useEffect(() => {
    if (!imagesLoaded) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [imagesLoaded, heroImages.length])

  // Handle manual navigation
  const goToSlide = (index: number) => {
    setCurrentImageIndex(index)
  }

  const nextSlide = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
  }

  const prevSlide = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
    )
  }

  return (
    <div className="relative min-h-[600px]">
      {/* Background images */}
      {heroImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url('${image}')`,
            backgroundBlendMode: "overlay",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
          aria-hidden={index !== currentImageIndex}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 min-h-[600px] flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              <div className="absolute -top-10 left-0">
                <NavigationTabs activeTab={activeTab} />
              </div>
              <SearchForm type={activeTab as "trips" | "hotels" | "rent"} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full"
        aria-label="Previous slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full"
        aria-label="Next slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentImageIndex ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentImageIndex ? "true" : "false"}
          />
        ))}
      </div>
    </div>
  )
}
