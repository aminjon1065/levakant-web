import type { CSSProperties } from 'react';
import Image from 'next/image';
import SIZES from '@/content/image-sizes.json';

const S = SIZES as unknown as Record<string, [number, number]>;

/**
 * Photo / render through next/image: AVIF/WebP at the width the layout needs (`sizes`),
 * lazy by default, intrinsic size from src/content/image-sizes.json (tools/images.mjs).
 * Technical plans stay plain <img> at full resolution — they are zoomed up to 220 %.
 */
export function Pic({
  src,
  alt,
  sizes,
  className,
  style,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [w, h] = S[src] ?? [1600, 1000];
  return <Image src={src} alt={alt} width={w} height={h} sizes={sizes} className={className} style={style} />;
}
