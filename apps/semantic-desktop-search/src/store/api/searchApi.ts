import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { searchFiles, MeiliSearchResult } from '@/utils/meilisearch'
import { enrichWithSparql, SPARQLEnrichmentMap } from '@/utils/sparql'

export interface SearchFilesArgs {
  query: string
  limit: number
}

export interface EnrichWithSparqlArgs {
  fileInstanceUris: string[]
  knowledgebase: string
}

export const searchApi = createApi({
  reducerPath: 'searchApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    searchFiles: builder.query<MeiliSearchResult[], SearchFilesArgs>({
      queryFn: async ({ query, limit }) => {
        try {
          const results = await searchFiles({ query, limit })
          return { data: results }
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } }
        }
      },
    }),
    enrichWithSparql: builder.query<SPARQLEnrichmentMap, EnrichWithSparqlArgs>({
      queryFn: async ({ fileInstanceUris, knowledgebase }) => {
        try {
          const enrichment = await enrichWithSparql({ fileInstanceUris, knowledgebase })
          return { data: enrichment }
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } }
        }
      },
    }),
  }),
})

export const { useSearchFilesQuery, useEnrichWithSparqlQuery } = searchApi

