import type { ImageListItem } from "@/image-list-item"
import { getImageSize } from 'react-image-size';
import { useEffect, useMemo, useState } from "react";
import "react-photo-album/rows.css";


import { Masonry, RenderComponentProps } from "masonic";
import { useAppDispatch } from "@/store/hooks";
import { openLightbox } from "@/store/slices/lightboxSlice";


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
  fileInstanceUri: string
}



const PhotoCard = ({ data }: RenderComponentProps<SImpleImage>) => {
  const dispatch = useAppDispatch()

  const handleClick = () => {
    dispatch(openLightbox({ fileInstanceUri: data.fileInstanceUri }))
  }
  return <img src={data.src} alt={data.src} width={data.width} height={data.height} onClick={handleClick} className="masonry-item clickable" />
}

export const GalleryView = ({ images }: GalleryViewProps) => {

  const thumbnails = useMemo<ImageListItem[]>(() => {
    return images
      .filter(image => image?.image && image?.id && image?.fileInstanceUri)
      .map(image => ({ ...image, image: `${image.image}?q=50&height=300px` }))
  }, [images])


  const [photos, setPhotos] = useState<SImpleImage[]>([])

  useEffect(() => {
    // If no thumbnails, set empty array and return
    if (!thumbnails || thumbnails.length === 0) {
      setPhotos([])
      return
    }

    const loadPhotos = async (image_list: ImageListItem[]) => {
      const sizes = __image_sizes__
      console.log(sizes)
      console.log("will load photos")
      for (const image of image_list) {
        if (!image?.id || !image?.image || !image?.fileInstanceUri) continue
        
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
      const newPhotos = thumbnails
        .filter(image => image?.id && image?.image && image?.fileInstanceUri)
        .map((image) => {
          // Create a stable object with all required properties
          const photo: SImpleImage = {
            src: image.image as string, 
            width: sizes[image.id]?.width || 300, 
            height: sizes[image.id]?.height || 300, 
            fileInstanceUri: image.fileInstanceUri,
          }
          return photo
        })
        .filter(photo => photo.src && photo.fileInstanceUri) // Extra safety
      
      setPhotos(newPhotos)
    }
    
    const sizes = __image_sizes__
    const initialPhotos = thumbnails
      .filter(image => image?.id && image?.image && image?.fileInstanceUri)
      .map((image) => {
        // Create a stable object with all required properties
        const photo: SImpleImage = {
          src: image.image as string, 
          width: sizes[image.id]?.width || 300, 
          height: sizes[image.id]?.height || 300, 
          fileInstanceUri: image.fileInstanceUri,
        }
        return photo
      })
      .filter(photo => photo.src && photo.fileInstanceUri) // Extra safety
    
    setPhotos(initialPhotos)
    loadPhotos(thumbnails)
  }, [thumbnails])

  // Ensure photos is always a valid array
  const validPhotos = useMemo(() => {
    if (!photos || !Array.isArray(photos)) return []
    return photos.filter(p => p && typeof p === 'object' && p.src && p.fileInstanceUri)
  }, [photos])

  if (validPhotos.length === 0) {
    return <div>No images found</div>
  }

  return <div className="gallery-view">
    <Masonry
      columnGutter={8}
      columnWidth={172}
      overscanBy={5}
      items={validPhotos}
      render={PhotoCard}
    />
  </div>
}


