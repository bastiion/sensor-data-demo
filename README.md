# Sensor Map Demo

A clean, isolated sensor data visualization application.

## Features

- Interactive map showing sensor stations with temperature readings
- Time-based slider to view sensor data at different points in time
- Color-coded temperature markers (blue = cold, red = hot)
- Sensor details on click
- **Temperature Heatmap** with CPU and GPU-accelerated interpolation options
- Real-time adjustable heatmap parameters (IDW power, distance range, color scale, opacity)

## Heatmap Visualization

The application features a temperature heatmap overlay that interpolates sensor readings across the map using **Inverse Distance Weighting (IDW)** spatial interpolation.

### Two Rendering Approaches

#### 1. CPU-Based Interpolation (Default)
- Pre-computes a 100×100 grid of interpolated temperature values on the CPU
- Uses [Turf.js](https://turfjs.org/) for accurate geographic distance calculations
- Uploads the grid as an RGBA texture to the GPU for rendering
- Good for stable, infrequent updates

#### 2. GPU Shader-Based Interpolation
- Performs IDW interpolation **per-pixel** directly in the fragment shader
- Supports up to 60 simultaneous sensor stations
- Uses **dynamic shader generation** to embed station data as compile-time constants
  - Currently a Workaround for WebGL/GLSL ES 1.0
  - Maintains high precision for geographic coordinates
- Real-time updates with 60 FPS performance
- Ideal for interactive parameter adjustments and time-series animation

### Interpolation Method: Inverse Distance Weighting (IDW)

The heatmap uses IDW to estimate temperatures at unmeasured locations based on nearby sensor readings:

```
T(x) = Σ(wi × Ti) / Σ(wi)
where wi = 1 / d(x, xi)^p
```

- `T(x)` = interpolated temperature at location x
- `Ti` = temperature at station i
- `d(x, xi)` = distance between x and station i
- `p` = power parameter (default: 3.0, adjustable 0.1-30.0)

Stations beyond the maximum distance threshold are excluded from calculations.

**Learn more**: [Inverse Distance Weighting - Wikipedia](https://en.wikipedia.org/wiki/Inverse_distance_weighting)

### Adjustable Parameters

- **Max Distance** (1-100 km): Maximum influence range of each sensor
- **IDW Power** (0.1-30.0): Controls how rapidly influence decreases with distance
- **Color Range** (-20°C to 60°C): Temperature bounds for color mapping
- **Opacity** (0.0-1.0): Heatmap transparency

### Technical Implementation

**Key Files:**
- `src/sensor-data/lib/heatmap/TemperatureHeatmapShaderLayer.ts` - GPU shader implementation
- `src/sensor-data/lib/heatmap/TemperatureHeatmapLayer.ts` - CPU grid implementation
- `src/sensor-data/lib/heatmap/interpolate.ts` - IDW calculation functions
- `src/sensor-data/lib/heatmap/useTemperatureHeatmap.ts` - React hook for layer management

**Technologies:**
- [MapLibre GL JS](https://maplibre.org/) Custom Layer API
- [regl](https://github.com/regl-project/regl) - Functional WebGL wrapper
- WebGL fragment shaders with GLSL ES 1.0
- [Turf.js](https://turfjs.org/) for geographic calculations

**Inspiration:**
- GPU interpolation approach inspired by [Shadertoy: Inverse Distance Weighted Interpolation](https://www.shadertoy.com/view/XdXfRr)

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
