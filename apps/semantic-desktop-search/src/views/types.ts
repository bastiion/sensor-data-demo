import { FC, ReactNode } from 'react'

export interface ViewDefinition {
  viewType: string
  name: string
  icon?: ReactNode
  canFilter: boolean
  description?: string
}

export interface ViewProps {
  instanceId: string
  filterEnabled: boolean
}

export type ViewComponent = FC<ViewProps>

export interface ViewRegistration {
  definition: ViewDefinition
  component: ViewComponent
}

