import { useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { useSensorStore } from '@/sensor-data/store/useSensorStore'
import { SensorMap } from '@/sensor-data/components/SensorMap'
import { FilterPanel } from '@/sensor-data/components/FilterPanel'

function App() {
  const { loadData, loaded, loading, error } = useSensorStore()

  // Load data on mount
  useEffect(() => {
    if (!loaded && !loading) {
      loadData()
    }
  }, [loadData, loaded, loading])

  if (error) {
    return (
      <Box height="100vh" width="100vw" display="flex" alignItems="center" justifyContent="center" bg="bg">
        <Box textAlign="center" p={4}>
          <Box fontSize="xl" fontWeight="bold" mb={2} color="red.500">
            Error Loading Data
          </Box>
          <Box color="fg.muted">{error}</Box>
        </Box>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box height="100vh" width="100vw" display="flex" alignItems="center" justifyContent="center" bg="bg">
        <Box textAlign="center" p={4}>
          <Box fontSize="xl" fontWeight="bold" mb={2}>
            Loading Sensor Data...
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box height="100vh" width="100vw" display="flex" flexDirection="column" overflow="hidden" bg="bg">
      {/* Filter Panel - 20% */}
      <Box height="20vh" overflow="auto">
        <FilterPanel />
      </Box>
      
      {/* Map - 80% */}
      <Box height="80vh" overflow="hidden">
        <SensorMap />
      </Box>
    </Box>
  )
}

export default App
