import { format, differenceInMinutes, addMinutes } from 'date-fns'
import { useSensorStore } from '../store/useSensorStore'
import { HStack, Text } from '@chakra-ui/react'
import { Slider } from '@chakra-ui/react'

interface DateTimeRangeSliderProps {
  onTimeChange: (time: Date) => void
}

export const DateTimeRangeSlider = ({ onTimeChange }: DateTimeRangeSliderProps) => {
  const { dataBounds, selectedTime } = useSensorStore()

  if (!dataBounds) return null

  const totalMinutes = differenceInMinutes(dataBounds.maxTime, dataBounds.minTime)
  const currentMinutes = selectedTime 
    ? differenceInMinutes(selectedTime, dataBounds.minTime)
    : 0

  const handleChange = (details: { value: number[] }) => {
    const newDate = addMinutes(dataBounds.minTime, details.value[0])
    onTimeChange(newDate)
  }

  return (
    <Slider.Root
      value={[currentMinutes]}
      onValueChange={handleChange}
      min={0}
      max={totalMinutes}
      step={60}
      size="sm"
    >
      <HStack justify="space-between" mb={1}>
        <Text fontSize="xs" color="fg.muted">
          {format(dataBounds.minTime, 'MMM dd HH:mm')}
        </Text>
        <Text fontSize="sm" fontWeight="semibold" color="blue.500">
          {format(selectedTime || dataBounds.minTime, 'MMM dd HH:mm')}
        </Text>
        <Text fontSize="xs" color="fg.muted">
          {format(dataBounds.maxTime, 'MMM dd HH:mm')}
        </Text>
      </HStack>
      <Slider.Control>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb index={0} />
      </Slider.Control>
    </Slider.Root>
  )
}

