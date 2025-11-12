import { create } from 'zustand'

export interface SearchState {
  searchQuery: string
  setSearchQuery: (query: string) => void
  geoSearch: boolean
  setGeoSearch: (geoSearch: boolean) => void
  geoSearchCenter: { lat: number, lng: number }
  setGeoSearchCenter: (geoSearchCenter: { lat: number, lng: number }) => void
  geoSearchRadius: number
  setGeoSearchRadius: (geoSearchRadius: number) => void
  knowledgebase: string
  setKnowledgebase: (knowledgebase: string) => void
  pageSize: number
  setPageSize: (pageSize: number) => void
}

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  geoSearch: false,
  setGeoSearch: (geoSearch) => set({ geoSearch }),
  geoSearchCenter: {
    lat: 50.986834385099854,
    lng: 13.550555724194794
  },
  setGeoSearchCenter: (geoSearchCenter) => set({ geoSearchCenter }),
  knowledgebase: 'http://localhost:9999/bigdata/namespace/kb/sparql',
  setKnowledgebase: (knowledgebase) => set({ knowledgebase }),
  geoSearchRadius: 10,
  setGeoSearchRadius: (geoSearchRadius) => set({ geoSearchRadius }),
  pageSize: 50,
  setPageSize: (pageSize) => set({ pageSize }),
}))

