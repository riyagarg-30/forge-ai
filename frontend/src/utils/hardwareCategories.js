/**
 * Category-specific hardware blueprint data for the report page's
 * deterministic Prototype Preview. No AI/image generation — each category
 * is a hand-authored set of SVG shape primitives (rects/paths/circles) so
 * the silhouette actually resembles the product type (a backpack with
 * straps and compartments, a bottle, a helmet, etc.) instead of one
 * generic rounded rectangle for every hardware idea.
 *
 * Shape kinds: 'rect' {x,y,w,h,rx?}, 'circle' {cx,cy,r,filled?},
 * 'ellipse' {cx,cy,rx,ry}, 'path' {d, anchor?}. Each shape may carry a
 * `label` used for numbered callouts; shapes without a label are pure
 * silhouette detail (straps, seams, vents) and never get a callout.
 */

export const HARDWARE_CATEGORIES = {
  backpack: {
    signals: ['backpack', 'rucksack', 'daypack', 'knapsack'],
    dimensions: { length: '48', width: '32', height: '20', unit: 'cm' },
    weight: '1.8 kg',
    batteryLife: '10 days standby (beacon + sensors)',
    materials: ['Ripstop nylon fabric', 'Aluminum frame', 'ABS plastic hardware'],
    wearable: true,
    front: [
      { kind: 'rect', x: 65, y: 20, w: 90, h: 145, rx: 18 },
      { kind: 'path', d: 'M 75 22 C 55 45, 55 100, 65 165', anchor: { x: 60, y: 100 } },
      { kind: 'path', d: 'M 145 22 C 165 45, 165 100, 155 165' },
      { kind: 'rect', x: 78, y: 95, w: 64, h: 34, rx: 4, grid: true, label: 'Solar panel' },
      { kind: 'rect', x: 82, y: 138, w: 56, h: 22, rx: 4, label: 'Battery compartment' },
      { kind: 'path', d: 'M 110 20 L 110 4', anchor: { x: 110, y: 8 } },
      { kind: 'circle', cx: 110, cy: 3, r: 3.5, label: 'GPS antenna' },
      { kind: 'circle', cx: 138, cy: 30, r: 5, label: 'SOS beacon' },
      { kind: 'rect', x: 72, y: 32, w: 30, h: 40, rx: 6, label: 'First aid kit' },
    ],
    side: [
      { kind: 'rect', x: 85, y: 20, w: 45, h: 145, rx: 16, label: 'Main compartment' },
      { kind: 'path', d: 'M 95 22 C 80 45, 80 100, 90 165' },
      { kind: 'rect', x: 92, y: 60, w: 18, h: 50, rx: 5, label: 'Water purifier module' },
      { kind: 'circle', cx: 108, cy: 6, r: 3 },
    ],
    top: [
      { kind: 'ellipse', cx: 110, cy: 110, rx: 46, ry: 30, label: 'Main compartment' },
      { kind: 'circle', cx: 110, cy: 110, r: 4, label: 'GPS antenna' },
    ],
    defaultParts: [
      'Main compartment', 'GPS antenna', 'Solar panel', 'Battery compartment',
      'Shoulder strap', 'SOS beacon', 'First aid kit', 'Water purifier module',
    ],
  },

  bottle: {
    signals: ['bottle', 'flask', 'tumbler', 'hydration'],
    dimensions: { length: '7', width: '7', height: '24', unit: 'cm' },
    weight: '340 g',
    batteryLife: '30 days standby',
    materials: ['Stainless steel', 'Silicone seal', 'ABS plastic cap'],
    wearable: false,
    front: [
      { kind: 'path', d: 'M 88 30 Q 88 20 100 20 L 120 20 Q 132 20 132 30 L 132 175 Q 132 190 110 190 Q 88 190 88 175 Z', anchor: { x: 110, y: 100 }, label: 'Vacuum-insulated body' },
      { kind: 'rect', x: 96, y: 8, w: 28, h: 14, rx: 4, label: 'Lid module' },
      { kind: 'rect', x: 92, y: 100, w: 36, h: 10, rx: 2, label: 'LED indicator ring' },
      { kind: 'circle', cx: 110, cy: 150, r: 5, label: 'Temperature sensor' },
    ],
    side: [
      { kind: 'path', d: 'M 95 30 Q 95 22 103 22 L 117 22 Q 125 22 125 30 L 125 175 Q 125 186 110 186 Q 95 186 95 175 Z' },
      { kind: 'rect', x: 100, y: 8, w: 20, h: 14, rx: 3 },
    ],
    top: [
      { kind: 'circle', cx: 110, cy: 110, r: 24, label: 'Lid module' },
      { kind: 'circle', cx: 110, cy: 110, r: 10 },
    ],
    defaultParts: [
      'Vacuum-insulated body', 'Temperature sensor', 'LED indicator ring',
      'Battery compartment', 'Lid module', 'UV-C sterilizer',
    ],
  },

  helmet: {
    signals: ['helmet', 'headgear', 'visor'],
    dimensions: { length: '28', width: '22', height: '24', unit: 'cm' },
    weight: '950 g',
    batteryLife: '8 hours active use',
    materials: ['ABS plastic shell', 'EPS foam liner', 'Carbon fiber reinforcement'],
    wearable: true,
    front: [
      { kind: 'path', d: 'M 60 110 Q 60 40 110 35 Q 160 40 160 110 L 160 130 Q 160 150 110 150 Q 60 150 60 130 Z', anchor: { x: 110, y: 90 }, label: 'Outer shell' },
      { kind: 'rect', x: 78, y: 95, w: 64, h: 30, rx: 6, label: 'HUD module' },
      { kind: 'path', d: 'M 60 130 Q 55 160 70 175', anchor: { x: 60, y: 155 }, label: 'Chin strap' },
      { kind: 'path', d: 'M 160 130 Q 165 160 150 175' },
      { kind: 'circle', cx: 145, cy: 70, r: 5, label: 'Bluetooth intercom' },
    ],
    side: [
      { kind: 'path', d: 'M 75 115 Q 75 45 115 42 Q 145 55 145 115 L 145 132 Q 130 148 105 148 Q 85 145 75 132 Z' },
      { kind: 'circle', cx: 100, cy: 70, r: 4, label: 'Ventilation ports' },
      { kind: 'circle', cx: 120, cy: 70, r: 4 },
      { kind: 'rect', x: 128, y: 100, w: 12, h: 18, rx: 3, label: 'Battery pack' },
    ],
    top: [
      { kind: 'ellipse', cx: 110, cy: 110, rx: 44, ry: 34, label: 'Outer shell' },
      { kind: 'circle', cx: 90, cy: 95, r: 3, label: 'Ventilation ports' },
      { kind: 'circle', cx: 130, cy: 95, r: 3 },
    ],
    defaultParts: [
      'Outer shell', 'HUD module', 'Bluetooth intercom', 'Battery pack',
      'Chin strap', 'Ventilation ports',
    ],
  },

  wearable: {
    signals: ['wearable', 'smartwatch', 'wristband', 'fitness band', 'smart ring'],
    dimensions: { length: '4.2', width: '3.6', height: '1.1', unit: 'cm' },
    weight: '38 g',
    batteryLife: '5 days',
    materials: ['Aluminum housing', 'Silicone band', 'Sapphire glass'],
    wearable: true,
    front: [
      { kind: 'rect', x: 82, y: 65, w: 56, h: 66, rx: 14, label: 'Display module' },
      { kind: 'rect', x: 90, y: 73, w: 40, h: 50, rx: 6, label: 'Sapphire glass' },
      { kind: 'path', d: 'M 96 65 L 90 20 Q 110 12 130 20 L 124 65', label: 'Silicone band' },
      { kind: 'path', d: 'M 96 131 L 90 176 Q 110 184 130 176 L 124 131' },
      { kind: 'circle', cx: 138, cy: 98, r: 3, label: 'Heart-rate sensor' },
    ],
    side: [
      { kind: 'rect', x: 96, y: 78, w: 28, h: 44, rx: 8 },
      { kind: 'circle', cx: 96, cy: 100, r: 4, label: 'Heart-rate sensor' },
      { kind: 'rect', x: 100, y: 88, w: 12, h: 10, rx: 2, label: 'Battery cell' },
    ],
    top: [
      { kind: 'rect', x: 82, y: 82, w: 56, h: 56, rx: 14, label: 'Display module' },
      { kind: 'circle', cx: 138, cy: 92, r: 3, label: 'Haptic motor' },
    ],
    defaultParts: [
      'Display module', 'Heart-rate sensor', 'Battery cell', 'Haptic motor', 'Charging contacts',
    ],
  },

  drone: {
    signals: ['drone', 'uav', 'quadcopter', 'aerial vehicle'],
    dimensions: { length: '35', width: '35', height: '12', unit: 'cm' },
    weight: '900 g',
    batteryLife: '28 minutes flight time',
    materials: ['Carbon fiber frame', 'ABS plastic shell', 'Aluminum motor mounts'],
    wearable: false,
    front: [
      { kind: 'ellipse', cx: 110, cy: 110, rx: 34, ry: 20, label: 'Flight controller' },
      { kind: 'path', d: 'M 76 110 L 40 90', anchor: { x: 45, y: 92 } },
      { kind: 'path', d: 'M 144 110 L 180 90' },
      { kind: 'path', d: 'M 76 110 L 40 130' },
      { kind: 'path', d: 'M 144 110 L 180 130' },
      { kind: 'circle', cx: 40, cy: 90, r: 12, label: 'Motor + propeller' },
      { kind: 'circle', cx: 180, cy: 90, r: 12 },
      { kind: 'circle', cx: 40, cy: 130, r: 12 },
      { kind: 'circle', cx: 180, cy: 130, r: 12 },
      { kind: 'rect', x: 100, y: 95, w: 20, h: 12, rx: 3, label: 'Camera gimbal' },
    ],
    side: [
      { kind: 'rect', x: 80, y: 100, w: 60, h: 22, rx: 6, label: 'Flight controller' },
      { kind: 'rect', x: 92, y: 122, w: 12, h: 10, rx: 2, label: 'Battery pack' },
      { kind: 'circle', cx: 130, cy: 128, r: 5, label: 'Camera gimbal' },
    ],
    top: [
      { kind: 'ellipse', cx: 110, cy: 110, rx: 34, ry: 20, label: 'Flight controller' },
      { kind: 'circle', cx: 40, cy: 90, r: 12, label: 'Motor + propeller' },
      { kind: 'circle', cx: 180, cy: 90, r: 12 },
      { kind: 'circle', cx: 40, cy: 130, r: 12 },
      { kind: 'circle', cx: 180, cy: 130, r: 12 },
      { kind: 'circle', cx: 90, cy: 108, r: 3, label: 'GPS module' },
    ],
    defaultParts: [
      'Flight controller', 'Camera gimbal', 'Battery pack', 'Motor + propeller',
      'GPS module', 'Obstacle sensors',
    ],
  },

  device: {
    signals: [],
    dimensions: { length: '14', width: '8', height: '3', unit: 'cm' },
    weight: '220 g',
    batteryLife: '12 hours active use',
    materials: ['ABS plastic housing', 'Aluminum accents'],
    wearable: false,
    front: [
      { kind: 'rect', x: 55, y: 60, w: 110, h: 70, rx: 14, label: 'Main housing' },
      { kind: 'rect', x: 68, y: 72, w: 40, h: 46, rx: 4, label: 'Sensor array' },
      { kind: 'circle', cx: 148, cy: 78, r: 4, label: 'Status LED' },
      { kind: 'rect', x: 130, y: 100, w: 20, h: 8, rx: 2, label: 'Charging port' },
    ],
    side: [
      { kind: 'rect', x: 75, y: 90, w: 70, h: 26, rx: 8, label: 'Main housing' },
      { kind: 'rect', x: 85, y: 96, w: 16, h: 12, rx: 2, label: 'Battery pack' },
    ],
    top: [
      { kind: 'rect', x: 55, y: 75, w: 110, h: 60, rx: 14, label: 'Main housing' },
      { kind: 'rect', x: 68, y: 87, w: 40, h: 36, rx: 4, label: 'Sensor array' },
    ],
    defaultParts: ['Main housing', 'Sensor array', 'Battery pack', 'Status LED', 'Charging port'],
  },
}

/** Detects the closest hardware category from the idea's own text — no AI, just keyword signals, falling back to a generic labeled device. */
export function detectHardwareCategory({ ideaText, productStrategy, coreFeatures }) {
  const haystack = [ideaText, productStrategy, ...(coreFeatures || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  for (const [key, category] of Object.entries(HARDWARE_CATEGORIES)) {
    if (category.signals.some((signal) => haystack.includes(signal))) return key
  }
  return 'device'
}

/** Grounds the callout list in the Product Agent's own features first, then fills in with category-typical parts (so a genuinely detailed idea still shows its own components, not just generic defaults). */
export function mergeHardwareParts(coreFeatures, defaultParts) {
  const features = coreFeatures || []
  const lowerFeatures = features.map((f) => f.toLowerCase())
  const extras = defaultParts.filter(
    (part) => !lowerFeatures.some((f) => f.includes(part.toLowerCase().split(' ')[0]))
  )
  return [...features, ...extras].slice(0, 8)
}
