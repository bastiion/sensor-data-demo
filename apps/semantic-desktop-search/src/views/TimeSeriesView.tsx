import { Box } from '@chakra-ui/react'
import { LuTrendingUp } from 'react-icons/lu'
import { TimeSeriesViewComponent } from '@/components/ui/time-series-view'
import { ViewProps, ViewDefinition } from './types'
import { useRegisterView } from './hooks/useRegisterView'
import { useSearchResults } from '@/hooks/useSearchResults'

export const timeSeriesViewDefinition: ViewDefinition = {
  viewType: 'timeseries',
  name: 'Time Series',
  icon: <LuTrendingUp />,
  canFilter: true,
  description: 'Visualize data distribution over time with interactive charts',
}

export const TimeSeriesView = ({ instanceId, filterEnabled }: ViewProps) => {
  // Register this view type
  useRegisterView(timeSeriesViewDefinition, TimeSeriesView)

  // Get filtered results from search
  const { results } = useSearchResults()

  return (
    <Box height="100%" width="100%" overflow="hidden" bg="bg">
      <TimeSeriesViewComponent 
        items={results} 
        instanceId={instanceId}
        filterEnabled={filterEnabled}
      />
    </Box>
  )
}

