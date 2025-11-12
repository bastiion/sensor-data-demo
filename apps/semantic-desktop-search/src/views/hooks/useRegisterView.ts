import { useEffect } from 'react'
import { useViewRegistry } from '../ViewRegistry'
import { ViewDefinition, ViewComponent } from '../types'

/**
 * Hook for views to self-register with the ViewRegistry
 */
export const useRegisterView = (definition: ViewDefinition, component: ViewComponent) => {
  const { registerView } = useViewRegistry()

  useEffect(() => {
    registerView(definition, component)
  }, [registerView, definition, component])
}

