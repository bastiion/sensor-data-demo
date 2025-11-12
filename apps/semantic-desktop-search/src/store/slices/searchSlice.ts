import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface SearchState {
  searchQuery: string
  pageSize: number
  knowledgebase: string
}

const initialState: SearchState = {
  searchQuery: '',
  pageSize: 50,
  knowledgebase: 'http://localhost:9999/bigdata/namespace/kb/sparql',
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload
    },
    setKnowledgebase: (state, action: PayloadAction<string>) => {
      state.knowledgebase = action.payload
    },
  },
})

export const { setSearchQuery, setPageSize, setKnowledgebase } = searchSlice.actions
export default searchSlice.reducer

