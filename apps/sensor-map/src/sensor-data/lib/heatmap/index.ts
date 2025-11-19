/**
 * Temperature heatmap module
 * Provides WebGL-based temperature interpolation and visualization for MapLibre GL
 */

export { useTemperatureHeatmap } from './useTemperatureHeatmap'
export { TemperatureHeatmapLayer } from './TemperatureHeatmapLayer'
export { calculateBounds, interpolateGrid, type InterpolationOptions } from './interpolate'
export type {
  GeographicBounds,
  ColorRampConfig,
  HeatmapOptions,
} from './types'
