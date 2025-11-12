import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SlideImage } from 'yet-another-react-lightbox'

// Extend SlideImage to include fileInstanceUri
export interface ExtendedSlideImage extends SlideImage {
  fileInstanceUri: string
}

export interface LightboxState {
  isOpen: boolean
  currentIndex: number
  slides: ExtendedSlideImage[]
}

const initialState: LightboxState = {
  isOpen: false,
  currentIndex: -1,
  slides: [],
}

interface OpenLightboxPayload {
  fileInstanceUri: string
}

const lightboxSlice = createSlice({
  name: 'lightbox',
  initialState,
  reducers: {
    openLightbox: (state, action: PayloadAction<OpenLightboxPayload>) => {
      // Find the index of the slide with the given fileInstanceUri
      const index = state.slides.findIndex(
        slide => slide.fileInstanceUri === action.payload.fileInstanceUri
      )
      
      if (index >= 0) {
        state.isOpen = true
        state.currentIndex = index
      }
    },
    closeLightbox: (state) => {
      state.isOpen = false
    },
    setSlides: (state, action: PayloadAction<ExtendedSlideImage[]>) => {
      state.slides = action.payload
    },
    setIndex: (state, action: PayloadAction<number>) => {
      state.currentIndex = action.payload
    },
  },
})

export const { openLightbox, closeLightbox, setSlides, setIndex } = lightboxSlice.actions
export default lightboxSlice.reducer

