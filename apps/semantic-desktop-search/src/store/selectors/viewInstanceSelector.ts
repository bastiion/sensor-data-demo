import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../index'

/**
 * Get all view instances
 */
export const selectAllViewInstances = (state: RootState) => state.viewInstance.instances

/**
 * Get view instance by tile ID
 */
export const selectViewInstanceByTileId = (tileId: string) =>
  createSelector([selectAllViewInstances], (instances) => instances[tileId])

/**
 * Get view instances by view type
 */
export const selectViewInstancesByType = (viewType: string) =>
  createSelector([selectAllViewInstances], (instances) =>
    Object.values(instances).filter((instance) => instance.viewType === viewType)
  )

/**
 * Get view instance by instance ID
 */
export const selectViewInstanceById = (instanceId: string) =>
  createSelector([selectAllViewInstances], (instances) =>
    Object.values(instances).find((instance) => instance.instanceId === instanceId)
  )

