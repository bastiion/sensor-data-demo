import { SlideImage } from 'yet-another-react-lightbox'
import { ImageListItem, Geo } from '@/image-list-item'
import { MeiliSearchResult } from './meilisearch'
import { SPARQLMetadata } from './sparql'

const thumbnailServerUrl = "http://localhost:20045/"

const supportedFileTypes = [
  "jpg", "jpeg", "png", "webp", "svg", "tif", "tiff", "gif", "bmp", "ico",
  "heic", "heif", "jp2", "jpm", "jpx", "jpf", "avif", "avifs",
  "pdf", "doc", "docx", "odt", "rtf", "xls", "xlsx", "ods", "ppt", "pptx", "odp", 
  "mp4", "mkv", "webm", "avi", "mov", "flv", "wmv", "mpg", "mpeg", "3gp", "ogv", "m4v"
]

export interface EnrichedResult extends MeiliSearchResult {
  sparqlMetadata?: SPARQLMetadata
}

const isSupportedFileType = (filePath: string) => {
  const extension = filePath.split(".").pop()?.toLowerCase()
  return extension && supportedFileTypes.includes(extension)
}

const generateThumbnailUrl = (filePath: string) => {
  return `${thumbnailServerUrl}${filePath.replace(/^\/srv2\/home\/sebastian\//, "")}`
}

const parseWKT = (location: string | undefined): Geo | undefined => {
  if (!location) return undefined
  
  const match = location.match(/^POINT\s*\(([^,]+),\s*([^)]+)\)$/)
  if (match && match[1] && match[2]) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) }
  }
  
  const matchZ = location.match(/^POINT Z\s*\(([^ ]+) \s*([^ ]+) \s*([^)]+)\)$/)
  if (matchZ && matchZ[1] && matchZ[2] && matchZ[3]) {
    return { 
      lat: parseFloat(matchZ[1]), 
      lng: parseFloat(matchZ[2]), 
      alt: parseFloat(matchZ[3]) 
    }
  }
  
  return undefined
}

/**
 * Transform enriched result to ImageListItem
 */
export const enrichedResultToListItem = (result: EnrichedResult): ImageListItem => {
  return {
    id: result.id || result.filePath,
    fileInstanceUri: result.fileInstanceUri,
    image: isSupportedFileType(result.filePath) ? generateThumbnailUrl(result.filePath) : undefined,
    title: result.title || result.filePath.split("/").pop() || result.filePath,
    description: result.filePath,
    geo: result.sparqlMetadata?.location ? parseWKT(result.sparqlMetadata.location) : undefined,
  }
}

/**
 * Transform enriched result to SlideImage for lightbox
 */
export const enrichedResultToSlideImage = (result: EnrichedResult): SlideImage | undefined => {
  const src = isSupportedFileType(result.filePath) ? generateThumbnailUrl(result.filePath) : undefined
  if (!src) return undefined
  const alt = result.title || result.filePath.split("/").pop() || result.filePath
  return { src, alt }
}

/**
 * Transform multiple enriched results to ImageListItems
 */
export const enrichedResultsToListItems = (results: EnrichedResult[]): ImageListItem[] => {
  return results.map(enrichedResultToListItem)
}

/**
 * Transform multiple enriched results to SlideImages
 */
export const enrichedResultsToSlideImages = (results: EnrichedResult[]): SlideImage[] => {
  return results
    .map(enrichedResultToSlideImage)
    .filter((slide): slide is SlideImage => slide !== undefined)
}

