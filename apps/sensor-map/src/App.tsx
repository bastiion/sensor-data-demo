import { Box } from '@chakra-ui/react'
import { SensorMap } from '@/sensor-data/components/SensorMap'
import { FilterPanel } from '@/sensor-data/components/FilterPanel'

function App() {
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
