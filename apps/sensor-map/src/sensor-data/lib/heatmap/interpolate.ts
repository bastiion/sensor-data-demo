import { distance } from '@turf/turf'
import type { GeographicBounds } from './types'
import type { SensorStation } from '@/sensor-data/store/useSensorStore'

/**
 * Options for grid interpolation
 */
export interface InterpolationOptions {
  bounds: GeographicBounds
  gridResolution: number
  maxDistanceKm: number
  idwPower: number
}

/**
 * Calculate optimal bounds from sensor stations
 */
export function calculateBounds(
  stations: SensorStation[],
  padding: number = 0.1
): GeographicBounds {
  if (stations.length === 0) {
    // Default bounds (Germany)
    return { north: 55, south: 47, east: 15, west: 5 }
  }

  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity

  for (const station of stations) {
    const [lng, lat] = station.coordinates
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
  }

  // Add padding
  const latPadding = (maxLat - minLat) * padding
  const lngPadding = (maxLng - minLng) * padding

  return {
    north: maxLat + latPadding,
    south: minLat - latPadding,
    east: maxLng + lngPadding,
    west: minLng - lngPadding,
  }
}

/**
 * Generate grid point coordinates based on bounds and resolution
 */
function generateGridPoints(
  bounds: GeographicBounds,
  gridResolution: number
): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = []
  const latStep = (bounds.north - bounds.south) / (gridResolution - 1)
  const lngStep = (bounds.east - bounds.west) / (gridResolution - 1)

  for (let i = 0; i < gridResolution; i++) {
    for (let j = 0; j < gridResolution; j++) {
      const lat = bounds.south + i * latStep
      const lng = bounds.west + j * lngStep
      points.push({ lat, lng })
    }
  }

  return points
}

/**
 * Interpolate temperature at a specific grid point using IDW
 */
function interpolatePoint(
  gridPoint: { lat: number; lng: number },
  stations: SensorStation[],
  maxDistanceKm: number,
  idwPower: number
): number {
  const gridCoord = [gridPoint.lng, gridPoint.lat] as [number, number]

  // Calculate distances and filter by max distance
  const stationsWithDistance = stations
    .map(station => {
      const stationCoord = station.coordinates as [number, number]
      const dist = distance(gridCoord, stationCoord, { units: 'kilometers' })
      return {
        station,
        distance: dist,
      }
    })
    .filter(item => item.distance <= maxDistanceKm)

  if (stationsWithDistance.length === 0) {
    // No stations within range, return 0 (will be treated as no-data)
    return 0
  }

  // If there's a station very close (< 0.01 km), use its value directly
  const veryClose = stationsWithDistance.find(item => item.distance < 0.01)
  if (veryClose && veryClose.station.currentReading) {
    return veryClose.station.currentReading.value!
  }

  // Apply IDW formula
  let weightedSum = 0
  let weightSum = 0

  for (const item of stationsWithDistance) {
    if (!item.station.currentReading || item.station.currentReading.value === null) {
      continue
    }

    const weight = 1 / Math.pow(item.distance, idwPower)
    weightedSum += weight * item.station.currentReading.value
    weightSum += weight
  }

  if (weightSum === 0) {
    return 0
  }

  return weightedSum / weightSum
}

/**
 * Interpolate temperature values for all grid points using IDW
 * @param stations Array of sensor stations with current readings
 * @param options Interpolation options
 * @returns Float32Array of interpolated temperature values
 */
export function interpolateGrid(
  stations: SensorStation[],
  options: InterpolationOptions
): Float32Array {
  const { bounds, gridResolution, maxDistanceKm, idwPower } = options
  const gridData = new Float32Array(gridResolution * gridResolution)

  // Filter stations with valid temperature readings
  const validStations = stations.filter(
    station => station.currentReading !== null && station.currentReading.value !== null
  )

  if (validStations.length === 0) {
    // No valid data, return empty grid
    return gridData
  }

  // Generate grid points
  const gridPoints = generateGridPoints(bounds, gridResolution)

  // Interpolate for each grid point
  for (let i = 0; i < gridPoints.length; i++) {
    const gridPoint = gridPoints[i]
    const interpolatedValue = interpolatePoint(
      gridPoint,
      validStations,
      maxDistanceKm,
      idwPower
    )
    gridData[i] = interpolatedValue
  }

  return gridData
}
