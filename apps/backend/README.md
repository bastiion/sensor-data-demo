# Backend API

Simple Express backend for filtering sensor data.

## Setup

1. Copy environment template:

```bash
cp env.example .env
```

2. Install dependencies:

```bash
bun install
```

## Development

```bash
bun run dev
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `DATA_PATH` - Relative path to sensor data JSON file (default: ../sensor-map/public/tryout_data.json)

## API Endpoints

### `GET /sensors/metadata`

Get dataset metadata including date range and available networks.

**Response:**

```json
{
  "minDate": "2024-01-01T00:00:00.000Z",
  "maxDate": "2024-12-31T23:59:59.000Z",
  "networks": ["luftdaten-info", "other-network"]
}
```

### `GET /sensors`

Filter sensor data by time, network, and bounding box.

**Query Parameters:**

- `timeFrom` - ISO 8601 datetime (e.g., `2024-01-01T00:00:00Z`)
- `timeTo` - ISO 8601 datetime
- `network` - Network name (e.g., `luftdaten-info`)
- `minLon` - Minimum longitude (bounding box west)
- `maxLon` - Maximum longitude (bounding box east)
- `minLat` - Minimum latitude (bounding box south)
- `maxLat` - Maximum latitude (bounding box north)

**Response:** GeoJSON FeatureCollection (same format as source data)

## Examples

Get metadata:

```bash
curl http://localhost:3000/sensors/metadata
```

Get all sensors:

```bash
curl http://localhost:3000/sensors
```

Filter by network:

```bash
curl "http://localhost:3000/sensors?network=luftdaten-info"
```

Filter by time range:

```bash
curl "http://localhost:3000/sensors?timeFrom=2024-01-01T00:00:00Z&timeTo=2024-12-31T23:59:59Z"
```

Filter by bounding box:

```bash
curl "http://localhost:3000/sensors?minLon=8.0&maxLon=9.0&minLat=47.0&maxLat=48.0"
```

Combine filters:

```bash
curl "http://localhost:3000/sensors?network=luftdaten-info&minLon=8.0&maxLon=9.0&minLat=47.0&maxLat=48.0"
```

## Tech Stack

- Express 5.1.0
- Zod 4.1.12
- CORS 2.8.5
- TypeScript 5.9.3
- shared-schemas (workspace package)
