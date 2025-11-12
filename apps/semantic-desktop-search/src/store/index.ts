import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import searchReducer from './slices/searchSlice'
import viewInstanceReducer from './slices/viewInstanceSlice'
import filterReducer from './slices/filterSlice'
import lightboxReducer from './slices/lightboxSlice'
import { searchApi } from './api/searchApi'

export const store = configureStore({
  reducer: {
    search: searchReducer,
    viewInstance: viewInstanceReducer,
    filter: filterReducer,
    lightbox: lightboxReducer,
    [searchApi.reducerPath]: searchApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state for serialization checks
        ignoredActions: ['searchApi/executeQuery/fulfilled'],
        ignoredPaths: ['searchApi'],
      },
    }).concat(searchApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

