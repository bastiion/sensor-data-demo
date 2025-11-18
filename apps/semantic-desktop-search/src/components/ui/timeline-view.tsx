import { useEffect, useRef, useMemo, useState } from 'react'
import { Timeline as VisTimeline } from 'vis-timeline/standalone'
import { DataSet } from 'vis-data/standalone'
import 'vis-timeline/styles/vis-timeline-graph2d.css'
import { Box, Button, Group } from '@chakra-ui/react'
import { ImageListItem } from '@/image-list-item'
import { useAppDispatch } from '@/store/hooks'
import { openLightbox } from '@/store/slices/lightboxSlice'
import { setFilter } from '@/store/slices/filterSlice'

interface TimelineViewProps {
  items: ImageListItem[]
  instanceId: string
  filterEnabled: boolean
}

interface TimelineItem {
  id: string
  content: string
  start: Date
  type: 'box'
  title?: string
  className?: string
}

export const TimelineViewComponent = ({ items, instanceId, filterEnabled }: TimelineViewProps) => {
  const dispatch = useAppDispatch()
  const timelineContainer = useRef<HTMLDivElement>(null)
  const timeline = useRef<VisTimeline | null>(null)
  const filterEnabledRef = useRef(filterEnabled)
  const instanceIdRef = useRef(instanceId)
  const [clusteringEnabled, setClusteringEnabled] = useState(true)
  
  // Store the current window range when filtering is enabled
  const savedRangeRef = useRef<{ start: Date; end: Date } | null>(null)
  
  // Update refs when props change
  useEffect(() => {
    filterEnabledRef.current = filterEnabled
    instanceIdRef.current = instanceId
  }, [filterEnabled, instanceId])
  
  // Create a lookup map for items by id
  const itemsById = useMemo(() => {
    const map = new Map<string, ImageListItem>()
    items.forEach(item => map.set(item.id, item))
    return map
  }, [items])

  // Transform ImageListItems to Timeline items
  const timelineItems = useMemo<TimelineItem[]>(() => {
    return items
      .filter(item => item.date) // Only include items with dates
      .map(item => ({
        id: item.id,
        content: item.title, // Simple content for clustering
        start: item.date!,
        type: 'box' as const,
        title: item.title, // Tooltip shows only the title
        className: 'timeline-item'
      }))
  }, [items])

  useEffect(() => {
    if (timelineContainer.current && !timeline.current) {
      // Create a DataSet for items
      const dataSet = new DataSet(timelineItems)
      
      // Template function for rendering items and clusters
      const templateFunction = (_itemData: any, _element: any, data: any) => {
        if (data.isCluster) {
          // Cluster template
          return `
            <div style="padding: 6px 12px; min-width: 120px;">
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">
                📦 Cluster
              </div>
              <div style="font-size: 12px; opacity: 0.9;">
                ${data.items?.length || 0} items
              </div>
            </div>
          `
        } else {
          // Regular item template
          const item = itemsById.get(data.id)
          if (!item) return data.content
          
          return `
            <div class="timeline-item-content" data-item-id="${item.id}" style="display: flex; align-items: center; gap: 8px; padding: 4px; cursor: pointer;">
              ${item.image ? `<img src="${item.image}?w=50&h=50" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; pointer-events: none;" />` : ''}
              <div style="flex: 1; min-width: 0; pointer-events: none;">
                <div style="font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</div>
              </div>
            </div>
          `
        }
      }

      // Configuration options
      const options = {
        width: '100%',
        height: '100%',
        stack: true,
        showCurrentTime: true,
        zoomable: true,
        moveable: true,
        verticalScroll: true,
        horizontalScroll: false,
        zoomKey: 'ctrlKey' as const,
        orientation: 'top' as const,
        margin: {
          item: {
            horizontal: 10,
            vertical: 10
          }
        },
        format: {
          minorLabels: {
            minute: 'HH:mm',
            hour: 'HH:mm',
            weekday: 'ddd D',
            day: 'D',
            week: 'w',
            month: 'MMM',
            year: 'YYYY'
          },
          majorLabels: {
            minute: 'ddd D MMMM',
            hour: 'ddd D MMMM',
            weekday: 'MMMM YYYY',
            day: 'MMMM YYYY',
            week: 'MMMM YYYY',
            month: 'YYYY',
            year: ''
          }
        },
        template: templateFunction,
        cluster: clusteringEnabled ? {
          titleTemplate: 'Cluster containing {count} items. Zoom in to see individual items.',
          showStipes: true,
          maxItems: 10,
          clusterCriteria: (_firstItem: any, _secondItem: any) => {
            // Cluster items that are close in time
            return true
          }
        } : undefined
      }
      
      // Create the Timeline
      timeline.current = new VisTimeline(timelineContainer.current, dataSet, options)
      
      // Add click handler for items
      timeline.current.on('click', (properties) => {
        if (properties.item) {
          const item = itemsById.get(properties.item)
          if (item && item.image) {
            dispatch(openLightbox({ fileInstanceUri: item.fileInstanceUri }))
          }
        }
      })
      
      // Add range change handler for filtering
      timeline.current.on('rangechanged', (properties) => {
        // Always save the current range when it changes
        savedRangeRef.current = {
          start: new Date(properties.start),
          end: new Date(properties.end)
        }
        
        if (!filterEnabledRef.current) return
        if (!properties.byUser) return // Only react to user interactions
        
        const startDate = new Date(properties.start)
        const endDate = new Date(properties.end)
        
        dispatch(setFilter({
          instanceId: instanceIdRef.current,
          filterType: 'dateRange',
          value: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        }))
      })
      
      // Fit to show all items on initial load only
      // (don't fit if filtering is enabled, as user controls the view)
      if (timelineItems.length > 0 && !filterEnabled) {
        setTimeout(() => {
          timeline.current?.fit()
        }, 100)
      }
    }
    
    return () => {
      if (timeline.current) {
        timeline.current.destroy()
        timeline.current = null
      }
    }
  }, [timelineItems, itemsById, dispatch])
  
  // Update items when they change
  useEffect(() => {
    if (timeline.current) {
      const dataSet = new DataSet(timelineItems)
      timeline.current.setItems(dataSet)
      
      if (timelineItems.length > 0) {
        setTimeout(() => {
          if (!timeline.current) return
          
          if (filterEnabled && savedRangeRef.current) {
            // When filtering is enabled, restore the saved range
            timeline.current.setWindow(
              savedRangeRef.current.start,
              savedRangeRef.current.end,
              { animation: false }
            )
          } else {
            // When filtering is disabled, auto-fit to show all items
            timeline.current.fit()
          }
        }, 100)
      }
    }
  }, [timelineItems, filterEnabled])

  // Update clustering when state changes
  useEffect(() => {
    if (timeline.current) {
      const clusterOptions = clusteringEnabled ? {
        titleTemplate: 'Cluster containing {count} items. Zoom in to see individual items.',
        showStipes: true,
        maxItems: 10,
        clusterCriteria: (_firstItem: any, _secondItem: any) => {
          return true
        }
      } : undefined

      timeline.current.setOptions({
        cluster: clusterOptions
      })
    }
  }, [clusteringEnabled])

  return (
    <>
      <style>{`
        .timeline-container .vis-timeline {
          border: none;
          font-family: inherit;
        }
        .timeline-container .vis-item {
          border-radius: 6px;
          border-width: 2px;
          background-color: var(--chakra-colors-bg-panel);
          border-color: var(--chakra-colors-border);
          color: var(--chakra-colors-fg);
        }
        .timeline-container .vis-item.vis-selected {
          border-color: var(--chakra-colors-accent);
          background-color: var(--chakra-colors-accent-muted);
        }
        .timeline-container .vis-item.vis-cluster {
          background-color: var(--chakra-colors-blue-100);
          border-color: var(--chakra-colors-blue-500);
        }
        .timeline-container .vis-time-axis {
          background-color: var(--chakra-colors-bg);
        }
        .timeline-container .vis-time-axis .vis-text {
          color: var(--chakra-colors-fg);
        }
        .timeline-container .vis-time-axis .vis-grid {
          border-color: var(--chakra-colors-border-subtle);
        }
        .timeline-container .vis-time-axis .vis-grid.vis-minor {
          border-color: var(--chakra-colors-border-subtle);
        }
        .timeline-container .vis-time-axis .vis-grid.vis-major {
          border-color: var(--chakra-colors-border);
        }
        .timeline-container .vis-panel {
          background-color: var(--chakra-colors-bg);
        }
        .timeline-container .vis-labelset {
          background-color: var(--chakra-colors-bg-panel);
        }
        .timeline-container .vis-current-time {
          background-color: var(--chakra-colors-red-500);
          width: 2px;
        }
      `}</style>
      <Box position="relative" height="100%" width="100%">
        <Group attached position="absolute" top={2} left={2} zIndex={1000}>
          <Button 
            onClick={() => setClusteringEnabled(!clusteringEnabled)} 
            size="sm"
            bg={clusteringEnabled ? "blue.500" : "bg.panel"}
            color={clusteringEnabled ? "white" : "fg"}
            _hover={clusteringEnabled ? { bg: "blue.600" } : { bg: "bg.muted" }}
            title={clusteringEnabled ? "Clustering enabled" : "Clustering disabled"}
          >
            📦 {clusteringEnabled ? "✓" : "✗"}
          </Button>
          <Button 
            onClick={() => timeline.current?.fit()} 
            size="sm"
            bg="bg.panel"
            color="fg"
            _hover={{ bg: "bg.muted" }}
            title="Fit all items"
          >
            Fit
          </Button>
        </Group>
        <Box 
          className="timeline-container"
          height="100%" 
          width="100%" 
          ref={timelineContainer}
        />
      </Box>
    </>
  )
}

