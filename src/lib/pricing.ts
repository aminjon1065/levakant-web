import type { FloorKey, Pricing, SiteData } from './types';

/** Lowest price of a layout across the floor groups it exists on. */
export const pxMin = (d: SiteData, p: Pricing, id: string) =>
  Math.min(...d.L[id].fk.map((k) => d.L[id].total * p.pxm[k]));

/** Lowest price per m² for a layout. */
export const m2Min = (d: SiteData, p: Pricing, id: string) => Math.min(...d.L[id].fk.map((k) => p.pxm[k]));

/** Monthly payment with the minimum down payment and the longest term ("в рассрочку от …"). */
export const moOf = (p: Pricing, v: number) => (v * (1 - p.downMin / 100)) / Math.max(...p.months);

/** Lowest price in the project. */
export const allMin = (d: SiteData, p: Pricing) => Math.min(...d.order.map((id) => pxMin(d, p, id)));

export interface CalcResult {
  price: number;
  full: boolean;
  downSum: number;
  rest: number;
  monthly: number;
  discount: number;
}

/** Instalment calculator: down 30–100 %, at 100 % the full-payment discount applies. */
export function calc(p: Pricing, total: number, fl: FloorKey, down: number, term: number): CalcResult {
  const price = Math.round(total * p.pxm[fl]);
  const full = down >= 100;
  const k = 1 - p.discountFull / 100;
  const rest = price - (price * down) / 100;
  return {
    price,
    full,
    downSum: full ? price * k : (price * down) / 100,
    rest,
    monthly: full ? price * k : rest / term,
    discount: price * (p.discountFull / 100),
  };
}
