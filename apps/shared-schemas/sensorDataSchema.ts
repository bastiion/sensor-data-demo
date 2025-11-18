import { z } from 'zod';

/**
 * Schema for GeoJSON Point geometry
 */
export const PointGeometrySchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]), // [longitude, latitude]
});

/**
 * Schema for sensor data properties
 * Based on the data from tryout_data.json
 */
export const SensorPropertiesSchema = z.object({
  time: z.string().datetime(), // ISO 8601 datetime string
  v: z.number().nullable(), // sensor value (can be null)
  id: z.string(), // sensor identifier
  hi: z.number().nullable(), // high value (can be null)
  lo: z.number().nullable(), // low value (can be null)
  c: z.number(), // confidence value
  uom: z.string(), // unit of measure (e.g., "°C")
  network: z.string(), // network name (e.g., "luftdaten-info")
  description: z.string(), // sensor description
  name: z.string(), // sensor name
});

/**
 * Schema for a single GeoJSON Feature containing sensor data
 */
export const SensorFeatureSchema = z.object({
  type: z.literal('Feature'),
  geometry: PointGeometrySchema,
  properties: SensorPropertiesSchema,
});

/**
 * Schema for a GeoJSON FeatureCollection of sensor data
 */
export const SensorFeatureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(SensorFeatureSchema),
});

// Type exports for TypeScript inference
export type PointGeometry = z.infer<typeof PointGeometrySchema>;
export type SensorProperties = z.infer<typeof SensorPropertiesSchema>;
export type SensorFeature = z.infer<typeof SensorFeatureSchema>;
export type SensorFeatureCollection = z.infer<typeof SensorFeatureCollectionSchema>;

