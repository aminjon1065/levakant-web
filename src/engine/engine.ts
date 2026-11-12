// LEVAKANT RESIDENCE — live 3D engine (port of levakant-source/engine/engine.js, three.js).
// One WebGL context per page, shared by every stage; each stage draws into its own 2D canvas,
// so the last frame stays on screen after the context is released.
// Loaded lazily (dynamic import) only when a 3D section approaches the viewport.
import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { DATES, SITE, sunPos } from '@/lib/sun';
import type { PlanKey, SunDateKey, Zone } from '@/lib/types';

const V3 = THREE.Vector3;
type V3 = THREE.Vector3;
const D2R = Math.PI / 180;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const sstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/* ---------- site data ---------- */
// Floors bottom to top. level = slab level in metres from the Archicad model.
export const FLOORS = [
  { k: 'b', node: 'L-1', level: -4.2, h: 4.2 },
  { k: '1', node: 'L01', level: 0.0, h: 4.3 },
  { k: '2', node: 'L02', level: 4.3, h: 3.05 },
  { k: '3', node: 'L03', level: 7.35, h: 3.15 },
  { k: '4', node: 'L04', level: 10.5, h: 3.15 },
  { k: '5', node: 'L05', level: 13.65, h: 3.15 },
  { k: '6', node: 'L06', level: 16.8, h: 3.15 },
  { k: '7', node: 'L07', level: 19.95, h: 3.15 },
  { k: '8', node: 'L08', level: 23.1, h: 3.15 },
  { k: '9', node: 'L09', level: 26.25, h: 3.15 },
  { k: 'ph', node: 'L10_mansard', level: 29.4, h: 3.15 },
  { k: 'roof', node: 'roof', level: 32.55, h: 3.4 },
] as const;
const PLAN_OF: Record<string, PlanKey> = {
  b: 'b',
  1: 'f1',
  2: 'typ',
  3: 'typ',
  4: 'typ',
  5: 'typ',
  6: 'typ',
  7: 'typ',
  8: 'typ',
  9: 'f9',
  ph: 'ph',
};
// Floor-plan image → model metres: plan spans W×H metres centred at (cx, cy); registered on the model's floor cuts.
const PLAN_REG: Record<PlanKey, [number, number, number, number]> = {
  typ: [47.75, 27.3, 0.025, 0.425],
  f9: [47.75, 27.05, 0.025, 0.4],
  ph: [47.6, 27.25, 0, 0.4],
  f1: [46.0, 28.9, 1.25, 1.425],
  b: [50.05, 28.9, -0.025, 1.425],
};
const HALF = [23.21, 13.38]; // building half-extents (model X, Y)

// glTF: model X → X, model Y → −Z, model Z → Y. Bearing of model +Y is 336°.
export function bearingVec(b: number) {
  const a = (b - SITE.yardBearing) * D2R;
  return new V3(Math.sin(a), 0, -Math.cos(a));
}
const modelToWorld = (x: number, y: number, z = 0) => new V3(x, z, -y);

const TOD = { day: ['equinox', 12 * 60 + 30], dusk: ['nov', 16 * 60 + 15], night: ['nov', 19 * 60 + 40] } as const;
export type Tod = keyof typeof TOD;

/* ---------- lighting look as a function of the sun's elevation ---------- */
// el, zenith, horizon, ground, hemiSky, hemiGround, hemiI, sunCol, sunI, fog, glow, litFrac, exposure, bloom
type LookRow = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  number,
  number,
  number,
  number,
];
const LOOKS: LookRow[] = [
  [-14, '#03060f', '#101a33', '#06080c', '#2a3658', '#06070a', 0.5, '#9fb3ff', 0.2, '#0c1224', 2.1, 0.44, 1.15, 0.42],
  [-5, '#122045', '#7a7396', '#121419', '#5d6a92', '#1c1b20', 0.75, '#ffb48a', 0.0, '#4f4d66', 2.0, 0.4, 1.05, 0.4],
  [1, '#24396b', '#e09a78', '#28241f', '#a99aae', '#3b3129', 0.9, '#ff9a5c', 1.7, '#a7837a', 1.8, 0.34, 1.0, 0.36],
  [9, '#3e639a', '#efbf98', '#3f4236', '#cfb9b0', '#4b4035', 1.0, '#ffbb80', 2.6, '#c9ab98', 1.1, 0.18, 1.0, 0.3],
  [22, '#3f74b6', '#b4cbe2', '#4c5444', '#d6e2ef', '#5f5a4f', 1.05, '#fff1e0', 2.9, '#bccbd9', 0, 0, 1.0, 0.22],
  [60, '#3168ae', '#a9c2de', '#515a49', '#dce7f2', '#67624f', 1.1, '#fff6ec', 3.1, '#b7c7d8', 0, 0, 1.0, 0.22],
];
function look(el: number) {
  let i = 0;
  while (i < LOOKS.length - 2 && el > LOOKS[i + 1][0]) i++;
  const a = LOOKS[i];
  const b = LOOKS[i + 1];
  const t = clamp((el - a[0]) / (b[0] - a[0]), 0, 1);
  const col = (k: number) => new THREE.Color(a[k] as string).lerp(new THREE.Color(b[k] as string), t);
  const num = (k: number) => lerp(a[k] as number, b[k] as number, t);
  return {
    zenith: col(1),
    horizon: col(2),
    ground: col(3),
    hemiSky: col(4),
    hemiGround: col(5),
    hemiI: num(6),
    sunCol: col(7),
    sunI: num(8),
    fog: col(9),
    glow: num(10),
    lit: num(11),
    exposure: num(12),
    bloom: num(13),
  };
}

/* ---------- model and textures ---------- */
const models = new Map<string, Promise<GLTF>>();
export function loadModel(url: string) {
  let p = models.get(url);
  if (!p) {
    p = (async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('model ' + res.status);
      const buf = await res.arrayBuffer();
      const gltf = await new GLTFLoader().parseAsync(buf, '');
      gltf.scene.updateMatrixWorld(true);
      // flat-shaded meshes still need a normal attribute: three's shadow lookup normalises it (zero → NaN, no shadows)
      gltf.scene.traverse((o) => {
        if (o instanceof THREE.Mesh && !o.geometry.attributes.normal) o.geometry.computeVertexNormals();
      });
      return gltf;
    })();
    models.set(url, p);
  }
  return p;
}

const planTex = new Map<string, Promise<THREE.CanvasTexture | null>>();
function loadPlanTexture(url: string) {
  let p = planTex.get(url);
  if (!p) {
    p = new Promise((res) => {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => {
        const sc = Math.min(1, 2048 / im.naturalWidth);
        const c = document.createElement('canvas');
        c.width = Math.round(im.naturalWidth * sc);
        c.height = Math.round(im.naturalHeight * sc);
        const g = c.getContext('2d')!;
        g.drawImage(im, 0, 0, c.width, c.height);
        g.globalCompositeOperation = 'source-in';
        g.fillStyle = '#F3E9D6';
        g.fillRect(0, 0, c.width, c.height);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        res(t);
      };
      im.onerror = () => res(null);
      im.src = url;
    });
    planTex.set(url, p);
  }
  return p;
}

