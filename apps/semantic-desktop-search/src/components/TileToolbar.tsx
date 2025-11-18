import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/select'
import { LuFilter, LuFilterX } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { useAvailableViews } from '@/views/hooks/useAvailableViews'
import { useAppDispatch } from '@/store/hooks'
import { updateInstance, toggleFilter } from '@/store/slices/viewInstanceSlice'
import { ExpandButton, RemoveButton, Separator } from 'react-mosaic-component'

interface TileToolbarProps {
  instanceId: string
  viewType: string
  canFilter: boolean
  filterEnabled: boolean
}

/**
 * TileToolbar - Custom controls for mosaic window toolbar
 * Displayed on the right side of the default toolbar
 */
export const TileToolbar = ({
  instanceId,
  viewType,
  canFilter,
  filterEnabled,
}: TileToolbarProps) => {
  const dispatch = useAppDispatch()
  const availableViews = useAvailableViews()

  const handleViewChange = (newViewType: string) => {
    dispatch(updateInstance({ instanceId, viewType: newViewType }))
  }

  const handleFilterToggle = () => {
    dispatch(toggleFilter({ instanceId }))
  }

  const viewCollection = createListCollection({
    items: availableViews.map((view) => ({
      label: view.definition.name,
      value: view.definition.viewType,
    })),
  })

  return (
    <>
      <SelectRoot
        collection={viewCollection}
        value={[viewType]}
        onValueChange={(e: any) => handleViewChange(e.value[0])}
        size="xs"
        width="140px"
        positioning={{ 
          sameWidth: false,
          placement: 'bottom-start',
          strategy: 'fixed'
        }}
      >
        <SelectTrigger>
          <SelectValueText placeholder="View type" />
        </SelectTrigger>
        <SelectContent 
          minW="200px"
          zIndex={10000}
          maxH="400px"
          minH="120px"
          overflow="auto"
          py={2}
        >
          {viewCollection.items.map((view) => (
            <SelectItem key={view.value} item={view} py={2} minH="36px">
              {view.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>

      {canFilter && (
        <Button
          onClick={handleFilterToggle}
          size="xs"
          variant={filterEnabled ? 'solid' : 'ghost'}
          bg={filterEnabled ? 'blue.500' : undefined}
          color={filterEnabled ? 'white' : 'fg'}
          _hover={filterEnabled ? { bg: 'blue.600' } : undefined}
          aria-label={filterEnabled ? 'Disable filter' : 'Enable filter'}
        >
          {filterEnabled ? <LuFilter size={14} /> : <LuFilterX size={14} />}
        </Button>
      )}
      
      <Separator />
      <ExpandButton />
      <RemoveButton />
    </>
  )
}

