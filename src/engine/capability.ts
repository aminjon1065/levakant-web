/**
 * Should this device get the live 3D model? Static renders otherwise (brief §7):
 * no WebGL2, little memory, Save-Data or prefers-reduced-motion → static.
 * `?3d=1` / `?3d=0` force it either way (tests, support).
 */
export function can3D(): boolean {
  if (typeof window === 'undefined') return false;
  const q = new URLSearchParams(window.location.search).get('3d');
  if (q === '0') return false;
  if (q === '1') return true;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 3) return false;
  if (typeof IntersectionObserver === 'undefined' || typeof ResizeObserver === 'undefined') return false;
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    return false;
  }
  return true;
}
