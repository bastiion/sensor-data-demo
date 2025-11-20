import REGL from 'regl'
import maplibregl from 'maplibre-gl'
import type { CustomLayerInterface, Map as MaplibreMap } from 'maplibre-gl'
import type { GeographicBounds, ColorRampConfig } from './types'
import type { SensorStation } from '@/sensor-data/store/useSensorStore'

const MAX_STATIONS = 60  // Maximum number of stations to render (for performance)

/**
 * GPU-accelerated heatmap layer that performs IDW interpolation directly in the fragment shader
 * 
 * DESIGN DECISION: Dynamic Shader Generation (Baking Data into Shader Code)
 * 
 * This implementation generates shader code dynamically with station data embedded as
 * compile-time constants, rather than passing data via uniform arrays. This approach
 * was chosen to work around several WebGL/GLSL ES 1.0 limitations:
 * 
 * 1. UNIFORM ARRAY ISSUES:
 *    - regl has strict type validation for uniform arrays that caused runtime errors
 *    - GLSL ES 1.0 requires constant expressions for array indices (no dynamic indexing)
 *    - Workarounds (manual unrolling, flat arrays) became complex and error-prone
 * 
 * 2. PRECISION CONCERNS:
 *    - Geographic coordinates in mercator space require high precision
 *    - Uniform data may lose precision through serialization/deserialization
 *    - Baking as GLSL constants preserves full floating-point precision
 * 
 * 3. PERFORMANCE:
 *    - Shader compilation happens once per data update (acceptable for sensor data)
 *    - No uniform upload overhead on every render frame
 *    - GPU can potentially optimize with compile-time known constants
 * 
 * TRADE-OFFS:
 *    - PRO: Works reliably across all WebGL implementations
 *    - PRO: Maintains high precision for geographic calculations
 *    - PRO: Simple, readable shader code without complex workarounds
 *    - CON: Shader recompilation needed when station data changes
 *    - CON: Limited to reasonable station counts (currently 60)
 * 
 * FURTHER RESEARCH:
 *    - Investigate WebGL 2.0 / GLSL ES 3.0 with UBO (Uniform Buffer Objects)
 *    - Test texture-based data passing (encode station data in texture)
 *    - Profile shader compilation time vs uniform overhead for different data update frequencies
 *    - Explore compute shaders for large station counts (WebGPU)
 */
export class TemperatureHeatmapShaderLayer implements CustomLayerInterface {
  id: string
  type: 'custom' = 'custom'

  private regl: REGL.Regl | null = null
  private drawCommand: REGL.DrawCommand | null = null
  public bounds: GeographicBounds
  private colorRamp: ColorRampConfig
  private opacity: number
  private idwPower: number
  private maxDistanceKm: number
  private map: MaplibreMap | null = null
  
  // Current station data
  private currentStations: { pos: [number, number], temp: number }[] = []

  constructor(
    bounds: GeographicBounds,
    colorRamp: ColorRampConfig = { min: 0, max: 20 },
    opacity: number = 0.7,
    idwPower: number = 2,
    maxDistanceKm: number = 30
  ) {
    this.id = 'temperature-heatmap-shader'
    this.bounds = bounds
    this.colorRamp = colorRamp
    this.opacity = opacity
    this.idwPower = idwPower
    this.maxDistanceKm = maxDistanceKm
  }

