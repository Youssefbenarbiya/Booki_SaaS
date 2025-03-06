/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Search } from "lucide-react"

// Fix Leaflet icon issue in Next.js
const defaultIcon = L.icon({
  iconUrl: "/assets/icons/marker-shadow.png",
  shadowUrl: "/assets/icons/m",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Ensure Leaflet uses the default icon
L.Marker.prototype.options.icon = defaultIcon

interface LocationMapSelectorProps {
  initialLatitude?: number
  initialLongitude?: number
  onLocationSelected: (lat: number, lng: number) => void
  height?: string
  enableSearch?: boolean
  readOnly?: boolean
}

function MapMarker({
  position,
  onPositionChange,
  readOnly = false,
}: {
  position: [number, number]
  onPositionChange: (position: [number, number]) => void
  readOnly?: boolean
}) {
  // Handle map clicks and update the marker only if not in read-only mode
  useMapEvents({
    click: (e) => {
      if (!readOnly) {
        onPositionChange([e.latlng.lat, e.latlng.lng])
      }
    },
  })

  return position ? <Marker position={position} /> : null
}

export default function LocationMapSelector({
  initialLatitude = 0,
  initialLongitude = 0,
  onLocationSelected,
  height = "400px",
  enableSearch = true,
  readOnly = false,
}: LocationMapSelectorProps) {
  // Default position if none provided
  const defaultPosition: [number, number] = [51.505, -0.09] // London as default

  // Use provided coordinates or default
  const [position, setPosition] = useState<[number, number]>(
    initialLatitude && initialLongitude
      ? [initialLatitude, initialLongitude]
      : defaultPosition
  )

  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])

  // Flag to track if position change is from user interaction (not from props)
  const isUserInteraction = useRef(false)

  // Handle position changes from user interactions (map click or search)
  const handlePositionChange = (newPosition: [number, number]) => {
    if (!readOnly) {
      isUserInteraction.current = true
      setPosition(newPosition)
    }
  }

  // Only notify parent when position changes from user interaction
  useEffect(() => {
    if (isUserInteraction.current) {
      onLocationSelected(position[0], position[1])
      isUserInteraction.current = false
    }
  }, [position, onLocationSelected])

  // Update position if initialLatitude/Longitude props change
  useEffect(() => {
    if (initialLatitude && initialLongitude) {
      // Don't trigger the onLocationSelected callback here
      setPosition([initialLatitude, initialLongitude])
    }
  }, [initialLatitude, initialLongitude])

  // Search for address using OpenStreetMap Nominatim API
  const searchAddress = async () => {
    if (!searchQuery || readOnly) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error("Error searching for address:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Select a search result
  const selectSearchResult = (result: any) => {
    if (readOnly) return

    const newPosition: [number, number] = [
      parseFloat(result.lat),
      parseFloat(result.lon),
    ]
    handlePositionChange(newPosition)
    setSearchResults([])
    setSearchQuery("")
  }

  return (
    <div className="w-full space-y-2">
      {enableSearch && !readOnly && (
        <div className="relative">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for address or location"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              onClick={searchAddress}
              disabled={isSearching}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {isSearching ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background border border-input shadow-md">
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => selectSearchResult(result)}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-accent"
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div
        style={{ height, width: "100%" }}
        className="rounded-md overflow-hidden border border-input"
      >
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          dragging={!readOnly}
          touchZoom={!readOnly}
          doubleClickZoom={!readOnly}
          scrollWheelZoom={!readOnly}
          zoomControl={!readOnly}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapMarker
            position={position}
            onPositionChange={handlePositionChange}
            readOnly={readOnly}
          />
        </MapContainer>
      </div>
      {!readOnly && (
        <div className="text-xs text-muted-foreground">
          Click on the map to select a location. Current position:{" "}
          {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </div>
      )}
    </div>
  )
}
