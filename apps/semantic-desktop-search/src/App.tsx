import { useState, useEffect } from 'react'
import { Box, VStack } from '@chakra-ui/react'
import { Search } from '@/components/ui/Search'
import { useSearchStore } from '@/store/useSearchStore'
import './App.css'

function App() {
  const { searchQuery } = useSearchStore()
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    setIsSearching(searchQuery.length > 3)
  }, [searchQuery])

  return (
    <Box minHeight="100vh" display="flex" alignItems={isSearching ? "flex-start" : "center"} justifyContent="center" padding={4}>
      <VStack width="100%" maxWidth="600px" transition="all 0.3s">
        <Box width="100%" marginTop={isSearching ? "20px" : "0"}>
          <Search placeholder="Search your desktop..." />
        </Box>
        {isSearching && (
          <Box width="100%">
            {/* Add your search results component here */}
            <p>Search results will appear here</p>
          </Box>
        )}
      </VStack>
    </Box>
  )
}

export default App
