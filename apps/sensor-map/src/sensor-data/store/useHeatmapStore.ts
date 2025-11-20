import { create } from 'zustand'

interface HeatmapSettings {
  maxDistanceKm: number
  idwPower: number
  colorRampMin: number
  colorRampMax: number
  opacity: number
}

interface HeatmapStore extends HeatmapSettings {
  setMaxDistanceKm: (value: number) => void
  setIdwPower: (value: number) => void
  setColorRampMin: (value: number) => void
  setColorRampMax: (value: number) => void
  setOpacity: (value: number) => void
  resetSettings: () => void
}

const defaultSettings: HeatmapSettings = {
  maxDistanceKm: 50,
  idwPower: 3.0,
  colorRampMin: 0,
  colorRampMax: 20,
  opacity: 0.6,
}

export const useHeatmapStore = create<HeatmapStore>((set) => ({
  ...defaultSettings,

  setMaxDistanceKm: (value: number) => set({ maxDistanceKm: value }),
  setIdwPower: (value: number) => set({ idwPower: value }),
  setColorRampMin: (value: number) => set({ colorRampMin: value }),
  setColorRampMax: (value: number) => set({ colorRampMax: value }),
  setOpacity: (value: number) => set({ opacity: value }),

  resetSettings: () => set(defaultSettings),
}))

