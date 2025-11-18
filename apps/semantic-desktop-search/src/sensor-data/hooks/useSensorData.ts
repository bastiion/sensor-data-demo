import { useSensorStore } from '../store/useSensorStore'

/**
 * Convenience hook to access sensor data store
 */
export const useSensorData = () => {
  const store = useSensorStore()
  
  return {
    // State
    loaded: store.loaded,
    loading: store.loading,
    error: store.error,
    data: store.data,
    filteredData: store.filteredData,
    timeRange: store.timeRange,
    geoBounds: store.geoBounds,
    
    // Actions
    loadData: store.loadData,
    setTimeRange: store.setTimeRange,
    setGeoBounds: store.setGeoBounds,
    resetFilters: store.resetFilters,
  }
}

