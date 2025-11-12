import { ImageListItem } from "@/image-list-item"
import { Virtuoso } from 'react-virtuoso'

import { CustomListItem } from "@/components/ui/list-item"
import { List } from "@chakra-ui/react";

interface LargeListProps {
  items: ImageListItem[]
}

export const LargeList = ({ items }: LargeListProps) => {
  // Items are already filtered by Redux selectors
  return <List.Root>
    <Virtuoso
      style={{ height: '800px' }}
      data={items}
      itemContent={(_index, item) => <CustomListItem key={item.id} {...item} />}
    />
  </List.Root>
}