/* ---------- shared renderer for the page ---------- */
const R: { gl: THREE.WebGLRenderer | null; stages: Set<Stage>; idleT: number; pmrem: THREE.PMREMGenerator | null } = {
  gl: null,
  stages: new Set(),
  idleT: 0,
  pmrem: null,
};
function renderer() {
  if (R.gl && !R.gl.getContext().isContextLost()) return R.gl;
  if (R.gl) {
    try {
      R.gl.dispose();
    } catch {
      /* lost */
    }
  }
  const cv = document.createElement('canvas');
  let r: THREE.WebGLRenderer;
  try {
    r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.localClippingEnabled = true;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFShadowMap; // r18x: PCF is soft via shadow.radius (PCFSoftShadowMap was removed)
  cv.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    release();
  });
  R.gl = r;
  R.pmrem = new THREE.PMREMGenerator(r);
  R.stages.forEach((s) => s.onRenderer());
  return r;
}
function release() {
  if (!R.gl) return;
  R.stages.forEach((s) => s.dropGpu());
  try {
    R.pmrem?.dispose();
    R.gl.dispose();
    R.gl.forceContextLoss();
  } catch {
    /* already lost */
  }
  R.gl = null;
  R.pmrem = null;
}
function idleCheck() {
  clearTimeout(R.idleT);
  R.idleT = window.setTimeout(() => {
    const busy = [...R.stages].some((s) => s.visible && (s.hover || s.animating()));
    if (busy) idleCheck();
    else release();
  }, 20000);
}

/* ---------- sky dome ---------- */
type SkyUniforms = {
  uZen: { value: THREE.Color };
  uHor: { value: THREE.Color };
  uGnd: { value: THREE.Color };
  uSun: { value: V3 };
  uSunCol: { value: THREE.Color };
  uSunA: { value: number };
  uStars: { value: number };
};
function makeSky(uniforms?: SkyUniforms) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: uniforms ?? {
      uZen: { value: new THREE.Color() },
      uHor: { value: new THREE.Color() },
      uGnd: { value: new THREE.Color() },
      uSun: { value: new V3(0, 1, 0) },
      uSunCol: { value: new THREE.Color() },
      uSunA: { value: 0 },
      uStars: { value: 0 },
    },
    vertexShader:
      'varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }',
    fragmentShader: `varying vec3 vDir; uniform vec3 uZen, uHor, uGnd, uSun, uSunCol; uniform float uSunA, uStars;
      float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453); }
      void main(){ vec3 d = normalize(vDir); float y = d.y;
        vec3 c = mix(uHor, uZen, pow(clamp(y,0.0,1.0), 0.48));
        c += uHor * 0.35 * exp(-max(y,0.0) * 18.0);
        c = mix(c, uGnd, smoothstep(0.0, -0.08, y));
        float s = max(dot(d, normalize(uSun)), 0.0);
        c += uSunCol * (pow(s, 6.0) * 0.35 + pow(s, 64.0) * 0.9 + pow(s, 900.0) * 6.0) * uSunA;
        if (uStars > 0.0 && y > 0.05) { vec3 q = floor(d * 420.0); float st = step(0.9975, h3(q)); c += vec3(0.9,0.92,1.0) * st * uStars * smoothstep(0.05, 0.4, y) * (0.4 + 0.6*h3(q+1.0)); }
        gl_FragColor = vec4(c * 1.35, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24), mat);
  m.frustumCulled = false;
  m.renderOrder = -10;
  return m as THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial & { uniforms: SkyUniforms }>;
}

/* ---------- material patch: lit windows, highlight, dimming, section caps ---------- */
type U<T> = { value: T };
interface FloorUniforms {
  uLit: U<number>;
  uHi: U<number>;
  uDim: U<number>;
  uOff: U<number>;
  uShop: U<number>;
}
interface GlobalUniforms {
  uGlow: U<number>;
  uLitFrac: U<number>;
  uCap: U<THREE.Color>;
}
function patchMaterial(mat: THREE.Material, fu: FloorUniforms, gu: GlobalUniforms, isGlass: boolean) {
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, {
      uGlow: gu.uGlow,
      uLitFrac: gu.uLitFrac,
      uLit: fu.uLit,
      uHi: fu.uHi,
      uDim: fu.uDim,
      uOff: fu.uOff,
      uShop: fu.uShop,
      uCap: gu.uCap,
    });
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
      .replace(
        '#include <worldpos_vertex>',
        '#include <worldpos_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;',
      );
    let f = sh.fragmentShader.replace(
      '#include <common>',
      `#include <common>
