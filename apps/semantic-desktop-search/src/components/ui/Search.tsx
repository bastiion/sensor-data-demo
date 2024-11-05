import { HStack, Input, Kbd } from "@chakra-ui/react"
import { InputGroup } from "@/components/ui/input-group"
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select"
import { LuSearch } from "react-icons/lu"
import { useSearchStore } from "@/store/useSearchStore"

const DomainSelect = () => (
  <NativeSelectRoot size="xs" variant="plain" width="auto" me="-1">
    <NativeSelectField defaultValue=".com" fontSize="sm">
      <option value=".com">.com</option>
      <option value=".org">.org</option>
      <option value=".net">.net</option>
    </NativeSelectField>
  </NativeSelectRoot>
)

interface SearchProps {
  placeholder?: string
}

export const Search = ({ 
  placeholder = "Search..." 
}: SearchProps) => {
  const { searchQuery, setSearchQuery } = useSearchStore()

  return (
    <HStack gap="10" width="full">
      <InputGroup
        flex="1"
        startElement={<LuSearch />}
        endElement={<Kbd>⌘K</Kbd>}
      >
        <Input placeholder={placeholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </InputGroup>

      <InputGroup
        flex="1"
        startElement="https://"
        endElement={<DomainSelect />}
      >
        <Input ps="4.75em" pe="0" placeholder="yoursite.com" />
      </InputGroup>
    </HStack>
  )
}
