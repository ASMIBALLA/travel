"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Navigation } from "lucide-react"

interface Location {
  name: string
  lat: number
  lng: number
}

interface LocationInputProps {
  sourceLocation: Location | null
  destination: Location | null
  onSourceChange: (location: Location | null) => void
  onDestinationChange: (location: Location | null) => void
  onLocationSet: () => void
}

// Sample locations for Sikkim/Northeast India
const sampleLocations: Location[] = [
  { name: "Gangtok", lat: 27.3389, lng: 88.6065 },
  { name: "Pelling", lat: 27.2152, lng: 88.2426 },
  { name: "Namchi", lat: 27.1663, lng: 88.3639 },
  { name: "Yuksom", lat: 27.3628, lng: 88.2119 },
  { name: "Rumtek Monastery", lat: 27.3019, lng: 88.6411 },
  { name: "Pemayangtse Monastery", lat: 27.2152, lng: 88.2426 },
  { name: "Tashiding Monastery", lat: 27.3333, lng: 88.2667 },
]

export function LocationInput({
  sourceLocation,
  destination,
  onSourceChange,
  onDestinationChange,
  onLocationSet,
}: LocationInputProps) {
  const [sourceInput, setSourceInput] = useState("")
  const [destinationInput, setDestinationInput] = useState("")
  const [sourceSuggestions, setSourceSuggestions] = useState<Location[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<Location[]>([])

  const handleSourceInputChange = (value: string) => {
    setSourceInput(value)
    if (value.length > 0) {
      const filtered = sampleLocations.filter((loc) => loc.name.toLowerCase().includes(value.toLowerCase()))
      setSourceSuggestions(filtered)
    } else {
      setSourceSuggestions([])
    }
  }

  const handleDestinationInputChange = (value: string) => {
    setDestinationInput(value)
    if (value.length > 0) {
      const filtered = sampleLocations.filter((loc) => loc.name.toLowerCase().includes(value.toLowerCase()))
      setDestinationSuggestions(filtered)
    } else {
      setDestinationSuggestions([])
    }
  }

  const selectSourceLocation = (location: Location) => {
    setSourceInput(location.name)
    onSourceChange(location)
    setSourceSuggestions([])
  }

  const selectDestinationLocation = (location: Location) => {
    setDestinationInput(location.name)
    onDestinationChange(location)
    setDestinationSuggestions([])
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation: Location = {
            name: "Current Location",
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setSourceInput("Current Location")
          onSourceChange(currentLocation)
        },
        (error) => {
          console.error("Error getting location:", error)
          // Fallback to Gangtok as default
          const gangtok = sampleLocations[0]
          setSourceInput(gangtok.name)
          onSourceChange(gangtok)
        },
      )
    }
  }

  const canProceed = sourceLocation && destination

  return (
    <div className="space-y-6">
      {/* Source Location */}
      <div className="space-y-2">
        <Label htmlFor="source" className="text-sm font-medium">
          Starting Point (Hotel/Current Location)
        </Label>
        <div className="relative">
          <Input
            id="source"
            placeholder="Enter your starting location..."
            value={sourceInput}
            onChange={(e) => handleSourceInputChange(e.target.value)}
            className="pr-12"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={getCurrentLocation}
          >
            <Navigation className="h-4 w-4" />
          </Button>

          {sourceSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-border rounded-md shadow-lg z-10 mt-1">
              {sourceSuggestions.map((location, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-sm"
                  onClick={() => selectSourceLocation(location)}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {location.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Destination */}
      <div className="space-y-2">
        <Label htmlFor="destination" className="text-sm font-medium">
          Destination
        </Label>
        <div className="relative">
          <Input
            id="destination"
            placeholder="Where would you like to go?"
            value={destinationInput}
            onChange={(e) => handleDestinationInputChange(e.target.value)}
          />

          {destinationSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-border rounded-md shadow-lg z-10 mt-1">
              {destinationSuggestions.map((location, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-sm"
                  onClick={() => selectDestinationLocation(location)}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {location.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={onLocationSet}
        disabled={!canProceed}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        size="lg"
      >
        <MapPin className="h-4 w-4 mr-2" />
        Show Route & Transport Options
      </Button>
    </div>
  )
}
