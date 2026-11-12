// Shapes of the project data (src/content/levakant-data.json and its localized copies).
// Field names are kept from the mockup so the ported logic stays 1:1 with it.

export type FloorKey = 'typ' | 'f9' | 'ph';
export type PlanKey = FloorKey | 'f1' | 'b';

export interface RoomLabel {
  /** room name, '' when the plan has no caption */
  n: string;
  /** area, formatted for the locale (e.g. "19,04") */
  a: string;
  x: number;
  y: number;
}

export interface RoomRow {
  n: string;
  a: string;
}

export interface Room3 {
  n: string;
  /** true when the room has a caption on the plan */
  nm: boolean;
  as: string;
  poly: string;
  cx: number;
  cy: number;
  off: boolean;
}

export interface Layout {
  id: string;
  /** number of rooms */
  r: 1 | 2 | 4;
  title: string;
  short: string;
  total: number;
  as: string;
  fl: string;
  flShort: string;
  fk: FloorKey[];
  per: string;
  side: string;
  ph: boolean;
  img: string;
  ar: number;
  labels: RoomLabel[];
  list: RoomRow[];
  wm: number;
  rooms3: Room3[] | null;
  m3: boolean;
  balc: string;
  note: string | null;
}

export interface Zone {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  poly: string;
  cx: number;
  cy: number;
}

export interface Floor {
  k: string;
  n: string;
  t: string;
  top: number;
  h: number;
  plan: PlanKey;
}

export interface GalleryItem {
  img: string;
  ar: number;
  no: string;
  t: string;
  s: string;
}

export interface SunFacade {
  n: string;
  dir: string;
  v: string;
  h: string;
  lit: number[];
}

export type SunDateKey = 'summer' | 'equinox' | 'winter';

export interface SunDay {
  label: string;
  hours: number[];
  pos: Record<string, [number, number]>;
  img: Record<string, string>;
  fac: SunFacade[];
  rise: string;
  riseM: number;
  setM: number;
}

export interface GlData {
  model: string;
  planImgs: Record<PlanKey, string>;
  rooms: Record<string, number>;
}

export interface SiteData {
  L: Record<string, Layout>;
  order: string[];
  P: Record<FloorKey, Zone[]>;
  floors: Floor[];
  gal: GalleryItem[];
  img: Record<`floor_${PlanKey}`, string>;
  m3: string[];
  sun: Record<SunDateKey, SunDay>;
  gl: GlData;
}

/** Demo price model: price per m² by floor group, instalment rules. Will come from the CMS. */
export interface Pricing {
  isDemo: boolean;
  currency: 'TJS';
  pxm: Record<FloorKey, number>;
  downMin: number;
  downStep: number;
  months: number[];
  discountFull: number;
}
