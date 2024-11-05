import { Input, InputGroup, InputLeftElement, Box } from "@chakra-ui/react"
import { SearchIcon } from "@chakra-ui/icons"
import { useSearchStore } from "../../store/useSearchStore"

interface SearchProps {
  placeholder?: string
}

export const Search = ({ 
  placeholder = "Search..." 
}: SearchProps) => {
  const { searchQuery, setSearchQuery } = useSearchStore()
  const isSearching = searchQuery.length > 3

  return (
    <Box width="100%" transition="all 0.3s">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          size={isSearching ? "md" : "lg"}
          variant="filled"
          bg="white"
          _hover={{ bg: "gray.50" }}
          _focus={{ bg: "white", borderColor: "blue.500" }}
          borderRadius="full"
          boxShadow="sm"
        />
      </InputGroup>
    </Box>
  )
}
