import { ImageListItem } from "@/image-list-item"

export type GenericItemFilter<FilterOptions> = (options: FilterOptions) => (item: ImageListItem) => boolean

export type BoundsGeoFilterOptions = {
  bounds: {
    minLat: number
    maxLat: number
    minLng: number
    maxLng: number
  }
}

export type BoundsGeoFilter = GenericItemFilter<BoundsGeoFilterOptions>

export const boundsGeoFilter: BoundsGeoFilter = ({ bounds }) => (item) => {
  if (!item.geo) return false
  const { lat, lng } = item.geo
  // Handle edge cases around the antimeridian (180/-180 longitude)
  if (bounds.minLng > bounds.maxLng) {
    // Bounds cross the antimeridian
    return lat >= bounds.minLat && 
           lat <= bounds.maxLat && 
           (lng >= bounds.minLng || lng <= bounds.maxLng);
  }
  
  // Handle normal case
  return lat >= bounds.minLat && 
         lat <= bounds.maxLat && 
         lng >= bounds.minLng && 
         lng <= bounds.maxLng;
}
