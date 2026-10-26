const files = import.meta.glob<string>('../assets/mdv/*.webp', { eager: true, import: 'default' })
const file = (name: string) => files[`../assets/mdv/${name}.webp`]

export type Pic = { src: string; srcSet?: string }

export const one = (name: string): Pic => ({ src: file(name) })
export const two = (name: string, small: number, large: number): Pic => ({
  src: file(`${name}-${small}`),
  srcSet: `${file(`${name}-${small}`)} ${small}w, ${file(`${name}-${large}`)} ${large}w`,
})

export const FLEX = {
  intro:
    'Flexible stone is an eco-friendly wall finish made from natural stone powder and inorganic minerals. Cured at low temperature, it becomes a lightweight, flexible and lower-carbon surface that still looks and feels like stone.',
  band: two('fs-curve', 1200, 2100),
  bandCaption: 'One continuous stone skin, bent around the curve',
  cover: two('fs-cover', 1200, 2000),
  layersImage: one('fs-layers'),
  layers: [
    {
      n: '01',
      title: 'Inorganic printing layer',
      text: 'Creates natural textures with inorganic printing technology.',
    },
    {
      n: '02',
      title: 'Natural stone powder surface',
      text: 'Inorganic mineral powder, natural marble powder, water-based polymer emulsion and inorganic pigments.',
    },
    {
      n: '03',
      title: 'Fibreglass mesh backing',
      text: 'Adds strength and structural stability to every sheet.',
    },
  ],
  highlights: [
    { value: '2–3', unit: 'mm', label: 'Thickness' },
    { value: '3–6', unit: 'kg/m²', label: 'Weight' },
    { value: 'A', unit: '', label: 'Fire rating' },
    { value: '−30–80', unit: '°C', label: 'Temperature range' },
  ],
  features: [
    {
      n: '01',
      title: 'Natural stone powder',
      text: 'Made with natural stone powder and inorganic minerals.',
      pic: one('fs-powder'),
      size: 'tall',
    },
    {
      n: '02',
      title: 'A-class fire rated',
      text: 'Reliable non-combustible performance for safer applications.',
      pic: one('fs-fire'),
      size: 'small',
    },
    {
      n: '03',
      title: 'Exterior waterproof',
      text: 'Stable protection against rain, moisture and changing weather.',
      pic: one('fs-rain'),
      size: 'small',
    },
    {
      n: '04',
      title: 'Lightweight, easy to handle',
      text: 'Only a fraction of the weight of traditional stone.',
      pic: one('fs-handling'),
      size: 'small',
    },
    {
      n: '05',
      title: 'Bends around curves',
      text: 'Wraps smooth columns and broad curves with ease.',
      pic: one('pj11-d1'),
      size: 'small',
    },
    {
      n: '06',
      title: 'Fast adhesive installation',
      text: 'Direct bonding reduces installation time and labour.',
      pic: one('fs-adhesive'),
      size: 'small',
    },
    {
      n: '07',
      title: 'Inkjet printed finishes',
      text: 'High-definition printing reproduces refined mineral textures.',
      pic: one('fs-inkjet'),
      size: 'small',
    },
    {
      n: '08',
      title: 'Many inorganic designs',
      text: 'A diverse collection of natural textures for exterior architecture.',
      pic: one('fs-designs'),
      size: 'small',
    },
  ],
  specs: [
    { label: 'Standard sizes', value: '600 × 1200 · 1200 × 2400 · 1200 × 3000 mm' },
    { label: 'Thickness', value: '2–3 mm, depending on the mould' },
    { label: 'Weight', value: '3–6 kg/m²' },
    { label: 'Decorative finish', value: 'Inorganic printing · Solid colour' },
    { label: 'Core material', value: 'Natural mineral powders that recreate authentic stone textures, with recycled mineral content' },
    { label: 'Structure', value: 'Microporous and breathable: lets moisture vapour escape from the wall' },
    { label: 'Fire rating', value: 'A' },
    { label: 'Moisture resistance', value: 'Excellent' },
    { label: 'Water, acid and alkali', value: 'Resists immersion in acidic or alkaline liquids' },
    { label: 'Temperature range', value: '−30 °C to 80 °C' },
    { label: 'Durability', value: '10–20 years' },
    { label: 'Cutting', value: 'Professional cutting tools or a heavy-duty utility knife' },
    { label: 'Installation', value: 'Adhesive or tile adhesive' },
    { label: 'Features', value: 'High-rise friendly · Flexible and bendable · Easy installation' },
  ],
}

