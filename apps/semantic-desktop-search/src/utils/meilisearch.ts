import { MeiliSearch } from 'meilisearch'

// Initialize Meilisearch client
const meilisearchClient = new MeiliSearch({
  host: 'http://localhost:7700',
  apiKey: 'your_master_key_here',
})

export interface MeiliSearchResult {
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
}

export interface SearchParams {
  query: string
  limit: number
}

/**
 * Search files using Meilisearch
 */
export const searchFiles = async ({ query, limit }: SearchParams): Promise<MeiliSearchResult[]> => {
  if (!query || query.length < 2) return []
  
  const index = meilisearchClient.index('file-metadata')
  const results = await index.search<MeiliSearchResult>(query, {
    limit,
    attributesToHighlight: ['fileName', 'filePath'],
    filter: undefined,
    attributesToSearchOn: ['fileName', 'filePath'],
  })
  
  return results.hits
}

export { meilisearchClient }

