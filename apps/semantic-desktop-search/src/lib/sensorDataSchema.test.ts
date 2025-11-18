import { describe, it, expect } from 'bun:test';
import {
  PointGeometrySchema,
  SensorPropertiesSchema,
  SensorFeatureSchema,
  SensorFeatureCollectionSchema,
  generateSensorJSONSchemas,
} from './sensorDataSchema';

describe('PointGeometrySchema', () => {
  it('should validate a correct Point geometry', () => {
    const validPoint = {
      type: 'Point',
      coordinates: [13.77516, 51.111646],
    };
    
    expect(() => PointGeometrySchema.parse(validPoint)).not.toThrow();
    const result = PointGeometrySchema.safeParse(validPoint);
    expect(result.success).toBe(true);
  });

  it('should reject invalid coordinate arrays', () => {
    const invalidPoint = {
      type: 'Point',
      coordinates: [13.77516], // missing latitude
    };
    
    const result = PointGeometrySchema.safeParse(invalidPoint);
    expect(result.success).toBe(false);
  });

  it('should reject non-Point geometry types', () => {
    const invalidPoint = {
      type: 'LineString',
      coordinates: [13.77516, 51.111646],
    };
    
    const result = PointGeometrySchema.safeParse(invalidPoint);
    expect(result.success).toBe(false);
  });
});

describe('SensorPropertiesSchema', () => {
  it('should validate sensor properties with numeric values', () => {
    const validProperties = {
      time: '2024-04-23T00:00Z',
      v: -1.7,
      id: '83494-u31fc2wfbmr',
      hi: 2.6,
      lo: -3.5,
      c: 0.331,
      uom: '°C',
      network: 'luftdaten-info',
      description: 'BME280',
      name: 'BME280',
    };
    
    expect(() => SensorPropertiesSchema.parse(validProperties)).not.toThrow();
    const result = SensorPropertiesSchema.safeParse(validProperties);
    expect(result.success).toBe(true);
  });

  it('should validate sensor properties with null values', () => {
    const propertiesWithNull = {
      time: '2024-04-23T00:00Z',
      v: null,
      id: '83494-u31fc2wfbmr',
      hi: null,
      lo: null,
      c: 0.331,
      uom: '°C',
      network: 'luftdaten-info',
      description: 'BME280',
      name: 'BME280',
    };
    
    expect(() => SensorPropertiesSchema.parse(propertiesWithNull)).not.toThrow();
    const result = SensorPropertiesSchema.safeParse(propertiesWithNull);
    expect(result.success).toBe(true);
  });

  it('should reject invalid datetime strings', () => {
    const invalidProperties = {
      time: 'not-a-date',
      v: -1.7,
      id: '83494-u31fc2wfbmr',
      hi: 2.6,
      lo: -3.5,
      c: 0.331,
      uom: '°C',
      network: 'luftdaten-info',
      description: 'BME280',
      name: 'BME280',
    };
    
    const result = SensorPropertiesSchema.safeParse(invalidProperties);
    expect(result.success).toBe(false);
  });

  it('should reject missing required fields', () => {
    const incompleteProperties = {
      time: '2024-04-23T00:00Z',
      v: -1.7,
      id: '83494-u31fc2wfbmr',
      // missing hi, lo, c, uom, network, description, name
    };
    
    const result = SensorPropertiesSchema.safeParse(incompleteProperties);
    expect(result.success).toBe(false);
  });

  it('should reject string values for numeric fields', () => {
    const invalidProperties = {
      time: '2024-04-23T00:00Z',
      v: 'not-a-number',
      id: '83494-u31fc2wfbmr',
      hi: 2.6,
      lo: -3.5,
      c: 0.331,
      uom: '°C',
      network: 'luftdaten-info',
      description: 'BME280',
      name: 'BME280',
    };
    
    const result = SensorPropertiesSchema.safeParse(invalidProperties);
    expect(result.success).toBe(false);
  });
});

describe('SensorFeatureSchema', () => {
  it('should validate a complete sensor feature', () => {
    const validFeature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [13.77516, 51.111646],
      },
      properties: {
        time: '2024-04-23T00:00Z',
        v: -1.7,
        id: '83494-u31fc2wfbmr',
        hi: 2.6,
        lo: -3.5,
        c: 0.331,
        uom: '°C',
        network: 'luftdaten-info',
        description: 'BME280',
        name: 'BME280',
      },
    };
    
    expect(() => SensorFeatureSchema.parse(validFeature)).not.toThrow();
    const result = SensorFeatureSchema.safeParse(validFeature);
    expect(result.success).toBe(true);
  });

  it('should validate a feature with null sensor values', () => {
    const featureWithNulls = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [13.77516, 51.111646],
      },
      properties: {
        time: '2024-04-23T00:00Z',
        v: null,
        id: '83494-u31fc2wfbmr',
        hi: null,
        lo: null,
        c: 0.331,
        uom: '°C',
        network: 'luftdaten-info',
        description: 'BME280',
        name: 'BME280',
      },
    };
    
    expect(() => SensorFeatureSchema.parse(featureWithNulls)).not.toThrow();
    const result = SensorFeatureSchema.safeParse(featureWithNulls);
    expect(result.success).toBe(true);
  });

  it('should reject features with invalid geometry', () => {
    const invalidFeature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon', // wrong type
        coordinates: [13.77516, 51.111646],
      },
      properties: {
        time: '2024-04-23T00:00Z',
        v: -1.7,
        id: '83494-u31fc2wfbmr',
        hi: 2.6,
        lo: -3.5,
        c: 0.331,
        uom: '°C',
        network: 'luftdaten-info',
        description: 'BME280',
        name: 'BME280',
      },
    };
    
    const result = SensorFeatureSchema.safeParse(invalidFeature);
    expect(result.success).toBe(false);
  });
});

