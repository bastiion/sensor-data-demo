import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../index'
import { getActiveBoundsFilters } from '@/utils/filters'

/**
 * Get all filters
 */
export const selectAllFilters = (state: RootState) => state.filter.filters

/**
 * Get filters for a specific instance
 */
export const selectFiltersByInstanceId = (instanceId: string) =>
  createSelector([selectAllFilters], (filters) => filters[instanceId] || [])

/**
 * Get all active bounds filters
 */
export const selectActiveBoundsFilters = createSelector(
  [selectAllFilters],
  (filters) => getActiveBoundsFilters(filters)
)

/**
 * Check if an instance has any enabled filters
 */
export const selectInstanceHasEnabledFilters = (instanceId: string) =>
  createSelector(
    [selectFiltersByInstanceId(instanceId)],
    (filters) => filters.some((f) => f.enabled)
  )

