// One-off port (already applied; kept to document how src/components/sections were produced).
// Needs parse5 + prettier: node tools/port-template.mjs <main.html> <i18n.json> <outDir>
// levakant-source/src/main.html (DC template) -> TSX section components + next-intl messages.
// Mirrors runtime.js semantics: whitespace kept (normalised to one space), false/null attrs dropped,
// BOOL attrs only when truthy, style strings -> objects, canvas children skipped, sc-if/sc-for -> && / map.
import fs from 'node:fs';
import path from 'node:path';
import { parseFragment } from 'parse5';
import * as prettier from 'prettier';

const [, , srcHtml, dictPath, outDir] = process.argv;
const html = fs.readFileSync(srcHtml, 'utf8');
const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });

/* ---------- reference translator (port of Component._i18n tk/tr) ---------- */
function makeTr(lang) {
  const D = dict[lang];
  const R = dict.rx[lang].map((r) => [new RegExp(r[0]), r[1]]);
  const tk = (k, dp) => {
    const v = D[k];
    if (v !== undefined) return v;
    if (dp > 14) return undefined;
    for (const [re, rep] of R) {
      const m = k.match(re);
      if (m) return rep.replace(/§(\d)/g, (x, j) => { const r = tk(m[+j], dp + 1); return r === undefined ? m[+j] : r; }).replace(/\$(\d)/g, (x, j) => m[+j] || '');
    }
    return undefined;
  };
  return (s) => { const k = s.replace(/\s+/g, ' ').trim(); return k ? tk(k, 0) : s; };
}
const TR = { tg: makeTr('tj'), en: makeTr('en') };

/* ---------- messages ---------- */
const MSG = { ru: {}, tg: {}, en: {} };
const report = { missing: [], argFail: [] };
const SAMPLES = ['193 160', '5 500', '35,12', '12', '7'];
function slug(en) {
  const src = en && /[A-Za-z]/.test(en) ? en : '';
  let w = (src.match(/[A-Za-z0-9]+/g) || []).slice(0, 4).map((x, i) => (i ? x[0].toUpperCase() + x.slice(1).toLowerCase() : x.toLowerCase()));
  let k = w.join('') || 'text';
  if (/^\d/.test(k)) k = 'n' + k;
  return k.slice(0, 32);
}
function addMsg(ns, ruIcu, args) {
  // ruIcu: RU text with {arg} placeholders. Translate by substituting sample values.
  MSG.ru[ns] ||= {}; MSG.tg[ns] ||= {}; MSG.en[ns] ||= {};
  const existing = Object.entries(MSG.ru[ns]).find(([, v]) => v === ruIcu);
  if (existing) return existing[0];
  const out = {};
  for (const lang of ['tg', 'en']) {
    let res;
    if (!args.length) res = TR[lang](ruIcu);
    else {
      // try same sample for all args first, then distinct samples
      const tries = [SAMPLES.map(() => null)];
      for (const s of SAMPLES) {
        const vals = args.map((a, i) => (args.length === 1 ? s : SAMPLES[(SAMPLES.indexOf(s) + i) % SAMPLES.length]));
        let txt = ruIcu; args.forEach((a, i) => { txt = txt.split('{' + a + '}').join(vals[i]); });
        const t = TR[lang](txt);
        if (t === undefined) continue;
        let back = t, ok = true;
        args.forEach((a, i) => { if (back.split(vals[i]).length !== 2) ok = false; else back = back.replace(vals[i], '{' + a + '}'); });
        if (ok) { res = back; break; }
      }
      void tries;
      if (res === undefined) report.argFail.push(`${ns}: ${ruIcu}`);
    }
    if (res === undefined) { report.missing.push(`${lang} ${ns}: ${ruIcu}`); res = ruIcu; }
    out[lang] = res;
  }
  let key = slug(out.en, ruIcu), n = 2;
  while (MSG.ru[ns][key] !== undefined) key = slug(out.en, ruIcu) + n++;
  MSG.ru[ns][key] = ruIcu; MSG.tg[ns][key] = out.tg; MSG.en[ns][key] = out.en;
  return key;
}