varying vec3 vWPos; uniform float uGlow, uLitFrac, uLit, uHi, uDim, uOff, uShop; uniform vec3 uCap;
float lvH(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }`,
    );
    const glow = isGlass
      ? `
      vec3 lp = vec3(vWPos.x, vWPos.y - uOff, vWPos.z);
      vec3 cell = floor(vec3(lp.x / 1.85, (lp.y + 0.3) / 3.15, lp.z / 1.85));
      float r = lvH(cell), r2 = lvH(cell + 17.3);
      float on = step(1.0 - uLitFrac, r) * step(r2, uLit);
      float lit = max(on, uShop * step(r2, uLit));
      vec3 warm = mix(vec3(1.0,0.58,0.26), vec3(1.0,0.82,0.58), fract(r*7.0));
      totalEmissiveRadiance += warm * lit * uGlow * (0.6 + 0.5*r);`
      : '';
    f = f.replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>${glow}
      totalEmissiveRadiance += vec3(0.79,0.62,0.38) * uHi * 0.28;`,
    );
    f = f.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
      gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * 0.18 + vec3(0.012,0.014,0.018), uDim);
      if (!gl_FrontFacing) gl_FragColor = vec4(uCap, 1.0);
      if (any(isnan(gl_FragColor.rgb)) || any(isinf(gl_FragColor.rgb))) gl_FragColor.rgb = uCap;
      gl_FragColor.rgb = clamp(gl_FragColor.rgb, 0.0, 64.0);`,
    );
    sh.fragmentShader = f;
  };
  mat.customProgramCacheKey = () =>
    (isGlass ? 'lv-g' : 'lv-s') + ((mat as THREE.MeshStandardMaterial).flatShading ? 'f' : '');
}

/* ---------- procedural trees and lamps ---------- */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const materialsOf = (o: THREE.Mesh) => (Array.isArray(o.material) ? o.material : [o.material]);

function buildTrees(site: THREE.Object3D, rand: () => number) {
  const tris: [V3, V3, V3, number][] = [];
  let total = 0;
  const a = new V3();
  const b = new V3();
  const c = new V3();
  site.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    if (!materialsOf(o).some((m) => /трава/i.test(m.name || ''))) return;
    const pos = o.geometry.attributes.position as THREE.BufferAttribute;
    const idx = o.geometry.index;
    const n = idx ? idx.count / 3 : pos.count / 3;
    for (let i = 0; i < n; i++) {
      const i0 = idx ? idx.getX(i * 3) : i * 3;
      const i1 = idx ? idx.getX(i * 3 + 1) : i * 3 + 1;
      const i2 = idx ? idx.getX(i * 3 + 2) : i * 3 + 2;
      a.fromBufferAttribute(pos, i0).applyMatrix4(o.matrixWorld);
      b.fromBufferAttribute(pos, i1).applyMatrix4(o.matrixWorld);
      c.fromBufferAttribute(pos, i2).applyMatrix4(o.matrixWorld);
      const ar = new V3().subVectors(b, a).cross(new V3().subVectors(c, a));
      const area = ar.length() / 2;
      if (area < 0.5 || Math.abs(ar.normalize().y) < 0.8) continue;
      total += area;
      tris.push([a.clone(), b.clone(), c.clone(), total]);
    }
  });
  const pts: V3[] = [];
  if (!tris.length) return pts;
  const ok = (p: V3) => {
    const mx = p.x;
    const my = -p.z;
    if (Math.abs(mx) < HALF[0] + 3.5 && Math.abs(my) < HALF[1] + 3.5) return false;
    if (Math.hypot(mx, my) > 95) return false;
    return pts.every((q) => (q.x - p.x) ** 2 + (q.z - p.z) ** 2 > 30);
  };
  for (let k = 0; k < 2400 && pts.length < 90; k++) {
    const r = rand() * total;
    let lo = 0;
    let hi = tris.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tris[mid][3] < r) lo = mid + 1;
      else hi = mid;
    }
    const [p, q, s] = tris[lo];
    let u = rand();
    let v = rand();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    const pt = p.clone().add(q.clone().sub(p).multiplyScalar(u)).add(s.clone().sub(p).multiplyScalar(v));
    if (ok(pt)) pts.push(pt);
  }
  return pts;
}
function mergeGeos(list: THREE.BufferGeometry[]) {
  let n = 0;
  list.forEach((g) => (n += (g.index ? g.toNonIndexed() : g).attributes.position.count));
  const pos = new Float32Array(n * 3);
  let o = 0;
  list.forEach((g) => {
    const p = (g.index ? g.toNonIndexed() : g).attributes.position.array as Float32Array;
    pos.set(p, o);
    o += p.length;
  });
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.computeVertexNormals();
  return out;
}
type Crowns = THREE.InstancedMesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
function treeMeshes(pts: V3[], rand: () => number) {
  const g = new THREE.Group() as THREE.Group & { userData: { crowns?: Crowns } };
  if (!pts.length) return g;
  const parts = (
    [
      [0, 0, 0, 1],
      [0.55, 0.45, 0.2, 0.72],
      [-0.5, 0.35, -0.25, 0.7],
      [0.1, 0.85, -0.1, 0.62],
    ] as const
  ).map(([x, y, z, s]) => new THREE.IcosahedronGeometry(s, 1).translate(x, y, z));
  const crownGeo = mergeGeos(parts).scale(1.9, 1.75, 1.9).translate(0, 4.4, 0);
  const trunkGeo = new THREE.CylinderGeometry(0.11, 0.16, 3.6, 6).translate(0, 1.8, 0);
  const crowns: Crowns = new THREE.InstancedMesh(
    crownGeo,
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.95, flatShading: true }),
    pts.length,
  );
  const trunks = new THREE.InstancedMesh(
    trunkGeo,
    new THREE.MeshStandardMaterial({ color: '#3a2e25', roughness: 1, flatShading: true }),
    pts.length,
  );
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new V3();
  const col = new THREE.Color();
  const greens = ['#3f5a35', '#4b6338', '#37502f', '#56693b', '#41593a'];
  pts.forEach((p, i) => {
    const sc = 0.75 + rand() * 0.55;
    q.setFromAxisAngle(new V3(0, 1, 0), rand() * 6.28);
    s.set(sc, sc * (0.9 + rand() * 0.3), sc);
    m.compose(p, q, s);
    crowns.setMatrixAt(i, m);
    trunks.setMatrixAt(i, m);
    col.set(greens[Math.floor(rand() * greens.length)]);
    crowns.setColorAt(i, col);
  });
  crowns.castShadow = trunks.castShadow = true;
  crowns.receiveShadow = true;
  g.add(crowns, trunks);
  g.userData.crowns = crowns;
  return g;
}
function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,190,120,0.9)');
  gr.addColorStop(0.35, 'rgba(255,160,90,0.35)');
  gr.addColorStop(1, 'rgba(255,140,70,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
interface Lamps extends THREE.Group {
  userData: {
    headMat?: THREE.MeshStandardMaterial;
    pools?: THREE.InstancedMesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  };
}
function buildLamps(site: THREE.Object3D) {
  const ray = new THREE.Raycaster();
  const meshes: THREE.Mesh[] = [];
  site.traverse((o) => {
    if (o instanceof THREE.Mesh) meshes.push(o);
  });
  const spots: [number, number][] = [];
  const ring = (ox: number, oy: number, step: number) => {
    for (let x = -HALF[0] - ox; x <= HALF[0] + ox + 0.01; x += step) {
      spots.push([x, -HALF[1] - oy]);
      spots.push([x, HALF[1] + oy]);
    }
    for (let y = -HALF[1] - oy + step; y < HALF[1] + oy - 0.01; y += step) {
      spots.push([-HALF[0] - ox, y]);
      spots.push([HALF[0] + ox, y]);
    }
  };
  ring(5, 5.5, 9.5);
  const pts: V3[] = [];
  spots.forEach(([x, y]) => {
    ray.set(modelToWorld(x, y, 60), new V3(0, -1, 0));
    const h = ray.intersectObjects(meshes, false)[0];
    if (!h) return;
    const mats = materialsOf(h.object as THREE.Mesh);
    const nm = (mats[h.face?.materialIndex || 0] || mats[0]).name || '';
    if (/асфальт/i.test(nm)) return;
    pts.push(h.point.clone());
  });
  const g = new THREE.Group() as Lamps;
  if (!pts.length) return g;
  const poleGeo = new THREE.CylinderGeometry(0.05, 0.07, 4.2, 6).translate(0, 2.1, 0);
  const headGeo = new THREE.BoxGeometry(0.34, 0.16, 0.34).translate(0, 4.25, 0);
  const poles = new THREE.InstancedMesh(
    poleGeo,
    new THREE.MeshStandardMaterial({ color: '#1d1f22', roughness: 0.5, metalness: 0.6 }),
    pts.length,
  );
  const headMat = new THREE.MeshStandardMaterial({
    color: '#2a2622',
    emissive: new THREE.Color('#ffb36b'),
    emissiveIntensity: 0,
  });
  const heads = new THREE.InstancedMesh(headGeo, headMat, pts.length);
  const pools = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(9, 9).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      map: glowTexture(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0,
      toneMapped: false,
    }),
    pts.length,
  );
  const m = new THREE.Matrix4();
  pts.forEach((p, i) => {
    m.makeTranslation(p.x, p.y, p.z);
    poles.setMatrixAt(i, m);
    heads.setMatrixAt(i, m);
    m.makeTranslation(p.x, p.y + 0.06, p.z);
    pools.setMatrixAt(i, m);
  });
  poles.castShadow = true;
  pools.renderOrder = 2;
  g.add(poles, heads, pools);
  g.userData = { headMat, pools };
  return g;
}

/* ---------- generic surroundings: low blocks and trees fading into the haze (illustrative) ---------- */
function buildContext(rand: () => number, gu: GlobalUniforms) {
  const g = new THREE.Group() as THREE.Group & { userData: { crowns?: Crowns } };
  const blocks: [number, number, number, number, number, number][] = [];
  const trees: V3[] = [];
  const inRoad = (x: number, y: number) => Math.abs(y + 32) < 15 || Math.abs(x + 41) < 13 || Math.abs(x - 64) < 9;
  const free = (x: number, y: number, rr: number) => blocks.every((b) => Math.hypot(b[0] - x, b[1] - y) > rr + b[5]);
  for (let k = 0; k < 900 && blocks.length < 150; k++) {
    const r = 118 + Math.pow(rand(), 0.8) * 470;
    const a = rand() * Math.PI * 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    const w = 12 + rand() * 20;
    const d = 10 + rand() * 14;
    const h = 6 + Math.floor(rand() * 4) * 3.1 + (rand() < 0.12 ? 9 : 0);
    const rad = Math.hypot(w, d) / 2;
    if (inRoad(x, y) || (Math.abs(x) < 70 && Math.abs(y) < 55) || !free(x, y, rad + 4)) continue;
    blocks.push([x, y, w, d, h, rad]);
  }
  for (let k = 0; k < 1500 && trees.length < 260; k++) {
    const r = 70 + rand() * 300;
    const a = rand() * Math.PI * 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (Math.abs(x) < 62 && Math.abs(y) < 48) continue;
    if (inRoad(x, y) || !free(x, y, 3)) continue;
    trees.push(modelToWorld(x, y, -0.6));
  }
  const geo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const mat = new THREE.MeshStandardMaterial({ color: '#5d5853', roughness: 0.92 });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, { uGlow: gu.uGlow, uLitFrac: gu.uLitFrac });
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
      .replace(
        '#include <worldpos_vertex>',
        '#include <worldpos_vertex>\nvec4 wp4 = vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\nwp4 = instanceMatrix * wp4;\nvWN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * objectNormal);\n#else\nvWN = normalize(mat3(modelMatrix) * objectNormal);\n#endif\nvWP = (modelMatrix * wp4).xyz;',
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vWP; varying vec3 vWN; uniform float uGlow, uLitFrac;\nfloat cH(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }',
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float vert = 1.0 - step(0.5, abs(vWN.y));
        vec2 uv = vec2(dot(vWP.xz, normalize(vec2(-vWN.z, vWN.x) + 1e-5)), vWP.y + 1.42);
        vec2 cl = floor(vec2(uv.x / 2.6, uv.y / 3.1)); vec2 fr = fract(vec2(uv.x / 2.6, uv.y / 3.1));
        float win = step(0.25, fr.x) * step(fr.x, 0.75) * step(0.3, fr.y) * step(fr.y, 0.8) * step(1.0, cl.y);
        float rr = cH(vec3(cl, floor(vWP.x * 0.05) + floor(vWP.z * 0.05) * 7.0));
        totalEmissiveRadiance += vec3(1.0,0.66,0.36) * vert * win * step(1.0 - uLitFrac * 0.55, rr) * uGlow * 0.32;
        diffuseColor.rgb *= mix(1.0, 0.82, vert * win);`,
      );
  };
  const im = new THREE.InstancedMesh(geo, mat, blocks.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  blocks.forEach((b, i) => {
    q.setFromAxisAngle(new V3(0, 1, 0), (rand() - 0.5) * 0.08);
    m.compose(modelToWorld(b[0], b[1], -1.4), q, new V3(b[2], b[4], b[3]));
    im.setMatrixAt(i, m);
  });
  im.receiveShadow = true;
  g.add(im);
  const tg = treeMeshes(trees, rand);
  g.add(tg);
  g.userData.crowns = tg.userData.crowns;
  return g;
}

