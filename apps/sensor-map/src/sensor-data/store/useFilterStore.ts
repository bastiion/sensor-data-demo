import { create } from 'zustand'

interface FilterState {
  // Filters
  selectedTime: Date | null
  selectedNetwork: string | null
  timeRangeFrom: Date | null
  timeRangeTo: Date | null
  
  // Actions
  setSelectedTime: (time: Date | null) => void
  setSelectedNetwork: (network: string | null) => void
  setTimeRange: (from: Date | null, to: Date | null) => void
  resetFilters: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  // Initial state
  selectedTime: null,
  selectedNetwork: null,
  timeRangeFrom: null,
  timeRangeTo: null,
  
  // Actions
  setSelectedTime: (time: Date | null) => {
    set({ selectedTime: time })
  },
  
  setSelectedNetwork: (network: string | null) => {
    set({ selectedNetwork: network })
  },
  
  setTimeRange: (from: Date | null, to: Date | null) => {
    set({
      timeRangeFrom: from,
      timeRangeTo: to,
    })
  },
  
  resetFilters: () => {
    set({
      selectedTime: null,
      selectedNetwork: null,
      timeRangeFrom: null,
      timeRangeTo: null,
    })
  },
}))

