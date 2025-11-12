import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ViewInstance {
  instanceId: string
  viewType: string
  filterEnabled: boolean
  tileId: string
}

export interface ViewInstanceState {
  instances: Record<string, ViewInstance>
}

const initialState: ViewInstanceState = {
  instances: {},
}

interface CreateInstancePayload {
  instanceId: string
  tileId: string
  viewType: string
  filterEnabled: boolean
}

interface UpdateInstancePayload {
  instanceId: string
  viewType?: string
  filterEnabled?: boolean
}

interface RemoveInstancePayload {
  instanceId: string
}

interface ToggleFilterPayload {
  instanceId: string
}

const viewInstanceSlice = createSlice({
  name: 'viewInstance',
  initialState,
  reducers: {
    createInstance: (state, action: PayloadAction<CreateInstancePayload>) => {
      const { instanceId, tileId, viewType, filterEnabled } = action.payload
      state.instances[tileId] = {
        instanceId,
        tileId,
        viewType,
        filterEnabled,
      }
    },
    updateInstance: (state, action: PayloadAction<UpdateInstancePayload>) => {
      const { instanceId, ...updates } = action.payload
      const tileId = Object.keys(state.instances).find(
        (tid) => state.instances[tid]?.instanceId === instanceId
      )
      if (tileId) {
        const instance = state.instances[tileId]
        if (instance) {
          state.instances[tileId] = {
            ...instance,
            ...updates,
          }
        }
      }
    },
    removeInstance: (state, action: PayloadAction<RemoveInstancePayload>) => {
      const { instanceId } = action.payload
      const tileId = Object.keys(state.instances).find(
        (tid) => state.instances[tid]?.instanceId === instanceId
      )
      if (tileId) {
        delete state.instances[tileId]
      }
    },
    toggleFilter: (state, action: PayloadAction<ToggleFilterPayload>) => {
      const { instanceId } = action.payload
      const tileId = Object.keys(state.instances).find(
        (tid) => state.instances[tid]?.instanceId === instanceId
      )
      if (tileId) {
        const instance = state.instances[tileId]
        if (instance) {
          instance.filterEnabled = !instance.filterEnabled
        }
      }
    },
  },
})

export const { createInstance, updateInstance, removeInstance, toggleFilter } =
  viewInstanceSlice.actions
export default viewInstanceSlice.reducer

