import { useLightboxStore } from '@/store/useLightBoxStore'
import { Box, Image, Text, ListItem } from '@chakra-ui/react'

interface ListItemProps {
  id: string
  index: number
  image?: string
  title: string
  description?: string
}

export const CustomListItem = ({ id, index, image, title, description }: ListItemProps) => {
  const { open, setIndex } = useLightboxStore()
  const handleClick = () => {
    setIndex(index)
    open()
  }
  return (
    <ListItem display="flex" alignItems="center"  margin="4px">
      {image ? <Image src={`${image}?q=50&w=100`} alt="item image" boxSize="100px" className='clickable' onClick={handleClick} /> : <Box>{index}</Box> }
      <Box ml="4">
        <Text fontSize="lg" fontWeight="bold">
          {title}
        </Text>
        {description && <Text fontSize="sm">{description}</Text>}
        <Text fontSize="sm">
          <a href={id} target="_blank" rel="noopener noreferrer">
            {id.split("#").pop()}
          </a>
        </Text>
      </Box>
    </ListItem>
  )
}