  /**
   * Generate fragment shader with station data baked in as compile-time constants
   */
  private generateFragmentShader(): string {
    const numStations = this.currentStations.length
    
    if (numStations === 0) {
      // Fallback shader when no stations
      return `
        precision highp float;
        void main() {
          discard; // No stations, render nothing
        }
      `
    }
    
    // Generate position and temperature functions with real data baked in
    let positionCases = ''
    let tempCases = ''
    
    for (let i = 0; i < numStations; i++) {
      const station = this.currentStations[i]
      positionCases += `        if (i == ${i}) return vec2(${station.pos[0].toFixed(10)}, ${station.pos[1].toFixed(10)});\n`
      tempCases += `        if (i == ${i}) return ${station.temp.toFixed(2)};\n`
    }
    
    return `
      precision highp float;
      
      #define MAX_STATIONS ${numStations}
      
      uniform float u_idwPower;
      uniform float u_maxDistanceKm;
      uniform float u_minTemp;
      uniform float u_maxTemp;
      uniform float u_opacity;
      
      varying vec2 v_texCoord;
      varying vec2 v_mercatorPos;

      // Get station position - dynamically generated with real data
      vec2 getStationPosition(int i) {
${positionCases}
        return vec2(0.0, 0.0);
      }
      
      // Get station temperature - dynamically generated with real data
      float getStationTemp(int i) {
${tempCases}
        return 0.0;
      }

      // Temperature to color mapping (blue -> cyan -> green -> yellow -> red)
      vec3 temperatureColor(float normalized) {
        normalized = clamp(normalized, 0.0, 1.0);
        
        vec3 color1 = vec3(0.0, 0.0, 1.0);    // Blue (cold)
        vec3 color2 = vec3(0.0, 1.0, 1.0);    // Cyan
        vec3 color3 = vec3(0.0, 1.0, 0.0);    // Green
        vec3 color4 = vec3(1.0, 1.0, 0.0);    // Yellow
        vec3 color5 = vec3(1.0, 0.0, 0.0);    // Red (hot)
        
        if (normalized < 0.25) {
          return mix(color1, color2, normalized * 4.0);
        } else if (normalized < 0.5) {
          return mix(color2, color3, (normalized - 0.25) * 4.0);
        } else if (normalized < 0.75) {
          return mix(color3, color4, (normalized - 0.5) * 4.0);
        } else {
          return mix(color4, color5, (normalized - 0.75) * 4.0);
        }
      }

      void main() {
        // Perform IDW interpolation with all stations
        float sumOfWeights = 0.0;
        float interpolatedTemp = 0.0;
        int stationsInRange = 0;
        
        for (int i = 0; i < MAX_STATIONS; i++) {
          vec2 stationPos = getStationPosition(i);
          float stationTemp = getStationTemp(i);
          
          // Calculate distance in mercator space and convert to approximate kilometers
          vec2 diff = v_mercatorPos - stationPos;
          float distMercator = length(diff);
          float distKm = distMercator * 40075.0 * cos(radians(51.0)); // Dresden latitude ~51°
          
          // Check if very close to station (matching CPU behavior)
          if (distKm < 0.01) {
            gl_FragColor = vec4(temperatureColor((stationTemp - u_minTemp) / (u_maxTemp - u_minTemp)), u_opacity);
            return;
          }
          
          // Only use stations within range (matching CPU filter)
          if (distKm > u_maxDistanceKm) continue;
          
          stationsInRange++;
          
          // Calculate inverse distance weight
          float weight = 1.0 / pow(distKm, u_idwPower);
          interpolatedTemp += stationTemp * weight;
          sumOfWeights += weight;
        }
        
        // No stations in range - discard (transparent)
        if (stationsInRange == 0 || sumOfWeights == 0.0) {
          discard;
        }
        
        // Calculate final interpolated temperature
        float temperature = interpolatedTemp / sumOfWeights;
        
        // Normalize and apply color ramp
        float normalized = (temperature - u_minTemp) / (u_maxTemp - u_minTemp);
        vec3 color = temperatureColor(normalized);
        
        gl_FragColor = vec4(color, u_opacity);
      }
    `
  }

  onAdd(map: MaplibreMap, gl: WebGLRenderingContext): void {
    this.map = map

    // Initialize regl
    this.regl = REGL({
      gl,
      attributes: {
        preserveDrawingBuffer: true,
      },
    })

    // Start with empty stations (will be updated via updateStations)
    this.buildDrawCommand()
  }

