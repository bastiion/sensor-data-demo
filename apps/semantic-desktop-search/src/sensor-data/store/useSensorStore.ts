import { create } from 'zustand'
import { SensorFeatureCollection, SensorFeatureCollectionSchema, SensorFeature } from '@/lib/sensorDataSchema'

export interface GeoBounds {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

export interface TimeRange {
  start?: Date
  end?: Date
}

interface SensorState {
  // Data state
  loaded: boolean
  loading: boolean
  error: string | null
  data: SensorFeatureCollection | null
  filteredData: SensorFeature[]
  
  // Filters
  timeRange: TimeRange
  geoBounds: GeoBounds | null
  
  // Actions
  loadData: () => Promise<void>
  setTimeRange: (start?: Date, end?: Date) => void
  setGeoBounds: (bounds: GeoBounds | null) => void
  resetFilters: () => void
}

// Helper function to filter data based on current filters
const applyFilters = (
  data: SensorFeatureCollection | null,
  timeRange: TimeRange,
  geoBounds: GeoBounds | null
): SensorFeature[] => {
  if (!data) return []
  
  let filtered = data.features
  
  // Apply time filter
  if (timeRange.start || timeRange.end) {
    filtered = filtered.filter(feature => {
      const featureTime = new Date(feature.properties.time)
      
      if (timeRange.start && featureTime < timeRange.start) {
        return false
      }
      
      if (timeRange.end && featureTime > timeRange.end) {
        return false
      }
      
      return true
    })
  }
  
  // Apply geo bounds filter
  if (geoBounds) {
    filtered = filtered.filter(feature => {
      const [lng, lat] = feature.geometry.coordinates
      
      return (
        lat >= geoBounds.minLat &&
        lat <= geoBounds.maxLat &&
        lng >= geoBounds.minLng &&
        lng <= geoBounds.maxLng
      )
    })
  }
  
  return filtered
}

export const useSensorStore = create<SensorState>((set, get) => ({
  // Initial state
  loaded: false,
  loading: false,
  error: null,
  data: null,
  filteredData: [],
  timeRange: {},
  geoBounds: null,
  
  // Load data from JSON file
  loadData: async () => {
    set({ loading: true, error: null })
    
    try {
      // Import the data from public directory
      const response = await fetch('/tryout_data.json')
      const rawData = await response.json()
      
      // Validate with Zod schema
      const validatedData = SensorFeatureCollectionSchema.parse(rawData)
      
      // Update state and apply filters
      const { timeRange, geoBounds } = get()
      const filteredData = applyFilters(validatedData, timeRange, geoBounds)
      
      set({
        data: validatedData,
        filteredData,
        loaded: true,
        loading: false,
      })
    } catch (error) {
      console.error('Failed to load sensor data:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to load data',
        loading: false,
        loaded: false,
      })
    }
  },
  
  // Set time range filter
  setTimeRange: (start?: Date, end?: Date) => {
    const { data, geoBounds } = get()
    const timeRange = { start, end }
    const filteredData = applyFilters(data, timeRange, geoBounds)
    
    set({ timeRange, filteredData })
  },
  
  // Set geo bounds filter
  setGeoBounds: (bounds: GeoBounds | null) => {
    const { data, timeRange } = get()
    const filteredData = applyFilters(data, timeRange, bounds)
    
    set({ geoBounds: bounds, filteredData })
  },
  
  // Reset all filters
  resetFilters: () => {
    const { data } = get()
    const timeRange = {}
    const geoBounds = null
    const filteredData = applyFilters(data, timeRange, geoBounds)
    
    set({ timeRange, geoBounds, filteredData })
  },
}))

