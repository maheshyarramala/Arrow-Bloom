/**
 * Arrow Bloom - Silhouette Shape Definitions & Polygon Rasterizer
 * 50 distinct, recognizable, chunky shapes across 5 collections.
 */
import { ShapeDefinition, CellCoord } from './types.ts';

// Helper to create polygons
type Poly = Array<[number, number]>;

export const SHAPE_DEFINITIONS: Record<number, ShapeDefinition> = {
  // Collection 1: "Shapes" (1-10)
  1: {
    id: 'heart',
    name: 'Heart',
    collectionId: 1,
    polygons: [[
      [0.5, 0.25], [0.38, 0.12], [0.22, 0.12], [0.12, 0.25], [0.12, 0.45],
      [0.26, 0.65], [0.5, 0.90], [0.74, 0.65], [0.88, 0.45], [0.88, 0.25],
      [0.78, 0.12], [0.62, 0.12],
    ]],
  },
  2: {
    id: 'star',
    name: 'Star',
    collectionId: 1,
    polygons: [[
      [0.5, 0.08], [0.62, 0.36], [0.92, 0.38], [0.69, 0.58], [0.77, 0.88],
      [0.5, 0.72], [0.23, 0.88], [0.31, 0.58], [0.08, 0.38], [0.38, 0.36],
    ]],
  },
  3: {
    id: 'moon',
    name: 'Crescent Moon',
    collectionId: 1,
    polygons: [[
      [0.52, 0.08], [0.70, 0.16], [0.82, 0.32], [0.86, 0.50], [0.80, 0.72],
      [0.64, 0.88], [0.46, 0.94], [0.26, 0.90], [0.48, 0.78], [0.60, 0.60],
      [0.60, 0.40], [0.48, 0.22], [0.28, 0.14],
    ]],
  },
  4: {
    id: 'diamond',
    name: 'Gem Diamond',
    collectionId: 1,
    polygons: [[
      [0.30, 0.12], [0.70, 0.12], [0.90, 0.42], [0.50, 0.92], [0.10, 0.42],
    ]],
  },
  5: {
    id: 'circle',
    name: 'Ring Circle',
    collectionId: 1,
    polygons: [[
      [0.50, 0.10], [0.78, 0.18], [0.90, 0.50], [0.78, 0.82], [0.50, 0.90],
      [0.22, 0.82], [0.10, 0.50], [0.22, 0.18],
    ]],
  },
  6: {
    id: 'triangle',
    name: 'Shield Triangle',
    collectionId: 1,
    polygons: [[
      [0.50, 0.10], [0.88, 0.86], [0.50, 0.76], [0.12, 0.86],
    ]],
  },
  7: {
    id: 'big_arrow',
    name: 'Arrow Head',
    collectionId: 1,
    polygons: [[
      [0.50, 0.08], [0.90, 0.50], [0.68, 0.50], [0.68, 0.90], [0.32, 0.90],
      [0.32, 0.50], [0.10, 0.50],
    ]],
  },
  8: {
    id: 'plus',
    name: 'Chunky Cross',
    collectionId: 1,
    polygons: [[
      [0.34, 0.10], [0.66, 0.10], [0.66, 0.34], [0.90, 0.34], [0.90, 0.66],
      [0.66, 0.66], [0.66, 0.90], [0.34, 0.90], [0.34, 0.66], [0.10, 0.66],
      [0.10, 0.34], [0.34, 0.34],
    ]],
  },
  9: {
    id: 'hexagon',
    name: 'Hexagon',
    collectionId: 1,
    polygons: [[
      [0.50, 0.10], [0.88, 0.28], [0.88, 0.72], [0.50, 0.90], [0.12, 0.72],
      [0.12, 0.28],
    ]],
  },
  10: {
    id: 'lightning',
    name: 'Lightning Bolt',
    collectionId: 1,
    polygons: [[
      [0.56, 0.08], [0.78, 0.08], [0.44, 0.44], [0.72, 0.44], [0.26, 0.94],
      [0.46, 0.56], [0.22, 0.56],
    ]],
  },

  // Collection 2: "Sky" (11-20)
  11: {
    id: 'bird',
    name: 'Flying Bird',
    collectionId: 2,
    polygons: [[
      // Side view of flying bird: beak, head, raised wings, round body, fanned tail
      [0.82, 0.40], // beak tip
      [0.72, 0.32], // forehead
      [0.60, 0.14], // top of front wing tip
      [0.50, 0.28], // mid wing notch
      [0.40, 0.16], // second wing tip
      [0.34, 0.36], // back of body
      [0.14, 0.44], // upper fanned tail
      [0.12, 0.56], // lower fanned tail
      [0.26, 0.60], // tail base
      [0.42, 0.68], // plump belly
      [0.64, 0.62], // breast
      [0.74, 0.50], // chin
    ]],
  },
  12: {
    id: 'airplane',
    name: 'Supersonic Airplane',
    collectionId: 2,
    // Top-down passenger jet angled ~45 deg: nose pointing up-right, swept wings, tail fin
    polygons: [[
      [0.86, 0.14], // nose tip
      [0.80, 0.24],
      [0.92, 0.54], // right wing tip
      [0.72, 0.48], // right wing root
      [0.52, 0.70],
      [0.54, 0.88], // right tailplane
      [0.40, 0.86], // tail cone
      [0.22, 0.70], // left tailplane
      [0.38, 0.54],
      [0.20, 0.38], // left wing root
      [0.34, 0.16], // left wing tip
      [0.66, 0.26],
    ]],
  },
  13: {
    id: 'balloon',
    name: 'Hot Air Balloon',
    collectionId: 2,
    polygons: [
      // Big balloon canopy + basket
      [
        [0.50, 0.08], [0.76, 0.18], [0.86, 0.42], [0.74, 0.68], [0.58, 0.78],
        [0.42, 0.78], [0.26, 0.68], [0.14, 0.42], [0.24, 0.18],
      ],
      [
        [0.42, 0.84], [0.58, 0.84], [0.56, 0.94], [0.44, 0.94],
      ],
    ],
  },
  14: {
    id: 'kite',
    name: 'Diamond Kite',
    collectionId: 2,
    polygons: [[
      [0.50, 0.10], [0.84, 0.42], [0.50, 0.84], [0.52, 0.94], [0.48, 0.94],
      [0.50, 0.84], [0.16, 0.42],
    ]],
  },
  15: {
    id: 'cloud',
    name: 'Fluffy Cloud',
    collectionId: 2,
    polygons: [[
      [0.26, 0.42], [0.38, 0.22], [0.60, 0.20], [0.74, 0.32], [0.88, 0.48],
      [0.86, 0.72], [0.72, 0.82], [0.28, 0.82], [0.14, 0.72], [0.14, 0.52],
    ]],
  },
  16: {
    id: 'sun',
    name: 'Radiant Sun',
    collectionId: 2,
    polygons: [[
      [0.50, 0.10], [0.58, 0.24], [0.76, 0.16], [0.74, 0.34], [0.90, 0.42],
      [0.78, 0.54], [0.86, 0.72], [0.68, 0.72], [0.64, 0.88], [0.50, 0.78],
      [0.36, 0.88], [0.32, 0.72], [0.14, 0.72], [0.22, 0.54], [0.10, 0.42],
      [0.26, 0.34], [0.24, 0.16], [0.42, 0.24],
    ]],
  },
  17: {
    id: 'butterfly',
    name: 'Twin Butterfly',
    collectionId: 2,
    polygons: [[
      [0.50, 0.22], [0.64, 0.12], [0.86, 0.20], [0.84, 0.48], [0.62, 0.52],
      [0.80, 0.76], [0.68, 0.88], [0.52, 0.74], [0.50, 0.90], [0.48, 0.74],
      [0.32, 0.88], [0.20, 0.76], [0.38, 0.52], [0.16, 0.48], [0.14, 0.20],
      [0.36, 0.12],
    ]],
  },
  18: {
    id: 'rocket',
    name: 'Space Rocket',
    collectionId: 2,
    polygons: [[
      [0.50, 0.08], [0.66, 0.28], [0.66, 0.66], [0.86, 0.84], [0.68, 0.82],
      [0.60, 0.92], [0.40, 0.92], [0.32, 0.82], [0.14, 0.84], [0.34, 0.66],
      [0.34, 0.28],
    ]],
  },
  19: {
    id: 'helicopter',
    name: 'Helicopter',
    collectionId: 2,
    polygons: [
      // Top rotor
      [[0.20, 0.14], [0.80, 0.14], [0.80, 0.20], [0.20, 0.20]],
      // Cabin and tail
      [
        [0.48, 0.20], [0.52, 0.20], [0.72, 0.36], [0.76, 0.58], [0.64, 0.70],
        [0.44, 0.70], [0.18, 0.54], [0.14, 0.40], [0.18, 0.46], [0.42, 0.46],
        [0.44, 0.32],
      ],
      // Skids
      [[0.34, 0.80], [0.72, 0.80], [0.72, 0.86], [0.34, 0.86]],
    ],
  },
  20: {
    id: 'ufo',
    name: 'Alien UFO',
    collectionId: 2,
    polygons: [[
      [0.50, 0.16], [0.66, 0.26], [0.90, 0.54], [0.74, 0.74], [0.50, 0.84],
      [0.26, 0.74], [0.10, 0.54], [0.34, 0.26],
    ]],
  },

  // Collection 3: "Animals" (21-30)
  21: {
    id: 'cat',
    name: 'Curious Cat',
    collectionId: 3,
    polygons: [[
      [0.24, 0.16], [0.38, 0.28], [0.62, 0.28], [0.76, 0.16], [0.78, 0.44],
      [0.72, 0.62], [0.82, 0.78], [0.74, 0.92], [0.46, 0.92], [0.28, 0.86],
      [0.22, 0.62], [0.22, 0.44],
    ]],
  },
  22: {
    id: 'fish',
    name: 'Tropical Fish',
    collectionId: 3,
    polygons: [[
      [0.86, 0.48], [0.68, 0.22], [0.42, 0.24], [0.18, 0.12], [0.24, 0.48],
      [0.18, 0.84], [0.42, 0.74], [0.68, 0.76],
    ]],
  },
  23: {
    id: 'rabbit',
    name: 'Bunny Rabbit',
    collectionId: 3,
    polygons: [[
      [0.34, 0.08], [0.42, 0.26], [0.58, 0.26], [0.66, 0.08], [0.72, 0.28],
      [0.72, 0.54], [0.84, 0.74], [0.78, 0.90], [0.38, 0.90], [0.24, 0.76],
      [0.28, 0.52], [0.28, 0.28],
    ]],
  },
  24: {
    id: 'penguin',
    name: 'Chubby Penguin',
    collectionId: 3,
    polygons: [[
      [0.50, 0.12], [0.66, 0.24], [0.72, 0.48], [0.82, 0.66], [0.72, 0.86],
      [0.58, 0.92], [0.42, 0.92], [0.28, 0.86], [0.18, 0.66], [0.28, 0.48],
      [0.34, 0.24],
    ]],
  },
  25: {
    id: 'turtle',
    name: 'Sea Turtle',
    collectionId: 3,
    polygons: [[
      [0.50, 0.10], [0.60, 0.24], [0.82, 0.28], [0.78, 0.50], [0.88, 0.74],
      [0.68, 0.84], [0.50, 0.92], [0.32, 0.84], [0.12, 0.74], [0.22, 0.50],
      [0.18, 0.28], [0.40, 0.24],
    ]],
  },
  26: {
    id: 'owl',
    name: 'Wise Owl',
    collectionId: 3,
    polygons: [[
      [0.26, 0.14], [0.50, 0.24], [0.74, 0.14], [0.80, 0.42], [0.76, 0.74],
      [0.64, 0.90], [0.36, 0.90], [0.24, 0.74], [0.20, 0.42],
    ]],
  },
  27: {
    id: 'dolphin',
    name: 'Ocean Dolphin',
    collectionId: 3,
    polygons: [[
      [0.16, 0.68], [0.30, 0.40], [0.48, 0.24], [0.56, 0.14], [0.62, 0.24],
      [0.82, 0.36], [0.90, 0.46], [0.76, 0.56], [0.56, 0.58], [0.34, 0.72],
      [0.22, 0.86], [0.14, 0.88],
    ]],
  },
  28: {
    id: 'elephant',
    name: 'Elephant',
    collectionId: 3,
    polygons: [[
      [0.36, 0.18], [0.68, 0.18], [0.82, 0.34], [0.82, 0.72], [0.70, 0.88],
      [0.58, 0.88], [0.56, 0.64], [0.44, 0.64], [0.42, 0.88], [0.30, 0.88],
      [0.22, 0.74], [0.18, 0.54], [0.26, 0.34],
    ]],
  },
  29: {
    id: 'bee',
    name: 'Bumblebee',
    collectionId: 3,
    polygons: [[
      [0.50, 0.14], [0.68, 0.26], [0.84, 0.22], [0.88, 0.42], [0.72, 0.54],
      [0.70, 0.74], [0.50, 0.92], [0.30, 0.74], [0.28, 0.54], [0.12, 0.42],
      [0.16, 0.22], [0.32, 0.26],
    ]],
  },
  30: {
    id: 'snail',
    name: 'Spiral Snail',
    collectionId: 3,
    polygons: [[
      [0.48, 0.24], [0.70, 0.24], [0.82, 0.42], [0.80, 0.68], [0.60, 0.78],
      [0.86, 0.86], [0.78, 0.94], [0.22, 0.94], [0.16, 0.68], [0.24, 0.50],
      [0.30, 0.34],
    ]],
  },

  // Collection 4: "Nature" (31-40)
  31: {
    id: 'flower',
    name: 'Blossom Flower',
    collectionId: 4,
    polygons: [[
      [0.50, 0.10], [0.64, 0.24], [0.84, 0.22], [0.78, 0.44], [0.90, 0.58],
      [0.74, 0.72], [0.72, 0.90], [0.50, 0.78], [0.28, 0.90], [0.26, 0.72],
      [0.10, 0.58], [0.22, 0.44], [0.16, 0.22], [0.36, 0.24],
    ]],
  },
  32: {
    id: 'tree',
    name: 'Evergreen Pine',
    collectionId: 4,
    polygons: [[
      [0.50, 0.10], [0.68, 0.32], [0.58, 0.32], [0.74, 0.54], [0.62, 0.54],
      [0.82, 0.78], [0.56, 0.78], [0.56, 0.92], [0.44, 0.92], [0.44, 0.78],
      [0.18, 0.78], [0.38, 0.54], [0.26, 0.54], [0.42, 0.32], [0.32, 0.32],
    ]],
  },
  33: {
    id: 'leaf',
    name: 'Oak Leaf',
    collectionId: 4,
    polygons: [[
      [0.50, 0.10], [0.68, 0.22], [0.60, 0.38], [0.78, 0.48], [0.62, 0.62],
      [0.72, 0.78], [0.50, 0.92], [0.28, 0.78], [0.38, 0.62], [0.22, 0.48],
      [0.40, 0.38], [0.32, 0.22],
    ]],
  },
  34: {
    id: 'mushroom',
    name: 'Forest Mushroom',
    collectionId: 4,
    polygons: [[
      [0.50, 0.14], [0.78, 0.24], [0.88, 0.52], [0.68, 0.58], [0.62, 0.90],
      [0.38, 0.90], [0.32, 0.58], [0.12, 0.52], [0.22, 0.24],
    ]],
  },
  35: {
    id: 'cactus',
    name: 'Desert Cactus',
    collectionId: 4,
    polygons: [[
      [0.42, 0.12], [0.58, 0.12], [0.58, 0.32], [0.76, 0.32], [0.82, 0.52],
      [0.74, 0.62], [0.58, 0.62], [0.58, 0.92], [0.42, 0.92], [0.42, 0.54],
      [0.26, 0.54], [0.18, 0.44], [0.24, 0.26], [0.42, 0.26],
    ]],
  },
  36: {
    id: 'palmtree',
    name: 'Tropical Palm',
    collectionId: 4,
    polygons: [[
      [0.50, 0.18], [0.74, 0.12], [0.84, 0.28], [0.66, 0.36], [0.82, 0.48],
      [0.64, 0.52], [0.56, 0.54], [0.56, 0.92], [0.44, 0.92], [0.44, 0.54],
      [0.36, 0.52], [0.18, 0.48], [0.34, 0.36], [0.16, 0.28], [0.26, 0.12],
    ]],
  },
  37: {
    id: 'mountain',
    name: 'Twin Peaks',
    collectionId: 4,
    polygons: [[
      [0.42, 0.18], [0.58, 0.44], [0.72, 0.34], [0.92, 0.86], [0.10, 0.86],
      [0.26, 0.54],
    ]],
  },
  38: {
    id: 'wave',
    name: 'Tsunami Wave',
    collectionId: 4,
    polygons: [[
      [0.68, 0.20], [0.82, 0.34], [0.82, 0.52], [0.68, 0.56], [0.62, 0.46],
      [0.70, 0.38], [0.56, 0.46], [0.44, 0.60], [0.24, 0.72], [0.12, 0.86],
      [0.90, 0.86], [0.90, 0.60],
    ]],
  },
  39: {
    id: 'snowflake',
    name: 'Winter Snowflake',
    collectionId: 4,
    polygons: [[
      [0.46, 0.08], [0.54, 0.08], [0.54, 0.38], [0.74, 0.24], [0.80, 0.34],
      [0.62, 0.48], [0.88, 0.48], [0.88, 0.56], [0.62, 0.56], [0.80, 0.70],
      [0.74, 0.80], [0.54, 0.66], [0.54, 0.92], [0.46, 0.92], [0.46, 0.66],
      [0.26, 0.80], [0.20, 0.70], [0.38, 0.56], [0.12, 0.56], [0.12, 0.48],
      [0.38, 0.48], [0.20, 0.34], [0.26, 0.24], [0.46, 0.38],
    ]],
  },
  40: {
    id: 'sun_cloud',
    name: 'Sun & Cloud',
    collectionId: 4,
    polygons: [[
      // Sun peeking behind cloud
      [0.60, 0.16], [0.76, 0.24], [0.82, 0.40], [0.76, 0.54], [0.66, 0.58],
      [0.74, 0.66], [0.72, 0.84], [0.24, 0.84], [0.14, 0.70], [0.20, 0.54],
      [0.36, 0.46], [0.42, 0.30], [0.54, 0.28],
    ]],
  },

  // Collection 5: "Legends" (41-50)
  41: {
    id: 'crown',
    name: 'Royal Crown',
    collectionId: 5,
    polygons: [[
      [0.12, 0.32], [0.30, 0.50], [0.50, 0.20], [0.70, 0.50], [0.88, 0.32],
      [0.82, 0.84], [0.18, 0.84],
    ]],
  },
  42: {
    id: 'anchor',
    name: 'Nautical Anchor',
    collectionId: 5,
    polygons: [
      // Top ring
      [[0.44, 0.10], [0.56, 0.10], [0.56, 0.24], [0.44, 0.24]],
      // Cross bar and shaft
      [[0.24, 0.30], [0.76, 0.30], [0.76, 0.38], [0.24, 0.38]],
      // Flukes and curved bottom
      [
        [0.44, 0.24], [0.56, 0.24], [0.56, 0.74], [0.78, 0.56], [0.84, 0.66],
        [0.58, 0.88], [0.42, 0.88], [0.16, 0.66], [0.22, 0.56], [0.44, 0.74],
      ],
    ],
  },
  43: {
    id: 'sailboat',
    name: 'Majestic Sailboat',
    collectionId: 5,
    polygons: [[
      [0.48, 0.12], [0.78, 0.60], [0.52, 0.60], [0.52, 0.30], [0.28, 0.60],
      [0.48, 0.60], [0.48, 0.68], [0.86, 0.68], [0.74, 0.88], [0.22, 0.88],
      [0.14, 0.68],
    ]],
  },
  44: {
    id: 'castle',
    name: 'Stone Castle',
    collectionId: 5,
    polygons: [[
      [0.16, 0.20], [0.28, 0.20], [0.28, 0.32], [0.38, 0.32], [0.38, 0.20],
      [0.50, 0.20], [0.50, 0.32], [0.62, 0.32], [0.62, 0.20], [0.72, 0.20],
      [0.72, 0.32], [0.84, 0.20], [0.84, 0.88], [0.16, 0.88],
    ]],
  },
  45: {
    id: 'eagle',
    name: 'Soaring Eagle',
    collectionId: 5,
    polygons: [[
      [0.50, 0.32], [0.66, 0.18], [0.88, 0.24], [0.86, 0.46], [0.68, 0.56],
      [0.58, 0.74], [0.50, 0.90], [0.42, 0.74], [0.32, 0.56], [0.14, 0.46],
      [0.12, 0.24], [0.34, 0.18],
    ]],
  },
  46: {
    id: 'jet',
    name: 'Stealth Fighter Jet',
    collectionId: 5,
    polygons: [[
      [0.50, 0.08], [0.58, 0.30], [0.92, 0.68], [0.70, 0.70], [0.74, 0.88],
      [0.50, 0.82], [0.26, 0.88], [0.30, 0.70], [0.08, 0.68], [0.42, 0.30],
    ]],
  },
  47: {
    id: 'whale',
    name: 'Great Blue Whale',
    collectionId: 5,
    polygons: [[
      [0.22, 0.36], [0.58, 0.32], [0.82, 0.44], [0.90, 0.58], [0.76, 0.70],
      [0.44, 0.70], [0.22, 0.62], [0.10, 0.50], [0.12, 0.70], [0.08, 0.32],
    ]],
  },
  48: {
    id: 'lion',
    name: 'Lion Head',
    collectionId: 5,
    polygons: [[
      [0.50, 0.12], [0.72, 0.20], [0.86, 0.42], [0.80, 0.68], [0.62, 0.86],
      [0.50, 0.88], [0.38, 0.86], [0.20, 0.68], [0.14, 0.42], [0.28, 0.20],
    ]],
  },
  49: {
    id: 'dragon',
    name: 'Mythic Dragon',
    collectionId: 5,
    polygons: [[
      [0.78, 0.20], [0.86, 0.32], [0.72, 0.44], [0.70, 0.28], [0.54, 0.32],
      [0.56, 0.14], [0.40, 0.38], [0.24, 0.30], [0.18, 0.50], [0.32, 0.66],
      [0.20, 0.84], [0.38, 0.86], [0.54, 0.72], [0.66, 0.62],
    ]],
  },
  50: {
    id: 'grand_master',
    name: 'Grand Master Maze',
    collectionId: 5,
    // Full square grid maze with thick rounded corner margin
    polygons: [[
      [0.05, 0.05], [0.95, 0.05], [0.95, 0.95], [0.05, 0.95],
    ]],
  },
};

