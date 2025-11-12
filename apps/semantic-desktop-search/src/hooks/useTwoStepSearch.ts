import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { MeiliSearch } from 'meilisearch'

// Initialize Meilisearch client
const meilisearchClient = new MeiliSearch({
  host: 'http://localhost:7700',
  apiKey: 'your_master_key_here',
})

interface MeiliSearchResult {
  id: string
  filePath: string
  fileName: string
  fileInstanceUri: string
  sizeBytes?: number
  mimeType?: string
  checksum?: string
  title?: string
  modificationTime?: string
  accessTime?: string
  creationTime?: string
  // Add other fields from your index
}

interface SPARQLMetadata {
  location?: string
  photoDate?: string
  dateModified?: string
  // Add other SPARQL fields
}

interface EnrichedResult extends MeiliSearchResult {
  sparqlMetadata?: SPARQLMetadata
}

/**
 * Two-step search hook:
 * 1. Fast Meilisearch filtering (debounced)
 * 2. SPARQL enrichment for filtered results
 */
export const useTwoStepSearch = (
  searchQuery: string,
  knowledgebase: string,
  limit: number = 50
) => {
  // Step 1: Fast Meilisearch search (debounced) - search only in fileName
  const {
    data: meilisearchResults,
    isLoading: isMeiliSearching,
    isFetching: isMeiliFetching,
  } = useQuery({
    queryKey: ['meilisearch', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return []
      
      const index = meilisearchClient.index('file-metadata')
      // We want to search both fileName and filePath, but prioritize fileName. 
      // We do this by ordering attributesToSearchOn as ['fileName', 'filePath'].
      // MeiliSearch will give higher priority to the first attribute.
      const results = await index.search<MeiliSearchResult>(searchQuery, {
        limit,
        attributesToHighlight: ['fileName', 'filePath'],
        filter: undefined,
        attributesToSearchOn: ['fileName', 'filePath'], // fileName comes first for higher priority
      })
      
      return results.hits
    },
    enabled: searchQuery.length >= 2,
    staleTime: 5000, // Cache for 5 seconds
    // Debouncing is handled by the query key staying the same
  })

  // Get fileInstanceUris from Meilisearch results for SPARQL query
  const fileInstanceUris = useMemo(
    () => meilisearchResults?.map((r) => r.fileInstanceUri) || [],
    [meilisearchResults]
  )

  // Step 2: Enrich with SPARQL metadata (only for Meilisearch results)
  const {
    data: sparqlEnrichment,
    isLoading: isSparqlLoading,
    isFetching: isSparqlFetching,
  } = useQuery({
    queryKey: ['sparql-enrichment', fileInstanceUris],
    queryFn: async () => {
      if (!fileInstanceUris.length) return new Map<string, SPARQLMetadata>()

      // Build SPARQL query to fetch metadata for specific fileInstanceUris
      const fileInstanceFilters = fileInstanceUris
        .map((uri) => `<${uri}>`)
        .join(' ')

      const query = `
        PREFIX st: <http://semanticdesk.top/ontology#>
        PREFIX gis: <http://www.opengis.net/ont/geosparql#>

        SELECT DISTINCT ?fileInstance ?location ?photoDate ?dateModified WHERE {
          VALUES ?fileInstance { ${fileInstanceFilters} }
          ?sub st:recentScannedInfo ?obj .
          ?obj st:fileInstance ?fileInstance .
          OPTIONAL {
            ?obj st:fileContent/st:photoDate ?photoDate .
          }
          OPTIONAL {
            ?fileInstance st:dateModified ?dateModified .
          }
          OPTIONAL {
            ?obj st:fileContent/gis:hasGeometry/gis:asWKT ?location .
          }
        }
      `

      const response = await fetch(knowledgebase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/sparql-results+json',
        },
        body: `query=${encodeURIComponent(query)}`,
      })

      const data = await response.json()
      
      // Create a map of fileInstanceUri -> metadata
      const metadataMap = new Map<string, SPARQLMetadata>()
      data.results?.bindings?.forEach((binding: any) => {
        const fileInstance = binding.fileInstance?.value
        if (fileInstance) {
          metadataMap.set(fileInstance, {
            location: binding.location?.value,
            photoDate: binding.photoDate?.value,
            dateModified: binding.dateModified?.value,
          })
        }
      })

      return metadataMap
    },
    enabled: fileInstanceUris.length > 0,
    staleTime: 30000, // Cache SPARQL results longer (30 seconds)
  })

  // Merge Meilisearch and SPARQL results
  const enrichedResults: EnrichedResult[] = useMemo(() => {
    if (!meilisearchResults) return []
    
    return meilisearchResults.map((meiliResult) => ({
      ...meiliResult,
      sparqlMetadata: sparqlEnrichment?.get(meiliResult.fileInstanceUri),
    }))
  }, [meilisearchResults, sparqlEnrichment])

  return {
    results: enrichedResults,
    isLoading: isMeiliSearching || (meilisearchResults && meilisearchResults.length > 0 && isSparqlLoading),
    isFetching: isMeiliFetching || isSparqlFetching,
    hasMeiliResults: Boolean(meilisearchResults && meilisearchResults.length > 0),
    hasSparqlEnrichment: Boolean(sparqlEnrichment && sparqlEnrichment.size > 0),
    // Separate states for progressive display
    meilisearchResults,
    sparqlEnrichment,
  }
}

