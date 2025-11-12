
import { SlideImage } from 'yet-another-react-lightbox'
import { create } from 'zustand'

export type LightboxState = {
  index: number
  setIndex: (index: number) => void
  slides: SlideImage[]
  setSelectedSrc: (src: string) => void
  setSlides: (slides: SlideImage[]) => void
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useLightboxStore = create<LightboxState>((set, get) => ({
  index: -1,
  setIndex: (index) => set({ index }),
  slides: [],
  setSlides: (slides) => set({ slides }),
  setSelectedSrc: (src) => {
    const index = get().slides.findIndex(slide => slide.src === src)
    if (index !== -1) set({ index })
  },
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))