# Sensor Map Demo

A clean, isolated sensor data visualization application.

## Features

- Interactive map showing sensor stations with temperature readings
- Time-based slider to view sensor data at different points in time
- Color-coded temperature markers (blue = cold, red = hot)
- Sensor details on click

## Tech Stack

- **React 18** with TypeScript
- **Zustand** for state management
- **MapLibre GL** for map rendering
- **Chakra UI** for UI components
- **date-fns** for date handling
- **Zod** for data validation
- **Vite** for build tooling

## Getting Started

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun run build
```

## Data Source

The app loads sensor temperature data from `public/tryout_data.json`, which contains readings from multiple sensor stations in the Dresden area over a week-long period (April 23-29, 2024).

## Architecture

- `src/sensor-data/store/` - Zustand store for state management
- `src/sensor-data/components/` - React components
- `src/lib/` - Schema definitions and utilities
- `public/` - Static assets including sensor data
