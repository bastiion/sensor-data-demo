
export type Geo = {
  lat: number
  lng: number
  alt?: number
}

export type ImageListItem = {
  id: string
  image?: string
  title: string
  description?: string
  geo?: Geo
  date?: Date
}
