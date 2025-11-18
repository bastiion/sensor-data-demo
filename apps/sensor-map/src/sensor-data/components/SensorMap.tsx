import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Box } from '@chakra-ui/react'
import { useSensorStore } from '../store/useSensorStore'

export const SensorMap = () => {
  const { sensorStations } = useSensorStore()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Default map center - Dresden
  const defaultCenter = { lat: 51.05, lng: 13.74 }

  // Convert sensor stations to GeoJSON (memoized to prevent unnecessary recalculations)
  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: sensorStations
      .filter(station => station.currentReading !== null)
      .map(station => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: station.coordinates,
        },
        properties: {
          id: station.id,
          name: station.name,
          description: station.description,
          network: station.network,
          ...(station.currentReading || {}),
          time: station.currentReading!.time.toISOString(),
        },
      })),
  }), [sensorStations])

  // Initialize map
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://tile-1.kartenforum.slub-dresden.de/styles/maptiler-basic-v2/style.json',
        center: [defaultCenter.lng, defaultCenter.lat],
        zoom: 10,
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
  }, [])

  // Initialize layers and event handlers (runs once when map is loaded)
  useEffect(() => {
    if (!map.current || !isLoaded) return

    const mapInstance = map.current

    // Only set up layers and handlers if they don't exist yet
    if (mapInstance.getSource('sensors')) return

    // Add source with initial empty data (will be updated by the data update effect)
    mapInstance.addSource('sensors', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    })

    // Add circle layer with color based on temperature
    mapInstance.addLayer({
      id: 'sensors-circle',
      type: 'circle',
      source: 'sensors',
      paint: {
        'circle-radius': 20,
        'circle-color': [
          'interpolate',
          ['linear'],
          ['get', 'value'],
          -10, '#0000ff', // cold - blue
          0, '#00ffff',   // cool - cyan
          10, '#00ff00',  // mild - green
          20, '#ffff00',  // warm - yellow
          30, '#ff0000',  // hot - red
        ],
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    })

    // Add text layer showing temperature value
    mapInstance.addLayer({
      id: 'sensors-text',
      type: 'symbol',
      source: 'sensors',
      layout: {
        'text-field': ['concat', ['to-string', ['get', 'value']], '°'],
        'text-font': ['Noto Sans Regular', 'Open Sans Regular'],
        'text-size': 12,
        'text-allow-overlap': true,
      },
      paint: {
        'text-color': '#000000',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5,
      },
    })

    // Add click event for sensors
    mapInstance.on('click', 'sensors-circle', (e) => {
      if (!e.features || e.features.length === 0) return

      const feature = e.features[0]
      if (!feature || !feature.geometry || !feature.properties) return
      
      const coordinates = (feature.geometry as any).coordinates.slice()
      const { name, value, time, uom, hi, lo, network, description } = feature.properties

      // Create popup content
      const popupContent = `
        <div style="padding: 10px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">${name || 'Sensor'}</h3>
          <div style="font-size: 12px;">
            <p style="margin: 4px 0;"><strong>Value:</strong> ${value != null ? `${value} ${uom}` : 'N/A'}</p>
            ${hi != null ? `<p style="margin: 4px 0;"><strong>High:</strong> ${hi} ${uom}</p>` : ''}
            ${lo != null ? `<p style="margin: 4px 0;"><strong>Low:</strong> ${lo} ${uom}</p>` : ''}
            <p style="margin: 4px 0;"><strong>Time:</strong> ${new Date(time).toLocaleString()}</p>
            <p style="margin: 4px 0; color: #666;"><strong>Network:</strong> ${network}</p>
            <p style="margin: 4px 0; color: #666; font-size: 11px;">${description}</p>
          </div>
        </div>
      `

      new maplibregl.Popup()
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(mapInstance)
    })

    // Change cursor on hover
    mapInstance.on('mouseenter', 'sensors-circle', () => {
      mapInstance.getCanvas().style.cursor = 'pointer'
    })
    mapInstance.on('mouseleave', 'sensors-circle', () => {
      mapInstance.getCanvas().style.cursor = ''
    })
  }, [isLoaded])

  // Update map data when sensor stations change (optimized: uses setData instead of remove/add)
  useEffect(() => {
    if (!map.current || !isLoaded) return

    const mapInstance = map.current
    const source = mapInstance.getSource('sensors') as maplibregl.GeoJSONSource | undefined

    if (source) {
      // Update existing source data - much more efficient than removing/re-adding layers!
      source.setData(geojson)
    }
  }, [geojson, isLoaded])

  return (
    <Box height="100%" width="100%" overflow="hidden" bg="bg">
      <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
    </Box>
  )
}
