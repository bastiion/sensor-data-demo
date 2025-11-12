import { Box, VStack } from '@chakra-ui/react'
import { Search } from '@/components/ui/Search'
import SelectButtonGroup from '@/components/ui/select-button-group'
import { ListType } from '@/list-type'

interface SearchWindowProps {
  listTypes: ListType[]
  onListTypeChange: (listType: ListType) => void
}

/**
 * Search window component - provides search input and view type selection
 */
export const SearchWindow = ({ listTypes, onListTypeChange }: SearchWindowProps) => {
  return (
    <Box height="100%" padding={4} overflow="auto" bg="bg">
      <VStack gap={4} align="stretch">
        <Search placeholder="Search your desktop..." />
        <SelectButtonGroup selected={listTypes} onSelect={onListTypeChange} />
      </VStack>
    </Box>
  )
}

