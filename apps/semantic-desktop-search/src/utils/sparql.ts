export interface SPARQLMetadata {
  location?: string
  photoDate?: string
  dateModified?: string
}

export interface SPARQLEnrichmentParams {
  fileInstanceUris: string[]
  knowledgebase: string
}

/**
 * Enrich file results with SPARQL metadata
 */
export const enrichWithSparql = async ({
  fileInstanceUris,
  knowledgebase,
}: SPARQLEnrichmentParams): Promise<Map<string, SPARQLMetadata>> => {
  if (!fileInstanceUris.length) return new Map()

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
}

