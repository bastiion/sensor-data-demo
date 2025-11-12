import { Box } from '@chakra-ui/react'
import { LargeList } from '@/components/large-list'
import { ImageListItem } from '@/image-list-item'

interface ListWindowProps {
  items: ImageListItem[]
}

/**
 * List window component - displays items in a list layout
 */
export const ListWindow = ({ items }: ListWindowProps) => {
  return (
    <Box height="100%" overflow="auto" bg="bg">
      <LargeList items={items} />
    </Box>
  )
}

