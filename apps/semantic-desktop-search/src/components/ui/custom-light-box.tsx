import { useLightboxStore } from "@/store/useLightBoxStore"
import Lightbox from "yet-another-react-lightbox"
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export const CustomLightbox = () => {
  const { index, isOpen, close, slides } = useLightboxStore()
  return <Lightbox
    slides={slides}
    open={isOpen}
    index={index}
    close={close}
    plugins={[Fullscreen, Slideshow, Thumbnails, Zoom, Video]}
  />
}