/* ---------- stage ---------- */
export type Mode = 'explore' | 'sun';
export type View = '' | 'front' | 'corner' | 'yard' | 'top';

export interface StageOptions {
  mode: Mode;
  model: string;
  plans?: Partial<Record<'typ' | 'f9' | 'ph', Zone[]>>;
  planImgs?: Partial<Record<PlanKey, string>>;
  /** number of rooms per layout id: tints the apartment zones */
  rooms?: Record<string, number>;
  /** sunrise / sunset minutes for a date (sun mode) */
  dayRange?: (date: SunDateKey) => [number, number];
  /** jump to the target view without easing */
  snap?: boolean;
  onFirstFrame?: () => void;
  onFloor?: (k: string) => void;
  onApt?: (id: string) => void;
  onFree?: () => void;
  onTime?: (minutes: number) => void;
  onReady?: () => void;
  onError?: (e: string) => void;
}

export interface StageState {
  exploded: boolean;
  open: boolean;
  floor: string | null;
  apt: string;
  enter: boolean;
  view: View;
  tod: Tod;
  date: SunDateKey;
  minutes: number;
  play: boolean;
  hoverApt: string;
}

type FloorDef = (typeof FLOORS)[number];
interface FloorRt {
  k: FloorDef['k'];
  level: number;
  h: number;
  i: number;
  node: THREE.Object3D | undefined;
  fu: FloorUniforms;
  base: V3;
  off: number;
  offGoal: number;
  dim: number;
  dimGoal: number;
  clip: THREE.Plane;
  cut: boolean;
  mats: THREE.Material[];
  box: THREE.Box3 | null;
  hiBase: number;
  hideAbove: boolean;
}
interface ZoneRt {
  id: string;
  mesh: THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>;
  line: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  center: THREE.Vector2;
  fill: number;
  edge: number;
}
interface Orbit {
  b: number;
  el: number;
  r: number;
  ty: number;
  tx: number;
  tz: number;
}

export class Stage {
  readonly view: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private opts: StageOptions;
  private mode: Mode;
  private st: StageState = {
    exploded: false,
    open: false,
    floor: null,
    apt: '',
    enter: false,
    view: 'corner',
    tod: 'dusk',
    date: 'equinox',
    minutes: 720,
    play: false,
    hoverApt: '',
  };
  private cam = new THREE.PerspectiveCamera(30, 1, 0.5, 4000);
  private orb: Orbit = { b: 120, el: 22, r: 105, ty: 15, tx: 0, tz: 0 };
  private goal: Orbit = { ...this.orb };
  visible = true;
  hover = false;
  ready = false;
  failed = '';
  private lastSunKey = '';
  private raf = 0;
  private last = 0;
  private moving = false;
  private first = false;
  private asp = 0;
  private tickT = 0;
  private hp = 0;
  private sleepT = 0;
  private drawn = false;
  private envDirty = true;
  private envRT: THREE.WebGLRenderTarget | null = null;
  private composer: EffectComposer | null = null;
  private compSize: [number, number] = [0, 0];
  private bloomPass: UnrealBloomPass | null = null;
  private exposure = 1;
  private bloom = 0.4;
  private io: IntersectionObserver;
  private ro: ResizeObserver | null = null;
  private handlers: Partial<Record<keyof HTMLElementEventMap, (e: PointerEvent) => void>> = {};
  // scene (after build)
  private scene!: THREE.Scene;
  private gu!: GlobalUniforms;
  private floors: FloorRt[] = [];
  private byK: Record<string, FloorRt> = {};
  private trees!: THREE.Group & { userData: { crowns?: Crowns } };
  private lamps!: Lamps;
  private ctxG!: THREE.Group & { userData: { crowns?: Crowns } };
  private ground!: THREE.Mesh<THREE.CircleGeometry, THREE.MeshStandardMaterial>;
  private sky!: ReturnType<typeof makeSky>;
  private hemi!: THREE.HemisphereLight;
  private sun!: THREE.DirectionalLight;
  private aptLight: THREE.PointLight | null = null;
  private zoneGroup = new THREE.Group();
  private zones: ZoneRt[] = [];
  private zoneFloor: FloorRt | null = null;
  private decal: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null = null;

