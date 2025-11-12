import { ImageListItem } from '@/image-list-item'

export interface BoundsFilter {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

export interface Filter {
  instanceId: string
  filterType: 'bounds' | 'dateRange' | 'custom'
  enabled: boolean
  value: any
}

/**
 * Check if an item is within bounds
 */
export const itemInBounds = (item: ImageListItem, bounds: BoundsFilter): boolean => {
  if (!item.geo) return false
  
  return (
    item.geo.lat >= bounds.minLat &&
    item.geo.lat <= bounds.maxLat &&
    item.geo.lng >= bounds.minLng &&
    item.geo.lng <= bounds.maxLng
  )
}

/**
 * Apply bounds filters to items (OR logic - item must be in at least one bounds)
 */
export const applyBoundsFilters = (
  items: ImageListItem[],
  boundsFilters: BoundsFilter[]
): ImageListItem[] => {
  if (boundsFilters.length === 0) return items
  
  return items.filter(item => 
    boundsFilters.some(bounds => itemInBounds(item, bounds))
  )
}

/**
 * Extract active bounds filters from filter map
 */
export const getActiveBoundsFilters = (filters: Record<string, Filter[]>): BoundsFilter[] => {
  return Object.values(filters)
    .flat()
    .filter(f => f.enabled && f.filterType === 'bounds')
    .map(f => f.value as BoundsFilter)
}

/**
 * Apply all active filters to items
 */
export const applyFilters = (
  items: ImageListItem[],
  filters: Record<string, Filter[]>
): ImageListItem[] => {
  const boundsFilters = getActiveBoundsFilters(filters)
  return applyBoundsFilters(items, boundsFilters)
}

