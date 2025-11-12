import { Box } from '@chakra-ui/react'
import { LuGalleryHorizontal } from 'react-icons/lu'
import { GalleryView as GalleryViewComponent } from '@/components/ui/gallery-view'
import { ViewProps, ViewDefinition } from './types'
import { useRegisterView } from './hooks/useRegisterView'
import { useSearchResults } from '@/hooks/useSearchResults'

export const galleryViewDefinition: ViewDefinition = {
  viewType: 'gallery',
  name: 'Gallery View',
  icon: <LuGalleryHorizontal />,
  canFilter: false,
  description: 'Display results as a masonry gallery',
}

export const GalleryView = (_props: ViewProps) => {
  // Register this view type
  useRegisterView(galleryViewDefinition, GalleryView)

  // Get filtered results from search
  const { results } = useSearchResults()

  return (
    <Box height="100%" width="100%" overflow="auto" bg="bg">
      <GalleryViewComponent images={results} />
    </Box>
  )
}

