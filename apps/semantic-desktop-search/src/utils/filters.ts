import { ImageListItem } from '@/image-list-item'

export interface BoundsFilter {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

export interface DateRangeFilter {
  startDate: Date
  endDate: Date
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
 * Check if an item is within date range
 */
export const itemInDateRange = (item: ImageListItem, dateRange: DateRangeFilter): boolean => {
  if (!item.date) return false
  
  const itemTime = item.date.getTime()
  const startTime = dateRange.startDate.getTime()
  const endTime = dateRange.endDate.getTime()
  
  return itemTime >= startTime && itemTime <= endTime
}

/**
 * Apply date range filters to items (OR logic - item must be in at least one range)
 */
export const applyDateRangeFilters = (
  items: ImageListItem[],
  dateRangeFilters: DateRangeFilter[]
): ImageListItem[] => {
  if (dateRangeFilters.length === 0) return items
  
  return items.filter(item => 
    dateRangeFilters.some(dateRange => itemInDateRange(item, dateRange))
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
 * Extract active date range filters from filter map
 */
export const getActiveDateRangeFilters = (filters: Record<string, Filter[]>): DateRangeFilter[] => {
  return Object.values(filters)
    .flat()
    .filter(f => f.enabled && f.filterType === 'dateRange')
    .map(f => ({
      startDate: new Date(f.value.startDate),
      endDate: new Date(f.value.endDate)
    }))
}

/**
 * Apply all active filters to items
 */
export const applyFilters = (
  items: ImageListItem[],
  filters: Record<string, Filter[]>
): ImageListItem[] => {
  let filtered = items
  
  // Apply bounds filters
  const boundsFilters = getActiveBoundsFilters(filters)
  if (boundsFilters.length > 0) {
    filtered = applyBoundsFilters(filtered, boundsFilters)
  }
  
  // Apply date range filters
  const dateRangeFilters = getActiveDateRangeFilters(filters)
  if (dateRangeFilters.length > 0) {
    filtered = applyDateRangeFilters(filtered, dateRangeFilters)
  }
  
  return filtered
}

