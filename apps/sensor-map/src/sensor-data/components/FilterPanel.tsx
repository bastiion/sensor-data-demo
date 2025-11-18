import { Box, Button, Stack, Text, Input, NativeSelectRoot, NativeSelectField } from '@chakra-ui/react'
import { format } from 'date-fns'
import { useMemo, useEffect } from 'react'
import { useFilterStore } from '../store/useFilterStore'
import { useSensorData } from '../hooks/useSensorData'
import { useSensorMetadata } from '../hooks/useSensorMetadata'
import { DateTimeRangeSlider } from './DateTimeRangeSlider'

export const FilterPanel = () => {
  const {
    selectedTime,
    setSelectedTime,
    selectedNetwork,
    setSelectedNetwork,
    timeRangeFrom,
    timeRangeTo,
    setTimeRange,
    resetFilters,
  } = useFilterStore()

  // Fetch metadata
  const { data: metadata } = useSensorMetadata()
  
  // Set default time range from metadata when it first loads
  useEffect(() => {
    if (metadata && !timeRangeFrom && !timeRangeTo) {
      setTimeRange(
        new Date(metadata.minDate),
        new Date(metadata.maxDate)
      )
    }
  }, [metadata, timeRangeFrom, timeRangeTo, setTimeRange])
  
  // Fetch sensor data with current filters
  const { data: sensorData } = useSensorData({
    network: selectedNetwork,
    timeFrom: timeRangeFrom,
    timeTo: timeRangeTo,
  })

  const handleTimeChange = (time: Date) => {
    setSelectedTime(time)
  }

  const handleReset = () => {
    resetFilters()
  }

  const handleNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedNetwork(value === '' ? null : value)
  }

  const handleTimeRangeFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const newFrom = value ? new Date(value) : null
    setTimeRange(newFrom, timeRangeTo)
  }

  const handleTimeRangeToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const newTo = value ? new Date(value) : null
    setTimeRange(timeRangeFrom, newTo)
  }

  // Calculate data bounds from sensor data
  const dataBounds = useMemo(() => {
    if (!sensorData?.features.length) return null
    
    const times = sensorData.features
      .map(f => new Date(f.properties.time))
      .sort((a, b) => a.getTime() - b.getTime())
    
    return {
      minTime: times[0],
      maxTime: times[times.length - 1],
    }
  }, [sensorData])

  // Count total features
  const totalFeatures = sensorData?.features.length || 0

  return (
    <Box bg="bg.subtle" p={4} borderBottom="1px solid" borderColor="border">
      <Stack gap={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text fontSize="lg" fontWeight="semibold">
            Sensor Data Viewer
          </Text>
          <Box textAlign="right">
            <Text fontSize="sm" color="fg.muted">
              {totalFeatures} sensor readings
            </Text>
            {selectedTime && (
              <Text fontSize="xs" color="blue.500">
                {format(selectedTime, 'MMM dd, yyyy HH:mm')}
              </Text>
            )}
          </Box>
        </Box>

        {/* Network Filter */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Measuring Network:
          </Text>
          <NativeSelectRoot size="sm">
            <NativeSelectField
              value={selectedNetwork || ''}
              onChange={handleNetworkChange}
              placeholder="All networks"
            >
              <option value="">All networks</option>
              {metadata?.networks.map(network => (
                <option key={network} value={network}>
                  {network}
                </option>
              ))}
            </NativeSelectField>
          </NativeSelectRoot>
        </Box>

        {/* Time Range Filter */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Time Range:
          </Text>
          <Stack gap={2}>
            <Box>
              <Text fontSize="xs" color="fg.muted" mb={1}>
                From:
              </Text>
              <Input
                type="datetime-local"
                value={timeRangeFrom ? format(timeRangeFrom, "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={handleTimeRangeFromChange}
                size="sm"
              />
            </Box>
            <Box>
              <Text fontSize="xs" color="fg.muted" mb={1}>
                To:
              </Text>
              <Input
                type="datetime-local"
                value={timeRangeTo ? format(timeRangeTo, "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={handleTimeRangeToChange}
                size="sm"
              />
            </Box>
          </Stack>
        </Box>

        {/* Time Point Slider */}
        {dataBounds && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Select Time Point:
            </Text>
            <DateTimeRangeSlider onTimeChange={handleTimeChange} dataBounds={dataBounds} />
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

