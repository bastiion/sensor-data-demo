import { useState, useEffect, useMemo } from 'react'
import { SlideImage } from 'yet-another-react-lightbox'
import { useSearchStore } from '@/store/useSearchStore'
import { useLightboxStore } from '@/store/useLightBoxStore'
import { useTwoStepSearch } from './useTwoStepSearch'
import { useDebouncedValue } from './useDebouncedValue'
import { ImageListItem, Geo } from '@/image-list-item'

const thumbnailServerUrl = "http://localhost:20045/"

const supportedFileTypes = [
  "jpg", "jpeg", "png", "webp", "svg", "tif", "tiff", "gif", "bmp", "ico",
  "heic", "heif", "jp2", "jpm", "jpx", "jpf", "avif", "avifs",
  "pdf", "doc", "docx", "odt", "rtf", "xls", "xlsx", "ods", "ppt", "pptx", "odp", 
  "mp4", "mkv", "webm", "avi", "mov", "flv", "wmv", "mpg", "mpeg", "3gp", "ogv", "m4v"
]

const isSupportedFileType = (filePath: string) => {
  const extension = filePath.split(".").pop()?.toLowerCase()
  return extension && supportedFileTypes.includes(extension)
}

/**
 * Generate a thumbnail URL for a given file path
 */
const generateThumbnailUrl = (filePath: string) => {
  return `${thumbnailServerUrl}${filePath.replace(/^\/srv2\/home\/sebastian\//, "")}`
}

const parseWKT = (location: string): Geo | undefined => {
  //POINT or 
  const match = location.match(/^POINT\s*\(([^,]+),\s*([^)]+)\)$/)
  if (match && match.length === 3) {
    //@ts-ignore
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) }
  }
  //POINT Z(lat,lon, height)
  const matchZ = location.match(/^POINT Z\s*\(([^ ]+) \s*([^ ]+) \s*([^)]+)\)$/)
  if (matchZ && matchZ.length === 4) {
    //@ts-ignore
    return { lat: parseFloat(matchZ[1]), lng: parseFloat(matchZ[2]), alt: parseFloat(matchZ[3]) }
  }
  return undefined
}

// Convert enriched result from two-step search to ImageListItem
const enrichedResultToListItem = (result: any): ImageListItem => {
  return {
    id: result.id || result.filePath,
    image: isSupportedFileType(result.filePath) ? generateThumbnailUrl(result.filePath) : undefined,
    title: result.title || result.filePath.split("/").pop() || result.filePath,
    description: result.filePath,
    geo: result.sparqlMetadata?.location ? parseWKT(result.sparqlMetadata.location) : undefined,
  }
}

const enrichedResultToSlideImage = (result: any): SlideImage | undefined => {
  const src = isSupportedFileType(result.filePath) ? generateThumbnailUrl(result.filePath) : undefined
  if (!src) return undefined
  const alt = result.title || result.filePath.split("/").pop() || result.filePath
  return { src, alt }
}

/**
 * Shared hook for search view logic
 * Handles search state, debouncing, two-step search, and lightbox slides
 */
export const useSearchView = () => {
  const { searchQuery, knowledgebase, pageSize } = useSearchStore()
  const [isSearching, setIsSearching] = useState(false)
  const { setSlides } = useLightboxStore()

  // Debounce the search query for better UX
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)

  // Use two-step search: Fast Meilisearch + SPARQL enrichment
  const {
    results: enrichedResults,
    isLoading,
    isFetching,
    hasMeiliResults,
    hasSparqlEnrichment,
  } = useTwoStepSearch(debouncedSearchQuery, knowledgebase, pageSize)

  // Update slides for lightbox with enriched results
  useEffect(() => {
    const slides = enrichedResults
      .map(enrichedResultToSlideImage)
      .filter(Boolean) as SlideImage[]
    setSlides(slides)
  }, [enrichedResults, setSlides])

  useEffect(() => {
    setIsSearching(searchQuery.length > 2)
  }, [searchQuery])

  // Convert enriched results to list items
  const listItems = useMemo(
    () => enrichedResults.map(enrichedResultToListItem),
    [enrichedResults]
  )

  return {
    searchQuery,
    debouncedSearchQuery,
    isSearching,
    listItems,
    enrichedResults,
    isLoading,
    isFetching,
    hasMeiliResults,
    hasSparqlEnrichment,
  }
}

