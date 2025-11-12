import { Box } from '@chakra-ui/react'
import { LuList } from 'react-icons/lu'
import { LargeList } from '@/components/large-list'
import { ViewProps, ViewDefinition } from './types'
import { useRegisterView } from './hooks/useRegisterView'
import { useSearchResults } from '@/hooks/useSearchResults'

export const listViewDefinition: ViewDefinition = {
  viewType: 'list',
  name: 'List View',
  icon: <LuList />,
  canFilter: false,
  description: 'Display results as a scrollable list',
}

export const ListView = (_props: ViewProps) => {
  // Register this view type
  useRegisterView(listViewDefinition, ListView)

  // Get filtered results from search
  const { results } = useSearchResults()

  return (
    <Box height="100%" width="100%" overflow="auto" bg="bg">
      <LargeList items={results} />
    </Box>
  )
}

