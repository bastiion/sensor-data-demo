import { useQuery } from '@tanstack/react-query'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

interface SensorMetadata {
  minDate: string
  maxDate: string
  networks: string[]
}

async function fetchMetadata(): Promise<SensorMetadata> {
  const response = await fetch(`${BACKEND_URL}/sensors/metadata`)
  if (!response.ok) {
    throw new Error('Failed to fetch metadata')
  }
  return response.json()
}

export function useSensorMetadata() {
  return useQuery({
    queryKey: ['sensors', 'metadata'],
    queryFn: fetchMetadata,
    staleTime: 10 * 60 * 1000, // Metadata doesn't change often - 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  })
}

