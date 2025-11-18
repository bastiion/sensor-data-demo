import { useState } from 'react'
import { Box, Button, Group, Stack, Text, Input } from '@chakra-ui/react'
import { useSensorData } from '../hooks/useSensorData'

export const FilterPanel = () => {
  const { timeRange, geoBounds, setTimeRange, resetFilters } = useSensorData()

  const [startDateInput, setStartDateInput] = useState(
    timeRange.start ? timeRange.start.toISOString().slice(0, 16) : ''
  )
  const [endDateInput, setEndDateInput] = useState(
    timeRange.end ? timeRange.end.toISOString().slice(0, 16) : ''
  )

  const handleApplyTimeFilter = () => {
    const start = startDateInput ? new Date(startDateInput) : undefined
    const end = endDateInput ? new Date(endDateInput) : undefined
    setTimeRange(start, end)
  }

  const handleReset = () => {
    setStartDateInput('')
    setEndDateInput('')
    resetFilters()
  }

  return (
    <Box bg="bg.subtle" p={4} borderBottom="1px solid" borderColor="border">
      <Stack gap={4}>
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>
            Sensor Data Filters
          </Text>
        </Box>

        {/* Time Range Filter */}
        <Group gap={4} wrap="wrap">
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1}>
              Start Date/Time
            </Text>
            <Input
              type="datetime-local"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              size="sm"
            />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1}>
              End Date/Time
            </Text>
            <Input
              type="datetime-local"
              value={endDateInput}
              onChange={(e) => setEndDateInput(e.target.value)}
              size="sm"
            />
          </Box>

          <Box alignSelf="flex-end">
            <Button onClick={handleApplyTimeFilter} colorScheme="blue" size="sm">
              Apply Time Filter
            </Button>
          </Box>
        </Group>

        {/* Geographic Bounds Display */}
        {geoBounds && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1}>
              Geographic Bounds (set by map):
            </Text>
            <Text fontSize="xs" color="fg.muted">
              Lat: {geoBounds.minLat.toFixed(4)} to {geoBounds.maxLat.toFixed(4)} | Lng:{' '}
              {geoBounds.minLng.toFixed(4)} to {geoBounds.maxLng.toFixed(4)}
            </Text>
          </Box>
        )}

        {/* Reset Button */}
        <Box>
          <Button onClick={handleReset} variant="outline" size="sm">
            Reset All Filters
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}

