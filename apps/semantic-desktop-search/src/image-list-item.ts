
export type Geo = {
  lat: number
  lng: number
  alt?: number
}

export interface TimeConfig {
  timeStart: string[]  // Array of paths to try for start time (in priority order)
  timeEnd?: string[]   // Array of paths to try for end time (optional)
}

export type ImageListItem = {
  id: string
  fileInstanceUri: string
  image?: string
  title: string
  description?: string
  geo?: Geo
  date?: Date
}

// Default time configuration for timeline view
export const DEFAULT_TIME_CONFIG: TimeConfig = {
  timeStart: [
    'sparqlMetadata.photoDate',
    'creationTime',
    'modificationTime',
    'accessTime'
  ],
  timeEnd: [] // No end time by default (point items)
}
