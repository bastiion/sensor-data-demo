import { Box, Button, Stack, Text } from '@chakra-ui/react'
import { useSensorStore } from '../store/useSensorStore'
import { DateTimeRangeSlider } from './DateTimeRangeSlider'
import { HeatmapControls } from './HeatmapControls'

export const FilterPanel = () => {
  const { setSelectedTime, resetFilters, dataBounds, sensorStations, heatmapEnabled, toggleHeatmap, useShaderInterpolation, toggleShaderInterpolation } = useSensorStore()

  const handleTimeChange = (time: Date) => {
    setSelectedTime(time)
  }

  const handleReset = () => {
    resetFilters()
  }

  // Count sensors with readings at current time
  const sensorsWithReadings = sensorStations.filter(s => s.currentReading !== null).length

  return (
    <Box bg="bg.subtle" p={4} borderBottom="1px solid" borderColor="border">
      <Stack gap={4}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text fontSize="lg" fontWeight="semibold">
            Sensor Data Viewer
          </Text>
          <Text fontSize="sm" color="fg.muted">
            {sensorsWithReadings} / {sensorStations.length} stations
          </Text>
        </Box>

        {/* Time Point Slider - at the top */}
        {dataBounds && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Time:
            </Text>
            <DateTimeRangeSlider onTimeChange={handleTimeChange} />
          </Box>
        )}

        {/* Heatmap Toggle */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Text fontSize="sm" fontWeight="medium">
            Show Heatmap
          </Text>
          <Button
            onClick={toggleHeatmap}
            variant={heatmapEnabled ? 'solid' : 'outline'}
            colorScheme="blue"
            size="sm"
          >
            {heatmapEnabled ? 'ON' : 'OFF'}
          </Button>
        </Box>

        {/* GPU Interpolation Toggle - only visible when heatmap is enabled */}
        {heatmapEnabled && (
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Text fontSize="sm" fontWeight="medium">
              Use GPU Interpolation
            </Text>
            <Button
              onClick={toggleShaderInterpolation}
              variant={useShaderInterpolation ? 'solid' : 'outline'}
              colorScheme="green"
              size="sm"
            >
              {useShaderInterpolation ? 'ON' : 'OFF'}
            </Button>
          </Box>
        )}

        {/* Heatmap Controls - only visible when heatmap is enabled */}
        {heatmapEnabled && <HeatmapControls />}

        {/* Reset Button */}
        <Box display="flex" justifyContent="flex-end">
          <Button onClick={handleReset} variant="outline" size="sm">
            Reset
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}

