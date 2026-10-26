export const unsplash = (id: string, w = 1600, q = 78) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`

export const srcSet = (id: string, widths = [640, 1024, 1600, 2200]) =>
  widths.map((w) => `${unsplash(id, w)} ${w}w`).join(', ')

export const isLocal = (src: string) => src.includes('/') || src.startsWith('data:')

export const BRAND = 'wallcraftpanels'
// "wallcraft" | "panels": the second word is set in a softer tone so the name reads at a glance
export const BRAND_SPLIT = 9

import { two } from './mdv'

const catalogue = import.meta.glob<string>('../assets/kuai/*.webp', { eager: true, import: 'default' })
const kuai = (name: string) => catalogue[`../assets/kuai/${name}.webp`]

export const MAT = {
  metalRetail: kuai('metal-retail'),
  metalDisplay: kuai('metal-display'),
  metalWave: kuai('metal-wave'),
  metalCanopy: kuai('metal-canopy'),
  metalChampagne: kuai('metal-champagne'),
  metalBronze: kuai('metal-bronze'),
  metalSalon: kuai('metal-salon'),
  metalGoldDesk: kuai('metal-gold-desk'),
  marbleLiving: kuai('marble-living'),
  stoneBoutique: kuai('stone-boutique'),
  stoneBlackWall: kuai('stone-black-wall'),
  stoneStorefront: kuai('stone-storefront'),
  stoneFacade: kuai('stone-facade'),
  stoneBath: kuai('stone-bath'),
  stoneBar: kuai('stone-bar'),
  stoneWood: kuai('stone-wood'),
  graniteWall: kuai('granite-wall'),
  travertineCafe: kuai('travertine-cafe'),
  travertineColumn: kuai('travertine-column'),
  travertineReception: kuai('travertine-reception'),
  travertineBoutique: kuai('travertine-boutique'),
  woodDesk: kuai('wood-desk'),
  woodLiving: kuai('wood-living'),
  woodPanelRoom: kuai('wood-panel-room'),
  woodSofa: kuai('wood-sofa'),
  navyBedroom: kuai('navy-bedroom'),
  geoWhiteFlutes: kuai('geo-white-flutes'),
  geoFireplace: kuai('geo-fireplace'),
  geoArch: kuai('geo-arch'),
  geoCurvedWood: kuai('geo-curved-wood'),
  geoDarkStone: kuai('geo-dark-stone'),
  geoFireside: kuai('geo-fireside'),
  geoLivingDark: kuai('geo-living-dark'),
  geoLivingGrey: kuai('geo-living-grey'),
  geoOffice: kuai('geo-office'),
  geoRounded: kuai('geo-rounded'),
  geoStair: kuai('geo-stair'),
  texGranite: kuai('tex-granite'),
  texDaisur: kuai('tex-daisur'),
} as const

export const SWATCH_IMG = (name: string) => kuai(`sw-${name}`)

const FLEX_COVER = two('fs-cover', 1200, 2000)
const MUSEUM = two('pj18-main', 1200, 2040)
const OMAKASE = two('pj29-main', 1200, 2040)

export const TEXTURE = {
  walnut: 'photo-1736506159776-22ca388780fa',
  straight: 'photo-1620671716215-b2c6609996fe',
  fabric: 'photo-1686806374120-e7ae3f19801d',
  travertine: 'photo-1648639035105-6bce23c55b67',
} as const

export const IMG = {
  retail: MAT.travertineBoutique,
} as const

export const NAV = [
  { label: 'Materials', href: '#materials' },
  { label: 'Flexible stone', href: '#flexible-stone' },
  { label: 'Boutique', href: '#boutique' },
  { label: 'Sketch to render', href: '#studio' },
  { label: 'Performance', href: '#performance' },
  { label: 'Projects', href: '#projects' },
]

export type FamilyId = 'wood' | 'aluminium' | 'stone' | 'granite' | 'profile'

export type Swatch = {
  id: string
  name: string
  code: string
  family: FamilyId
  texture: string
}

const sw = (family: FamilyId, code: string, name: string, file: string): Swatch => ({
  id: code.toLowerCase().replace(/[^a-z0-9]/g, ''),
  name,
  code,
  family,
  texture: SWATCH_IMG(file),
})

export const SWATCHES: Swatch[] = [
  sw('wood', 'LPSW1146', 'Classic Ceder', 'classic-ceder'),
  sw('wood', 'LPSW1147', 'Valencia Maple', 'valencia-maple'),
  sw('wood', 'LPSW1150', 'Safari Cedar', 'safari-cedar'),
  sw('wood', 'LPSW1152', 'Twilight Grandis', 'twilight-grandis'),
  sw('wood', 'LPSW1160', 'Desert Walnut', 'desert-walnut'),
  sw('wood', 'LPSW1161', 'Manhattan Walnut', 'manhattan-walnut'),
  sw('wood', 'LPSW1163', 'History Oak', 'history-oak'),
  sw('wood', 'LPSW1187', 'Coastal Elmwood', 'coastal-elmwood'),
  sw('wood', 'LPSW1190', 'Royal Classic Oak', 'royal-classic-oak'),
  sw('wood', 'LPSW2108', 'Harvest Ebony', 'harvest-ebony'),
  sw('wood', 'LPSW2118', 'Cocoa Walnut', 'cocoa-walnut'),
  sw('wood', 'LPSW2120', 'Stone Black Oak', 'stone-black-oak'),

  sw('aluminium', 'LPMG10017', 'Meteor Silver', 'meteor-silver'),
  sw('aluminium', 'LPMG10010', 'Laser Silver', 'laser-silver'),
  sw('aluminium', 'LPMG10009', 'Laser Gold', 'laser-gold'),
  sw('aluminium', 'LPMG10021', 'Meteor Gold', 'meteor-gold'),
  sw('aluminium', 'LPMO9002H', 'Antique Brass', 'antique-brass'),
  sw('aluminium', 'LPMO9001H', 'Oxidation White', 'oxidation-white'),
  sw('aluminium', 'LPMG10007', 'Steel Grey', 'steel-grey'),
  sw('aluminium', 'LPMG10020', 'Filar Grey', 'filar-grey'),
  sw('aluminium', 'LPMG10008', 'Blossom Silver', 'blossom-silver'),
  sw('aluminium', 'LPMD6008H', 'Meteor Silver Silk', 'meteor-silver-silk'),
  sw('aluminium', 'LPMG4008', 'Silver Line', 'silver-line'),
  sw('aluminium', 'LPMG6001', 'Clear Mirror', 'clear-mirror'),
  sw('aluminium', 'LPMG4002', 'Sepia', 'sepia'),
  sw('aluminium', 'LPMB5011', 'Honey Reddish-brown', 'copper'),
  sw('aluminium', 'LPG12002', 'Starlight Camouflage', 'starlight-camouflage'),
  sw('aluminium', 'LPG12004', 'Velvet Ink Shadow', 'velvet-ink'),

  sw('stone', 'LPSS4391', 'Yellow Cave', 'yellow-cave'),
  sw('stone', 'LPSS1341', 'Carrara Marble', 'carrara-marble'),
  sw('stone', 'LPSS3301', 'Ashes Cream', 'ashes-cream'),
  sw('stone', 'LPSS2303', 'Semplice White', 'semplice-white'),
  sw('stone', 'LPSS2301', 'Ice Field', 'ice-field'),
  sw('stone', 'LPSS3304', 'Cara Cata', 'cara-cata'),
  sw('stone', 'LPSS3310', 'Moussy', 'moussy'),
  sw('stone', 'LPSS3309', 'Itier Grey', 'itier-grey'),
  sw('stone', 'LPSS3308', 'Puppe Grey', 'puppe-grey'),
  sw('stone', 'LPSS13114', 'Martian Stone', 'martian-stone'),
  sw('stone', 'IT-D02', 'Roca Grey Travertine', 'roca-travertine'),
  sw('stone', 'IT-D01', 'Railay Travertine', 'railay-travertine'),
  sw('stone', 'IT-LL14', 'River Crossing Slab', 'river-slab'),
  sw('stone', 'SS21', 'Volcanic Black', 'volcanic-black'),

  sw('granite', 'LPSS1330', 'Aura Grey', 'aura-grey'),
  sw('granite', 'LPSS1331', 'Star Rock', 'star-rock'),
  sw('granite', 'LPSS1343', 'Light Terrazzo', 'light-terrazzo'),
  sw('granite', 'LPSS1337', 'Rudyte', 'rudyte'),
  sw('granite', 'LPSS1345', 'Griotte Grey', 'griotte-grey'),
  sw('granite', 'LPSS2302', 'Baikal', 'baikal'),
  sw('granite', 'LPSS3302', 'Gardenar Grey', 'gardenar-grey'),
  sw('granite', 'LPSS3303', 'Galactic Desert', 'galactic-desert'),
  sw('granite', 'LPMPFS3318', 'Yunxi Elegant Grey', 'yunxi-grey'),
  sw('granite', 'IT-LL15', 'Daisur White', 'daisur-white'),
  sw('granite', 'IT-LL13', 'Lantas Stone', 'lantas-stone'),
  sw('granite', 'SS51', 'Granite Chip', 'granite-chip'),
]

export type Profile = { code: string; size: string; shape: 'flute' | 'rib' | 'wave' | 'scoop' | 'flat' | 'round' }

export const PROFILES: Profile[] = [
  { code: 'ELP14014', size: '149 × 14 mm', shape: 'flute' },
  { code: 'ELP16815', size: '179 × 14.5 mm', shape: 'round' },
  { code: 'ELP16313', size: '172 × 13 mm', shape: 'wave' },
  { code: 'ELP18018H', size: '191 × 18 mm', shape: 'rib' },
  { code: 'ELP11726', size: '129 × 26 mm', shape: 'rib' },
  { code: 'ELP12025', size: '130 × 25 mm', shape: 'rib' },
  { code: 'ELP10033', size: '109 × 33 mm', shape: 'scoop' },
  { code: 'ELP8221', size: '87 × 21 mm', shape: 'scoop' },
  { code: 'ELP19213', size: '200 × 13 mm', shape: 'wave' },
  { code: 'ELP15418', size: '170 × 18 mm', shape: 'flat' },
  { code: 'ELP30030', size: '320 × 30 mm', shape: 'flat' },
  { code: 'ELP4016', size: '51 × 16 mm', shape: 'scoop' },
]

export type SampleItem = {
  id: string
  name: string
  code: string
  family: FamilyId
  texture?: string
  shape?: Profile['shape']
}

export const profileId = (code: string) => code.toLowerCase()

export const SAMPLE_INDEX: Record<string, SampleItem> = Object.fromEntries([
  ...SWATCHES.map((s) => [s.id, s] as const),
  ...PROFILES.map(
    (p) => [profileId(p.code), { id: profileId(p.code), name: `${p.size} profile`, code: p.code, family: 'profile', shape: p.shape }] as const,
  ),
])

export type Family = {
  id: FamilyId
  index: string
  name: string
  short: string
  line: string
  description: string
  image: string
  imageSet?: string
  gallery: { src: string; srcSet?: string; caption: string }[]
  facts: { value: string; label: string }[]
  tone: string
}

export const FAMILIES: Family[] = [
  {
    id: 'wood',
    index: '01',
    name: 'Wood',
    short: 'Wood grain',
    line: 'Warmth, without the upkeep.',
    description:
      'From the original colour of the grain to tones that express a personality. Wood-grain surfaces from pale maple and cedar to walnut and ebony, laminated with a fine tactile texture that reads and feels like veneer.',
    image: MAT.woodPanelRoom,
    gallery: [
      { src: MAT.woodPanelRoom, caption: 'Dressing room · LPSW1187 Coastal Elmwood' },
      { src: MAT.woodLiving, caption: 'Living wall · LPSW2117 Camden Oak' },
      { src: MAT.woodDesk, caption: 'Study · LPSW2118 Cocoa Walnut' },
    ],
    facts: [
      { value: '31', label: 'Wood-grain finishes' },
      { value: 'Flex', label: 'Bends with the wall' },
      { value: 'Matte', label: 'Veneer-like touch' },
    ],
    tone: '#8a5a3b',
  },
  {
    id: 'aluminium',
    index: '02',
    name: 'Aluminium',
    short: 'Metal texture',
    line: 'Soft light. Hard lines.',
    description:
      'The soft, diffuse reflection of the metal picks up the colour of the space around it. Brushed silver, laser gold, antique brass and oxidised patinas in a light panel that saves time and labour on site, with an installed effect that is simply striking.',
    image: MAT.metalRetail,
    gallery: [
      { src: MAT.metalRetail, caption: 'Flagship · LPMG10017 Meteor Silver' },
      { src: MAT.metalChampagne, caption: 'Gallery wall · LPMG10009 Laser Gold' },
      { src: MAT.metalWave, caption: 'Showroom · LPMG6006H Matt Wave' },
    ],
    facts: [
      { value: '30', label: 'Metal finishes' },
      { value: 'Light', label: 'Saves time and labour' },
      { value: 'Flex', label: 'Wraps columns and curves' },
    ],
    tone: '#9aa0a6',
  },
  {
    id: 'stone',
    index: '03',
    name: 'Stone',
    short: 'Stone texture',
    line: 'The charm of stone. A fraction of the weight.',
    description:
      'The inherent texture and charm of stone, reproduced with a tough surface and a smart texture. Travertines with real pores, marbles, volcanic reliefs and quiet limestones that bend around columns and curved walls.',
    image: FLEX_COVER.src,
    imageSet: FLEX_COVER.srcSet,
    gallery: [
      { ...MUSEUM, caption: 'Museum · flexible stone DY-9015-3' },
      { src: MAT.travertineReception, caption: 'Reception · IT-D01 Railay Travertine' },
      { ...OMAKASE, caption: 'Omakase restaurant · flexible stone DY-5005-4' },
    ],
    facts: [
      { value: '2.5', label: 'mm flexible stone' },
      { value: '3000', label: 'mm max. length' },
      { value: 'In / Out', label: 'Indoor and outdoor' },
    ],
    tone: '#c8bba7',
  },
  {
    id: 'granite',
    index: '04',
    name: 'Granite',
    short: 'Granite & terrazzo',
    line: 'Speckled, veined, permanent.',
    description:
      'Speckled granites, terrazzo and dark veined stones with the depth of a slab and none of its weight. Made for counters, plinths, feature walls and facades that take daily wear.',
    image: MAT.stoneFacade,
    gallery: [
      { src: MAT.stoneFacade, caption: 'Facade · LPSS1330 Aura Grey' },
      { src: MAT.graniteWall, caption: 'Lobby · LPSS3302 Gardenar Grey' },
      { src: MAT.stoneBar, caption: 'Bar · IT-LL15 Daisur White' },
    ],
    facts: [
      { value: '12', label: 'Granite looks' },
      { value: '2.5', label: 'mm, slab look without the weight' },
      { value: 'UV', label: 'Colourfast outdoors' },
    ],
    tone: '#6f7378',
  },
  {
    id: 'profile',
    index: '05',
    name: '3D Profiles',
    short: 'Geo composite',
    line: 'Rhythm you can touch.',
    description:
      'Fluted, ribbed and wave profiles in eco-wood composite: wood powder and resin, extruded and wrapped in a high-precision tactile film. Standard 3000 mm lengths with matching trims for walls, columns and ceilings.',
    image: MAT.geoWhiteFlutes,
    gallery: [
      { src: MAT.geoLivingGrey, caption: 'Living room · ELP14014 fluted' },
      { src: MAT.geoCurvedWood, caption: 'Lounge · ELP16815 on a curved wall' },
      { src: MAT.geoArch, caption: 'Arch · ELP14615 in black' },
    ],
    facts: [
      { value: '30+', label: 'Profiles' },
      { value: '3000', label: 'mm standard length' },
      { value: 'Eco', label: 'Recyclable core' },
    ],
    tone: '#b9b2a8',
  },
]

export type Hotspot = { code: string; name: string; family: string; use: string; at: [number, number] }

export type BoutiqueZone = {
  id: string
  n: string
  title: string
  text: string
  image: string
  imageSet?: string
  size: [number, number]
  focus: [number, number]
  plan: [number, number]
  panels: Hotspot[]
}

const OAK_GALLERY = 'photo-1791140842017-ff731195de5c'

export const BOUTIQUE: { name: string; meta: string; zones: BoutiqueZone[] } = {
  name: 'Maison Calma',
  meta: 'Concept boutique · 140 m² · ready-to-wear and leather goods',
  zones: [
    {
      id: 'entrance',
      n: '01',
      title: 'Oak gallery',
      text: 'An oak-lined gallery welcomes the client: lit rails, low benches and a mirror at the end of the axis. Warm grain, quiet light, nothing more.',
      image: unsplash(OAK_GALLERY, 1400, 82),
      imageSet: [900, 1400, 2000, 2600].map((w) => `${unsplash(OAK_GALLERY, w, 82)} ${w}w`).join(', '),
      size: [2000, 3000] as [number, number],
      focus: [0.5, 0.6] as [number, number],
      plan: [22, 78] as [number, number],
      panels: [
        { code: 'LPSW1190', name: 'Royal Classic Oak', family: 'Wood', use: 'Wall panels', at: [8, 63] },
        { code: 'LPSW1147', name: 'Valencia Maple', family: 'Wood', use: 'Benches and plinths', at: [80, 74] },
      ] as Hotspot[],
    },
    {
      id: 'gallery',
      n: '02',
      title: 'Gallery wall',
      text: 'Rough-cut stone behind a single black rail. Fewer pieces, more presence, and the texture does the merchandising.',
      image: MAT.stoneBoutique,
      size: [1302, 1066] as [number, number],
      focus: [0.5, 0.5] as [number, number],
      plan: [24, 30] as [number, number],
      panels: [
        { code: 'SS38', name: 'Rough-cut stone', family: 'Stone', use: 'Gallery wall', at: [66, 30] },
        { code: 'LPSW1161', name: 'Manhattan Walnut', family: 'Wood', use: 'Display drawers', at: [12, 72] },
      ] as Hotspot[],
    },
    {
      id: 'lounge',
      n: '03',
      title: 'Fitting lounge',
      text: 'Curved flutes wrap the fitting area in pale wood. Soft light, warm grain and acoustic calm while clients try things on.',
      image: MAT.geoCurvedWood,
      size: [1400, 1921] as [number, number],
      focus: [0.5, 0.45] as [number, number],
      plan: [76, 26] as [number, number],
      panels: [
        { code: 'ELP16815', name: 'Round flute profile', family: '3D Profile', use: 'Curved wall', at: [24, 30] },
        { code: 'LPSW1147', name: 'Valencia Maple', family: 'Wood', use: 'Bench and plinth', at: [86, 64] },
      ] as Hotspot[],
    },
    {
      id: 'desk',
      n: '04',
      title: 'Cash desk',
      text: 'A monolithic counter in brushed gold against white stone. It reads as one solid block, clad in light flexible panels.',
      image: MAT.metalGoldDesk,
      size: [700, 1049] as [number, number],
      focus: [0.5, 0.62] as [number, number],
      plan: [72, 72] as [number, number],
      panels: [
        { code: 'LPMG10009', name: 'Laser Gold', family: 'Aluminium', use: 'Cash desk', at: [62, 74] },
        { code: 'LPSS2303', name: 'Semplice White', family: 'Stone', use: 'Back wall', at: [80, 32] },
      ] as Hotspot[],
    },
  ],
}

export const STATEMENT =
  'wallcraftpanels brings the warmth of wood, the precision of aluminium and the permanence of stone and granite to panels that are lighter, faster to install and made to last. For facades, private homes and the most demanding retail floors.'

export const FIGURES = [
  { value: 5, suffix: '', label: 'Material families' },
  { value: 100, suffix: '+', label: 'Finishes and profiles' },
  { value: 3000, suffix: '', label: 'mm standard panel length' },
  { value: 9, suffix: '', label: 'Built-in properties' },
]

export const PROPERTIES = [
  { id: 'water', title: 'Water resistant', text: 'No swelling or warping in wet rooms and on facades.' },
  { id: 'fire', title: 'Fire retardant', text: 'Flame-retardant surfaces over A1 and Class B cores.' },
  { id: 'rot', title: 'Rot proof', text: 'No rot or mould, even in humid rooms.' },
  { id: 'toxic', title: 'No toxic release', text: 'Nothing harmful given off in use. A1 cores are formaldehyde-free.' },
  { id: 'install', title: 'Easy to install', text: 'Light panels, clips, trims and adhesive. Fast on site.' },
  { id: 'maintenance', title: 'Low maintenance', text: 'Wipe clean. No sanding, oiling or sealing.' },
  { id: 'paint', title: 'No painting needed', text: 'Finished at the factory, and paintable if you want it.' },
  { id: 'colour', title: 'Natural colour', text: 'Colourfast pigments that hold their tone under UV.' },
  { id: 'eco', title: 'Recyclable', text: 'Eco-wood cores made from wood powder and resin.' },
] as const

export type Core = {
  id: string
  code: string
  name: string
  summary: string
  scores: number[]
  headline: { value: string; label: string }[]
  rows: { property: string; value: string; norm?: string }[]
  uses: string
}

export const AXES = ['Fire', 'Moisture', 'Impact', 'Acoustics', 'Stability', 'Weathering']

export const CORES: Core[] = [
  {
    id: 'a1',
    code: 'CORE A1',
    name: 'Magnesium oxide core',
    summary:
      'Magnesium oxide and chloride, glass-fibre mesh, plant fibre and perlite. Non-combustible, stable in humid spaces and free of formaldehyde and asbestos.',
    scores: [10, 9, 7, 8, 8, 7],
    headline: [
      { value: 'A1', label: 'Reaction to fire' },
      { value: '≥120', label: 'Minutes fire resistance' },
      { value: '42', label: 'dB as a partition system' },
    ],
    rows: [
      { property: 'Reaction to fire', value: 'A1 · non-combustible, will not burn at ≥ 800 °C', norm: 'EN 13501-1 / GB 8624' },
      { property: 'Fire resistance', value: '≥ 120 min depending on thickness and system' },
      { property: 'Density', value: '0.8 – 1.2 g/cm³' },
      { property: 'Sound insulation', value: '29 dB (6 mm) · > 42 dB as a system' },
      { property: 'Moisture', value: 'No swelling, warping or efflorescence after immersion' },
      { property: 'Thicknesses', value: '5 · 6 · 8 · 9 · 10 · 12 · 15 · 18 mm' },
      { property: 'Formats', value: '1220 × 2400 / 2440 / 3000 mm' },
    ],
    uses: 'Escape routes, kitchens and bathrooms, high-traffic retail and the base of ventilated facades.',
  },
  {
    id: 'c',
    code: 'CORE C',
    name: 'Carbon composite core',
    summary:
      'A high-density composite pressed at high temperature. Tougher and more stable than MDF or particleboard, with the flatness that metal and high-gloss finishes need.',
    scores: [6, 8, 9, 5, 9, 8],
    headline: [
      { value: '1.4', label: 'g/cm³ max. density' },
      { value: 'B', label: 'Fire · Class A on request' },
      { value: '3200', label: 'mm max. height' },
    ],
    rows: [
      { property: 'Reaction to fire', value: 'Class B (Class A on request)', norm: 'GB 8624' },
      { property: 'Density', value: '1.1 – 1.4 g/cm³' },
      { property: 'Impact', value: 'High resistance; outperforms MDF and particleboard' },
      { property: 'Moisture', value: 'Low water absorption and swelling' },
      { property: 'Flatness', value: 'Suited to metal, mirror and synchronised grain' },
      { property: 'Thicknesses', value: '5 · 8 mm' },
      { property: 'Formats', value: '1220 × 2440 / 2600 / 2800 / 3050 / 3200 mm' },
    ],
    uses: 'Large-format aluminium and wood-grain cladding in retail, hospitality and wet areas.',
  },
  {
    id: 'eco',
    code: 'GEO',
    name: 'Eco-wood composite',
    summary:
      'Wood powder, resin and additives mixed, pelletised and extruded through a mould, then wrapped in a 3D tactile film. Rot proof, water resistant and recyclable.',
    scores: [6, 9, 7, 6, 8, 8],
    headline: [
      { value: '3000', label: 'mm standard length' },
      { value: '30+', label: 'Profiles with trims' },
      { value: 'Eco', label: 'Recyclable core' },
    ],
    rows: [
      { property: 'Composition', value: 'Wood powder + resin + additives, extruded' },
      { property: 'Surface', value: 'High-precision 3D tactile lamination film' },
      { property: 'Water', value: 'Water resistant, rot and mould proof' },
      { property: 'Fire', value: 'Flame-retardant formulation' },
      { property: 'Profiles', value: '51 × 16 mm to 320 × 30 mm' },
      { property: 'Trims', value: 'W2424 · W2222 · ELP2626 · ELP3434' },
    ],
    uses: 'Fluted feature walls, columns, ceilings and joinery fronts in homes, offices and boutiques.',
  },
  {
    id: 'ext',
    code: 'FACADE',
    name: 'Ventilated facade system',
    summary:
      'A mineral-core panel with an exterior stone, granite or metal finish on a concealed aluminium subframe. Built for direct sun, driving rain and freeze cycles.',
    scores: [9, 9, 8, 6, 9, 10],
    headline: [
      { value: 'A2', label: 's1,d0 · reaction to fire' },
      { value: '3000', label: 'Hours of UV testing' },
      { value: '100', label: 'Freeze–thaw cycles' },
    ],
    rows: [
      { property: 'Reaction to fire', value: 'A2-s1,d0*', norm: 'EN 13501-1' },
      { property: 'Colour stability', value: 'ΔE ≤ 3 after 3,000 h xenon*', norm: 'EN ISO 4892-2' },
      { property: 'Freeze–thaw', value: '100 cycles without damage*', norm: 'EN 12467' },
      { property: 'Wind load', value: 'Up to 2.4 kPa depending on subframe*' },
      { property: 'Service temperature', value: '−40 °C to +80 °C*' },
      { property: 'Thickness / weight', value: '8 – 12 mm · 18 – 22 kg/m²*' },
    ],
    uses: 'Ventilated facades, shopfront canopies, soffits and screens.',
  },
]

export const COMPARE = {
  columns: ['Wood', 'Aluminium', 'Stone', 'Granite', '3D Profile'],
  rows: [
    { label: 'Look', values: ['Wood grain', 'Brushed, laser, mirror', 'Travertine, marble, slate', 'Granite, terrazzo', 'Fluted, ribbed, wave'] },
    { label: 'Finishes', values: ['31', '30', '14', '12', '30+'] },
    { label: 'Thickness', values: ['Flexible sheet', 'Flexible sheet', '2 – 3 mm', '2.5 mm', '13 – 33 mm'] },
    { label: 'Bends around curves', values: [true, true, true, true, 'In plan'] },
    { label: 'Wet areas', values: [true, true, true, true, true] },
    { label: 'Exterior use', values: [false, 'Canopies', true, true, false] },
    { label: 'Installation', values: ['Adhesive', 'Adhesive', 'Tile adhesive', 'Tile adhesive', 'Clips + trims'] },
  ] as { label: string; values: (string | boolean)[] }[],
}

export const SERVICES = [
  {
    n: '01',
    title: 'Material direction',
    text: 'We build the palette with you: wood, aluminium, stone and granite samples on your table, matched to light, budget and use.',
  },
  {
    n: '02',
    title: 'Panel layout and shop drawings',
    text: 'Every wall modelled in 3D, with joints, radii, fixings and grain direction resolved before production begins.',
  },
  {
    n: '03',
    title: 'Made-to-measure production',
    text: 'Panels cut, wrapped and labelled per elevation, with batch control so colour and grain stay consistent across the project.',
  },
  {
    n: '04',
    title: 'Installation support',
    text: 'Clip systems, adhesives and trims specified per substrate, with on-site guidance for your installer and a written warranty.',
  },
]

export const STAGES = [
  {
    key: 'plan',
    n: '01',
    label: 'Plan',
    title: 'It all starts with a line.',
    text: 'We zone the customer journey, shop window, cash desk and lighting points on the boutique floor plan.',
  },
  {
    key: 'sketch',
    n: '02',
    label: 'Sketch',
    title: 'The space rises.',
    text: 'Every wall is drawn with its real panel layout: 1220 mm modules, 4 mm joints and custom radii.',
  },
  {
    key: 'massing',
    n: '03',
    label: 'Massing',
    title: 'Proportion before material.',
    text: 'A white model to check scale, circulation and how the daylight falls into the room.',
  },
  {
    key: 'material',
    n: '04',
    label: 'Material',
    title: 'Every surface, by wallcraftpanels.',
    text: 'Walnut grain, fluted profiles, Meteor Silver aluminium, Laser Gold and granite over A1 and carbon cores.',
  },
  {
    key: 'light',
    n: '05',
    label: 'Light',
    title: 'Light reveals the texture.',
    text: '3000 K wall washers, a diffused light well and LED strips built into the display niche.',
  },
  {
    key: 'render',
    n: '06',
    label: 'Final render',
    title: 'The boutique, before it exists.',
    text: 'Materials calibrated against real samples: what you see in the render is what gets made.',
  },
]
