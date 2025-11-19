import { useEffect, useRef, useMemo } from 'react'
import type { Map as MaplibreMap } from 'maplibre-gl'
import { calculateBounds, interpolateGrid, type InterpolationOptions } from './interpolate'
import { TemperatureHeatmapLayer } from './TemperatureHeatmapLayer'
import type { HeatmapOptions } from './types'
import type { SensorStation } from '@/sensor-data/store/useSensorStore'

/**
 * Hook to manage temperature heatmap layer
 * Automatically updates the heatmap when selectedTime changes
 */
export function useTemperatureHeatmap(
  map: MaplibreMap | null,
  stations: SensorStation[],
  selectedTime: Date | null,
  enabled: boolean,
  options: HeatmapOptions = {}
) {
  const layerRef = useRef<TemperatureHeatmapLayer | null>(null)

  // Memoize interpolation options
  const interpolationOptions = useMemo((): InterpolationOptions => ({
    bounds: options.bounds ?? calculateBounds(stations),
    gridResolution: options.gridResolution ?? 100,
    maxDistanceKm: options.maxDistanceKm ?? 30,
    idwPower: options.idwPower ?? 2,
  }), [options.bounds, options.gridResolution, options.maxDistanceKm, options.idwPower, stations])

  // Initialize layer and manage visibility based on enabled state
  useEffect(() => {
    if (!map || stations.length === 0) return

    const colorRamp = options.colorRamp ?? { min: 0, max: 20 }
    const opacity = options.opacity ?? 0.7

    // Create layer instance if it doesn't exist
    if (!layerRef.current) {
      layerRef.current = new TemperatureHeatmapLayer(
        interpolationOptions.gridResolution,
        interpolationOptions.bounds,
        colorRamp,
        opacity
      )
    }

    const layerId = layerRef.current.id
    const layerExists = map.getLayer(layerId)

    // Add or remove layer based on enabled state
    if (enabled && !layerExists) {
      // Add layer when enabled
      map.addLayer(layerRef.current as any, 'sensors-circle')
    } else if (!enabled && layerExists) {
      // Remove layer when disabled
      map.removeLayer(layerId)
    }

    // Cleanup
    return () => {
      if (layerRef.current && map.getLayer(layerRef.current.id)) {
        map.removeLayer(layerRef.current.id)
      }
      layerRef.current = null
    }
  }, [map, stations, interpolationOptions, options.colorRamp, options.opacity, enabled])

  // Update texture when selectedTime changes or when enabled becomes true
  useEffect(() => {
    if (!layerRef.current || !enabled) return

    // Use selectedTime if available, otherwise use current readings from stations
    const timeToUse = selectedTime

    // Find nearest reading for each station at this timestamp
    const stationsAtTime = stations.map(station => {
      if (station.readings.length === 0) {
        return { ...station, currentReading: null }
      }

      // If no time selected, use the station's currentReading if available, otherwise first reading
      if (!timeToUse) {
        return {
          ...station,
          currentReading: station.currentReading || station.readings[0] || null,
        }
      }

      // Find nearest reading to selected time
      let nearestReading = station.readings[0] || null
      let minDiff = nearestReading
        ? Math.abs(nearestReading.time.getTime() - timeToUse.getTime())
        : Infinity

      for (const reading of station.readings) {
        const diff = Math.abs(reading.time.getTime() - timeToUse.getTime())
        if (diff < minDiff) {
          minDiff = diff
          nearestReading = reading
        }
      }

      return {
        ...station,
        currentReading: nearestReading,
      }
    })

    // Interpolate and update texture
    const gridData = interpolateGrid(stationsAtTime, interpolationOptions)
    layerRef.current.updateTexture(gridData)
  }, [selectedTime, stations, interpolationOptions, enabled])

  return layerRef.current
}

