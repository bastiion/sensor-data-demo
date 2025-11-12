import { useMemo, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { useSearchFilesQuery, useEnrichWithSparqlQuery } from '@/store/api/searchApi'
import { selectEnrichedResults, selectFilteredResults } from '@/store/selectors/resultsSelector'
import { setSlides } from '@/store/slices/lightboxSlice'

/**
 * Hook to get search results with enrichment and filtering
 */
export const useSearchResults = () => {
  const dispatch = useAppDispatch()
  const { searchQuery, pageSize, knowledgebase } = useAppSelector((state) => state.search)

  // Step 1: Meilisearch query
  const {
    data: meilisearchResults,
    isLoading: isMeiliSearching,
    isFetching: isMeiliFetching,
  } = useSearchFilesQuery(
    { query: searchQuery, limit: pageSize },
    { skip: !searchQuery || searchQuery.length < 2 }
  )

  // Get file instance URIs for SPARQL enrichment
  const fileInstanceUris = useMemo(
    () => meilisearchResults?.map((r) => r.fileInstanceUri) || [],
    [meilisearchResults]
  )

  // Step 2: SPARQL enrichment
  const {
    data: sparqlEnrichment,
    isLoading: isSparqlLoading,
    isFetching: isSparqlFetching,
  } = useEnrichWithSparqlQuery(
    { fileInstanceUris, knowledgebase },
    { skip: fileInstanceUris.length === 0 }
  )

  // Combine results
  const enrichedResults = useAppSelector((state) =>
    selectEnrichedResults(state, meilisearchResults, sparqlEnrichment)
  )

  // Apply filters
  const filteredResults = useAppSelector((state) =>
    selectFilteredResults(state, enrichedResults)
  )

  // Update lightbox slides - convert filtered ImageListItems back to slides
  const slides = useMemo(() => {
    return filteredResults
      .filter(item => item.image)
      .map(item => ({
        src: item.image!,
        alt: item.title,
        width: 1920,
        height: 1080,
        fileInstanceUri: item.fileInstanceUri,
      }))
  }, [filteredResults])
  
  useEffect(() => {
    dispatch(setSlides(slides))
  }, [slides, dispatch])

  return {
    results: filteredResults,
    enrichedResults,
    isLoading: isMeiliSearching || (meilisearchResults && meilisearchResults.length > 0 && isSparqlLoading),
    isFetching: isMeiliFetching || isSparqlFetching,
    hasMeiliResults: Boolean(meilisearchResults && meilisearchResults.length > 0),
    hasSparqlEnrichment: Boolean(sparqlEnrichment && sparqlEnrichment.size > 0),
  }
}

