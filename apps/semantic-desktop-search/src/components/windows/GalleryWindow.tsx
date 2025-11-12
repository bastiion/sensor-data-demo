import { Box } from '@chakra-ui/react'
import { GalleryView } from '@/components/ui/gallery-view'
import { ImageListItem } from '@/image-list-item'

interface GalleryWindowProps {
  items: ImageListItem[]
}

/**
 * Gallery window component - displays images in a gallery layout
 */
export const GalleryWindow = ({ items }: GalleryWindowProps) => {
  return (
    <Box height="100%" overflow="auto" padding={2} bg="bg">
      <GalleryView images={items} />
    </Box>
  )
}

