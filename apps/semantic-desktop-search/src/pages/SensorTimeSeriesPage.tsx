import { useEffect, useCallback } from 'react'
import { Box } from '@chakra-ui/react'
import { Mosaic, MosaicWindow, MosaicNode } from 'react-mosaic-component'
import 'react-mosaic-component/react-mosaic-component.css'
import '../mosaic-theme.css'
import { useSensorData } from '@/sensor-data/hooks/useSensorData'
import { SensorMap } from '@/sensor-data/components/SensorMap'
import { SensorTimeChart } from '@/sensor-data/components/SensorTimeChart'
import { FilterPanel } from '@/sensor-data/components/FilterPanel'

type TileId = 'map' | 'chart'

const SensorTimeSeriesPage = () => {
  const { loadData, loaded, loading, error } = useSensorData()

  // Load data on mount
  useEffect(() => {
    if (!loaded && !loading) {
      loadData()
    }
  }, [loadData, loaded, loading])

  // Mosaic layout - Map on left, Chart on right
  const mosaicValue: MosaicNode<TileId> = {
    direction: 'row',
    first: 'map',
    second: 'chart',
    splitPercentage: 50,
  }

  const renderTile = useCallback((tileId: TileId, path: any) => {
    if (tileId === 'map') {
      return (
        <MosaicWindow path={path} title="Sensor Map">
          <SensorMap />
        </MosaicWindow>
      )
    }

    if (tileId === 'chart') {
      return (
        <MosaicWindow path={path} title="Time Series">
          <SensorTimeChart />
        </MosaicWindow>
      )
    }

    return null
  }, [])

  if (error) {
    return (
      <Box height="100vh" width="100vw" display="flex" alignItems="center" justifyContent="center" bg="bg">
        <Box textAlign="center" p={4}>
          <Box fontSize="xl" fontWeight="bold" mb={2} color="red.500">
            Error Loading Data
          </Box>
          <Box color="fg.muted">{error}</Box>
        </Box>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box height="100vh" width="100vw" display="flex" alignItems="center" justifyContent="center" bg="bg">
        <Box textAlign="center" p={4}>
          <Box fontSize="xl" fontWeight="bold" mb={2}>
            Loading Sensor Data...
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box height="100vh" width="100vw" overflow="hidden" bg="bg">
      <FilterPanel />
      <Box height="calc(100vh - 160px)" width="100vw">
        <Mosaic<TileId>
          renderTile={renderTile}
          value={mosaicValue}
          onChange={() => {}}
          className="mosaic-blueprint-theme"
          resize={{ minimumPaneSizePercentage: 20 }}
        />
      </Box>
    </Box>
  )
}

export default SensorTimeSeriesPage

