import { useEffect, useState } from 'react'
import { format, differenceInMinutes, addMinutes } from 'date-fns'
import { useFilterStore } from '../store/useFilterStore'
import { Box, Text } from '@chakra-ui/react'

interface DateTimeRangeSliderProps {
  onTimeChange: (time: Date) => void
  dataBounds: {
    minTime: Date
    maxTime: Date
  } | null
}

// Convert a date to minutes since the start of the date range
const dateToMinutes = (date: Date, startDate: Date): number => {
  return differenceInMinutes(date, startDate)
}

// Convert minutes to date
const minutesToDate = (minutes: number, startDate: Date): Date => {
  return addMinutes(startDate, minutes)
}

export const DateTimeRangeSlider = ({ onTimeChange, dataBounds }: DateTimeRangeSliderProps) => {
  const { selectedTime } = useFilterStore()

  if (!dataBounds) {
    return null
  }

  // Calculate total range in minutes
  const totalMinutes = dateToMinutes(dataBounds.maxTime, dataBounds.minTime)
  
  // Calculate current position in minutes
  const currentMinutes = selectedTime 
    ? dateToMinutes(selectedTime, dataBounds.minTime)
    : 0

  const [sliderValue, setSliderValue] = useState(currentMinutes)
  const [currentDate, setCurrentDate] = useState(
    selectedTime || dataBounds.minTime
  )

  useEffect(() => {
    const newMinutes = selectedTime 
      ? dateToMinutes(selectedTime, dataBounds.minTime)
      : 0
    setSliderValue(newMinutes)
    setCurrentDate(selectedTime || dataBounds.minTime)
  }, [selectedTime, dataBounds])

  const handleChange = (value: number) => {
    setSliderValue(value)
    const newDate = minutesToDate(value, dataBounds.minTime)
    setCurrentDate(newDate)
  }

  const handleChangeEnd = (value: number) => {
    const newDate = minutesToDate(value, dataBounds.minTime)
    onTimeChange(newDate)
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Text fontSize="xs" color="fg.muted">
          {format(dataBounds.minTime, 'MMM dd, yyyy HH:mm')}
        </Text>
        <Text fontSize="sm" fontWeight="semibold" color="blue.500">
          {format(currentDate, 'MMM dd, yyyy HH:mm')}
        </Text>
        <Text fontSize="xs" color="fg.muted">
          {format(dataBounds.maxTime, 'MMM dd, yyyy HH:mm')}
        </Text>
      </Box>
      <input
        type="range"
        min={0}
        max={totalMinutes}
        step={60}
        value={sliderValue}
        onChange={(e) => handleChange(parseInt(e.target.value))}
        onMouseUp={(e) => handleChangeEnd(parseInt((e.target as HTMLInputElement).value))}
        onTouchEnd={(e) => handleChangeEnd(parseInt((e.target as HTMLInputElement).value))}
        style={{
          width: '100%',
          height: '8px',
          background: 'linear-gradient(to right, #3b82f6, #60a5fa)',
          borderRadius: '4px',
          outline: 'none',
          cursor: 'pointer',
        }}
      />
    </Box>
  )
}

