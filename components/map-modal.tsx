"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Maximize2, Minimize2 } from "lucide-react"
import L, { LatLngExpression } from "leaflet"
import axios from "axios"

interface Location {
  name: string
  lat: number
  lng: number
}

interface Driver {
  id: string
  type: "cab" | "bus"
  lat: number
  lng: number
  name?: string
  route?: string
}

interface MapModalProps {
  isOpen: boolean
  onClose: () => void
  sourceLocation: Location | null
  destination: Location | null
  drivers?: Driver[]
  children?: React.ReactNode
  isMapMinimized: boolean
  onRouteDrawn: (distance: number, duration: number) => void
  onToggleMapSize: () => void
}

export function MapModal({
  isOpen,
  onClose,
  sourceLocation,
  destination,
  drivers = [],
  children,
  isMapMinimized,
  onRouteDrawn,
  onToggleMapSize,
}: MapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const routeRef = useRef<L.Polyline | null>(null)
  const driverMarkersRef = useRef<{ [key: string]: L.Marker }>({})

  useEffect(() => {
    if (!isOpen || !sourceLocation || !destination) return

    const initializeMap = async () => {
      // Dynamically import Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      if (mapRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView([sourceLocation.lat, sourceLocation.lng], 13)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
          maxZoom: 18,
        }).addTo(mapInstanceRef.current)

        // Source & Destination markers
        const sourceMarker = L.marker([sourceLocation.lat, sourceLocation.lng]).addTo(mapInstanceRef.current)
        const destMarker = L.marker([destination.lat, destination.lng]).addTo(mapInstanceRef.current)

        // Fit map bounds
        const group = L.featureGroup([sourceMarker, destMarker])
        mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [20, 20] })

        setIsMapLoaded(true)
      }
    }

    initializeMap()
  }, [isOpen, sourceLocation, destination])

  // Dynamic route fetching
  useEffect(() => {
    if (!mapInstanceRef.current || !sourceLocation || !destination) return

    const fetchRoute = async () => {
      try {
        const response = await axios.get(
          `https://router.project-osrm.org/route/v1/driving/${sourceLocation.lng},${sourceLocation.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
        )

        const routeData = response.data.routes[0]
        const coordinates: LatLngExpression[] = routeData.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        )

        // Remove previous route if exists
        if (routeRef.current) {
          routeRef.current.setLatLngs(coordinates)
        } else {
          routeRef.current = L.polyline(coordinates, { color: "#15803d", weight: 4 }).addTo(mapInstanceRef.current)
        }

        // Fit map to route bounds
        mapInstanceRef.current.fitBounds(routeRef.current.getBounds(), { padding: [20, 20] })

        // Callback with distance & duration
        onRouteDrawn(routeData.distance, routeData.duration)

      } catch (err) {
        console.error("OSRM fetch route error:", err)
      }
    }

    fetchRoute()
  }, [sourceLocation, destination, onRouteDrawn])

  // Real-time driver markers update
  useEffect(() => {
    if (!mapInstanceRef.current) return

    drivers.forEach((driver) => {
      if (driverMarkersRef.current[driver.id]) {
        // Move existing marker smoothly
        driverMarkersRef.current[driver.id].setLatLng([driver.lat, driver.lng])
      } else {
        // Add new driver marker
        const marker = L.marker([driver.lat, driver.lng], {
          icon: L.divIcon({
            html: `<div class="w-4 h-4 rounded-full border border-white shadow-md ${
              driver.type === "cab" ? "bg-yellow-500" : "bg-blue-500"
            }"></div>`,
            className: "",
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          }),
        }).addTo(mapInstanceRef.current)
        marker.bindPopup(`<strong>${driver.type === "cab" ? "Cab" : "Bus"}</strong><br/>${driver.name || driver.route}`)
        driverMarkersRef.current[driver.id] = marker
      }
    })
  }, [drivers])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div
        className={`fixed bg-white rounded-lg shadow-2xl flex flex-col transition-all duration-700 ease-in-out ${
          isMapMinimized ? "top-4 left-4 right-4 h-64" : "inset-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-primary">Route Map</h3>
            <p className="text-sm text-muted-foreground">
              {sourceLocation?.name} → {destination?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onToggleMapSize}>
              {isMapMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full rounded-b-lg" />

          {!isMapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Children / Transport Options */}
      {children && (
        <div
          className={`fixed left-4 right-4 ${
            isMapMinimized ? "top-72 bottom-4 overflow-y-auto" : "bottom-8"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  )
}
