import { useState, useCallback } from 'react'
import { Box } from '@chakra-ui/react'
import { Mosaic, MosaicWindow, MosaicNode } from 'react-mosaic-component'
import 'react-mosaic-component/react-mosaic-component.css'
import '../mosaic-theme.css'
import { useSearchView } from '@/hooks/useSearchView'
import { useSearchStore } from '@/store/useSearchStore'
import { ListType } from '@/list-type'
import { CustomLightbox } from '@/components/ui/custom-light-box'
import { Navigation } from '@/components/Navigation'
import { ChakraColorModeSync } from '@/components/ChakraColorModeSync'
import { SearchWindow } from '@/components/windows/SearchWindow'
import { GalleryWindow } from '@/components/windows/GalleryWindow'
import { ListWindow } from '@/components/windows/ListWindow'
import { MapWindow } from '@/components/windows/MapWindow'
import { StatusWindow } from '@/components/windows/StatusWindow'

// Define view IDs for the mosaic
export type ViewId = 'search' | 'gallery' | 'list' | 'map' | 'status'

const WINDOW_TITLES: Record<ViewId, string> = {
  search: 'Search & Controls',
  gallery: 'Gallery View',
  list: 'List View',
  map: 'Map View',
  status: 'Status & Info',
}

/**
 * MosaicView - Main page with tiling window layout using react-mosaic-component
 */
const MosaicView = () => {
  const { setGeoSearch } = useSearchStore()
  const {
    debouncedSearchQuery,
    isSearching,
    listItems,
    isLoading,
    isFetching,
    hasMeiliResults,
    hasSparqlEnrichment,
  } = useSearchView()

  const [listTypes, setListTypes] = useState<ListType[]>([ListType.LIST])

  // Handle list type selection
  const handleListTypeChange = useCallback((listType: ListType) => {
    setListTypes(prev => {
      if (listType === ListType.MAP) {
        setGeoSearch(!prev.includes(ListType.MAP))
      }
      return prev.includes(listType) ? prev.filter(t => t !== listType) : [...prev, listType]
    })
  }, [setGeoSearch])

  // Initial mosaic layout - customizable by user through drag & drop
  const [mosaicValue, setMosaicValue] = useState<MosaicNode<ViewId> | null>({
    direction: 'row',
    first: {
      direction: 'column',
      first: 'search',
      second: 'status',
      splitPercentage: 40,
    },
    second: {
      direction: 'row',
      first: {
        direction: 'column',
        first: 'gallery',
        second: 'list',
        splitPercentage: 50,
      },
      second: 'map',
      splitPercentage: 60,
    },
    splitPercentage: 25,
  })

  // Render each window based on its ViewId
  const renderTile = useCallback(
    (id: ViewId, path: any) => {
      let content: JSX.Element

      switch (id) {
        case 'search':
          content = (
            <SearchWindow 
              listTypes={listTypes} 
              onListTypeChange={handleListTypeChange}
            />
          )
          break
        case 'gallery':
          content = <GalleryWindow items={listItems} />
          break
        case 'list':
          content = <ListWindow items={listItems} />
          break
        case 'map':
          content = <MapWindow items={listItems} />
          break
        case 'status':
          content = (
            <StatusWindow
              isSearching={isSearching}
              searchQuery={debouncedSearchQuery}
              resultCount={listItems.length}
              isLoading={isLoading}
              isFetching={isFetching}
              hasMeiliResults={hasMeiliResults}
              hasSparqlEnrichment={hasSparqlEnrichment}
            />
          )
          break
        default:
          content = <Box padding={4}>Unknown view: {id}</Box>
      }

      return (
        <MosaicWindow<ViewId>
          path={path}
          title={WINDOW_TITLES[id]}
          createNode={() => 'search'}
        >
          {content}
        </MosaicWindow>
      )
    },
    [
      listTypes,
      handleListTypeChange,
      listItems,
      isSearching,
      debouncedSearchQuery,
      isLoading,
      isFetching,
      hasMeiliResults,
      hasSparqlEnrichment,
    ]
  )

  return (
    <Box height="100vh" width="100vw" overflow="hidden" bg="bg">
      <ChakraColorModeSync />
      <Navigation />
      <Mosaic<ViewId>
        renderTile={renderTile}
        value={mosaicValue}
        onChange={setMosaicValue}
        className="mosaic-blueprint-theme"
      />
      <CustomLightbox />
    </Box>
  )
}

export default MosaicView