describe('SensorFeatureCollectionSchema', () => {
  it('should validate a feature collection with multiple features', () => {
    const validCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [13.77516, 51.111646],
          },
          properties: {
            time: '2024-04-23T00:00Z',
            v: -1.7,
            id: '83494-u31fc2wfbmr',
            hi: 2.6,
            lo: -3.5,
            c: 0.331,
            uom: '°C',
            network: 'luftdaten-info',
            description: 'BME280',
            name: 'BME280',
          },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [13.77516, 51.111646],
          },
          properties: {
            time: '2024-04-23T06:00Z',
            v: 14.9,
            id: '83494-u31fc2wfbmr',
            hi: 27.4,
            lo: 1.9,
            c: 0.3358,
            uom: '°C',
            network: 'luftdaten-info',
            description: 'BME280',
            name: 'BME280',
          },
        },
      ],
    };
    
    expect(() => SensorFeatureCollectionSchema.parse(validCollection)).not.toThrow();
    const result = SensorFeatureCollectionSchema.safeParse(validCollection);
    expect(result.success).toBe(true);
  });

  it('should validate an empty feature collection', () => {
    const emptyCollection = {
      type: 'FeatureCollection',
      features: [],
    };
    
    expect(() => SensorFeatureCollectionSchema.parse(emptyCollection)).not.toThrow();
    const result = SensorFeatureCollectionSchema.safeParse(emptyCollection);
    expect(result.success).toBe(true);
  });

  it('should reject collections with invalid features', () => {
    const invalidCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [13.77516], // invalid: missing latitude
          },
          properties: {
            time: '2024-04-23T00:00Z',
            v: -1.7,
            id: '83494-u31fc2wfbmr',
            hi: 2.6,
            lo: -3.5,
            c: 0.331,
            uom: '°C',
            network: 'luftdaten-info',
            description: 'BME280',
            name: 'BME280',
          },
        },
      ],
    };
    
    const result = SensorFeatureCollectionSchema.safeParse(invalidCollection);
    expect(result.success).toBe(false);
  });

  it('should reject wrong type', () => {
    const wrongType = {
      type: 'Feature', // should be FeatureCollection
      features: [],
    };
    
    const result = SensorFeatureCollectionSchema.safeParse(wrongType);
    expect(result.success).toBe(false);
  });
});

describe('generateSensorJSONSchemas', () => {
  it('should generate valid JSON schemas for all sensor types', () => {
    const schemas = generateSensorJSONSchemas();
    
    expect(schemas).toHaveProperty('pointGeometry');
    expect(schemas).toHaveProperty('sensorProperties');
    expect(schemas).toHaveProperty('sensorFeature');
    expect(schemas).toHaveProperty('sensorFeatureCollection');
  });

  it('should include JSON Schema standard properties', () => {
    const schemas = generateSensorJSONSchemas();
    
    // Check for JSON Schema 2020-12 standard properties
    expect(schemas.pointGeometry).toHaveProperty('$schema', 'https://json-schema.org/draft/2020-12/schema');
    expect(schemas.pointGeometry).toHaveProperty('type', 'object');
    expect(schemas.sensorProperties).toHaveProperty('$schema');
    expect(schemas.sensorFeature).toHaveProperty('$schema');
    expect(schemas.sensorFeatureCollection).toHaveProperty('$schema');
  });

  it('should generate schemas compatible with JSON Schema 2020-12', () => {
    const schemas = generateSensorJSONSchemas();
    
    // Check that the schema has required JSON Schema properties
    expect(schemas.sensorFeatureCollection).toHaveProperty('type');
    expect(schemas.sensorFeatureCollection.type).toBe('object');
    expect(schemas.sensorFeatureCollection).toHaveProperty('properties');
    expect(schemas.sensorFeatureCollection).toHaveProperty('required');
  });
});

describe('TypeScript type inference', () => {
  it('should correctly infer types from schemas', () => {
    // This is a compile-time check, but we can also verify at runtime
    const feature = {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [13.77516, 51.111646] as [number, number],
      },
      properties: {
        time: '2024-04-23T00:00Z',
        v: -1.7,
        id: '83494-u31fc2wfbmr',
        hi: 2.6,
        lo: -3.5,
        c: 0.331,
        uom: '°C',
        network: 'luftdaten-info',
        description: 'BME280',
        name: 'BME280',
      },
    };
    
    // Should compile and validate
    const parsed = SensorFeatureSchema.parse(feature);
    expect(parsed.geometry.coordinates[0]).toBe(13.77516);
    expect(parsed.properties.v).toBe(-1.7);
  });
});

