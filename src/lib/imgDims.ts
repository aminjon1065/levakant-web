import SIZES from '@/content/image-sizes.json';

const S = SIZES as unknown as Record<string, [number, number]>;

/** Intrinsic width/height attributes for a local image: lets the browser reserve the box before a lazy image loads. */
export const imgDims = (src: string) => {
  const d = S[src];
  return d ? { width: d[0], height: d[1] } : {};
};