  constructor(canvas: HTMLCanvasElement, opts: StageOptions) {
    this.view = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.opts = opts;
    this.mode = opts.mode;
    R.stages.add(this);
    this.io = new IntersectionObserver((es) => {
      this.visible = es[es.length - 1].isIntersecting;
      if (this.visible) this.kick();
      else this.sleepSoon();
    });
    this.io.observe(canvas);
    this.bind();
    loadModel(opts.model)
      .then((g) => this.build(g))
      .catch((e: unknown) => {
        this.failed = String((e as Error)?.message || e);
        opts.onError?.(this.failed);
      });
  }

  private sleepSoon() {
    clearTimeout(this.sleepT);
    this.sleepT = window.setTimeout(() => {
      if (![...R.stages].some((s) => s.visible)) release();
    }, 1500);
  }

  private build(gltf: GLTF) {
    const scene = new THREE.Scene();
    this.scene = scene;
    this.gu = { uGlow: { value: 0 }, uLitFrac: { value: 0 }, uCap: { value: new THREE.Color('#2a2b2e') } };
    const root = gltf.scene.clone(true);
    scene.add(root);
    root.updateMatrixWorld(true);
    this.floors = FLOORS.map((F, i) => {
      const node = root.getObjectByName(F.node);
      const fu: FloorUniforms = {
        uLit: { value: 1 },
        uHi: { value: 0 },
        uDim: { value: 0 },
        uOff: { value: 0 },
        uShop: { value: F.k === '1' || F.k === 'b' ? 0.75 : 0 },
      };
      const fl: FloorRt = {
        k: F.k,
        level: F.level,
        h: F.h,
        i,
        node,
        fu,
        base: node ? node.position.clone() : new V3(),
        off: 0,
        offGoal: 0,
        dim: 0,
        dimGoal: 0,
        clip: new THREE.Plane(new V3(0, -1, 0), 1e5),
        cut: false,
        mats: [],
        box: null,
        hiBase: 0,
        hideAbove: false,
      };
      node?.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return;
        o.castShadow = true;
        o.receiveShadow = true;
        o.userData.floor = F.k;
        const list = materialsOf(o).map((m) => {
          const glass = /стекло|glass/i.test(m.name || '');
          const c = m.clone() as THREE.MeshStandardMaterial;
          c.side = THREE.FrontSide;
          c.clippingPlanes = [];
          if (glass) {
            c.color = new THREE.Color('#0b1116');
            c.roughness = 0.06;
            c.metalness = 0.0;
            c.envMapIntensity = 1.25;
          } else c.envMapIntensity = 0.55;
          patchMaterial(c, fu, this.gu, glass);
          fl.mats.push(c);
          return c;
        });
        o.material = Array.isArray(o.material) ? list : list[0];
      });
      fl.box = node ? new THREE.Box3().setFromObject(node) : null;
      return fl;
    });
    this.byK = Object.fromEntries(this.floors.map((f) => [f.k, f]));
    const site = root.getObjectByName('site');
    site?.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.receiveShadow = true;
        materialsOf(o).forEach((m) => ((m as THREE.MeshStandardMaterial).envMapIntensity = 0.35));
      }
    });
    const rand = rng(1337);
    this.trees = site ? treeMeshes(buildTrees(site, rand), rand) : new THREE.Group();
    scene.add(this.trees);
    this.lamps = site ? buildLamps(site) : (new THREE.Group() as Lamps);
    scene.add(this.lamps);
    this.ctxG = buildContext(rng(77), this.gu);
    scene.add(this.ctxG);
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(1400, 64).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: '#303030', roughness: 1 }),
    );
    ground.position.y = -1.42;
    ground.receiveShadow = true;
    scene.add(ground);
    this.ground = ground;
    this.sky = makeSky();
    scene.add(this.sky);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    scene.add(this.hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 3);
    sun.castShadow = true;
    const sm = innerWidth < 760 ? 1024 : 2048;
    sun.shadow.mapSize.set(sm, sm);
    Object.assign(sun.shadow.camera, { left: -58, right: 58, top: 58, bottom: -58, near: 60, far: 400 });
    sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.bias = -0.0008;
    sun.shadow.normalBias = 0;
    sun.shadow.radius = 2.5;
    scene.add(sun, sun.target);
    sun.target.position.set(0, 10, 0);
    this.sun = sun;
    scene.fog = new THREE.Fog(0x888888, 260, 1300);
    if (this.mode === 'explore') {
      this.aptLight = new THREE.PointLight('#ffc58a', 0, 22, 1.6);
      this.aptLight.position.set(0, -50, 0);
      scene.add(this.aptLight);
    }
    scene.add(this.zoneGroup);
    this.ready = true;
    this.applyAll(true);
    this.opts.onReady?.();
    this.kick();
  }

  /* -- public API -- */
  set(p: Partial<StageState>) {
    const prev = { ...this.st };
    Object.assign(this.st, p);
    if (!this.ready) return;
    const ch = (k: keyof StageState) => prev[k] !== this.st[k];
    if ((['exploded', 'open', 'floor', 'apt', 'enter', 'view', 'tod', 'date', 'minutes', 'play'] as const).some(ch))
      this.applyAll(false, prev);
    this.kick();
  }
  dispose() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.io.disconnect();
    this.unbind();
    R.stages.delete(this);
    if (!R.stages.size) release();
  }
  animating() {
    return this.moving || this.st.play;
  }

  /* -- state → scene -- */
  private sunNow() {
    const s = this.st;
    if (this.mode === 'sun') {
      const d = DATES[s.date] || DATES.equinox;
      return sunPos(d[0], d[1], d[2], Math.floor(s.minutes / 60), s.minutes % 60);
    }
    const [dk, m] = TOD[s.tod] || TOD.dusk;
    const d = DATES[dk];
    return sunPos(d[0], d[1], d[2], Math.floor(m / 60), m % 60);
  }
  private applyLight() {
    const { az, el } = this.sunNow();
    const L = look(el);
    const sd = bearingVec(az)
      .multiplyScalar(Math.cos(Math.max(el, -2) * D2R))
      .add(new V3(0, Math.sin(Math.max(el, -2) * D2R), 0))
      .normalize();
    const night = el < -6;
    const ld = night
      ? bearingVec(150)
          .multiplyScalar(0.7)
          .add(new V3(0, 0.7, 0))
          .normalize()
      : sd;
    this.sun.position.copy(ld).multiplyScalar(220).add(this.sun.target.position);
    this.sun.color.copy(L.sunCol);
    this.sun.intensity = night ? 0.22 : L.sunI;
    this.sun.castShadow = !night && el > -1;
    this.hemi.color.copy(L.hemiSky);
    this.hemi.groundColor.copy(L.hemiGround);
    this.hemi.intensity = L.hemiI;
    const u = this.sky.material.uniforms;
    u.uZen.value.copy(L.zenith);
    u.uHor.value.copy(L.horizon);
    u.uGnd.value.copy(L.ground);
    u.uSun.value.copy(sd);
    u.uSunCol.value.copy(L.sunCol);
    u.uSunA.value = sstep(-8, 2, el);
    u.uStars.value = sstep(-4, -12, el);
    const fog = this.scene.fog as THREE.Fog;
    fog.color.copy(L.fog).lerp(L.ground, 0.5);
    fog.near = (el < -6 ? 140 : 150) * 1.35;
    fog.far = (el < -6 ? 700 : 760) * 1.35;
    this.ground.material.color.copy(L.ground);
    this.gu.uGlow.value = L.glow;
    this.gu.uLitFrac.value = L.lit;
    const lampOn = sstep(4, -3, el);
    if (this.lamps.userData.headMat && this.lamps.userData.pools) {
      this.lamps.userData.headMat.emissiveIntensity = 6 * lampOn;
      this.lamps.userData.pools.material.opacity = 0.55 * lampOn;
    }
    [this.trees, this.ctxG].forEach((t) =>
      t.userData.crowns?.material.color.setScalar(lerp(0.55, 1, sstep(-6, 10, el))),
    );
    this.exposure = L.exposure;
    this.bloom = L.bloom;
    const key = Math.round(el * 2) + ':' + Math.round(az / 3);
    if (key !== this.lastSunKey) {
      this.lastSunKey = key;
      this.envDirty = true;
    }
  }
  private applyAll(first: boolean, prev: Partial<StageState> = {}) {
    const s = this.st;
    this.applyLight();
    if (this.mode === 'sun') {
      if (first) Object.assign(this.goal, { b: 200, el: 50, r: 128, ty: 9, tx: 0, tz: 0 });
      this.exp(false, null);
      return;
    }
    const sel = s.exploded && s.open && s.floor ? this.byK[s.floor] : null;
    this.exp(s.exploded, sel);
    this.floors.forEach((f) => {
      f.hiBase = !s.exploded && f.k === s.floor && f.k !== 'roof' ? 0.5 : 0;
      f.fu.uHi.value = f.hiBase;
    });
    if (
      s.exploded &&
      s.open &&
      sel &&
      (prev.floor !== s.floor || prev.open !== s.open || prev.exploded !== s.exploded || first)
    )
      this.buildZones(sel);
    if (!sel) this.clearZones();
    this.zoneLook();
    // camera
    if (s.enter && sel && s.apt) this.flyApt(sel, s.apt);
    else if (
      first ||
      prev.view !== s.view ||
      prev.exploded !== s.exploded ||
      prev.open !== s.open ||
      prev.floor !== s.floor ||
      prev.enter !== s.enter
    )
      this.frame(sel);
  }
  private exp(on: boolean, sel: FloorRt | null) {
    const gap = 3.4;
    this.floors.forEach((f) => {
      const above = !!sel && f.i > sel.i;
      f.offGoal = on ? f.i * gap + (above ? 22 : 0) : 0;
      f.dimGoal = sel && f.i !== sel.i ? (above ? 1 : 0.45) : 0;
      const cut = !!(sel && f === sel && f.k !== 'roof');
      if (cut !== f.cut) {
        f.cut = cut;
        f.mats.forEach((m) => {
          m.clippingPlanes = cut ? [f.clip] : [];
          m.side = cut ? THREE.DoubleSide : THREE.FrontSide;
          m.needsUpdate = true;
        });
      }
      f.hideAbove = !!(sel && (f.k === 'roof' || above));
    });
    this.moving = true;
  }
  private clearZones() {
    this.zones.forEach((z) => {
      z.mesh.geometry.dispose();
      z.line.geometry.dispose();
    });
    this.zoneGroup.clear();
    this.zones = [];
    this.zoneFloor = null;
    this.decal = null;
  }
  private buildZones(fl: FloorRt) {
    this.clearZones();
    this.zoneFloor = fl;
    const plan = PLAN_OF[fl.k];
    const Z = (this.opts.plans || {})[plan as 'typ' | 'f9' | 'ph'];
    const reg = PLAN_REG[plan];
    if (!reg) return;
    const [W, H, cx, cy] = reg;
    const url = (this.opts.planImgs || {})[plan];
    if (url) {
      const dm = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      });
      const decal = new THREE.Mesh(new THREE.PlaneGeometry(W, H).rotateX(-Math.PI / 2), dm);
      decal.position.set(cx, 0, -cy);
      decal.renderOrder = 2;
      decal.visible = false;
      this.zoneGroup.add(decal);
      this.decal = decal;
      const me = this.zoneGroup;
      loadPlanTexture(url).then((t) => {
        if (!t || decal.parent !== me) return;
        dm.map = t;
        dm.needsUpdate = true;
        decal.visible = true;
        this.moving = true;
        this.kick();
      });
    }
    if (!Z) return;
    Z.forEach((z) => {
      const nums = z.poly
        .replace(/%/g, '')
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      const pts: THREE.Vector2[] = [];
      for (let i = 0; i + 1 < nums.length; i += 2) {
        const px = (z.x + (nums[i] / 100) * z.w) / 100;
        const py = (z.y + (nums[i + 1] / 100) * z.h) / 100;
        pts.push(new THREE.Vector2(cx + (px - 0.5) * W, cy - (py - 0.5) * H));
      }
      if (pts.length < 3) return;
      const geo = new THREE.ShapeGeometry(new THREE.Shape(pts));
      geo.rotateX(-Math.PI / 2); // model (x,y) → world (x, 0, -y)
      const rooms = (this.opts.rooms || {})[z.id] || 2;
      const tint = rooms === 1 ? '#9DB7C4' : rooms >= 4 ? '#D08A5C' : '#D9B676';
      const mat = new THREE.MeshBasicMaterial({
        color: tint,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = 3;
      // glowing contour: thin ribbons along the outline
      const rib: THREE.BufferGeometry[] = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        const len = a.distanceTo(b);
        if (len < 0.05) continue;
        const g = new THREE.BoxGeometry(len + 0.1, 0.5, 0.11);
        g.rotateY(-Math.atan2(-(b.y - a.y), b.x - a.x));
        g.translate((a.x + b.x) / 2, 0.25, -(a.y + b.y) / 2);
        rib.push(g);
      }
      const line = new THREE.Mesh(
        mergeGeos(rib),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color('#F2C98A').multiplyScalar(2.2),
          transparent: true,
          opacity: 0,
          toneMapped: false,
          depthWrite: false,
        }),
      );
      line.renderOrder = 4;
      const c = pts.reduce((acc, p) => acc.add(p), new THREE.Vector2()).multiplyScalar(1 / pts.length);
      const zz: ZoneRt = { id: z.id, mesh, line, center: c, fill: 0, edge: 0 };
      mesh.userData.zone = zz;
      this.zoneGroup.add(mesh, line);
      this.zones.push(zz);
    });
  }
  private zoneLook() {
    const s = this.st;
    this.zones.forEach((z) => {
      const on = z.id === s.apt;
      const hv = z.id === s.hoverApt;
      z.fill = s.enter ? (on ? 0.12 : 0) : on ? 0.66 : hv ? 0.5 : s.apt ? 0.14 : 0.3;
      z.edge = s.enter ? (on ? 0.9 : 0) : on ? 1 : hv ? 0.55 : 0;
    });
    this.moving = true;
  }
  private fit(height: number, width: number, depth = 27) {
    const asp = this.cam.aspect || 1.6;
    const vf = (this.cam.fov * D2R) / 2;
    const hf = Math.atan(Math.tan(vf) * asp);
    const r = Math.sqrt(height * height + width * width + depth * depth) / 2;
    return (r / Math.sin(Math.min(vf, hf))) * 0.92;
  }
  private frame(sel: FloorRt | null, onlyR = false) {
    const s = this.st;
    const V: Record<string, [number, number]> = {
      front: [156, 10],
      corner: [122, 22],
      yard: [302, 22],
      top: [156, 86],
    };
    const v = V[s.view];
    const g = this.goal;
    const keep = onlyR ? { b: g.b, el: g.el } : null;
    if (v) {
      g.b = v[0];
      g.el = v[1];
    }
    if (sel) {
      const y = sel.level + sel.i * 3.4 + 1.2;
      g.tx = 0;
      g.tz = 0;
      g.ty = y - 1.0;
      g.r = this.fit(4, 47) * (s.view === 'top' ? 0.92 : 1.06);
      if (!v || s.view === 'front' || s.view === 'corner' || s.view === 'yard') g.el = Math.max(g.el, 50);
      if (s.view === 'top') g.el = 86;
    } else if (s.exploded) {
      g.tx = 0;
      g.tz = 0;
      g.ty = 24;
      g.r = this.fit(76, 47);
    } else {
      g.tx = 0;
      g.tz = 0;
      g.ty = 15.5;
      g.r = this.fit(40, 47);
    }
    if (keep) Object.assign(g, keep);
    this.moving = true;
  }
  private flyApt(fl: FloorRt, id: string) {
    const zs = this.zones.filter((z) => z.id === id);
    if (!zs.length) return;
    const camP = this.cam.position;
    let best = zs[0];
    let bd = 1e9;
    zs.forEach((z) => {
      const d = (z.center.x - camP.x) ** 2 + (-z.center.y - camP.z) ** 2;
      if (d < bd) {
        bd = d;
        best = z;
      }
    });
    const g = this.goal;
    g.tx = best.center.x;
    g.tz = -best.center.y;
    g.ty = fl.level + fl.i * 3.4 + 0.4;
    this.aptLight?.position.set(best.center.x, fl.level + fl.i * 3.4 + 2.6, -best.center.y);
    // look from outside the building toward the apartment, steeply, like a dollhouse
    const out = Math.abs(best.center.y) > 3 ? (best.center.y > 0 ? 336 : 156) : best.center.x > 0 ? 66 : 246;
    g.b = out;
    g.el = 58;
    g.r = 21;
    this.moving = true;
  }

  /* -- input -- */
  private bind() {
    const v = this.view;
    let drag: { x: number; y: number; b: number; el: number; moved: boolean; id: number } | null = null;
    this.handlers = {
      pointerdown: (e) => {
        drag = { x: e.clientX, y: e.clientY, b: this.goal.b, el: this.goal.el, moved: false, id: e.pointerId };
        this.kick();
      },
      pointermove: (e) => {
        this.hover = true;
        if (drag) {
          const dx = e.clientX - drag.x;
          const dy = e.clientY - drag.y;
          if (!drag.moved && Math.hypot(dx, dy) < 5) return;
          if (!drag.moved) {
            drag.moved = true;
            try {
              v.setPointerCapture(drag.id);
            } catch {
              /* ok */
            }
          }
          this.goal.b = drag.b - dx * 0.32;
          if (e.pointerType !== 'touch') this.goal.el = clamp(drag.el + dy * 0.22, 3, 88);
          this.moving = true;
          this.kick();
          return;
        }
        if (this.mode === 'explore') {
          const now = performance.now();
          if (now - this.hp > 60) {
            this.hp = now;
            this.hoverPick(e);
          }
        }
      },
      pointerup: (e) => {
        const d = drag;
        drag = null;
        if (!d) return;
        if (d.moved) {
          this.opts.onFree?.();
          return;
        }
        this.click(e);
      },
      pointerleave: () => {
        this.hover = false;
        this.floors.forEach((fl) => (fl.fu.uHi.value = fl.hiBase || 0));
        if (this.st.hoverApt) this.st.hoverApt = '';
        if (this.ready) {
          this.zoneLook();
          this.kick();
        }
        v.style.cursor = '';
      },
      pointercancel: () => {
        drag = null;
      },
    };
    for (const [k, h] of Object.entries(this.handlers)) v.addEventListener(k, h as EventListener);
    this.ro = new ResizeObserver(() => this.kick());
    this.ro.observe(v);
  }
  private unbind() {
    for (const [k, h] of Object.entries(this.handlers)) this.view.removeEventListener(k, h as EventListener);
    this.ro?.disconnect();
  }
  private ray(e: PointerEvent) {
    const r = this.view.getBoundingClientRect();
    const nd = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(nd, this.cam);
    return ray;
  }
  private pickZone(ray: THREE.Raycaster): ZoneRt | null {
    if (!this.zones.length) return null;
    const h = ray.intersectObjects(
      this.zones.map((z) => z.mesh),
      false,
    )[0];
    return h ? (h.object.userData.zone as ZoneRt) : null;
  }
  private pickFloor(ray: THREE.Raycaster) {
    let best: FloorRt | null = null;
    let bd = 1e9;
    const b = new THREE.Box3();
    const hit = new V3();
    this.floors.forEach((f) => {
      if (!f.box || !f.node?.visible || f.k === 'roof') return;
      b.copy(f.box);
      b.min.y = Math.max(b.min.y, f.level - 0.3);
      b.max.y = f.cut ? f.level + 1.35 : Math.min(b.max.y, f.level + f.h - 0.05);
      b.min.y += f.off;
      b.max.y += f.off;
      if (ray.ray.intersectBox(b, hit)) {
        const d = hit.distanceToSquared(ray.ray.origin);
        if (d < bd) {
          bd = d;
          best = f;
        }
      }
    });
    return best as FloorRt | null;
  }
  private hoverPick(e: PointerEvent) {
    if (!this.ready) return;
    const ray = this.ray(e);
    const z = this.st.enter ? null : this.pickZone(ray);
    const id = z ? z.id : '';
    let cur = '';
    if (!z) {
      const f = !this.st.enter ? this.pickFloor(ray) : null;
      this.floors.forEach(
        (fl) => (fl.fu.uHi.value = Math.max(fl.hiBase || 0, f && fl === f && f.k !== 'roof' && !fl.cut ? 0.55 : 0)),
      );
      cur = f && f.k !== 'roof' ? 'pointer' : 'grab';
    } else {
      this.floors.forEach((fl) => (fl.fu.uHi.value = fl.hiBase || 0));
      cur = 'pointer';
    }
    this.view.style.cursor = cur;
    if (id !== this.st.hoverApt) {
      this.st.hoverApt = id;
      this.zoneLook();
    }
    this.kick();
  }
  private click(e: PointerEvent) {
    if (!this.ready) return;
    const ray = this.ray(e);
    const z = this.st.enter ? null : this.pickZone(ray);
    if (z) {
      this.opts.onApt?.(z.id);
      return;
    }
    const f = this.pickFloor(ray);
    if (f && f.k !== 'roof') this.opts.onFloor?.(f.k);
  }

  /* -- render loop -- */
  kick() {
    if (!this.raf) this.raf = requestAnimationFrame((t) => this.tick(t));
  }
  private tick(now: number) {
    this.raf = 0;
    if (!this.ready || !this.visible) return;
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000) || 0.016;
    this.last = now;
    const k = 1 - Math.pow(0.0025, dt);
    let moving = false;
    const cw0 = this.view.clientWidth;
    const ch0 = this.view.clientHeight;
    if (cw0 > 4 && ch0 > 4) {
      const asp = cw0 / ch0;
      this.cam.aspect = asp;
      if (Math.abs(asp - this.asp) > 0.01) {
        this.asp = asp;
        if (this.mode === 'explore' && !this.st.enter) {
          const s = this.st;
          this.frame(s.exploded && s.open && s.floor ? this.byK[s.floor] : null, !this.first);
        }
        if (this.mode === 'sun') this.goal.r = this.fit(36, 70, 60);
      }
    }
    const snap = !this.first || this.opts.snap;
    if (snap) {
      this.first = true;
      Object.assign(this.orb, this.goal);
      this.floors.forEach((f) => {
        f.off = f.offGoal;
        f.dim = f.dimGoal;
      });
      this.zones.forEach((z) => {
        z.mesh.material.opacity = z.fill;
        z.line.material.opacity = z.edge;
      });
      if (this.decal) this.decal.material.opacity = this.st.enter ? 0.95 : 0.6;
      if (this.aptLight) this.aptLight.intensity = this.st.enter ? 45 : 0;
    }
    // sun play (sun mode)
    if (this.mode === 'sun' && this.st.play) {
      let m = this.st.minutes + dt * 40;
      const rise = this.opts.dayRange ? this.opts.dayRange(this.st.date) : [300, 1200];
      if (m > rise[1]) m = rise[0];
      this.st.minutes = m;
      this.applyLight();
      this.tickT += dt;
      if (this.tickT > 0.25) {
        this.tickT = 0;
        this.opts.onTime?.(Math.round(m));
      }
      moving = true;
    }
    // camera damping
    const o = this.orb;
    const g = this.goal;
    const db = ((g.b - o.b + 540) % 360) - 180;
    for (const key of ['el', 'r', 'ty', 'tx', 'tz'] as const) {
      const dv = g[key] - o[key];
      if (Math.abs(dv) > 1e-3) {
        o[key] += dv * k;
        moving = true;
      } else o[key] = g[key];
    }
    if (Math.abs(db) > 1e-3) {
      o.b += db * k;
      moving = true;
    }
    // floors
    this.floors.forEach((f) => {
      const d1 = f.offGoal - f.off;
      const d2 = f.dimGoal - f.dim;
      if (Math.abs(d1) > 1e-3 || Math.abs(d2) > 1e-3) {
        f.off += d1 * k * 0.9;
        f.dim += d2 * k;
        moving = true;
      } else {
        f.off = f.offGoal;
        f.dim = f.dimGoal;
      }
      if (f.node) {
        f.node.position.y = f.base.y + f.off;
        f.node.visible = !(f.hideAbove && f.dim > 0.7);
      }
      f.fu.uOff.value = f.off;
      f.fu.uDim.value = f.dim;
      f.clip.constant = f.level + f.off + (this.st.enter ? 1.15 : 1.35);
    });
    // zones
    const zf = this.zoneFloor;
    const zy = zf ? zf.level + zf.off + 0.32 : 0;
    if (this.decal) {
      const go = this.st.enter ? 0.95 : 0.6;
      const dm = this.decal.material;
      if (Math.abs(go - dm.opacity) > 1e-3) {
        dm.opacity += (go - dm.opacity) * k;
        moving = true;
      }
      this.decal.position.y = zy - 0.04;
    }
    if (this.aptLight) {
      const li = this.aptLight;
      const go = this.st.enter ? 45 : 0;
      if (Math.abs(go - li.intensity) > 0.05) {
        li.intensity += (go - li.intensity) * k;
        moving = true;
      } else li.intensity = go;
      if (zf) li.position.y = zf.level + zf.off + 2.6;
    }
    this.zones.forEach((z) => {
      const a = z.mesh.material;
      const b = z.line.material;
      const d1 = z.fill - a.opacity;
      const d2 = z.edge - b.opacity;
      if (Math.abs(d1) > 1e-3 || Math.abs(d2) > 1e-3) {
        a.opacity += d1 * k;
        b.opacity += d2 * k;
        moving = true;
      } else {
        a.opacity = z.fill;
        b.opacity = z.edge;
      }
      z.mesh.position.y = zy;
      z.line.position.y = zy - 0.25;
    });
    // camera placement
    const tgt = new V3(o.tx, o.ty, o.tz);
    const dir = bearingVec(o.b)
      .multiplyScalar(Math.cos(o.el * D2R))
      .add(new V3(0, Math.sin(o.el * D2R), 0));
    this.cam.position.copy(tgt).addScaledVector(dir, o.r);
    this.cam.lookAt(tgt);
    this.moving = moving;
    this.render();
    if (moving) this.kick();
    else idleCheck();
  }
  /** called by the shared renderer */
  onRenderer() {
    this.envDirty = true;
    this.composer = null;
  }
  dropGpu() {
    this.composer = null;
    if (this.envRT) {
      this.envRT.dispose();
      this.envRT = null;
    }
  }
  private render() {
    const v = this.view;
    const cw = v.clientWidth;
    const ch = v.clientHeight;
    if (cw < 4 || ch < 4) return;
    const r = renderer();
    if (!r || !R.pmrem) {
      this.failed = 'webgl';
      this.opts.onError?.('webgl');
      return;
    }
    let dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    dpr = Math.min(dpr, Math.sqrt(3.2e6 / (cw * ch)));
    const w = Math.max(2, Math.round(cw * dpr));
    const h = Math.max(2, Math.round(ch * dpr));
    if (v.width !== w || v.height !== h) {
      v.width = w;
      v.height = h;
    }
    this.cam.aspect = cw / ch;
    this.cam.clearViewOffset();
    this.cam.updateProjectionMatrix();
    if (this.envDirty || !this.envRT) {
      this.envRT?.dispose();
      const es = new THREE.Scene();
      es.add(makeSky(this.sky.material.uniforms));
      this.envRT = R.pmrem.fromScene(es, 0, 1, 2000);
      this.scene.environment = this.envRT.texture;
      this.envDirty = false;
    }
    r.setPixelRatio(1);
    r.setSize(w, h, false);
    r.toneMappingExposure = this.exposure || 1;
    if (!this.composer || this.composer.renderer !== r) {
      const comp = new EffectComposer(r);
      comp.addPass(new RenderPass(this.scene, this.cam));
      this.bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.4, 0.32, 0.92);
      comp.addPass(this.bloomPass);
      comp.addPass(new OutputPass());
      this.composer = comp;
      this.compSize = [0, 0];
    }
    if (this.compSize[0] !== w || this.compSize[1] !== h) {
      this.composer.setPixelRatio(1);
      this.composer.setSize(w, h);
      this.compSize = [w, h];
    }
    this.bloomPass!.strength = this.bloom || 0.4;
    this.composer.render();
    this.ctx.drawImage(r.domElement, 0, 0, w, h);
    if (!this.drawn) {
      this.drawn = true;
      this.opts.onFirstFrame?.();
    }
  }
}

export const createStage = (canvas: HTMLCanvasElement, opts: StageOptions) => new Stage(canvas, opts);
