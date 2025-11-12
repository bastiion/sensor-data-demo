import { Box, VStack, Text, Badge } from '@chakra-ui/react'

interface StatusWindowProps {
  isSearching: boolean
  searchQuery: string
  resultCount: number
  isLoading: boolean | undefined
  isFetching: boolean | undefined
  hasMeiliResults: boolean | undefined
  hasSparqlEnrichment: boolean | undefined
}

/**
 * Status window component - displays search status and metadata
 */
export const StatusWindow = ({
  isSearching,
  searchQuery,
  resultCount,
  isLoading,
  isFetching,
  hasMeiliResults,
  hasSparqlEnrichment,
}: StatusWindowProps) => {
  return (
    <Box height="100%" padding={4} overflow="auto" bg="bg">
      <VStack align="stretch" gap={3}>
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="fg.muted">
            Search Query
          </Text>
          <Text fontSize="lg" fontWeight="bold">
            {searchQuery || 'No query'}
          </Text>
        </Box>

        {isSearching && searchQuery && (
          <>
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="fg.muted">
                Results
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {isLoading ? 'Searching...' : resultCount}
              </Text>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" color="fg.muted" marginBottom={2}>
                Status
              </Text>
              <VStack align="stretch" gap={2}>
                {hasMeiliResults && (
                  <Badge colorScheme="green" padding={2} borderRadius="md">
                    ✓ Fast search completed
                  </Badge>
                )}
                {hasSparqlEnrichment && (
                  <Badge colorScheme="blue" padding={2} borderRadius="md">
                    ✓ Metadata enriched
                  </Badge>
                )}
                {isFetching && !isLoading && (
                  <Badge colorScheme="orange" padding={2} borderRadius="md">
                    ⟳ Loading metadata...
                  </Badge>
                )}
              </VStack>
            </Box>
          </>
        )}

        {!isSearching && (
          <Box>
            <Text fontSize="sm" color="fg.muted">
              Start typing to search...
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  )
}

