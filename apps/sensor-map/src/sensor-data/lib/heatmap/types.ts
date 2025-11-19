/**
 * Type definitions for temperature heatmap functionality
 */

/**
 * Geographic bounds for the interpolation grid
 */
export interface GeographicBounds {
  north: number
  south: number
  east: number
  west: number
}

/**
 * Color ramp configuration for temperature visualization
 */
export interface ColorRampConfig {
  min: number // Minimum temperature in Celsius
  max: number // Maximum temperature in Celsius
}

/**
 * Configuration options for the heatmap
 */
export interface HeatmapOptions {
  gridResolution?: number // Grid size (e.g., 100 for 100x100 grid)
  maxDistanceKm?: number // Maximum distance for IDW interpolation in kilometers
  idwPower?: number // Power parameter for IDW (typically 2)
  colorRamp?: ColorRampConfig
  bounds?: GeographicBounds // Optional bounds, auto-calculated if not provided
  opacity?: number // Layer opacity (0.0 to 1.0)
}
