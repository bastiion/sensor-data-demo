import { useState, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { LuSearch } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { SearchOverlay } from './SearchOverlay'

export const SearchFAB = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <Box
        position="fixed"
        bottom={6}
        right={6}
        zIndex={1000}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          variant="solid"
          bg="blue.500"
          color="white"
          borderRadius="full"
          width="60px"
          height="60px"
          boxShadow="lg"
          _hover={{ transform: 'scale(1.1)', bg: 'blue.600' }}
          _active={{ bg: 'blue.700' }}
          transition="transform 0.2s"
        >
          <LuSearch size={24} />
        </Button>
      </Box>
      <SearchOverlay isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

