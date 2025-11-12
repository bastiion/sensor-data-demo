import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Filter {
  instanceId: string
  filterType: 'bounds' | 'dateRange' | 'custom'
  enabled: boolean
  value: any
}

export interface FilterState {
  filters: Record<string, Filter[]>
}

const initialState: FilterState = {
  filters: {},
}

interface SetFilterPayload {
  instanceId: string
  filterType: 'bounds' | 'dateRange' | 'custom'
  value: any
}

interface RemoveFilterPayload {
  instanceId: string
  filterType: 'bounds' | 'dateRange' | 'custom'
}

interface ClearInstanceFiltersPayload {
  instanceId: string
}

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<SetFilterPayload>) => {
      const { instanceId, filterType, value } = action.payload
      
      if (!state.filters[instanceId]) {
        state.filters[instanceId] = []
      }
      
      const filters = state.filters[instanceId]
      if (!filters) return
      
      const existingFilterIndex = filters.findIndex((f) => f.filterType === filterType)
      
      if (existingFilterIndex >= 0) {
        const filter = filters[existingFilterIndex]
        if (filter) {
          filter.value = value
          filter.enabled = true
        }
      } else {
        filters.push({
          instanceId,
          filterType,
          enabled: true,
          value,
        })
      }
    },
    removeFilter: (state, action: PayloadAction<RemoveFilterPayload>) => {
      const { instanceId, filterType } = action.payload
      
      const filters = state.filters[instanceId]
      if (filters) {
        state.filters[instanceId] = filters.filter((f) => f.filterType !== filterType)
        
        if (state.filters[instanceId]?.length === 0) {
          delete state.filters[instanceId]
        }
      }
    },
    clearInstanceFilters: (state, action: PayloadAction<ClearInstanceFiltersPayload>) => {
      const { instanceId } = action.payload
      delete state.filters[instanceId]
    },
    toggleFilterEnabled: (state, action: PayloadAction<RemoveFilterPayload>) => {
      const { instanceId, filterType } = action.payload
      
      const filters = state.filters[instanceId]
      if (filters) {
        const filter = filters.find((f) => f.filterType === filterType)
        if (filter) {
          filter.enabled = !filter.enabled
        }
      }
    },
  },
})

export const { setFilter, removeFilter, clearInstanceFilters, toggleFilterEnabled } =
  filterSlice.actions
export default filterSlice.reducer

