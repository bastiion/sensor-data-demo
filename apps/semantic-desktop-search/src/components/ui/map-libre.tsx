import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Box, Button, Group } from '@chakra-ui/react'
import { ImageListItem } from '@/image-list-item'
import { useSearchStore } from '@/store/useSearchStore'
import { useFilterStore } from '@/store/useFilter'

interface MapLibreProps {
  tags: ImageListItem[]
}

type Feature = {
  type: "Feature"
  geometry: {
    type: "Point"
    coordinates: [number, number]
  },
  properties: ImageListItem
}

export const MapLibre = ({ tags }: MapLibreProps) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const { geoSearchCenter, setGeoSearchCenter } = useSearchStore()
  const { setBoundsGeoFilter, clearBoundsGeoFilter } = useFilterStore()
  const features = useMemo<Feature[]>(() => {
    return tags.filter(tag => tag.geo).map(tag => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [tag.geo?.lng || 0, tag.geo?.lat || 0] },
      properties: tag
    }))
  }, [tags])

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          "version": 8,
          "sources": {
            "osm": {
              "type": "raster",
              "tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
              "tileSize": 256,
              "attribution": "&copy; OpenStreetMap Contributors",
              "maxzoom": 19
            }
          },
          "layers": [
            {
              "id": "osm",
              "type": "raster",
              "source": "osm"
            }
          ]
        },
        center: [geoSearchCenter.lng, geoSearchCenter.lat],
        zoom: 7
      })
      map.current.on('moveend', () => {
        const bounds = map.current?.getBounds()
        const center = bounds?.getCenter()
        if (center && bounds) {
          setGeoSearchCenter({ lat: center.lat, lng: center.lng })
          setBoundsGeoFilter({ bounds: { minLat: bounds.getSouth(), maxLat: bounds.getNorth(), minLng: bounds.getWest(), maxLng: bounds.getEast() } })
        }
      })
      map.current.on('load', () => {
        setIsLoaded(true)
      })
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

    return () => {
      resizeObserver.disconnect()
      if (map.current) {
        map.current.remove()
        map.current = null
        clearBoundsGeoFilter()
      }
    }
  }, [])

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
            ${properties.image ? `<img src="${properties.image}?w=300" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">` : ''}
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
    
      
  }, [features, isLoaded])

  const removeLayers = useCallback(() => {
    if (map.current) {
      if (map.current.getLayer('clusters')) map.current.removeLayer('clusters');
      if (map.current.getLayer('cluster-count')) map.current.removeLayer('cluster-count');
      if (map.current.getLayer('unclustered-point')) map.current.removeLayer('unclustered-point');
      if (map.current.getSource('locations')) map.current.removeSource('locations');
    }
  }, [])

  useEffect(() => {
    return () => {
      removeLayers()
      }
    }, [])

  return (
    <Box position="relative" height="100%" width="100%" display="flex" flexDirection="column">
      <Group attached position="absolute" top={2} left={2} zIndex={1000}>
        <Button onClick={() => {
           removeLayers()
           redrawLayers()
        }} size="sm">Redraw Map</Button>
        <Button onClick={() => map.current?.zoomTo(map.current.getZoom() + 1)} size="sm">Zoom In</Button>
        <Button onClick={() => map.current?.zoomTo(map.current.getZoom() - 1)} size="sm">Zoom Out</Button>
      </Group>
      <Box ref={mapContainer} width="100%" height="100%" flex="1" />
    </Box>
  )
}

