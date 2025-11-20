import { useEffect, useRef, useMemo } from 'react'
import type { Map as MaplibreMap } from 'maplibre-gl'
import { calculateBounds, interpolateGrid, type InterpolationOptions } from './interpolate'
import { TemperatureHeatmapLayer } from './TemperatureHeatmapLayer'
import { TemperatureHeatmapShaderLayer } from './TemperatureHeatmapShaderLayer'
import type { HeatmapOptions } from './types'
import type { SensorStation } from '@/sensor-data/store/useSensorStore'
import { useHeatmapStore } from '@/sensor-data/store/useHeatmapStore'

/**
 * Hook to manage temperature heatmap layer
 * Automatically updates the heatmap when selectedTime changes
 * Supports both CPU-based (pre-computed grid) and GPU-based (shader) interpolation
 */
export function useTemperatureHeatmap(
  map: MaplibreMap | null,
  stations: SensorStation[],
  selectedTime: Date | null,
  enabled: boolean,
  useShaderLayer: boolean,
  options: HeatmapOptions = {}
) {
  const layerRef = useRef<TemperatureHeatmapLayer | TemperatureHeatmapShaderLayer | null>(null)
  
  // Get settings from heatmap store
  const {
    maxDistanceKm: storeMaxDistanceKm,
    idwPower: storeIdwPower,
    colorRampMin,
    colorRampMax,
    opacity: storeOpacity,
  } = useHeatmapStore()

  // Memoize interpolation options (merge store values with options, options take priority)
  const interpolationOptions = useMemo((): InterpolationOptions => ({
    bounds: options.bounds ?? calculateBounds(stations),
    gridResolution: options.gridResolution ?? 100,
    maxDistanceKm: options.maxDistanceKm ?? storeMaxDistanceKm,
    idwPower: options.idwPower ?? storeIdwPower,
  }), [options.bounds, options.gridResolution, options.maxDistanceKm, options.idwPower, stations, storeMaxDistanceKm, storeIdwPower])
  
  // Memoize color ramp and opacity
  const colorRamp = useMemo(() => 
    options.colorRamp ?? { min: colorRampMin, max: colorRampMax },
    [options.colorRamp, colorRampMin, colorRampMax]
  )
  
  const opacity = options.opacity ?? storeOpacity

  // Initialize layer and manage visibility based on enabled state and layer type
  useEffect(() => {
    if (!map || stations.length === 0) return

    // Check if we need to switch layer types
    const needsLayerSwitch = layerRef.current && 
      ((useShaderLayer && layerRef.current instanceof TemperatureHeatmapLayer) ||
       (!useShaderLayer && layerRef.current instanceof TemperatureHeatmapShaderLayer))

    // Remove old layer if switching types
    if (needsLayerSwitch && layerRef.current) {
      const oldLayerId = layerRef.current.id
      if (map.getLayer(oldLayerId)) {
        map.removeLayer(oldLayerId)
      }
      layerRef.current = null
    }

    // Create layer instance if it doesn't exist or was just removed
    if (!layerRef.current) {
      if (useShaderLayer) {
        layerRef.current = new TemperatureHeatmapShaderLayer(
          interpolationOptions.bounds,
          colorRamp,
          opacity,
          interpolationOptions.idwPower,
          interpolationOptions.maxDistanceKm
        )
      } else {
        layerRef.current = new TemperatureHeatmapLayer(
          interpolationOptions.gridResolution,
          interpolationOptions.bounds,
          colorRamp,
          opacity
        )
      }
    } else {
      // Update existing layer's settings
      layerRef.current.updateColorRamp(colorRamp)
      layerRef.current.updateOpacity(opacity)
      
      // Update shader layer specific settings
      if (layerRef.current instanceof TemperatureHeatmapShaderLayer) {
        layerRef.current.updateIdwPower(interpolationOptions.idwPower)
        layerRef.current.updateMaxDistance(interpolationOptions.maxDistanceKm)
      }
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
  }, [map, stations, interpolationOptions, colorRamp, opacity, enabled, useShaderLayer])

  // Update layer data when selectedTime changes or when enabled becomes true
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

    // Update layer based on type
    if (layerRef.current instanceof TemperatureHeatmapShaderLayer) {
      // GPU shader layer - pass station data directly
      layerRef.current.updateStations(stationsAtTime)
    } else {
      // CPU layer - compute grid and update texture
      const gridData = interpolateGrid(stationsAtTime, interpolationOptions)
      layerRef.current.updateTexture(gridData)
    }
  }, [selectedTime, stations, interpolationOptions, colorRamp, enabled, useShaderLayer])

  return layerRef.current
}

