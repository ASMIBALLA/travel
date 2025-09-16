"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, Bus, Users, Clock, IndianRupee, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useBookingState, type Location } from "@/hooks/use-booking-state"

interface TransportOptionsProps {
  sourceLocation: Location | null
  destination: Location | null
  isVisible: boolean
}

interface TransportOption {
  id: string
  type: "cab" | "minibus" | "bus"
  name: string
  capacity: number
  estimatedTime: string
  fare: number
  rating: number
  features: string[]
  availability: "available" | "limited" | "unavailable"
}

export function TransportOptions({ sourceLocation, destination, isVisible }: TransportOptionsProps) {
  const { toast } = useToast()
  const { addBookingRecord } = useBookingState()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  // Calculate approximate distance (simplified)
  const calculateDistance = () => {
    if (!sourceLocation || !destination) return 0
    const R = 6371 // Earth's radius in km
    const dLat = ((destination.lat - sourceLocation.lat) * Math.PI) / 180
    const dLon = ((destination.lng - sourceLocation.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((sourceLocation.lat * Math.PI) / 180) *
        Math.cos((destination.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const distance = calculateDistance()

  const transportOptions: TransportOption[] = [
    {
      id: "cab-1",
      type: "cab",
      name: "Private Cab",
      capacity: 4,
      estimatedTime: `${Math.ceil(distance * 2)} mins`,
      fare: Math.ceil(distance * 25),
      rating: 4.8,
      features: ["AC", "GPS Tracking", "English Speaking Driver"],
      availability: "available",
    },
    {
      id: "minibus-1",
      type: "minibus",
      name: "Shared Mini Bus",
      capacity: 12,
      estimatedTime: `${Math.ceil(distance * 2.5)} mins`,
      fare: Math.ceil(distance * 12),
      rating: 4.5,
      features: ["Comfortable Seating", "Local Guide", "Multiple Stops"],
      availability: "available",
    },
    {
      id: "bus-1",
      type: "bus",
      name: "Local Bus",
      capacity: 30,
      estimatedTime: `${Math.ceil(distance * 3)} mins`,
      fare: Math.ceil(distance * 8),
      rating: 4.2,
      features: ["Budget Friendly", "Scenic Route", "Local Experience"],
      availability: "limited",
    },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case "cab":
        return <Car className="h-5 w-5" />
      case "minibus":
        return <Users className="h-5 w-5" />
      case "bus":
        return <Bus className="h-5 w-5" />
      default:
        return <Car className="h-5 w-5" />
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-green-100 text-green-800"
      case "limited":
        return "bg-yellow-100 text-yellow-800"
      case "unavailable":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleBooking = (option: TransportOption) => {
    if (!sourceLocation || !destination) return

    setSelectedOption(option.id)

    addBookingRecord({
      sourceLocation,
      destination,
      transportType: option.type,
      transportName: option.name,
      fare: option.fare,
      status: "confirmed",
    })

    toast({
      title: "Booking Confirmed!",
      description: `Your ${option.name} has been booked. Driver will contact you shortly.`,
    })

    // Simulate booking process
    setTimeout(() => {
      setSelectedOption(null)
    }, 3000)
  }

  if (!isVisible || !sourceLocation || !destination) return null

  return (
    <div
      className={`transition-all duration-700 transform ${
        isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-full opacity-0 scale-95"
      }`}
    >
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-green-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Available Transport Options</CardTitle>
          <CardDescription>Choose your preferred transport for the journey ({distance.toFixed(1)} km)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {transportOptions.map((option, index) => (
            <Card
              key={option.id}
              className={`transition-all duration-300 hover:shadow-md cursor-pointer transform ${
                selectedOption === option.id ? "ring-2 ring-primary" : ""
              } ${isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">{getIcon(option.type)}</div>
                    <div>
                      <h4 className="font-medium">{option.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{option.estimatedTime}</span>
                        <span>•</span>
                        <Users className="h-3 w-3" />
                        <span>{option.capacity} seats</span>
                        <span>•</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{option.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-lg font-semibold">
                      <IndianRupee className="h-4 w-4" />
                      {option.fare}
                    </div>
                    <Badge className={getAvailabilityColor(option.availability)} variant="secondary">
                      {option.availability}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {option.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                <Button
                  className="w-full mt-3"
                  onClick={() => handleBooking(option)}
                  disabled={option.availability === "unavailable" || selectedOption === option.id}
                  variant={option.availability === "available" ? "default" : "secondary"}
                >
                  {selectedOption === option.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Booking...
                    </>
                  ) : (
                    `Book ${option.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