  /**
   * Build or rebuild the draw command with current station data
   */
  private buildDrawCommand(): void {
    if (!this.regl) return

    const fragmentShader = this.generateFragmentShader()

    // Create regl draw command with dynamically generated fragment shader
    this.drawCommand = this.regl({
      vert: `
        precision highp float;
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        uniform mat4 u_matrix;
        varying vec2 v_texCoord;
        varying vec2 v_mercatorPos;

        void main() {
          gl_Position = u_matrix * vec4(a_position, 0.0, 1.0);
          v_texCoord = a_texCoord;
          v_mercatorPos = a_position;
        }
      `,

      frag: fragmentShader,

      attributes: {
        // Quad covering the geographic bounds using MercatorCoordinate
        a_position: () => {
          const { west, south, east, north } = this.bounds
          const sw = maplibregl.MercatorCoordinate.fromLngLat({ lng: west, lat: south })
          const se = maplibregl.MercatorCoordinate.fromLngLat({ lng: east, lat: south })
          const ne = maplibregl.MercatorCoordinate.fromLngLat({ lng: east, lat: north })
          const nw = maplibregl.MercatorCoordinate.fromLngLat({ lng: west, lat: north })
          
          return [
            [sw.x, sw.y],
            [se.x, se.y],
            [ne.x, ne.y],
            [sw.x, sw.y],
            [ne.x, ne.y],
            [nw.x, nw.y],
          ]
        },

        a_texCoord: [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 0],
          [1, 1],
          [0, 1],
        ],
      },

      uniforms: {
        u_matrix: (this.regl as any).prop('matrix'),
        // Station data is baked into shader code, only parameters passed as uniforms
        u_idwPower: this.idwPower,
        u_maxDistanceKm: this.maxDistanceKm,
        u_minTemp: () => this.colorRamp.min,
        u_maxTemp: () => this.colorRamp.max,
        u_opacity: this.opacity,
      },

      count: 6,

      // Alpha blending configuration for semi-transparent heatmap overlay
      blend: {
        enable: true, // Enable blending to allow transparency
        func: {
          // RGB blending: standard alpha compositing formula
          srcRGB: 'src alpha',           // Multiply source color by source alpha (pre-multiplied alpha)
          dstRGB: 'one minus src alpha', // Multiply destination color by (1 - source alpha)
          // Result: finalRGB = sourceRGB * sourceAlpha + destRGB * (1 - sourceAlpha)
          // This creates smooth transparency blending with map layers below
          
          // Alpha blending: preserve both source and destination alpha
          srcAlpha: 1,                   // Keep source alpha as-is (no modification)
          dstAlpha: 1,                   // Keep destination alpha as-is
          // This maintains proper alpha channel for further compositing
        },
      },

      // Depth testing configuration
      depth: {
        enable: false, // Disable depth testing - heatmap is always rendered as overlay
        // We want the heatmap to appear on top of the map, not interact with 3D terrain depth
      },
    })
  }

  render(_gl: WebGLRenderingContext, matrix: any): void {
    if (!this.drawCommand || !this.map) return

    // Execute draw command - station data already baked into shader
    this.drawCommand({
      matrix: matrix,
    })
  }

  /**
   * Update station data and rebuild shader with new embedded data
   * @param stations Array of sensor stations with current readings
   */
  updateStations(stations: SensorStation[]): void {
    // Filter stations with valid readings
    const validStations = stations.filter(
      station => station.currentReading !== null && station.currentReading.value !== null
    )

    // Limit to MAX_STATIONS (60 for reasonable performance)
    const stationsToUse = validStations.slice(0, MAX_STATIONS)

    // Convert to mercator coordinates
    this.currentStations = stationsToUse.map(station => {
      const [lng, lat] = station.coordinates
      const mercator = maplibregl.MercatorCoordinate.fromLngLat({ lng, lat })
      
      return {
        pos: [mercator.x, mercator.y] as [number, number],
        temp: station.currentReading!.value!
      }
    })

    // Rebuild the draw command with new shader code containing the station data
    this.buildDrawCommand()

    // Trigger map repaint
    if (this.map) {
      this.map.triggerRepaint()
    }
  }

  /**
   * Update color ramp configuration
   */
  updateColorRamp(colorRamp: ColorRampConfig): void {
    this.colorRamp = colorRamp
    if (this.map) {
      this.map.triggerRepaint()
    }
  }

  /**
   * Update layer opacity
   */
  updateOpacity(opacity: number): void {
    this.opacity = opacity
    if (this.map) {
      this.map.triggerRepaint()
    }
  }

  /**
   * Update IDW power parameter
   */
  updateIdwPower(idwPower: number): void {
    this.idwPower = idwPower
    if (this.map) {
      this.map.triggerRepaint()
    }
  }

  /**
   * Update max distance parameter
   */
  updateMaxDistance(maxDistanceKm: number): void {
    this.maxDistanceKm = maxDistanceKm
    if (this.map) {
      this.map.triggerRepaint()
    }
  }

  onRemove(): void {
    // Cleanup
    if (this.regl) {
      this.regl.destroy()
      this.regl = null
    }
    this.drawCommand = null
    this.map = null
  }
}

