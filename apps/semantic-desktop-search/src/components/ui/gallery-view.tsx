import type { ImageListItem } from "@/image-list-item"
import { getImageSize } from 'react-image-size';
import { useEffect, useMemo, useState } from "react";
import "react-photo-album/rows.css";


import { Masonry, RenderComponentProps } from "masonic";
import { useLightboxStore } from "@/store/useLightBoxStore";


interface GalleryViewProps {
  images: ImageListItem[]
}

interface ImageSize {
  width: number
  height: number
}


let __image_sizes__: Record<string, ImageSize> = {}

type SImpleImage = {
  src: string
  width: number
  height: number
  index: number
}



const PhotoCard = ({ data }: RenderComponentProps<SImpleImage>) => {
  const { setIndex, open } = useLightboxStore()

  const handleClick = () => {
    setIndex(data.index)
    open()
  }
  return <img src={data.src} alt={data.src} width={data.width} height={data.height} onClick={handleClick} className="masonry-item clickable" />
}

export const GalleryView = ({ images }: GalleryViewProps) => {

  const thumbnails = useMemo<ImageListItem[]>(() => {
    return images.filter(image => image.image).map(image => ({ ...image, image: `${image.image}?q=50&height=300px` }))
  }, [images])


  const [photos, setPhotos] = useState<SImpleImage[]>([])

  useEffect(() => {
    const loadPhotos = async (image_list: ImageListItem[]) => {
      const sizes = __image_sizes__
      console.log(sizes)
      console.log("will load photos")
      for (const image of image_list) {
        let size: ImageSize | undefined = sizes[image.id]
        if (!size) {
          try {
            size = await getImageSize(image.image as string)
          } catch (e) {
            console.error(e)
            size = { width: 300, height: 300 }
          }
          __image_sizes__[image.id] = size
        }
      }
      //update photos a second time to ensure sizes are updated
      setPhotos(thumbnails.map((image, index) => ({ src: image.image as string, width: sizes[image.id]?.width || 300, height: sizes[image.id]?.height || 300, index })))
    }
    const sizes = __image_sizes__
    loadPhotos(thumbnails)
    setPhotos(thumbnails.map((image, index) => ({ src: image.image as string, width: sizes[image.id]?.width || 300, height: sizes[image.id]?.height || 300, index })))
  }, [thumbnails, setPhotos])

  if (!photos.length) {
    return <div>No images found</div>
  }

  return <div className="gallery-view">
    <Masonry
      columnGutter={8}
      columnWidth={172}
      overscanBy={5}
      items={photos} render={PhotoCard} />
  </div>
}


