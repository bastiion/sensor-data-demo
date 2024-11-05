import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react"
import { SearchIcon } from "@chakra-ui/icons"

interface SearchProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

export const Search = ({ 
  placeholder = "Search...", 
  value, 
  onChange 
}: SearchProps) => {
  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <SearchIcon color="gray.400" />
      </InputLeftElement>
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        size="lg"
        variant="filled"
        bg="white"
        _hover={{ bg: "gray.50" }}
        _focus={{ bg: "white", borderColor: "blue.500" }}
        borderRadius="full"
        boxShadow="sm"
      />
    </InputGroup>
  )
}