/* ---------- JSX emit ---------- */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const EVT = { onclick: 'onClick', onchange: 'onChange', oninput: 'onInput', onmousemove: 'onMouseMove', onmouseleave: 'onMouseLeave', onmouseenter: 'onMouseEnter', onkeydown: 'onKeyDown', onkeyup: 'onKeyUp', onsubmit: 'onSubmit', onfocus: 'onFocus', onblur: 'onBlur', onpointerdown: 'onPointerDown', onpointermove: 'onPointerMove', onpointerup: 'onPointerUp', onpointerleave: 'onPointerLeave', onwheel: 'onWheel', onscroll: 'onScroll' };
const ATTR = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', autocomplete: 'autoComplete', readonly: 'readOnly', maxlength: 'maxLength', minlength: 'minLength', colspan: 'colSpan', rowspan: 'rowSpan', crossorigin: 'crossOrigin', srcset: 'srcSet', enterkeyhint: 'enterKeyHint', inputmode: 'inputMode', spellcheck: 'spellCheck', contenteditable: 'contentEditable', frameborder: 'frameBorder', allowfullscreen: 'allowFullScreen', viewbox: 'viewBox' };
const BOOL = new Set(['disabled', 'hidden', 'checked', 'selected', 'multiple', 'required', 'autoplay', 'muted', 'loop', 'controls', 'playsinline', 'open', 'readonly', 'novalidate']);
const TXT_ATTR = new Set(['aria-label', 'alt', 'placeholder', 'title', 'aria-description']);
const H = /\{\{([^}]+)\}\}/g;
const camel = (n) => n.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const RESERVED = new Set(['t', 'v', 'i']);

function expr(p, scope) {
  p = p.trim();
  if (p === 'true' || p === 'false' || p === 'null' || /^-?\d+(\.\d+)?$/.test(p)) return p;
  const head = p.split('.')[0];
  if (scope.has(head)) { const nm = scope.get(head); return [nm, ...p.split('.').slice(1)].join('.'); }
  return 'v.' + p;
}
const usage = new Map(); // section -> Set of v.* paths
function noteUse(sec, e) { if (e.startsWith('v.')) { usage.get(sec).add(e.slice(2)); } }

function parts(str) { // -> [{t:'s',s}|{t:'b',p}]
  const out = []; let last = 0; let m; H.lastIndex = 0;
  while ((m = H.exec(str))) { if (m.index > last) out.push({ t: 's', s: str.slice(last, m.index) }); out.push({ t: 'b', p: m[1] }); last = m.index + m[0].length; }
  if (last < str.length) out.push({ t: 's', s: str.slice(last) });
  return out;
}
const hasWords = (s) => /[А-Яа-яЁёҲҳҶҷҚқҒғӢӣӮӯ]/.test(s);

function textToJsx(raw, ctx) {
  const norm = raw.replace(/\s+/g, ' ');
  if (!norm.trim()) return norm ? '{" "}' : '';
  const lead = /^\s/.test(norm) ? '{" "}' : '', trail = /\s$/.test(norm) ? '{" "}' : '';
  const body = norm.trim();
  const ps = parts(body);
  const staticTxt = ps.filter((p) => p.t === 's').map((p) => p.s).join('');
  if (!hasWords(staticTxt)) {
    // only bindings / numbers / punctuation: emit inline
    const inner = ps.map((p) => { if (p.t === 's') return JSON.stringify(p.s); const e = expr(p.p, ctx.scope); noteUse(ctx.sec, e); return e; });
    return lead + inner.map((x) => `{${x}}`).join('') + trail;
  }
  const args = []; const argExpr = [];
  let icu = '';
  for (const p of ps) {
    if (p.t === 's') { icu += p.s; continue; }
    const e = expr(p.p, ctx.scope); noteUse(ctx.sec, e);
    let a = p.p.trim().split('.').pop().replace(/[^A-Za-z0-9_]/g, '_');
    while (args.includes(a)) a += '2';
    args.push(a); argExpr.push(`${a}: ${e}`); icu += '{' + a + '}';
  }
  const key = addMsg(ctx.ns, icu, args);
  return lead + `{t(${JSON.stringify(key)}${args.length ? ', { ' + argExpr.join(', ') + ' }' : ''})}` + trail;
}

