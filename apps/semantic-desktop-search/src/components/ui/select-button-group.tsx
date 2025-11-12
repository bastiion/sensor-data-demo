import { ListType } from '@/list-type'
import { Button, Stack, Group } from '@chakra-ui/react'
import { FaList, FaTh, FaMap, FaClock } from 'react-icons/fa'

const ButtonGroup = ({children}: {children: React.ReactNode}) => <Group attached justifyContent="center">{children}</Group>


interface SelectButtonGroupProps {
  selected: ListType[]
  onSelect: (selected: ListType) => void
}

const SelectButtonGroup = ({selected, onSelect: setSelected}: SelectButtonGroupProps) => {
  return (
    <Stack gap="4">
      <ButtonGroup>
        <Button variant={selected.includes(ListType.LIST) ? "solid" : "outline"} onClick={() => setSelected(ListType.LIST)}>List View
          <FaList />
        </Button>
        <Button variant={selected.includes(ListType.GALLERY) ? "solid" : "outline"} onClick={() => setSelected(ListType.GALLERY)} >Gallery View
          <FaTh />
        </Button>
        <Button variant={selected.includes(ListType.MAP) ? "solid" : "outline"} onClick={() => setSelected(ListType.MAP)}   >Map View
          <FaMap />
        </Button>
        <Button variant={selected.includes(ListType.TIMELINE) ? "solid" : "outline"} onClick={() => setSelected(ListType.TIMELINE)} >Timeline View
          <FaClock />
        </Button>
      </ButtonGroup>
    </Stack>
  )
}

export default SelectButtonGroup

