import { useViewRegistry } from '../ViewRegistry'

/**
 * Hook to get all available registered views
 */
export const useAvailableViews = () => {
  const { getAllViews } = useViewRegistry()
  return getAllViews()
}