export type SectorId = 'residential' | 'hospitality' | 'public' | 'workplace' | 'fnb' | 'retail'

export const SECTORS: { id: SectorId; name: string; text: string; cover: Pic }[] = [
  {
    id: 'residential',
    name: 'Residential',
    text: 'Villa and residential renovations for interior and exterior spaces, with a lightweight, durable and versatile finish.',
    cover: two('sector-residential', 900, 1600),
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    text: 'Hotel renovations with distinctive façades: natural texture, durability and design flexibility.',
    cover: two('sector-hospitality', 900, 1600),
  },
  {
    id: 'public',
    name: 'Public',
    text: 'Schools, hospitals, museums and community centres with durable, natural surfaces inside and out.',
    cover: two('sector-public', 900, 1600),
  },
  {
    id: 'workplace',
    name: 'Workplace',
    text: 'Office interiors and commercial façades with natural texture, light installation and indoor–outdoor performance.',
    cover: two('sector-workplace', 900, 1600),
  },
  {
    id: 'fnb',
    name: 'Food & Beverage',
    text: 'Restaurants, cafés and beverage shops with natural textures and fast, flexible installation.',
    cover: two('sector-fnb', 900, 1600),
  },
  {
    id: 'retail',
    name: 'Retail',
    text: 'Fashion boutiques, cosmetics stores and flagships with natural texture and distinctive commercial character.',
    cover: two('sector-retail', 900, 1600),
  },
]

export type CaseStudy = {
  id: string
  title: string
  sector: SectorId
  description: string
  area: number
  panels: number
  code: string
  main: Pic
  mainCaption: string
  details: { pic: Pic; caption: string }[]
  texture: string
}

const study = (
  page: number,
  data: Omit<CaseStudy, 'id' | 'main' | 'details' | 'texture'> & { captions: string[] },
): CaseStudy => {
  const { captions, ...rest } = data
  return {
    ...rest,
    id: `p${page}`,
    main: two(`pj${page}-main`, 1200, 2040),
    details: captions.map((caption, i) => ({ pic: one(`pj${page}-d${i + 1}`), caption })),
    texture: file(`pj${page}-tex`),
  }
}

