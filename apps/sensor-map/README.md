# Sensor Map Frontend

Interactive map visualization for sensor data with real-time filtering.

## Features

- **MapLibre GL JS** - Interactive map visualization
- **TanStack React Query v5** - Smart data fetching with caching and background updates
- **Zustand** - Minimal state management for filters only
- **Network Filtering** - Filter sensors by measuring network (automatic backend refetch)
- **Time Range Filtering** - Filter data by date/time range (automatic backend refetch)
- **Time Point Selection** - View sensor readings at specific times (client-side calculation)
- **No Flickering** - Previous data stays visible during refetch
- **Fallback Mode** - Uses local JSON if backend is unavailable

## Setup

1. Copy environment template:

```bash
cp env.example .env
```

2. Configure backend URL in `.env`:

```
VITE_BACKEND_URL=http://localhost:3000
```

3. Install dependencies:

```bash
bun install
```

## Development

```bash
bun run dev
```

## Architecture

### State Management
- **Zustand (`useFilterStore`)**: Holds only filter state (selectedTime, selectedNetwork, timeRange)
- **No data in store**: All data fetching handled by React Query

### Data Fetching (React Query)
- **`useSensorData`**: Fetches sensor data with automatic caching and background updates
  - Query key: `['sensors', network, timeFrom, timeTo]`
  - `placeholderData: keepPreviousData` - prevents flickering during refetch
  - Falls back to local JSON if backend unavailable
  
- **`useSensorMetadata`**: Fetches available networks and date range
  - Query key: `['sensors', 'metadata']`
  - Cached for 10 minutes

### Client-Side Computation
- **Current Reading Calculation**: Done in `SensorMap` component
  - Groups features by sensor ID
  - Finds nearest reading to `selectedTime`
  - Recalculates only when `sensorData` or `selectedTime` changes

## Filters

### Measuring Network
Select from available networks (loaded from `/sensors/metadata`). 
Changes the query key → React Query automatically refetches from `/sensors?network=...`

### Time Range
Filter data by date/time range using datetime inputs.
Changes the query key → React Query automatically refetches from `/sensors?timeFrom=...&timeTo=...`

### Time Point Slider
Select a specific point in time to view sensor readings.
**Client-side only** - just updates `selectedTime` in store, no backend call.

### Reset Button
Clears all filters → React Query refetches unfiltered data.

## Why No Flickering?

1. **placeholderData: keepPreviousData**: React Query keeps showing old data during refetch
2. **No loading indicators**: UI never shows loading state, just smooth transitions
3. **Client-side time slider**: Instant response, no network delay
4. **Smart caching**: React Query deduplicates requests and caches results

## Environment Variables

- `VITE_BACKEND_URL` - Backend API URL (default: http://localhost:3000)

## Tech Stack

- React 18
- TypeScript
- MapLibre GL JS
- Chakra UI
- Zustand (state management)
- Zod (validation)
- shared-schemas (workspace package)
