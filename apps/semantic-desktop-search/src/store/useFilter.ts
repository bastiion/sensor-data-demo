import { BoundsGeoFilterOptions } from "@/lib/boundsGeoFilter"
import { create } from "zustand"

type UseFilterState = {
  boundsGeoFilterOptions?: BoundsGeoFilterOptions
  setBoundsGeoFilter: (options: BoundsGeoFilterOptions) => void
  clearBoundsGeoFilter: () => void
}

export const useFilterStore = create<UseFilterState>((set) => ({
  boundsGeoFilterOptions: undefined,
  setBoundsGeoFilter: (options) => set({ boundsGeoFilterOptions: options }),
  clearBoundsGeoFilter: () => set({ boundsGeoFilterOptions: undefined }),
}))