export const CASES: CaseStudy[] = [
  study(11, {
    title: 'Curved Façade Villa',
    sector: 'residential',
    description:
      'White stone panels create a clean and elegant villa exterior. Lightweight and weather-resistant, they offer lasting beauty with easy installation.',
    area: 750,
    panels: 286,
    code: 'DY-9013-1',
    mainCaption: 'Main residence',
    captions: ['Exterior wall', 'Hallway', 'Bedroom'],
  }),
  study(36, {
    title: 'Retail Flagship Store',
    sector: 'retail',
    description:
      'A cohesive stone finish brings the façade and the interior together: lightweight, waterproof and easy to install.',
    area: 1200,
    panels: 457,
    code: 'DY-DS-104',
    mainCaption: 'Exterior façade',
    captions: ['Retail interior', 'Lounge area'],
  }),
  study(18, {
    title: 'Museum Exterior Walls',
    sector: 'public',
    description:
      'A museum wrapped in warm, stone-textured walls around a reflecting pool. Flexible stone is lightweight, weather-resistant and naturally textured.',
    area: 2300,
    panels: 873,
    code: 'DY-9015-3',
    mainCaption: 'Public courtyard',
    captions: ['Central atrium', 'Interior passage', 'Museum exterior'],
  }),
  study(29, {
    title: 'Omakase Restaurant',
    sector: 'fnb',
    description:
      'White stone-textured walls bring a calm, refined character to a Japanese dining space, with a natural finish and quick, efficient installation.',
    area: 180,
    panels: 70,
    code: 'DY-5005-4',
    mainCaption: 'Restaurant entrance',
    captions: ['Dining counter', 'Side wall of the bar', 'Niche wall'],
  }),
  study(13, {
    title: 'Brand Hotel',
    sector: 'hospitality',
    description:
      'A refreshed exterior gives the resort hotel a natural and modern identity. Flexible stone is lightweight, waterproof and weather-resistant.',
    area: 1235,
    panels: 468,
    code: 'DY-2001-1',
    mainCaption: 'Hotel façade',
    captions: ['Door design', 'Terrace', 'Feature wall'],
  }),
  study(38, {
    title: 'Trendy Clothing Store',
    sector: 'retail',
    description:
      'A flagship with fluid curves and an immersive shopping experience. Flexible stone is lightweight, bendable and easy to install.',
    area: 900,
    panels: 345,
    code: 'DY-6015-2',
    mainCaption: 'Sales floor',
    captions: ['Hallway', 'Spiral staircase'],
  }),
  study(25, {
    title: 'Grade-A Office Building',
    sector: 'workplace',
    description:
      'A refreshed exterior that reflects a design studio’s creative identity. Flexible stone is lightweight, weather-resistant and easy to install.',
    area: 1800,
    panels: 683,
    code: 'DY-9020-3',
    mainCaption: 'Exterior wall',
    captions: ['Office area', 'Skylight', 'Rest area'],
  }),
  study(9, {
    title: 'Villa Façade',
    sector: 'residential',
    description:
      'Flexible stone brings natural texture and refined character to villa façades, with lightweight construction.',
    area: 600,
    panels: 230,
    code: 'PT-9013-2',
    mainCaption: 'Exterior walls',
    captions: ['Feature wall', 'Exterior wall', 'Exterior wall'],
  }),
  study(35, {
    title: 'Korean Fashion Store',
    sector: 'retail',
    description:
      'A contemporary Korean streetwear store with a bold retail identity. Flexible stone adds natural texture with easy installation.',
    area: 700,
    panels: 266,
    code: 'DY-9090-16',
    mainCaption: 'Store interior',
    captions: ['Wall design', 'Display stand', 'Clothing rails'],
  }),
  study(15, {
    title: 'Mountain Resort Hotel',
    sector: 'hospitality',
    description:
      'A mountain resort with refined indoor and outdoor spaces. Flexible stone is lightweight, weather-resistant and naturally textured.',
    area: 1300,
    panels: 493,
    code: 'DY-9013-1',
    mainCaption: 'Hotel façade',
    captions: ['Dusk view', 'Lounge', 'Feature wall'],
  }),
  study(23, {
    title: 'Grade-A Office Lobby',
    sector: 'workplace',
    description:
      'A premium Grade-A office designed for a professional workplace experience. Flexible stone gives a refined finish with light, fast installation.',
    area: 1600,
    panels: 609,
    code: 'DY-9090-38',
    mainCaption: 'Lobby lounge',
    captions: ['Corridor', 'Lobby sculpture', 'Lobby walls'],
  }),
  study(28, {
    title: 'Vintage Restaurant',
    sector: 'fnb',
    description:
      'Textured stone walls blend with warm wood, classic furniture and soft lighting, preserving the restaurant’s timeless character.',
    area: 550,
    panels: 190,
    code: 'DY-9042-3',
    mainCaption: 'Long wall',
    captions: ['Booth seating wall', 'Dining room'],
  }),
  study(37, {
    title: 'Skincare Flagship Store',
    sector: 'retail',
    description:
      'A calm and refined skincare retail space. Flexible stone adds natural texture with light, easy installation.',
    area: 350,
    panels: 134,
    code: 'DY-9024',
    mainCaption: 'Storefront',
    captions: ['Display cabinet', 'Shop window', 'Window display'],
  }),
  study(19, {
    title: 'Community Service Center',
    sector: 'public',
    description:
      'A welcoming public space for everyday community services. Flexible stone adds natural texture, durability and easy maintenance.',
    area: 2000,
    panels: 759,
    code: 'DY-9015-1',
    mainCaption: 'Main building',
    captions: ['Exterior wall', 'Arched wall'],
  }),
  study(8, {
    title: 'Private Living Residence',
    sector: 'residential',
    description:
      'Natural travertine textures bring warmth and timeless character to a villa renovation, connecting modern design and nature.',
    area: 800,
    panels: 305,
    code: 'DY-9090-4',
    mainCaption: 'Exterior wall',
    captions: ['Entrance', 'Courtyard façade', 'Street façade'],
  }),
]

export const PANEL_SIZE = '1200 × 2400 mm'
