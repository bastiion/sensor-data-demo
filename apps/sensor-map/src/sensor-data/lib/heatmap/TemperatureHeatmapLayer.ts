import REGL from 'regl'
import maplibregl from 'maplibre-gl'
import type { CustomLayerInterface, Map as MaplibreMap } from 'maplibre-gl'
import type { GeographicBounds, ColorRampConfig } from './types'

/**
 * MapLibre custom layer for rendering temperature heatmap using WebGL
 */
export class TemperatureHeatmapLayer implements CustomLayerInterface {
  id: string
  type: 'custom' = 'custom'
  // Don't specify renderingMode - let MapLibre handle it

  private regl: REGL.Regl | null = null
  private drawCommand: REGL.DrawCommand | null = null
  private texture: REGL.Texture2D | null = null
  private gridSize: number
  public bounds: GeographicBounds  // Made public for debugging
  private colorRamp: ColorRampConfig
  private opacity: number
  private map: MaplibreMap | null = null
  private currentMatrix: any = null
  private currentTextureData: Uint8Array | null = null

  constructor(
    gridSize: number,
    bounds: GeographicBounds,
    colorRamp: ColorRampConfig = { min: -10, max: 35 },
    opacity: number = 0.7
  ) {
    this.id = 'temperature-heatmap'
    this.gridSize = gridSize
    this.bounds = bounds
    this.colorRamp = colorRamp
    this.opacity = opacity
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

    // Create regl draw command
    this.drawCommand = this.regl({
      // Vertex shader
      vert: `
        precision highp float;
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        uniform mat4 u_matrix;
        varying vec2 v_texCoord;

        void main() {
          gl_Position = u_matrix * vec4(a_position, 0.0, 1.0);
          v_texCoord = a_texCoord;
        }
      `,

      // Fragment shader - with temperature color mapping
      frag: `
        precision highp float;
        uniform sampler2D u_texture;
        uniform float u_opacity;
        varying vec2 v_texCoord;

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
          vec4 texColor = texture2D(u_texture, v_texCoord);
          
          // If texture has data (alpha > 0), use it
          if (texColor.a > 0.5) {
            // Red channel contains normalized temperature (0-1)
            float normalized = texColor.r;
            
            // Get color from temperature
            vec3 color = temperatureColor(normalized);
            gl_FragColor = vec4(color, u_opacity);
          } else {
            // No data - transparent
            discard;
          }
        }
      `,

      attributes: {
        // Quad covering the geographic bounds using MercatorCoordinate
        a_position: () => {
          const { west, south, east, north } = this.bounds
          // Convert lat/lng to Mercator coordinates (like the official example!)
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
        u_matrix: () => this.currentMatrix,
        u_texture: () => this.texture!,
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

    // Recreate texture on every render if we have data
    // This ensures the texture binding stays fresh
    if (this.currentTextureData && this.regl) {
      // Destroy old texture
      if (this.texture) {
        try {
          (this.texture as any).destroy()
        } catch (e) {
          // Ignore errors
        }
      }
      
      // Create fresh texture with stored data
      this.texture = this.regl.texture({
        width: this.gridSize,
        height: this.gridSize,
        data: this.currentTextureData,
        format: 'rgba',
        type: 'uint8',
        mag: 'linear',
        min: 'linear',
        wrap: 'clamp',
      })
    }

    if (!this.texture) return

    // Store the matrix for the uniform
    this.currentMatrix = matrix

    // Execute the draw command
    this.drawCommand()
  }

  /**
   * Update the texture with new grid data
   * Converts Float32Array temperature data to RGBA Uint8Array format
   */
  updateTexture(gridData: Float32Array): void {
    if (!this.regl) return

    // Convert Float32Array to RGBA Uint8Array
    // Encode temperature into red channel (0-255) and hasData flag in alpha channel
    const rgbaData = new Uint8Array(this.gridSize * this.gridSize * 4)
    
    for (let i = 0; i < gridData.length; i++) {
      const temp = gridData[i]
      const hasData = temp !== 0
      
      if (hasData) {
        // Normalize temperature to 0-1 range, then to 0-255
        const normalized = (temp - this.colorRamp.min) / (this.colorRamp.max - this.colorRamp.min)
        const clamped = Math.max(0, Math.min(1, normalized))
        const encoded = Math.floor(clamped * 255)
        
        rgbaData[i * 4 + 0] = encoded  // Red: normalized temperature (0-255)
        rgbaData[i * 4 + 1] = 0        // Green: unused
        rgbaData[i * 4 + 2] = 0        // Blue: unused
        rgbaData[i * 4 + 3] = 255      // Alpha: hasData flag
      } else {
        // No data
        rgbaData[i * 4 + 0] = 0
        rgbaData[i * 4 + 1] = 0
        rgbaData[i * 4 + 2] = 0
        rgbaData[i * 4 + 3] = 0 // Alpha = 0 means no data
      }
    }

    // Store the texture data - it will be recreated on every render
    this.currentTextureData = rgbaData

    // Trigger map repaint to show the updated texture
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

  onRemove(): void {
    // Cleanup
    if (this.texture) {
      this.texture.destroy()
      this.texture = null
    }
    if (this.regl) {
      this.regl.destroy()
      this.regl = null
    }
    this.drawCommand = null
    this.map = null
  }
}

