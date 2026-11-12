/**
 * Should this device get the live 3D model? Static scheme otherwise (brief §7).
 *   webgl  — no WebGL2: 3D impossible
 *   pref   — prefers-reduced-motion: static by default, the visitor can still opt in
 *   device — ≤2 GB memory or Save-Data: static by default, opt-in possible
 * `?3d=1` / `?3d=0` force either way (tests, support); the opt-in is remembered for the session.
 */
export type Cap = { ok: true; quality: 'high' | 'low' } | { ok: false; reason: 'webgl' | 'pref' | 'device' };

type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

function webgl2() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Lighter rendering (no bloom, lower resolution and shadow map) for modest hardware. */
function quality(): 'high' | 'low' {
  const nav = navigator as Nav;
  const mem = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  const phone = window.matchMedia?.('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 600;
  return mem <= 4 || cores <= 4 || phone ? 'low' : 'high';
}

export function can3D(): Cap {
  if (
    typeof window === 'undefined' ||
    typeof IntersectionObserver === 'undefined' ||
    typeof ResizeObserver === 'undefined'
  )
    return { ok: false, reason: 'webgl' };
  const q = new URLSearchParams(window.location.search).get('3d');
  if (q === '0') return { ok: false, reason: 'pref' };
  if (!webgl2()) return { ok: false, reason: 'webgl' };
  let forced = q === '1';
  try {
    forced ||= sessionStorage.getItem('lv-3d') === '1';
  } catch {
    /* storage blocked */
  }
  if (forced) return { ok: true, quality: quality() };
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return { ok: false, reason: 'pref' };
  const nav = navigator as Nav;
  if (nav.connection?.saveData || (nav.deviceMemory !== undefined && nav.deviceMemory < 3))
    return { ok: false, reason: 'device' };
  return { ok: true, quality: quality() };
}

/** Visitor asked for 3D despite reduced motion / a modest device. */
export function optIn3D() {
  try {
    sessionStorage.setItem('lv-3d', '1');
  } catch {
    /* storage blocked: opt-in lasts for this page view */
  }
}
