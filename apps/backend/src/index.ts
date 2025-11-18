import express, { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SensorFeatureCollectionSchema, type SensorFeatureCollection, type SensorFeature } from 'shared-schemas';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Load sensor data on startup
let sensorData: SensorFeatureCollection;
let metadata: {
  minDate: string;
  maxDate: string;
  networks: string[];
};

try {
  const dataPath = join(__dirname, '..', process.env.DATA_PATH || '../sensor-map/public/tryout_data.json');
  const rawData = readFileSync(dataPath, 'utf-8');
  sensorData = SensorFeatureCollectionSchema.parse(JSON.parse(rawData));
  
  // Calculate metadata
  const dates = sensorData.features.map(f => new Date(f.properties.time));
  const networks = [...new Set(sensorData.features.map(f => f.properties.network))];
  
  metadata = {
    minDate: new Date(Math.min(...dates.map(d => d.getTime()))).toISOString(),
    maxDate: new Date(Math.max(...dates.map(d => d.getTime()))).toISOString(),
    networks: networks.sort(),
  };
  
  console.log(`✅ Loaded ${sensorData.features.length} sensor features`);
  console.log(`📅 Date range: ${metadata.minDate} to ${metadata.maxDate}`);
  console.log(`📡 Networks: ${metadata.networks.join(', ')}`);
} catch (error) {
  console.error('❌ Failed to load sensor data:', error);
  process.exit(1);
}

// Query parameters schema
const querySchema = z.object({
  timeFrom: z.string().datetime().optional(),
  timeTo: z.string().datetime().optional(),
  network: z.string().optional(),
  minLon: z.coerce.number().optional(),
  maxLon: z.coerce.number().optional(),
  minLat: z.coerce.number().optional(),
  maxLat: z.coerce.number().optional(),
});

// Get metadata endpoint
app.get('/sensors/metadata', (_req: Request, res: Response) => {
  res.json(metadata);
});

// Filter sensor data endpoint
app.get('/sensors', (req: Request, res: Response) => {
  try {
    const params = querySchema.parse(req.query);
    
    let filtered = sensorData.features;

    // Filter by time range
    if (params.timeFrom) {
      const fromDate = new Date(params.timeFrom);
      filtered = filtered.filter(f => new Date(f.properties.time) >= fromDate);
    }
    if (params.timeTo) {
      const toDate = new Date(params.timeTo);
      filtered = filtered.filter(f => new Date(f.properties.time) <= toDate);
    }

    // Filter by network
    if (params.network) {
      filtered = filtered.filter(f => f.properties.network === params.network);
    }

    // Filter by bounding box
    if (params.minLon !== undefined) {
      filtered = filtered.filter(f => f.geometry.coordinates[0] >= params.minLon!);
    }
    if (params.maxLon !== undefined) {
      filtered = filtered.filter(f => f.geometry.coordinates[0] <= params.maxLon!);
    }
    if (params.minLat !== undefined) {
      filtered = filtered.filter(f => f.geometry.coordinates[1] >= params.minLat!);
    }
    if (params.maxLat !== undefined) {
      filtered = filtered.filter(f => f.geometry.coordinates[1] <= params.maxLat!);
    }

    const result: SensorFeatureCollection = {
      type: 'FeatureCollection',
      features: filtered,
    };

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Invalid query parameters',
        details: error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 GET /sensors/metadata - Get date range and available networks`);
  console.log(`📍 GET /sensors - Filter sensor data`);
});
