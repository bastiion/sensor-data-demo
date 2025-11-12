import { HStack, Input, Kbd } from "@chakra-ui/react"
import { InputGroup } from "@/components/ui/input-group"
import { LuSearch } from "react-icons/lu"
import { useSearchStore } from "@/store/useSearchStore"
import { useCallback, useEffect, useState } from "react"
import debounce from "lodash/debounce"

interface SearchProps {
  placeholder?: string
}

export const Search = ({
  placeholder = "Search..."
}: SearchProps) => {
  const { searchQuery, setSearchQuery, pageSize, setPageSize } = useSearchStore()
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  const onSearchChange = useCallback(debounce((value: string) => {
    setSearchQuery(value)
  }, 300), [setSearchQuery])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value)
    onSearchChange(e.target.value)
  }

  return (
    <HStack justify="center" width="full">
      <InputGroup
        width="60%"
        startElement={<LuSearch size={32} />}
        endElement={
          <Kbd fontSize="xl">⌘K</Kbd>
        }
      >
        <Input
          size="2xl"
          placeholder={placeholder}
          value={localSearchQuery}
          onChange={handleSearchChange}
          fontSize="2xl"
        />
      </InputGroup>
      <Input
        width="120px"
        size="2xl"
        type="number"
        value={pageSize}
        onChange={(e) => setPageSize(Number(e.target.value))}
        placeholder="Size"
        fontSize="xl"
        opacity="0.5"
        _hover={{ opacity: 1 }}
        transition="opacity 0.2s"
      />
    </HStack>
  )
}
