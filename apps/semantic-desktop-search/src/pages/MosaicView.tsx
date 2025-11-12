import { useState, useCallback, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { Mosaic, MosaicWindow, MosaicNode } from 'react-mosaic-component'
import { v4 as uuid } from 'uuid'
import 'react-mosaic-component/react-mosaic-component.css'
import '../mosaic-theme.css'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createInstance, removeInstance } from '@/store/slices/viewInstanceSlice'
import { clearInstanceFilters } from '@/store/slices/filterSlice'
import { selectAllViewInstances } from '@/store/selectors/viewInstanceSelector'
import { useViewRegistry } from '@/views/ViewRegistry'
import { TileToolbar } from '@/components/TileToolbar'
import { CustomLightbox } from '@/components/ui/custom-light-box'
import { ChakraColorModeSync } from '@/components/ChakraColorModeSync'

type ViewId = string

/**
 * MosaicView - Main page with tiling window layout using react-mosaic-component
 */
const MosaicView = () => {
  const dispatch = useAppDispatch()
  const viewInstances = useAppSelector(selectAllViewInstances)
  const { getViewComponent, getViewDefinition } = useViewRegistry()

  // Initial mosaic layout
  const [mosaicValue, setMosaicValue] = useState<MosaicNode<ViewId> | null>({
    direction: 'row',
    first: 'gallery',
    second: {
      direction: 'row',
      first: 'list',
      second: 'map',
      splitPercentage: 50,
    },
    splitPercentage: 40,
  })

  // Track which tiles have been initialized
  const [initializedTiles, setInitializedTiles] = useState<Set<string>>(new Set())

  // Render each window based on its ViewId
  const renderTile = useCallback(
    (tileId: ViewId, path: any) => {
      // Get or create instance for this tile
      let instance = viewInstances[tileId]

      // Initialize instance if it doesn't exist
      if (!instance && !initializedTiles.has(tileId)) {
        const instanceId = uuid()
        const defaultViewType = tileId === 'gallery' ? 'gallery' : tileId === 'list' ? 'list' : 'map'
        
        dispatch(
          createInstance({
            instanceId,
            tileId,
            viewType: defaultViewType,
            filterEnabled: false,
          })
        )

        setInitializedTiles((prev) => new Set(prev).add(tileId))

        // Return a placeholder while initializing
        return (
          <MosaicWindow path={path} title="Loading...">
            <Box height="100%" width="100%" bg="bg" />
          </MosaicWindow>
        )
      }

      if (!instance) {
        return (
          <MosaicWindow path={path} title="Loading...">
            <Box height="100%" width="100%" bg="bg" />
          </MosaicWindow>
        )
      }

      const ViewComponent = getViewComponent(instance.viewType)
      const viewDef = getViewDefinition(instance.viewType)

      if (!ViewComponent || !viewDef) {
        return (
          <MosaicWindow path={path} title="Unknown View">
            <Box height="100%" width="100%" bg="bg" padding={4}>
              View type "{instance.viewType}" not found
            </Box>
          </MosaicWindow>
        )
      }

      return (
        <MosaicWindow
          path={path}
          title="" // Empty title since dropdown shows the view type
          toolbarControls={
            <TileToolbar
              instanceId={instance.instanceId}
              viewType={instance.viewType}
              canFilter={viewDef.canFilter}
              filterEnabled={instance.filterEnabled}
            />
          }
        >
          <ViewComponent instanceId={instance.instanceId} filterEnabled={instance.filterEnabled} />
        </MosaicWindow>
      )
    },
    [
      viewInstances,
      initializedTiles,
      getViewComponent,
      getViewDefinition,
      dispatch,
    ]
  )

  // Handle mosaic changes to clean up removed tiles
  const handleMosaicChange = useCallback(
    (newValue: MosaicNode<ViewId> | null) => {
      // Find removed tiles
      const getAllTileIds = (node: MosaicNode<ViewId> | null): Set<string> => {
        if (!node) return new Set()
        if (typeof node === 'string') return new Set([node])
        return new Set([
          ...getAllTileIds(node.first),
          ...getAllTileIds(node.second),
        ])
      }

      const oldTiles = getAllTileIds(mosaicValue)
      const newTiles = getAllTileIds(newValue)
      const removedTiles = Array.from(oldTiles).filter((id) => !newTiles.has(id))

      // Clean up removed tiles
      removedTiles.forEach((tileId) => {
        const instance = viewInstances[tileId]
        if (instance) {
          dispatch(removeInstance({ instanceId: instance.instanceId }))
          dispatch(clearInstanceFilters({ instanceId: instance.instanceId }))
        }
        setInitializedTiles((prev) => {
          const next = new Set(prev)
          next.delete(tileId)
          return next
        })
      })

      setMosaicValue(newValue)
    },
    [mosaicValue, viewInstances, dispatch]
  )

  // Preload view components to ensure they register
  useEffect(() => {
    // Views will auto-register when first rendered
  }, [])

  return (
    <Box height="100vh" width="100vw" overflow="hidden" bg="bg">
      <ChakraColorModeSync />
      <Mosaic<ViewId>
        renderTile={renderTile}
        value={mosaicValue}
        onChange={handleMosaicChange}
        className="mosaic-blueprint-theme"
      />
      <CustomLightbox />
    </Box>
  )
}

export default MosaicView
