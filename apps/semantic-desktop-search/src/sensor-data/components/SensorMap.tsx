import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Box } from '@chakra-ui/react'
import { useSensorData } from '../hooks/useSensorData'

export const SensorMap = () => {
  const { filteredData, setGeoBounds } = useSensorData()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Default map center - Dresden
  const defaultCenter = { lat: 51.05, lng: 13.74 }

  // Convert sensor features to GeoJSON
  const geojson = {
    type: 'FeatureCollection' as const,
    features: filteredData.map(feature => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: feature.geometry.coordinates,
      },
      properties: {
        id: feature.properties.id,
        name: feature.properties.name,
        value: feature.properties.v,
        time: feature.properties.time,
        uom: feature.properties.uom,
      },
    })),
  }

  // Initialize map
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://tile-1.kartenforum.slub-dresden.de/styles/maptiler-basic-v2/style.json',
        center: [defaultCenter.lng, defaultCenter.lat],
        zoom: 10,
      })

      // Update bounds on map movement
      map.current.on('moveend', () => {
        if (!map.current) return
        
        const bounds = map.current.getBounds()
        setGeoBounds({
          minLat: bounds.getSouth(),
          maxLat: bounds.getNorth(),
          minLng: bounds.getWest(),
          maxLng: bounds.getEast(),
        })
      })

      map.current.on('load', () => {
        setIsLoaded(true)
      })
    }

    // Handle resize
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
    }
  }, [setGeoBounds])

  // Update map data when filteredData changes
  useEffect(() => {
    if (!map.current || !isLoaded) return

    const mapInstance = map.current

    // Remove existing source and layers if they exist
    if (mapInstance.getLayer('sensors-layer')) {
      mapInstance.removeLayer('sensors-layer')
    }
    if (mapInstance.getLayer('sensors-cluster-count')) {
      mapInstance.removeLayer('sensors-cluster-count')
    }
    if (mapInstance.getLayer('sensors-clusters')) {
      mapInstance.removeLayer('sensors-clusters')
    }
    if (mapInstance.getSource('sensors')) {
      mapInstance.removeSource('sensors')
    }

    // Add new source
    mapInstance.addSource('sensors', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    })

    // Add cluster layer
    mapInstance.addLayer({
      id: 'sensors-clusters',
      type: 'circle',
      source: 'sensors',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          10,
          '#f1f075',
          30,
          '#f28cb1',
        ],
        'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
      },
    })

    // Add cluster count layer
    mapInstance.addLayer({
      id: 'sensors-cluster-count',
      type: 'symbol',
      source: 'sensors',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Open Sans Regular'],
        'text-size': 12,
      },
    })

    // Add unclustered point layer
    mapInstance.addLayer({
      id: 'sensors-layer',
      type: 'circle',
      source: 'sensors',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#3b82f6',
        'circle-radius': 6,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    })

    // Add click event for clusters
    mapInstance.on('click', 'sensors-clusters', (e) => {
      const features = mapInstance.queryRenderedFeatures(e.point, {
        layers: ['sensors-clusters'],
      })
      const clusterId = features[0].properties.cluster_id
      const source = mapInstance.getSource('sensors') as maplibregl.GeoJSONSource
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return

        mapInstance.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom: zoom,
        })
      })
    })

    // Add popup on click
    mapInstance.on('click', 'sensors-layer', (e) => {
      if (!e.features || e.features.length === 0) return

      const feature = e.features[0]
      const coordinates = (feature.geometry as any).coordinates.slice()
      const { name, value, time, uom } = feature.properties

      // Create popup content
      const popupContent = `
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold;">${name || 'Sensor'}</h3>
          <p style="margin: 4px 0;"><strong>Value:</strong> ${value !== null ? `${value} ${uom}` : 'N/A'}</p>
          <p style="margin: 4px 0;"><strong>Time:</strong> ${new Date(time).toLocaleString()}</p>
        </div>
      `

      new maplibregl.Popup()
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(mapInstance)
    })

    // Change cursor on hover
    mapInstance.on('mouseenter', 'sensors-layer', () => {
      mapInstance.getCanvas().style.cursor = 'pointer'
    })
    mapInstance.on('mouseleave', 'sensors-layer', () => {
      mapInstance.getCanvas().style.cursor = ''
    })
    mapInstance.on('mouseenter', 'sensors-clusters', () => {
      mapInstance.getCanvas().style.cursor = 'pointer'
    })
    mapInstance.on('mouseleave', 'sensors-clusters', () => {
      mapInstance.getCanvas().style.cursor = ''
    })
  }, [filteredData, isLoaded])

  return (
    <Box height="100%" width="100%" overflow="hidden" bg="bg">
      <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
    </Box>
  )
}

