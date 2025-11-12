import { useState, useCallback } from 'react'
import { Box, Grid, GridItem, VStack, Text, HStack, Badge } from '@chakra-ui/react'
import { Search } from '@/components/ui/Search'
import { useSearchStore } from '@/store/useSearchStore'
import './App.css'
import { MapLibre } from '@/components/ui/map-libre'
import SelectButtonGroup from './components/ui/select-button-group'
import { ListType } from './list-type'
import { ImageListItem } from './image-list-item'
import { GalleryView } from './components/ui/gallery-view'
import { CustomLightbox } from './components/ui/custom-light-box'
import { LargeList } from './components/large-list'
import { useSearchView } from './hooks/useSearchView'
import { Navigation } from './components/Navigation'
import { ChakraColorModeSync } from './components/ChakraColorModeSync'

// Old SPARQL validation schema and functions moved to useSearchView hook


interface ListTypeSwitchProps {
  selected: ListType[]
  listItems: ImageListItem[]
}
const isDebug = true

const ListTypeSwitch = ({selected, listItems}: ListTypeSwitchProps) => {
  return <>
    {selected.includes(ListType.MAP) && <MapLibre tags={listItems} />}
    {selected.includes(ListType.LIST) && <LargeList items={listItems} />}
    {selected.includes(ListType.GALLERY) && <GalleryView images={listItems} />}
  </>
}

function App() {
  const { setGeoSearch } = useSearchStore()
  const [listTypes, setListTypes] = useState([ListType.LIST])

  // Use the shared search view hook
  const {
    debouncedSearchQuery,
    isSearching,
    listItems,
    isLoading,
    isFetching,
    hasMeiliResults,
    hasSparqlEnrichment,
  } = useSearchView()

  const setListType = useCallback((listType: ListType) => {
      setListTypes(prev => {
        if (listType === ListType.MAP) {
          setGeoSearch(!prev.includes(ListType.MAP))
        }
        return prev.includes(listType) ? prev.filter(t => t !== listType) : [...prev, listType]
      })
  }, [setGeoSearch])

  return (
    <>
      <ChakraColorModeSync />
      <Navigation />
      <Box minHeight="100vh" minWidth={listTypes.includes(ListType.MAP) ? "100vw" : undefined} transition="all 0.6s" display="flex" alignItems={isSearching ? "flex-start" : "center"} justifyContent="center" padding={4}>
        <VStack width="100%" maxWidth={listTypes.includes(ListType.MAP) ? "100%" : "600px"} transition="all 0.3s">
          <Box width="100%" marginTop={isSearching ? "20px" : "0"} transition="all 0.3s">
            <Grid templateRows="auto auto" gap={4}>
              <GridItem>
                <Search placeholder="Search your desktop..." />
              </GridItem>
              <GridItem>
                <SelectButtonGroup selected={listTypes} onSelect={setListType} />
              </GridItem>
            </Grid>
          </Box>
          
          {/* Two-step search status indicator */}
          {isSearching && debouncedSearchQuery && (
            <Box width="100%">
              <HStack gap={2} justifyContent="center" fontSize="sm">
                <Text>
                  {isLoading ? 'Searching...' : `${listItems.length} results`}
                </Text>
                {hasMeiliResults && (
                  <Badge colorScheme="green">✓ Fast search</Badge>
                )}
                {hasSparqlEnrichment && (
                  <Badge colorScheme="blue">✓ Metadata enriched</Badge>
                )}
                {isFetching && !isLoading && (
                  <Badge colorScheme="orange">⟳ Loading metadata...</Badge>
                )}
              </HStack>
            </Box>
          )}

          {(isSearching || isDebug) && (
            <Box width="100%">
              <ListTypeSwitch selected={listTypes} listItems={listItems} />
            </Box>
          )}
        </VStack>
        <CustomLightbox />
      </Box>
    </>
  )
}

export default App
