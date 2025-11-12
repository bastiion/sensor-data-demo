import { Box } from '@chakra-ui/react'
import { MapLibre } from '@/components/ui/map-libre'
import { ImageListItem } from '@/image-list-item'

interface MapWindowProps {
  items: ImageListItem[]
}

/**
 * Map window component - displays geotagged items on a map
 */
export const MapWindow = ({ items }: MapWindowProps) => {
  return (
    <Box height="100%" overflow="hidden" bg="bg">
      <MapLibre tags={items} />
    </Box>
  )
}

