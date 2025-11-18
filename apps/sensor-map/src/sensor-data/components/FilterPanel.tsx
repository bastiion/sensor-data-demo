import { Box, Button, Stack, Text } from '@chakra-ui/react'
import { format } from 'date-fns'
import { useSensorStore } from '../store/useSensorStore'
import { DateTimeRangeSlider } from './DateTimeRangeSlider'

export const FilterPanel = () => {
  const { selectedTime, setSelectedTime, resetFilters, dataBounds, sensorStations } = useSensorStore()

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
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text fontSize="lg" fontWeight="semibold">
            Sensor Data Viewer
          </Text>
          <Box textAlign="right">
            <Text fontSize="sm" color="fg.muted">
              {sensorsWithReadings} / {sensorStations.length} stations with data
            </Text>
            {selectedTime && (
              <Text fontSize="xs" color="blue.500">
                {format(selectedTime, 'MMM dd, yyyy HH:mm')}
              </Text>
            )}
          </Box>
        </Box>

        {/* Time Point Slider */}
        {dataBounds && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Select Time Point:
            </Text>
            <DateTimeRangeSlider onTimeChange={handleTimeChange} />
          </Box>
        )}

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

