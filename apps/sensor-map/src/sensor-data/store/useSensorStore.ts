import { create } from 'zustand'
import { type SensorFeatureCollection, SensorFeatureCollectionSchema } from '@/lib/sensorDataSchema'

export interface DataBounds {
  minTime: Date
  maxTime: Date
}

export interface SensorReading {
  time: Date
  value: number | null
  hi: number | null
  lo: number | null
  c: number
  uom: string
}

export interface SensorStation {
  id: string
  name: string
  description: string
  network: string
  coordinates: [number, number]
  readings: SensorReading[]
  currentReading: SensorReading | null
}

interface SensorState {
  // Data state
  loaded: boolean
  loading: boolean
  error: string | null
  rawData: SensorFeatureCollection | null
  sensorStations: SensorStation[]
  dataBounds: DataBounds | null
  
  // Filters
  selectedTime: Date | null
  heatmapEnabled: boolean
  
  // Actions
  loadData: () => Promise<void>
  setSelectedTime: (time: Date | null) => void
  toggleHeatmap: () => void
  resetFilters: () => void
}

// Aggregate raw data into sensor stations
const aggregateSensorStations = (
  data: SensorFeatureCollection | null
): SensorStation[] => {
  if (!data) return []
  
  const stationMap = new Map<string, SensorStation>()
  
  data.features.forEach(feature => {
    const id = feature.properties.id
    
    if (!stationMap.has(id)) {
      stationMap.set(id, {
        id,
        name: feature.properties.name,
        description: feature.properties.description,
        network: feature.properties.network,
        coordinates: feature.geometry.coordinates,
        readings: [],
        currentReading: null,
      })
    }
    
    const station = stationMap.get(id)!
    station.readings.push({
      time: new Date(feature.properties.time),
      value: feature.properties.v,
      hi: feature.properties.hi,
      lo: feature.properties.lo,
      c: feature.properties.c,
      uom: feature.properties.uom,
    })
  })
  
  // Sort readings by time for each station
  stationMap.forEach(station => {
    station.readings.sort((a, b) => a.time.getTime() - b.time.getTime())
  })
  
  return Array.from(stationMap.values())
}

// Find the nearest reading to the selected time for each station
const updateCurrentReadings = (
  stations: SensorStation[],
  selectedTime: Date | null
): SensorStation[] => {
  return stations.map(station => {
    if (station.readings.length === 0) {
      return { ...station, currentReading: null }
    }
    
    const firstReading = station.readings[0]
    if (!firstReading) {
      return { ...station, currentReading: null }
    }
    
    // If no time selected, use first reading
    if (!selectedTime) {
      return {
        ...station,
        currentReading: firstReading,
      }
    }
    
    // Find nearest reading to selected time
    let nearestReading: SensorReading = firstReading
    let minDiff = Math.abs(firstReading.time.getTime() - selectedTime.getTime())
    
    for (const reading of station.readings) {
      const diff = Math.abs(reading.time.getTime() - selectedTime.getTime())
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
}

export const useSensorStore = create<SensorState>((set, get) => ({
  // Initial state
  loaded: false,
  loading: false,
  error: null,
  rawData: null,
  sensorStations: [],
  dataBounds: null,
  selectedTime: null,
  heatmapEnabled: false,
  
  // Load data from JSON file
  loadData: async () => {
    set({ loading: true, error: null })
    
    try {
      // Import the data from public directory
      const response = await fetch(`${import.meta.env.BASE_URL}tryout_data.json`)
      const rawData = await response.json()
      
      // Validate with Zod schema
      const validatedData = SensorFeatureCollectionSchema.parse(rawData)
      
      // Calculate data time bounds
      const times = validatedData.features
        .map(f => new Date(f.properties.time))
        .sort((a, b) => a.getTime() - b.getTime())
      
      let dataBounds: DataBounds | null = null
      if (times.length > 0) {
        const minTime = times[0]
        const maxTime = times[times.length - 1]
        if (minTime && maxTime) {
          dataBounds = { minTime, maxTime }
        }
      }
      
      // Aggregate data into sensor stations
      const stations = aggregateSensorStations(validatedData)
      
      // Set initial current readings (first reading for each station)
      const stationsWithReadings = updateCurrentReadings(stations, null)
      
      set({
        rawData: validatedData,
        sensorStations: stationsWithReadings,
        dataBounds,
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
  
  // Set selected time point - updates current readings for all stations
  setSelectedTime: (time: Date | null) => {
    const { sensorStations } = get()
    const updatedStations = updateCurrentReadings(sensorStations, time)
    
    set({ selectedTime: time, sensorStations: updatedStations })
  },
  
  // Toggle heatmap visibility
  toggleHeatmap: () => {
    set((state) => ({ heatmapEnabled: !state.heatmapEnabled }))
  },
  
  // Reset filters
  resetFilters: () => {
    const { sensorStations } = get()
    const updatedStations = updateCurrentReadings(sensorStations, null)
    
    set({ selectedTime: null, sensorStations: updatedStations, heatmapEnabled: false })
  },
}))

