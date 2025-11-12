import { useEffect, useState } from 'react'
import {
  Box,
  Input,
  VStack,
  HStack,
  Text,
  Kbd,
  Badge,
  Separator,
} from '@chakra-ui/react'
import { LuSearch, LuSun, LuMoon, LuMapPin, LuX } from 'react-icons/lu'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { setSearchQuery, setPageSize } from '@/store/slices/searchSlice'
import { removeFilter } from '@/store/slices/filterSlice'
import { getActiveBoundsFilters } from '@/utils/filters'

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const dispatch = useAppDispatch()
  const { searchQuery, pageSize } = useAppSelector((state) => state.search)
  const filters = useAppSelector((state) => state.filter.filters)
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [localPageSize, setLocalPageSize] = useState(pageSize)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  const activeBoundsFilters = getActiveBoundsFilters(filters)
  const hasActiveFilters = activeBoundsFilters.length > 0

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setLocalQuery(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    setLocalPageSize(pageSize)
  }, [pageSize])

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        dispatch(setSearchQuery(localQuery))
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [localQuery, isOpen, dispatch])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <>
      {/* Backdrop */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.600"
        backdropFilter="blur(4px)"
        zIndex={1500}
        onClick={onClose}
      />

      {/* Overlay Content */}
      <Box
        position="fixed"
        top="20vh"
        left="50%"
        transform="translateX(-50%)"
        width="90%"
        maxWidth="600px"
        zIndex={1501}
        onClick={(e) => e.stopPropagation()}
      >
        <Box
          bg="bg.panel"
          borderRadius="lg"
          boxShadow="2xl"
          borderWidth="1px"
          borderColor="border"
          padding={6}
        >
          <VStack gap={4} align="stretch">
            <HStack>
              <LuSearch size={24} />
              <Text fontSize="xl" fontWeight="bold">
                Search Desktop
              </Text>
              <Box flex={1} />
              {mounted && (
                <Button
                  onClick={toggleTheme}
                  size="sm"
                  variant="ghost"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <LuSun size={18} /> : <LuMoon size={18} />}
                </Button>
              )}
            </HStack>

            <Box>
              <Text fontSize="sm" fontWeight="medium" marginBottom={2}>
                Search Query
              </Text>
              <Input
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Type to search..."
                size="lg"
                autoFocus
              />
              <HStack marginTop={2} fontSize="xs" color="fg.muted">
                <Kbd>⌘K</Kbd>
                <Text>to open</Text>
                <Kbd>ESC</Kbd>
                <Text>to close</Text>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" marginBottom={2}>
                Results Limit
              </Text>
              <Input
                type="number"
                value={localPageSize}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setLocalPageSize(val)
                  dispatch(setPageSize(val))
                }}
                size="md"
                width="150px"
              />
            </Box>

            {hasActiveFilters && (
              <>
                <Separator />
                <Box>
                  <Text fontSize="sm" fontWeight="medium" marginBottom={2}>
                    Active Filters
                  </Text>
                  <VStack gap={2} align="stretch">
                    {Object.entries(filters).map(([instanceId, instanceFilters]) =>
                      instanceFilters
                        .filter(f => f.enabled && f.filterType === 'bounds')
                        .map((filter, idx) => (
                          <HStack
                            key={`${instanceId}-${idx}`}
                            padding={2}
                            bg="bg.muted"
                            borderRadius="md"
                            fontSize="xs"
                            justify="space-between"
                          >
                            <HStack gap={2}>
                              <LuMapPin size={14} />
                              <Text>
                                Map Bounds: {filter.value.minLat.toFixed(3)}, {filter.value.minLng.toFixed(3)} 
                                {' → '} 
                                {filter.value.maxLat.toFixed(3)}, {filter.value.maxLng.toFixed(3)}
                              </Text>
                              <Badge size="sm" colorScheme="blue">
                                {instanceId.substring(0, 8)}
                              </Badge>
                            </HStack>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() =>
                                dispatch(removeFilter({ instanceId, filterType: 'bounds' }))
                              }
                              aria-label="Remove filter"
                            >
                              <LuX size={14} />
                            </Button>
                          </HStack>
                        ))
                    )}
                  </VStack>
                </Box>
              </>
            )}
          </VStack>
        </Box>
      </Box>
    </>
  )
}

