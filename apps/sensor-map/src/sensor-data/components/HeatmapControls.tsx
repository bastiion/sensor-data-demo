import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { Slider } from '@chakra-ui/react'
import { useHeatmapStore } from '../store/useHeatmapStore'

export const HeatmapControls = () => {
  const {
    maxDistanceKm,
    idwPower,
    colorRampMin,
    colorRampMax,
    opacity,
    setMaxDistanceKm,
    setIdwPower,
    setColorRampMin,
    setColorRampMax,
    setOpacity,
  } = useHeatmapStore()

  return (
    <Box bg="bg.subtle" p={4} borderRadius="md" border="1px solid" borderColor="border">
      <Text fontSize="md" fontWeight="semibold" mb={4}>
        Heatmap Settings
      </Text>
      
      <Stack gap={4}>
        {/* Max Distance */}
        <Slider.Root
          maxW="full"
          size="sm"
          value={[maxDistanceKm]}
          onValueChange={(details) => setMaxDistanceKm(details.value[0])}
          min={1}
          max={100}
          step={1}
        >
          <HStack justify="space-between">
            <Slider.Label>Max Distance (km)</Slider.Label>
            <Slider.ValueText />
          </HStack>
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb index={0} />
          </Slider.Control>
        </Slider.Root>

        {/* IDW Power */}
        <Slider.Root
          maxW="full"
          size="sm"
          value={[idwPower]}
          onValueChange={(details) => setIdwPower(details.value[0])}
          min={0.1}
          max={30.0}
          step={0.1}
        >
          <HStack justify="space-between">
            <Slider.Label>IDW Power</Slider.Label>
            <Slider.ValueText />
          </HStack>
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb index={0} />
          </Slider.Control>
        </Slider.Root>

        {/* Color Ramp Range (Min/Max) */}
        <Slider.Root
          maxW="full"
          size="sm"
          value={[colorRampMin, colorRampMax]}
          onValueChange={(details) => {
            setColorRampMin(details.value[0])
            setColorRampMax(details.value[1])
          }}
          min={-20}
          max={60}
          step={1}
        >
          <HStack justify="space-between">
            <Slider.Label>Color Range (°C)</Slider.Label>
            <Text fontSize="sm" fontWeight="medium">
              {colorRampMin}° - {colorRampMax}°
            </Text>
          </HStack>
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb index={0} />
            <Slider.Thumb index={1} />
          </Slider.Control>
        </Slider.Root>

        {/* Opacity */}
        <Slider.Root
          maxW="full"
          size="sm"
          value={[opacity]}
          onValueChange={(details) => setOpacity(details.value[0])}
          min={0}
          max={1}
          step={0.01}
        >
          <HStack justify="space-between">
            <Slider.Label>Opacity</Slider.Label>
            <Slider.ValueText />
          </HStack>
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb index={0} />
          </Slider.Control>
        </Slider.Root>
      </Stack>
    </Box>
  )
}

