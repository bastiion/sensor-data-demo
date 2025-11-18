import { useMemo, useState } from 'react'
import { Box, Button, Group, Stack, Text } from '@chakra-ui/react'
import { scaleTime, scaleLinear } from '@visx/scale'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { GridRows, GridColumns } from '@visx/grid'
import { Group as VisxGroup } from '@visx/group'
import { LinePath, AreaClosed } from '@visx/shape'
import { curveMonotoneX } from '@visx/curve'
import { ParentSize } from '@visx/responsive'
import { ImageListItem } from '@/image-list-item'

interface TimeSeriesViewProps {
  items: ImageListItem[]
  instanceId: string
  filterEnabled: boolean
}

interface DataPoint {
  date: Date
  value: number
  count: number
}

// Aggregate items by date/time
const aggregateByTime = (items: ImageListItem[], interval: 'hour' | 'day' | 'week' | 'month'): DataPoint[] => {
  const grouped = new Map<number, { sum: number; count: number }>()
  
  items.forEach(item => {
    if (!item.date) return
    
    let key: number
    const date = new Date(item.date)
    
    switch (interval) {
      case 'hour':
        key = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).getTime()
        break
      case 'day':
        key = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()).getTime()
        break
      case 'month':
        key = new Date(date.getFullYear(), date.getMonth(), 1).getTime()
        break
    }
    
    const existing = grouped.get(key) || { sum: 0, count: 0 }
    grouped.set(key, {
      sum: existing.sum + 1,
      count: existing.count + 1
    })
  })
  
  return Array.from(grouped.entries())
    .map(([timestamp, { count }]) => ({
      date: new Date(timestamp),
      value: count,
      count
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

interface ChartProps {
  data: DataPoint[]
  width: number
  height: number
  chartType: 'line' | 'area' | 'bar'
}

const Chart = ({ data, width, height, chartType }: ChartProps) => {
  const margin = { top: 20, right: 30, bottom: 60, left: 60 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  
  // Scales
  const xScale = useMemo(
    () =>
      scaleTime({
        domain: [
          data.length > 0 ? data[0]!.date : new Date(),
          data.length > 0 ? data[data.length - 1]!.date : new Date()
        ],
        range: [0, innerWidth],
      }),
    [data, innerWidth]
  )
  
  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, Math.max(...data.map(d => d.value), 1)],
        range: [innerHeight, 0],
        nice: true,
      }),
    [data, innerHeight]
  )
  
  if (width < 100 || height < 100) {
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
        
        {/* Area Chart */}
        {chartType === 'area' && (
          <AreaClosed
            data={data}
            x={(d: DataPoint) => xScale(d.date) ?? 0}
            y={(d: DataPoint) => yScale(d.value) ?? 0}
            yScale={yScale}
            fill="url(#area-gradient)"
            curve={curveMonotoneX}
          />
        )}
        
        {/* Line Chart */}
        {(chartType === 'line' || chartType === 'area') && (
          <LinePath
            data={data}
            x={(d: DataPoint) => xScale(d.date) ?? 0}
            y={(d: DataPoint) => yScale(d.value) ?? 0}
            stroke="var(--chakra-colors-blue-500)"
            strokeWidth={2}
            curve={curveMonotoneX}
          />
        )}
        
        {/* Bar Chart */}
        {chartType === 'bar' && data.map((d, i) => {
          const barWidth = Math.max(2, innerWidth / data.length - 2)
          const barHeight = innerHeight - yScale(d.value)
          const barX = xScale(d.date) - barWidth / 2
          const barY = yScale(d.value)
          
          return (
            <rect
              key={i}
              x={barX}
              y={barY}
              width={barWidth}
              height={barHeight}
              fill="var(--chakra-colors-blue-500)"
              opacity={0.7}
            />
          )
        })}
        
        {/* Data points */}
        {(chartType === 'line' || chartType === 'area') && data.map((d, i) => (
          <circle
            key={i}
            cx={xScale(d.date)}
            cy={yScale(d.value)}
            r={3}
            fill="var(--chakra-colors-blue-500)"
            stroke="var(--chakra-colors-bg)"
            strokeWidth={2}
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
        />
      </VisxGroup>
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="area-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--chakra-colors-blue-500)" stopOpacity={0.5} />
          <stop offset="100%" stopColor="var(--chakra-colors-blue-500)" stopOpacity={0.1} />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const TimeSeriesViewComponent = ({ items }: TimeSeriesViewProps) => {
  const [interval, setInterval] = useState<'hour' | 'day' | 'week' | 'month'>('day')
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area')
  
  // Aggregate data
  const data = useMemo(() => aggregateByTime(items, interval), [items, interval])
  
  // Statistics
  const stats = useMemo(() => {
    const total = items.length
    const withDates = items.filter(i => i.date).length
    const dateRange = items
      .filter(i => i.date)
      .map(i => new Date(i.date!).getTime())
    
    return {
      total,
      withDates,
      earliest: dateRange.length > 0 ? new Date(Math.min(...dateRange)) : null,
      latest: dateRange.length > 0 ? new Date(Math.max(...dateRange)) : null,
    }
  }, [items])
  
  if (items.length === 0) {
    return (
      <Box height="100%" width="100%" display="flex" alignItems="center" justifyContent="center" bg="bg">
        <Text color="fg.muted">No data to display</Text>
      </Box>
    )
  }
  
  return (
    <Stack height="100%" width="100%" gap={0}>
      {/* Controls */}
      <Box p={2} borderBottomWidth="1px" borderColor="border" bg="bg.panel">
        <Group gap={2} wrap="wrap">
          <Group attached>
            <Button
              size="sm"
              bg={interval === 'hour' ? 'blue.500' : 'bg'}
              color={interval === 'hour' ? 'white' : 'fg'}
              onClick={() => setInterval('hour')}
              _hover={interval === 'hour' ? { bg: 'blue.600' } : { bg: 'bg.muted' }}
            >
              Hour
            </Button>
            <Button
              size="sm"
              bg={interval === 'day' ? 'blue.500' : 'bg'}
              color={interval === 'day' ? 'white' : 'fg'}
              onClick={() => setInterval('day')}
              _hover={interval === 'day' ? { bg: 'blue.600' } : { bg: 'bg.muted' }}
            >
              Day
            </Button>
            <Button
              size="sm"
              bg={interval === 'week' ? 'blue.500' : 'bg'}
              color={interval === 'week' ? 'white' : 'fg'}
              onClick={() => setInterval('week')}
              _hover={interval === 'week' ? { bg: 'blue.600' } : { bg: 'bg.muted' }}
            >
              Week
            </Button>
            <Button
              size="sm"
              bg={interval === 'month' ? 'blue.500' : 'bg'}
              color={interval === 'month' ? 'white' : 'fg'}
              onClick={() => setInterval('month')}
              _hover={interval === 'month' ? { bg: 'blue.600' } : { bg: 'bg.muted' }}
            >
              Month
            </Button>
          </Group>
          
          <Group attached>
            <Button
              size="sm"
              bg={chartType === 'line' ? 'blue.500' : 'bg'}
              color={chartType === 'line' ? 'white' : 'fg'}
              onClick={() => setChartType('line')}
              _hover={chartType === 'line' ? { bg: 'blue.600' } : { bg: 'bg.muted' }}
            >
              📈 Line
            </Button>
            <Button
              size="sm"
              bg={chartType === 'area' ? 'blue.500' : 'bg'}
              color={chartType === 'area' ? 'white' : 'fg'}
              onClick={() => setChartType('area')}
              _hover={chartType === 'area' ? { bg: 'blue.600' } : { bg: 'bg.muted' }}
            >
              📊 Area
            </Button>
            <Button
              size="sm"
              bg={chartType === 'bar' ? 'blue.500' : 'bg'}
              color={chartType === 'bar' ? 'white' : 'fg'}
              onClick={() => setChartType('bar')}
              _hover={chartType === 'bar' ? { bg: 'blue.600' } : { bg: 'bg.muted' }}
            >
              📊 Bar
            </Button>
          </Group>
        </Group>
        
        {/* Statistics */}
        <Box mt={2} fontSize="xs" color="fg.muted">
          <Text>
            Total items: {stats.total} ({stats.withDates} with dates)
            {stats.earliest && stats.latest && (
              <> • Range: {stats.earliest.toLocaleDateString()} - {stats.latest.toLocaleDateString()}</>
            )}
          </Text>
        </Box>
      </Box>
      
      {/* Chart */}
      <Box flex={1} position="relative" overflow="hidden" bg="bg">
        <ParentSize>
          {({ width, height }) => (
            <Chart data={data} width={width} height={height} chartType={chartType} />
          )}
        </ParentSize>
      </Box>
    </Stack>
  )
}

