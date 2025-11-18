import { Box } from '@chakra-ui/react'
import { LuClock } from 'react-icons/lu'
import { TimelineViewComponent } from '@/components/ui/timeline-view'
import { ViewProps, ViewDefinition } from './types'
import { useRegisterView } from './hooks/useRegisterView'
import { useSearchResults } from '@/hooks/useSearchResults'

export const timelineViewDefinition: ViewDefinition = {
  viewType: 'timeline',
  name: 'Timeline View',
  icon: <LuClock />,
  canFilter: true,
  description: 'Display results on an interactive timeline with date filtering',
}

export const TimelineView = ({ instanceId, filterEnabled }: ViewProps) => {
  // Register this view type
  useRegisterView(timelineViewDefinition, TimelineView)

  // Get filtered results from search
  const { results } = useSearchResults()

  return (
    <Box height="100%" width="100%" overflow="hidden" bg="bg">
      <TimelineViewComponent 
        items={results} 
        instanceId={instanceId}
        filterEnabled={filterEnabled}
      />
    </Box>
  )
}