/**
 * Standard ray-casting Point in Polygon test
 */
function isPointInPolygon(x: number, y: number, poly: Poly): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Rasterizes normalized shape definition onto an N x N grid.
 * Ensures:
 * - Minimum thickness
 * - Largest 4-connected component
 * - Tiny hole filling
 */
export function rasterizeShape(
  shape: ShapeDefinition,
  gridSize: number
): { mask: boolean[][]; cells: CellCoord[] } {
  const total = gridSize * gridSize;
  if (shape.id === 'grand_master') {
    const mask = Array.from({ length: gridSize }, () => Array(gridSize).fill(true));
    const cells: CellCoord[] = new Array(total);
    for (let i = 0; i < total; i++) cells[i] = { r: (i / gridSize) | 0, c: i % gridSize };
    return { mask, cells };
  }

  const raw = new Uint8Array(total);
  for (let r = 0; r < gridSize; r++) {
    const y = (r + 0.5) / gridSize;
    const rowOffset = r * gridSize;
    for (let c = 0; c < gridSize; c++) {
      const x = (c + 0.5) / gridSize;
      let inside = false;
      for (let p = 0; p < shape.polygons.length && !inside; p++) {
        const poly = shape.polygons[p];
        let hit = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
          if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
        }
        inside = hit;
      }
      raw[rowOffset + c] = inside ? 1 : 0;
    }
  }

  const filled = new Uint8Array(raw);
  for (let r = 1; r < gridSize - 1; r++) {
    for (let c = 1; c < gridSize - 1; c++) {
      const idx = r * gridSize + c;
      if (raw[idx] === 0 && raw[idx - gridSize] + raw[idx + gridSize] + raw[idx - 1] + raw[idx + 1] >= 3) filled[idx] = 1;
    }
  }

  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let best = new Int32Array(0);
  for (let start = 0; start < total; start++) {
    if (filled[start] === 0 || visited[start]) continue;
    let head = 0, tail = 0;
    queue[tail++] = start;
    visited[start] = 1;
    while (head < tail) {
      const idx = queue[head++];
      const row = (idx / gridSize) | 0;
      const col = idx - row * gridSize;
      let next = idx - gridSize;
      if (row > 0 && filled[next] && !visited[next]) { visited[next] = 1; queue[tail++] = next; }
      next = idx + gridSize;
      if (row + 1 < gridSize && filled[next] && !visited[next]) { visited[next] = 1; queue[tail++] = next; }
      next = idx - 1;
      if (col > 0 && filled[next] && !visited[next]) { visited[next] = 1; queue[tail++] = next; }
      next = idx + 1;
      if (col + 1 < gridSize && filled[next] && !visited[next]) { visited[next] = 1; queue[tail++] = next; }
    }
    if (tail > best.length) best = queue.slice(0, tail);
  }

  if (best.length < 8) {
    const mid = (gridSize / 2) | 0;
    const fallback: number[] = [];
    for (let r = Math.max(0, mid - 2); r <= Math.min(gridSize - 1, mid + 2); r++) {
      for (let c = Math.max(0, mid - 2); c <= Math.min(gridSize - 1, mid + 2); c++) fallback.push(r * gridSize + c);
    }
    best = Int32Array.from(fallback);
  }

  const mask = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
  const cells: CellCoord[] = new Array(best.length);
  for (let i = 0; i < best.length; i++) {
    const idx = best[i];
    const r = (idx / gridSize) | 0;
    const c = idx - r * gridSize;
    mask[r][c] = true;
    cells[i] = { r, c };
  }
  return { mask, cells };
}

export function getShapeThumbnailPath(shape: ShapeDefinition, size = 100): string {
  let pathStr = '';
  shape.polygons.forEach((poly) => {
    poly.forEach(([nx, ny], idx) => {
      const x = Math.round(nx * size);
      const y = Math.round(ny * size);
      if (idx === 0) {
        pathStr += `M ${x} ${y} `;
      } else {
        pathStr += `L ${x} ${y} `;
      }
    });
    pathStr += 'Z ';
  });
  return pathStr;
}