function attrValue(name, val, ctx, isText) {
  const ps = parts(val);
  if (ps.length === 1 && ps[0].t === 'b') { const e = expr(ps[0].p, ctx.scope); noteUse(ctx.sec, e); return { kind: 'expr', code: e }; }
  if (ps.every((p) => p.t === 's')) {
    if (isText && hasWords(val)) { const key = addMsg(ctx.ns, val.replace(/\s+/g, ' ').trim(), []); return { kind: 'expr', code: `t(${JSON.stringify(key)})` }; }
    return { kind: 'str', code: val };
  }
  if (isText && hasWords(ps.filter((p) => p.t === 's').map((p) => p.s).join(''))) {
    const args = [], argExpr = []; let icu = '';
    for (const p of ps) { if (p.t === 's') { icu += p.s; continue; } const e = expr(p.p, ctx.scope); noteUse(ctx.sec, e); let a = p.p.trim().split('.').pop(); while (args.includes(a)) a += '2'; args.push(a); argExpr.push(`${a}: ${e}`); icu += '{' + a + '}'; }
    const key = addMsg(ctx.ns, icu.replace(/\s+/g, ' ').trim(), args);
    return { kind: 'expr', code: `t(${JSON.stringify(key)}, { ${argExpr.join(', ')} })` };
  }
  const tpl = ps.map((p) => { if (p.t === 's') return p.s.replace(/[`\\]/g, '\\$&').replace(/\$\{/g, '\\${'); const e = expr(p.p, ctx.scope); noteUse(ctx.sec, e); return '${' + e + '}'; }).join('');
  return { kind: 'expr', code: '`' + tpl + '`' };
}

function styleToObj(val, ctx) {
  const decls = val.split(';').map((d) => d.trim()).filter(Boolean);
  const props = decls.map((d) => {
    const i = d.indexOf(':'); const k = d.slice(0, i).trim(); const vv = d.slice(i + 1).trim();
    const key = k.startsWith('--') ? JSON.stringify(k) : camel(k);
    const av = attrValue('style', vv, ctx, false);
    return `${key}: ${av.kind === 'str' ? JSON.stringify(av.code) : av.code}`;
  });
  return `{ ${props.join(', ')} }`;
}

function nodeToJsx(n, ctx, svg) {
  if (n.nodeName === '#text') return textToJsx(n.value, ctx);
  if (n.nodeName === '#comment') return '';
  const tag = n.tagName;
  const attrs = Object.fromEntries((n.attrs || []).map((a) => [a.name, a.value]));
  const kids = (c, s) => (c.content ? c.content.childNodes : c.childNodes).map((k) => nodeToJsx(k, ctx, s)).join('');
  if (tag === 'sc-if') {
    const e = expr(attrs.value.replace(/^\{\{|\}\}$/g, ''), ctx.scope); noteUse(ctx.sec, e);
    return `{${e} && (<>${kids(n, svg)}</>)}`;
  }
  if (tag === 'sc-for') {
    const e = expr(attrs.list.replace(/^\{\{|\}\}$/g, ''), ctx.scope); noteUse(ctx.sec, e);
    const as = attrs.as || 'item'; const nm = RESERVED.has(as) ? as + 'x' : as;
    const prev = ctx.scope.get(as); ctx.scope.set(as, nm);
    const body = kids(n, svg);
    if (prev === undefined) ctx.scope.delete(as); else ctx.scope.set(as, prev);
    return `{${e}.map((${nm}, i) => (<Fragment key={i}>${body}</Fragment>))}`;
  }
  const isSvg = svg || tag === 'svg';
  const props = [];
  const hasChange = 'onchange' in attrs || 'oninput' in attrs;
  for (const [name, val] of Object.entries(attrs)) {
    if (name.startsWith('hint-')) continue;
    if (name === 'ref') { const e = expr(val.replace(/^\{\{|\}\}$/g, ''), ctx.scope); noteUse(ctx.sec, e); props.push(`ref={${e}}`); continue; }
    if (EVT[name]) {
      let ev = EVT[name];
      if (ev === 'onInput' && (tag === 'input' || tag === 'textarea') && 'value' in attrs) ev = 'onChange';
      const e = expr(val.replace(/^\{\{|\}\}$/g, ''), ctx.scope); noteUse(ctx.sec, e); props.push(`${ev}={${e}}`); continue;
    }
    if (BOOL.has(name)) {
      if (val === '' || val === name) { props.push(ATTR[name] || name); continue; }
      const av = attrValue(name, val, ctx, false);
      props.push(`${ATTR[name] || name}={${av.kind === 'str' ? JSON.stringify(val === 'true') : '!!(' + av.code + ')'}}`); continue;
    }
    if (name === 'style') { props.push(`style={${styleToObj(val, ctx)}}`); continue; }
    let pn = ATTR[name] || name;
    if (isSvg && !name.startsWith('aria-') && !name.startsWith('data-') && name.indexOf('-') > 0) pn = camel(name);
    if (name === 'value' && (tag === 'input' || tag === 'textarea' || tag === 'select')) pn = 'value';
    const av = attrValue(name, val, ctx, TXT_ATTR.has(name));
    props.push(av.kind === 'str' ? `${pn}=${JSON.stringify(av.code)}` : `${pn}={${av.code}}`);
  }
  if ('value' in attrs && !hasChange && (tag === 'input' || tag === 'textarea' || tag === 'select')) props.push('readOnly');
  const open = `<${tag}${props.length ? ' ' + props.join(' ') : ''}`;
  if (VOID.has(tag) || tag === 'canvas') return tag === 'canvas' ? open + `></${tag}>` : open + ' />';
  return `${open}>${kids(n, isSvg)}</${tag}>`;
}

/* ---------- split into sections ---------- */
const frag = parseFragment(html);
const root = frag.childNodes.find((n) => n.tagName === 'div');
const sections = []; // {name, nodes, parent}
function collect(parent) {
  let cur = null;
  for (const n of parent.childNodes) {
    if (n.nodeName === '#comment') {
      const m = n.data.match(/^(\/)?s:([a-z]+)$/);
      if (m && !m[1]) { cur = { name: m[2], nodes: [] }; sections.push(cur); continue; }
      if (m && m[1]) { cur = null; continue; }
    }
    if (cur) cur.nodes.push(n);
    else if (n.tagName === 'div' && /\brest\b/.test((n.attrs.find((a) => a.name === 'class') || {}).value || '')) collect(n);
  }
}
collect(root);

const NAMES = { nav: 'Nav', hero: 'Hero', about: 'About', price: 'Price', building: 'Building', floorplan: 'Floorplan', apartments: 'Apartments', trust: 'Trust', lifestyle: 'Lifestyle', location: 'Location', gallery: 'Gallery', arch: 'Architecture', commerce: 'Commerce', contact: 'Contact', footer: 'Footer', mcta: 'MobileCta', lightbox: 'Lightbox', planx: 'PlanZoom' };
const summary = [];
for (const s of sections) {
  usage.set(s.name, new Set());
  const ctx = { sec: s.name, ns: s.name, scope: new Map() };
  const body = s.nodes.map((n) => nodeToJsx(n, ctx, false)).join('');
  const comp = NAMES[s.name];
  const uses = [...usage.get(s.name)].sort();
  const src = `// Generated from levakant-source/src/main.html <!--s:${s.name}--> — hand-maintained from here on.
import { Fragment } from 'react';
import { useTranslations } from 'next-intl';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ${comp}({ v }: { v: any }) {
  const t = useTranslations(${JSON.stringify(s.name)});
  return (<>${body}</>);
}
`;
  let pretty = src;
  try { pretty = await prettier.format(src, { parser: 'typescript', printWidth: 120, singleQuote: true }); } catch (e) { console.error('prettier failed for', s.name, e.message.slice(0, 300)); }
  fs.writeFileSync(path.join(outDir, comp + '.tsx'), pretty);
  summary.push({ name: s.name, comp, uses });
}
for (const l of ['ru', 'tg', 'en']) fs.writeFileSync(path.join(outDir, `messages.${l}.json`), JSON.stringify(MSG[l], null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'uses.json'), JSON.stringify(summary, null, 1));
fs.writeFileSync(path.join(outDir, 'report.txt'), `missing (${report.missing.length}):\n${report.missing.join('\n')}\n\nargFail (${report.argFail.length}):\n${report.argFail.join('\n')}\n`);
console.log('sections', sections.map((s) => s.name).join(' '));
console.log('messages', Object.values(MSG.ru).reduce((a, o) => a + Object.keys(o).length, 0), 'missing', report.missing.length, 'argFail', report.argFail.length);
