import { useAppSelector } from '@/store/hooks'
import { selectViewInstanceById } from '@/store/selectors/viewInstanceSelector'

/**
 * Hook to access current view instance data
 */
export const useViewInstance = (instanceId: string) => {
  return useAppSelector((state) => selectViewInstanceById(instanceId)(state))
}

