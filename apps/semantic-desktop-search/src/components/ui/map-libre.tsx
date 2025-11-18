import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Box, Button, Group } from '@chakra-ui/react'
import { ImageListItem } from '@/image-list-item'
import { useAppDispatch } from '@/store/hooks'
import { setFilter } from '@/store/slices/filterSlice'
import { openLightbox } from '@/store/slices/lightboxSlice'
import { debounce } from 'lodash-es'

interface MapLibreProps {
  tags: ImageListItem[]
  instanceId: string
  filterEnabled: boolean
}

type Feature = {
  type: "Feature"
  geometry: {
    type: "Point"
    coordinates: [number, number]
  },
  properties: ImageListItem
}

export const MapLibre = ({ tags, instanceId, filterEnabled }: MapLibreProps) => {
  const dispatch = useAppDispatch()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [autoRedraw, setAutoRedraw] = useState(true)
  
  // Use refs to track current values in event handlers
  const filterEnabledRef = useRef(filterEnabled)
  const instanceIdRef = useRef(instanceId)
  
  // Update refs when props change
  useEffect(() => {
    filterEnabledRef.current = filterEnabled
    instanceIdRef.current = instanceId
  }, [filterEnabled, instanceId])

  // Default map center - could be moved to Redux if needed
  const geoSearchCenter = { lat: 50.986834385099854, lng: 13.550555724194794 }
  
  const features = useMemo<Feature[]>(() => {
    return tags.filter(tag => tag.geo).map(tag => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [tag.geo?.lng || 0, tag.geo?.lat || 0] },
      properties: {
        ...tag,
        // Ensure all properties are strings for MapLibre (it doesn't handle complex objects well)
        fileInstanceUri: tag.fileInstanceUri,
        title: tag.title,
        description: tag.description || '',
        image: tag.image || ''
      }
    }))
  }, [tags])

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://tile-1.kartenforum.slub-dresden.de/styles/maptiler-basic-v2/style.json',
        center: [geoSearchCenter.lng, geoSearchCenter.lat],
        zoom: 7
      })
      map.current.on('moveend', () => {
        // Always capture moveend, but only dispatch if filter is enabled
        if (!filterEnabledRef.current) return
        
        const bounds = map.current?.getBounds()
        if (bounds) {
          dispatch(setFilter({ 
            instanceId: instanceIdRef.current, 
            filterType: 'bounds', 
            value: { 
              minLat: bounds.getSouth(), 
              maxLat: bounds.getNorth(), 
              minLng: bounds.getWest(), 
              maxLng: bounds.getEast() 
            } 
          }))
        }
      })
      map.current.on('load', () => {
        setIsLoaded(true)
      })
    }

    // Add event delegation for popup image clicks
    const handlePopupImageClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.classList.contains('map-popup-image')) {
        const fileInstanceUri = target.getAttribute('data-file-instance-uri')
        if (fileInstanceUri) {
          dispatch(openLightbox({ fileInstanceUri }))
          // Close all popups
          const popups = document.getElementsByClassName('maplibregl-popup')
          Array.from(popups).forEach(popup => popup.remove())
        }
      }
    }

    if (mapContainer.current) {
      mapContainer.current.addEventListener('click', handlePopupImageClick)
    }

    // Add resize observer to handle window size changes
    const resizeObserver = new ResizeObserver(() => {
      if (map.current) {
        map.current.resize()
      }
    })

    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current)
    }

    const currentContainer = mapContainer.current

    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener('click', handlePopupImageClick)
      }
      resizeObserver.disconnect()
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [dispatch])

  const redrawLayers = useCallback(() => {

    if (!map.current || !isLoaded) return

    map.current.setGlyphs('https://tileserver.geomatico.es/fonts/{fontstack}/{range}.pbf');
    // Add clustered source from features
    map.current.addSource('locations', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: features
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Add clusters layer
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'locations',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          10,
          '#f1f075',
          30,
          '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          10,
          30,
          30,
          40
        ]
      }
    });

    // Add cluster count labels
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'locations', 
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Arial Unicode MS Bold'],
        'text-size': 12
      }
    });

    // Add unclustered points
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'locations',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#11b4da',
        'circle-radius': 6,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    });

    // Handle cluster click
    map.current.on('click', 'clusters', async (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      if (!features[0]?.properties) return
      const clusterId = features[0].properties.cluster_id;
      const source = map.current!.getSource('locations') as maplibregl.GeoJSONSource;
      const zoom = await source.getClusterExpansionZoom(clusterId);
      map.current!.easeTo({
        center: (features[0].geometry as any).coordinates,
        zoom: zoom
      });
    });

    // Handle point click
    map.current.on('click', 'unclustered-point', (e) => {
      if (!e.features || !e.features[0]) return
      const coordinates = (e.features![0].geometry as any).coordinates.slice();
      const properties = e.features![0].properties;

      new maplibregl.Popup()
        .setLngLat(coordinates)
        .setHTML(
          `<div style="background: #222; color: white; padding: 12px; border-radius: 4px; max-width: 300px;">
            ${properties.image ? `<img src="${properties.image}?w=300" class="map-popup-image" data-file-instance-uri="${properties.fileInstanceUri}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 8px; cursor: pointer;">` : ''}
            <strong>${properties.title}</strong>
            ${properties.description ? `<br>${properties.description}` : ''}
          </div>`
        )
        .addTo(map.current!);
    });
  

    // Change cursor on hover
    map.current.on('mouseenter', 'clusters', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'clusters', () => {
      map.current!.getCanvas().style.cursor = '';
    });
    
    map.current.on('mouseenter', 'unclustered-point', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'unclustered-point', () => {
      map.current!.getCanvas().style.cursor = '';
    });
    
      
  }, [features, isLoaded, dispatch])

  const removeLayers = useCallback(() => {
    if (map.current) {
      if (map.current.getLayer('clusters')) map.current.removeLayer('clusters');
      if (map.current.getLayer('cluster-count')) map.current.removeLayer('cluster-count');
      if (map.current.getLayer('unclustered-point')) map.current.removeLayer('unclustered-point');
      if (map.current.getSource('locations')) map.current.removeSource('locations');
    }
  }, [])

  // Manual redraw function
  const handleManualRedraw = useCallback(() => {
    removeLayers()
    redrawLayers()
  }, [removeLayers, redrawLayers])

  // Debounced auto-redraw function
  const debouncedAutoRedraw = useMemo(
    () => debounce(() => {
      if (map.current && isLoaded && autoRedraw) {
        removeLayers()
        redrawLayers()
      }
    }, 500), // 500ms debounce delay
    [removeLayers, redrawLayers, isLoaded, autoRedraw]
  )

  // Auto-redraw when features change (if enabled)
  useEffect(() => {
    if (autoRedraw && isLoaded) {
      debouncedAutoRedraw()
    }
    
    // Cleanup debounce on unmount
    return () => {
      debouncedAutoRedraw.cancel()
    }
  }, [features, autoRedraw, isLoaded, debouncedAutoRedraw])

  useEffect(() => {
    return () => {
      removeLayers()
      }
    }, [removeLayers])

  return (
    <Box position="relative" height="100%" width="100%" display="flex" flexDirection="column">
      <Group attached position="absolute" top={2} left={2} zIndex={1000}>
        <Button 
          onClick={() => setAutoRedraw(!autoRedraw)} 
          size="sm"
          bg={autoRedraw ? "blue.500" : "bg.panel"}
          color={autoRedraw ? "white" : "fg"}
          _hover={autoRedraw ? { bg: "blue.600" } : { bg: "bg.muted" }}
          title={autoRedraw ? "Auto-redraw enabled" : "Auto-redraw disabled"}
        >
          Auto {autoRedraw ? "✓" : "✗"}
        </Button>
        {!autoRedraw && (
          <Button 
            onClick={handleManualRedraw} 
            size="sm"
            bg="bg.panel"
            color="fg"
            _hover={{ bg: "bg.muted" }}
          >
            Redraw
          </Button>
        )}
        <Button 
          onClick={() => map.current?.zoomTo(map.current.getZoom() + 1)} 
          size="sm"
          bg="bg.panel"
          color="fg"
          _hover={{ bg: "bg.muted" }}
        >
          Zoom In
        </Button>
        <Button 
          onClick={() => map.current?.zoomTo(map.current.getZoom() - 1)} 
          size="sm"
          bg="bg.panel"
          color="fg"
          _hover={{ bg: "bg.muted" }}
        >
          Zoom Out
        </Button>
      </Group>
      <Box ref={mapContainer} width="100%" height="100%" flex="1" />
    </Box>
  )
}

