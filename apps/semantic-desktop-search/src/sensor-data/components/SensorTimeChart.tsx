import { useMemo } from 'react'
import { Box, Text } from '@chakra-ui/react'
import { scaleTime, scaleLinear } from '@visx/scale'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { GridRows, GridColumns } from '@visx/grid'
import { Group as VisxGroup } from '@visx/group'
import { LinePath } from '@visx/shape'
import { curveMonotoneX } from '@visx/curve'
import { ParentSize } from '@visx/responsive'
import { useSensorData } from '../hooks/useSensorData'

interface DataPoint {
  date: Date
  value: number
  count: number
}

// Aggregate sensor data by time
const aggregateData = (features: any[]): DataPoint[] => {
  const timeMap = new Map<string, { sum: number; count: number }>()

  features.forEach((feature) => {
    if (feature.properties.v === null) return

    const time = new Date(feature.properties.time)
    const timeKey = time.toISOString()

    const existing = timeMap.get(timeKey) || { sum: 0, count: 0 }
    timeMap.set(timeKey, {
      sum: existing.sum + feature.properties.v,
      count: existing.count + 1,
    })
  })

  return Array.from(timeMap.entries())
    .map(([timeKey, { sum, count }]) => ({
      date: new Date(timeKey),
      value: sum / count, // Average value
      count,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

interface ChartProps {
  width: number
  height: number
  data: DataPoint[]
}

const Chart = ({ width, height, data }: ChartProps) => {
  const margin = { top: 20, right: 30, bottom: 60, left: 60 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Scales
  const xScale = useMemo(
    () =>
      scaleTime({
        domain: [
          Math.min(...data.map((d) => d.date.getTime())),
          Math.max(...data.map((d) => d.date.getTime())),
        ],
        range: [0, innerWidth],
      }),
    [data, innerWidth]
  )

  const yScale = useMemo(() => {
    const values = data.map((d) => d.value)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const padding = (maxValue - minValue) * 0.1

    return scaleLinear({
      domain: [minValue - padding, maxValue + padding],
      range: [innerHeight, 0],
      nice: true,
    })
  }, [data, innerHeight])

  if (data.length === 0) {
    return null
  }

  return (
    <svg width={width} height={height}>
      <VisxGroup left={margin.left} top={margin.top}>
        {/* Grid */}
        <GridRows
          scale={yScale}
          width={innerWidth}
          stroke="var(--chakra-colors-border-subtle)"
          strokeOpacity={0.3}
        />
        <GridColumns
          scale={xScale}
          height={innerHeight}
          stroke="var(--chakra-colors-border-subtle)"
          strokeOpacity={0.3}
        />

        {/* Line Chart */}
        <LinePath
          data={data}
          x={(d: DataPoint) => xScale(d.date) ?? 0}
          y={(d: DataPoint) => yScale(d.value) ?? 0}
          stroke="var(--chakra-colors-blue-500)"
          strokeWidth={2}
          curve={curveMonotoneX}
        />

        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={xScale(d.date)}
            cy={yScale(d.value)}
            r={3}
            fill="var(--chakra-colors-blue-500)"
          />
        ))}

        {/* Axes */}
        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke="var(--chakra-colors-border)"
          tickStroke="var(--chakra-colors-border)"
          tickLabelProps={() => ({
            fill: 'var(--chakra-colors-fg)',
            fontSize: 11,
            textAnchor: 'middle',
          })}
          numTicks={6}
        />
        <AxisLeft
          scale={yScale}
          stroke="var(--chakra-colors-border)"
          tickStroke="var(--chakra-colors-border)"
          tickLabelProps={() => ({
            fill: 'var(--chakra-colors-fg)',
            fontSize: 11,
            textAnchor: 'end',
            dx: -4,
          })}
          label="Temperature (°C)"
          labelProps={{
            fill: 'var(--chakra-colors-fg)',
            fontSize: 12,
            textAnchor: 'middle',
          }}
        />
      </VisxGroup>

      {/* Gradient for potential future use */}
      <defs>
        <linearGradient id="area-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--chakra-colors-blue-500)" stopOpacity={0.3} />
          <stop offset="100%" stopColor="var(--chakra-colors-blue-500)" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const SensorTimeChart = () => {
  const { filteredData } = useSensorData()

  const data = useMemo(() => aggregateData(filteredData), [filteredData])

  if (filteredData.length === 0) {
    return (
      <Box
        height="100%"
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="bg"
      >
        <Text color="fg.muted">No data to display</Text>
      </Box>
    )
  }

  return (
    <Box height="100%" width="100%" bg="bg" padding={4}>
      <Box mb={2}>
        <Text fontSize="lg" fontWeight="semibold">
          Temperature Time Series
        </Text>
        <Text fontSize="sm" color="fg.muted">
          {filteredData.length} sensor readings
        </Text>
      </Box>
      <Box height="calc(100% - 50px)" width="100%">
        <ParentSize>
          {({ width, height }) => <Chart width={width} height={height} data={data} />}
        </ParentSize>
      </Box>
    </Box>
  )
}

