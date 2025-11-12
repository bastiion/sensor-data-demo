import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { ViewDefinition, ViewComponent, ViewRegistration } from './types'
import { ListView, listViewDefinition } from './ListView'
import { GalleryView, galleryViewDefinition } from './GalleryView'
import { MapView, mapViewDefinition } from './MapView'

interface ViewRegistryContextValue {
  views: Map<string, ViewRegistration>
  registerView: (definition: ViewDefinition, component: ViewComponent) => void
  getViewDefinition: (viewType: string) => ViewDefinition | undefined
  getViewComponent: (viewType: string) => ViewComponent | undefined
  getAllViews: () => ViewRegistration[]
}

const ViewRegistryContext = createContext<ViewRegistryContextValue | undefined>(undefined)

interface ViewRegistryProps {
  children: ReactNode
}

// Pre-register all views
const initialViews = new Map<string, ViewRegistration>([
  ['list', { definition: listViewDefinition, component: ListView }],
  ['gallery', { definition: galleryViewDefinition, component: GalleryView }],
  ['map', { definition: mapViewDefinition, component: MapView }],
])

export const ViewRegistry = ({ children }: ViewRegistryProps) => {
  const [views, setViews] = useState<Map<string, ViewRegistration>>(initialViews)

  const registerView = useCallback((definition: ViewDefinition, component: ViewComponent) => {
    setViews((prevViews) => {
      const newViews = new Map(prevViews)
      newViews.set(definition.viewType, { definition, component })
      return newViews
    })
  }, [])

  const getViewDefinition = useCallback(
    (viewType: string) => views.get(viewType)?.definition,
    [views]
  )

  const getViewComponent = useCallback(
    (viewType: string) => views.get(viewType)?.component,
    [views]
  )

  const getAllViews = useCallback(() => Array.from(views.values()), [views])

  const value: ViewRegistryContextValue = {
    views,
    registerView,
    getViewDefinition,
    getViewComponent,
    getAllViews,
  }

  return (
    <ViewRegistryContext.Provider value={value}>
      {children}
    </ViewRegistryContext.Provider>
  )
}

export const useViewRegistry = () => {
  const context = useContext(ViewRegistryContext)
  if (!context) {
    throw new Error('useViewRegistry must be used within ViewRegistry')
  }
  return context
}

