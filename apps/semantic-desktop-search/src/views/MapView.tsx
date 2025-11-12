import { Box } from '@chakra-ui/react'
import { LuMap } from 'react-icons/lu'
import { MapLibre } from '@/components/ui/map-libre'
import { ViewProps, ViewDefinition } from './types'
import { useRegisterView } from './hooks/useRegisterView'
import { useSearchResults } from '@/hooks/useSearchResults'

export const mapViewDefinition: ViewDefinition = {
  viewType: 'map',
  name: 'Map View',
  icon: <LuMap />,
  canFilter: true,
  description: 'Display results on a map with geographic filtering',
}

export const MapView = ({ instanceId, filterEnabled }: ViewProps) => {
  // Register this view type
  useRegisterView(mapViewDefinition, MapView)

  // Get filtered results from search
  const { results } = useSearchResults()

  return (
    <Box height="100%" width="100%" overflow="hidden" bg="bg">
      <MapLibre 
        tags={results} 
        instanceId={instanceId}
        filterEnabled={filterEnabled}
      />
    </Box>
  )
}

