"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, Bus, Users, Calendar, IndianRupee, MapPin } from "lucide-react"
import type { BookingRecord } from "@/hooks/use-booking-state"

interface BookingHistoryProps {
  bookings: BookingRecord[]
}

export function BookingHistory({ bookings }: BookingHistoryProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "cab":
        return <Car className="h-4 w-4" />
      case "minibus":
        return <Users className="h-4 w-4" />
      case "bus":
        return <Bus className="h-4 w-4" />
      default:
        return <Car className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (bookings.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
          <p className="text-muted-foreground">
            Your booking history will appear here once you make your first booking.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking History
          </CardTitle>
          <CardDescription>Your recent travel bookings and their status</CardDescription>
        </CardHeader>
      </Card>

      {bookings.map((booking) => (
        <Card key={booking.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">{getIcon(booking.transportType)}</div>
                <div>
                  <h4 className="font-semibold">{booking.transportName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {booking.bookedAt.toLocaleDateString()} at {booking.bookedAt.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-lg font-semibold mb-1">
                  <IndianRupee className="h-4 w-4" />
                  {booking.fare}
                </div>
                <Badge className={getStatusColor(booking.status)} variant="secondary">
                  {booking.status}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{booking.sourceLocation.name}</span>
              <span>→</span>
              <span>{booking.destination.name}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
