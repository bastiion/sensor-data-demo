# Shared Schemas

Shared Zod schemas for sensor data validation used across frontend and backend applications.

## Contents

- `sensorDataSchema.ts` - Zod schemas for GeoJSON sensor data

## Usage

### In Backend

```typescript
import { SensorFeatureCollectionSchema, SensorFeature } from 'shared-schemas';

// Validate incoming data
const validatedData = SensorFeatureCollectionSchema.parse(data);
```

### In Frontend

```typescript
import { SensorFeatureCollection, SensorProperties } from 'shared-schemas';

// Use the types
const sensorData: SensorFeatureCollection = await fetchSensorData();
```

## Schemas

### `PointGeometrySchema`
GeoJSON Point geometry with coordinates `[longitude, latitude]`

### `SensorPropertiesSchema`
Sensor data properties including:
- `time` - ISO 8601 datetime
- `v` - sensor value
- `id` - sensor identifier
- `hi` / `lo` - high/low values
- `c` - confidence
- `uom` - unit of measure
- `network` - network name
- `description` - sensor description
- `name` - sensor name

### `SensorFeatureSchema`
Single GeoJSON Feature with sensor data

### `SensorFeatureCollectionSchema`
GeoJSON FeatureCollection of sensor features

## Type Exports

All schemas have corresponding TypeScript types exported:
- `PointGeometry`
- `SensorProperties`
- `SensorFeature`
- `SensorFeatureCollection`
