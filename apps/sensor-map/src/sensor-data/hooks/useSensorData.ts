import { useQuery } from '@tanstack/react-query'
import { SensorFeatureCollectionSchema, type SensorFeatureCollection } from 'shared-schemas'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

interface SensorQueryParams {
  network?: string | null
  timeFrom?: Date | null
  timeTo?: Date | null
}

// Fetch sensor data from backend with filters
async function fetchSensorData(params: SensorQueryParams): Promise<SensorFeatureCollection> {
  const searchParams = new URLSearchParams()
  
  if (params.network) {
    searchParams.append('network', params.network)
  }
  if (params.timeFrom) {
    searchParams.append('timeFrom', params.timeFrom.toISOString())
  }
  if (params.timeTo) {
    searchParams.append('timeTo', params.timeTo.toISOString())
  }
  
  const queryString = searchParams.toString()
  const url = `${BACKEND_URL}/sensors${queryString ? `?${queryString}` : ''}`
  
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`)
    }
    
    const rawData = await response.json()
    return SensorFeatureCollectionSchema.parse(rawData)
  } catch (error) {
    // Fallback to local JSON
    console.warn('Backend unavailable, falling back to local data:', error)
    const response = await fetch(`${import.meta.env.BASE_URL}tryout_data.json`)
    const rawData = await response.json()
    return SensorFeatureCollectionSchema.parse(rawData)
  }
}

export function useSensorData(params: SensorQueryParams) {
  return useQuery({
    queryKey: ['sensors', params.network, params.timeFrom?.toISOString(), params.timeTo?.toISOString()],
    queryFn: () => fetchSensorData(params),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while loading - no flickering!
  })
}

