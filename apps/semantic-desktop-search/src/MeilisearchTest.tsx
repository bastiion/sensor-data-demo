import { InstantSearch, SearchBox, Hits, Highlight, Stats } from 'react-instantsearch';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { Box, Heading, VStack, Card, Text } from '@chakra-ui/react';
import './MeilisearchTest.css';

// Configure Meilisearch client based on docker-compose.yml
const { searchClient } = instantMeiliSearch(
  'http://localhost:7700',
  'your_master_key_here'
);

// Hit component to display search results
const Hit = ({ hit }: { hit: any }) => {
  return (
    <Card.Root mb={3} p={4}>
      <VStack align="stretch" gap={2}>
        <Heading size="md">
          <Highlight attribute="filePath" hit={hit} />
        </Heading>
        {hit.title && (
          <Text>
            <strong>Title:</strong> <Highlight attribute="title" hit={hit} />
          </Text>
        )}
        {hit.fileSize && (
          <Text><strong>Size:</strong> {hit.fileSize} bytes</Text>
        )}
        {hit.mimeType && (
          <Text><strong>Type:</strong> {hit.mimeType}</Text>
        )}
        {hit.checksum && (
          <Text fontSize="sm" color="gray.500">
            Checksum: {hit.checksum}
          </Text>
        )}
      </VStack>
    </Card.Root>
  );
};

const MeilisearchTest = () => {
  return (
    <Box minHeight="100vh" padding={6}>
      <VStack maxWidth="1200px" margin="0 auto" gap={6} align="stretch">
        <Heading size="2xl" textAlign="center">
          Meilisearch Test Page
        </Heading>
        
        <InstantSearch
          indexName="file-metadata"
          searchClient={searchClient}
        >
          <VStack gap={4} align="stretch">
            <Box>
              <SearchBox 
                placeholder="Search files..."
                classNames={{
                  root: 'search-box',
                  form: 'search-box-form',
                  input: 'search-box-input',
                  submit: 'search-box-submit',
                  reset: 'search-box-reset',
                }}
              />
            </Box>
            
            <Box>
              <Stats />
            </Box>

            <Box>
              <Hits hitComponent={Hit} />
            </Box>
          </VStack>
        </InstantSearch>
      </VStack>
    </Box>
  );
};

export default MeilisearchTest;

