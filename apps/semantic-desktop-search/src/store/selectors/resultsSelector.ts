import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../index'
import { EnrichedResult, enrichedResultsToListItems, enrichedResultsToSlideImages } from '@/utils/transforms'
import { applyFilters } from '@/utils/filters'
import { MeiliSearchResult } from '@/utils/meilisearch'
import { SPARQLEnrichmentMap } from '@/utils/sparql'

/**
 * Combine Meilisearch results with SPARQL enrichment
 */
export const selectEnrichedResults = createSelector(
  [
    (_state: RootState, meilisearchResults: MeiliSearchResult[] | undefined) => meilisearchResults,
    (_state: RootState, _meilisearchResults: MeiliSearchResult[] | undefined, sparqlEnrichment: SPARQLEnrichmentMap | undefined) => sparqlEnrichment,
  ],
  (meilisearchResults, sparqlEnrichment): EnrichedResult[] => {
    if (!meilisearchResults) return []
    
    return meilisearchResults.map((meiliResult) => ({
      ...meiliResult,
      sparqlMetadata: sparqlEnrichment?.[meiliResult.fileInstanceUri],
    }))
  }
)

/**
 * Apply filters to enriched results
 */
export const selectFilteredResults = createSelector(
  [
    (_state: RootState, enrichedResults: EnrichedResult[]) => enrichedResults,
    (state: RootState) => state.filter.filters,
  ],
  (enrichedResults, filters) => {
    const listItems = enrichedResultsToListItems(enrichedResults)
    return applyFilters(listItems, filters)
  }
)

/**
 * Generate lightbox slides from enriched results
 */
export const selectLightboxSlides = createSelector(
  [
    (_state: RootState, enrichedResults: EnrichedResult[]) => enrichedResults,
  ],
  (enrichedResults) => {
    return enrichedResultsToSlideImages(enrichedResults)
  }
)

