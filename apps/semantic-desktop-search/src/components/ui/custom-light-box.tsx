import Lightbox from "yet-another-react-lightbox"
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen"
import Slideshow from "yet-another-react-lightbox/plugins/slideshow"
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails"
import Video from "yet-another-react-lightbox/plugins/video"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"
import "yet-another-react-lightbox/plugins/thumbnails.css"
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { closeLightbox } from '@/store/slices/lightboxSlice'

export const CustomLightbox = () => {
  const dispatch = useAppDispatch()
  const { currentIndex, isOpen, slides } = useAppSelector((state) => state.lightbox)

  return (
    <Lightbox
      slides={slides}
      open={isOpen}
      index={currentIndex}
      close={() => dispatch(closeLightbox())}
      plugins={[Fullscreen, Slideshow, Thumbnails, Zoom, Video]}
    />
  )
}
