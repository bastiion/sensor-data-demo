import { ImageListItem } from "@/image-list-item"
import { Virtuoso } from 'react-virtuoso'

import { CustomListItem } from "@/components/ui/list-item"
import { List } from "@chakra-ui/react";
import { useFilterStore } from "@/store/useFilter";
import { boundsGeoFilter } from "@/lib/boundsGeoFilter";
import { useMemo } from "react";

interface LargeListProps {
  items: ImageListItem[]
}

export const LargeList = ({ items }: LargeListProps) => {
  const { boundsGeoFilterOptions } = useFilterStore()
  const filteredItems = useMemo(() => boundsGeoFilterOptions ? items.filter(boundsGeoFilter(boundsGeoFilterOptions)) : items, [items, boundsGeoFilterOptions]) 
  return <List.Root>
    <Virtuoso
      style={{ height: '800px' }}
      data={filteredItems}
      itemContent={(index, item) => <CustomListItem key={item.id} index={index} {...item} />}
    />
  </List.Root>
}
