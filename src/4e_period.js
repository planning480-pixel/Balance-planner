
/* ---------- Bangkok areas ---------- */
const BKK = 'กรุงเทพมหานคร';
const BKK5 = ['กรุงเทพ 1', 'กรุงเทพ 2', 'กรุงเทพ 3', 'กรุงเทพ 4', 'กรุงเทพ 5'];
const BKK_W = [0.26, 0.22, 0.2, 0.17, 0.15];
const areaProv = (a) => (BKK5.includes(a) ? BKK : a);
const regionAreas = (u) => regionProvs(u).flatMap((p) => (p === BKK ? BKK5 : [p]));
const allAreas = () => allProvs().flatMap((p) => (p === BKK ? BKK5 : [p]));

/* ---------- fiscal years & months ---------- */
const W12 = (() => { const w = [1.0, 0.95, 1.05, 1.02, 0.92, 0.98, 0.97, 1.0, 0.99, 1.01, 1.03, 1.08]; const s = w.reduce((a, b) => a + b, 0); return w.map((x) => x / s); })();
const fyCur = () => Number(S.ops?.annual?.fy) || 2570;
const selFy = () => (Number(S.fy) === fyCur() - 1 ? fyCur() - 1 : fyCur());
const monFy = (m, fy) => MONTHS[m].replace(/(\d+)$/, (x) => String(Number(x) - (fyCur() - fy)));
const QN = ['Q1 (ต.ค.–ธ.ค.)', 'Q2 (ม.ค.–มี.ค.)', 'Q3 (เม.ย.–มิ.ย.)', 'Q4 (ก.ค.–ก.ย.)'];
/* sample yearly totals used to synthesise past months until real monthly files are imported */
const YEAR_BASE = { revenue: { 2568: [537540, 609700], 2569: [565000, 578200] }, enforce: { 2568: [900, 850], 2569: [960, 900] }, audit: { 2568: [0.43, 1], 2569: [0.45, 1] } };
function lastMonth(fy) { if (fy !== fyCur()) return 11; const ks = Object.keys(S.ops?.months || {}).map(Number); return ks.length ? Math.max(...ks) : -1; }

/* ---------- period modes ---------- */
const PER_T = [['year', 'ทั้งปี (สะสม)'], ['month', 'รายเดือน']];
const PER_G = [['yoy', 'YoY'], ['qoq', 'QoQ'], ['mom', 'MoM']];
const perMode = () => (['year', 'month', 'yoy', 'qoq', 'mom'].includes(S.per) ? S.per : 'year');
const isGrowth = (p = perMode()) => ['mom', 'qoq', 'yoy'].includes(p);
const refWord = () => (isGrowth() ? 'ปีก่อน' : 'เป้า');
function perSel() {
  const fy = selFy(), last = lastMonth(fy), p = perMode();
  const m = Math.max(0, Math.min(last < 0 ? 0 : last, S.pm == null ? last : Number(S.pm)));
  const q = S.pq == null ? Math.max(0, Math.floor(Math.max(last, 0) / 3)) : Number(S.pq);
  let months;
  if (p === 'month' || p === 'mom') months = [m];
  else if (p === 'qoq') months = [q * 3, q * 3 + 1, q * 3 + 2].filter((x) => x <= last);
  else months = Array.from({ length: last + 1 }, (_, i) => i);
  return { fy, last, p, m, q, months };
}
function perLabel(sel = perSel()) {
  const { fy, p, m, q, months } = sel, f = (x) => monFy(x, fy);
  if (!months.length) return 'ยังไม่มีข้อมูลในช่วงนี้';
  const rng = months.length > 1 ? `${f(months[0])} – ${f(months[months.length - 1])}` : f(months[0]);
  const prev = months.length > 1 ? `${monFy(months[0], fy - 1)} – ${monFy(months[months.length - 1], fy - 1)}` : monFy(months[0], fy - 1);
  if (p === 'year') return `ปีงบ ${fy} · ${rng} เทียบเป้า`;
  if (p === 'month') return `${rng} เทียบเป้าเดือนนี้`;
  return `${p === 'qoq' ? QN[q].split(' ')[0] + ' · ' : ''}${rng} เทียบ ${prev}`;
}

/* ---------- monthly data (with Bangkok split) ---------- */
function splitBkk(M) {
  if (!M?.prov || !M.prov[BKK] || BKK5.some((a) => M.prov[a])) return M;
  const o = { prov: Object.assign({}, M.prov), pp: Object.assign({}, M.pp || {}) };
  const v = M.prov[BKK]; delete o.prov[BKK];
  const jw = (salt) => { const w = BKK_W.map((x, i) => x * (0.94 + hsh(BKK5[i] + salt) * 0.12)); const t = w.reduce((a, b) => a + b, 0); return w.map((x) => x / t); };
  const pp = M.pp?.[BKK]; delete o.pp[BKK];
  if (pp) { BKK5.forEach((a) => { o.pp[a] = {}; }); Object.entries(pp).forEach(([k, x]) => { const w = jw(k); BKK5.forEach((a, i) => { o.pp[a][k] = [x[0] * w[i], x[1] * BKK_W[i]]; }); }); BKK5.forEach((a) => { o.prov[a] = Object.values(o.pp[a]).reduce((s2, x) => [s2[0] + x[0], s2[1] + x[1]], [0, 0]); }); }
  else { const w = jw('a'); BKK5.forEach((a, i) => { o.prov[a] = [v[0] * w[i], v[1] * BKK_W[i]]; }); }
  return o;
}
let MD_CACHE = {};
const mdKey = () => String(S.ops?.updatedAt || '') + '|' + Object.keys(S.ops?.months || {}).join(',');
function tmplMonth() { const ks = Object.keys(S.ops?.months || {}).map(Number).sort((a, b) => a - b); return ks.length ? { m: ks[0], d: S.ops.months[String(ks[0])] } : null; }
/* synthesise a month from the first real month: scale = seasonality × year size */
function genMonth(fy, m, targetOnly) {
  const tp = tmplMonth(); if (!tp) return null;
  const w = W12[m] / W12[tp.m], out = {};
  ['revenue', 'enforce', 'audit'].forEach((met) => {
    const M = tp.d[met]; if (!M) return;
    let fa = 1, ft = 1;
    if (fy !== fyCur()) {
      const yb = YEAR_BASE[met][fy]; if (!yb) return;
      if (met === 'audit') { fa = 1; ft = 1; }
      else { const totA = Object.values(M.prov || {}).reduce((s, v) => s + Number(v[0] || 0), 0) / W12[tp.m]; const ann = Number(S.ops?.annual?.[met]) || Object.values(M.prov || {}).reduce((s, v) => s + Number(v[1] || 0), 0) / W12[tp.m]; fa = totA ? yb[0] / totA : 1; ft = ann ? yb[1] / ann : 1; }
    }
    const hrAdj = met === 'audit' && fy !== fyCur() ? YEAR_BASE.audit[fy][0] / 0.476 : 1;
    const jit = (k) => (fy === fyCur() ? 1 : 0.94 + hsh(String(fy) + m + k) * 0.12);
    const pair = (v, k) => (met === 'audit' ? [targetOnly ? null : Number(v[0] || 0) * w * hrAdj * jit(k), Number(v[1] || 0) * w] : [targetOnly ? null : Number(v[0] || 0) * w * fa * jit(k), Number(v[1] || 0) * w * ft]);
    const o = { prov: {}, pp: {} };
    Object.entries(M.pp || {}).forEach(([n, ob]) => { o.pp[n] = {}; Object.entries(ob).forEach(([k, v]) => { o.pp[n][k] = pair(v, n + k); }); o.prov[n] = Object.values(o.pp[n]).reduce((s, x) => [s[0] == null ? null : s[0] + (x[0] || 0), s[1] + x[1]], [targetOnly ? null : 0, 0]); });
    Object.entries(M.prov || {}).forEach(([n, v]) => { if (!o.prov[n]) o.prov[n] = pair(v, n); });
    out[met] = o;
  });
  out.sample = true;
  return out;
}
/* month data for a fiscal year: real if present, otherwise synthesised (past years) or target-only (future months) */
function monthData(fy, m, opt = {}) {
  const key = mdKey() + '|' + fy + '|' + m + '|' + (opt.tgt ? 't' : '');
  if (MD_CACHE.k !== mdKey()) MD_CACHE = { k: mdKey() };
  if (key in MD_CACHE) return MD_CACHE[key];
  let raw = null;
  if (fy === fyCur()) raw = S.ops?.months?.[String(m)] || (opt.tgt ? genMonth(fy, m, true) : null);
  else raw = S.ops?.hist?.[fy]?.[String(m)] || genMonth(fy, m, false);
  const d = raw ? Object.fromEntries(['revenue', 'enforce', 'audit'].filter((k) => raw[k]).map((k) => [k, splitBkk(raw[k])])) : null;
  if (d && raw.sample) d.sample = true;
  MD_CACHE[key] = d; return d;
}
const isSampleFy = (fy) => fy !== fyCur() && !S.ops?.hist?.[fy];
function sumData(list) {
  const out = {};
  ['revenue', 'enforce', 'audit'].forEach((met) => {
    const acc = { prov: {}, pp: {} }; let any = false;
    list.forEach((d) => { const M = d?.[met]; if (!M) return; any = true;
      Object.entries(M.prov || {}).forEach(([n, v]) => { const c = acc.prov[n] || [0, 0]; acc.prov[n] = [c[0] + Number(v[0] || 0), c[1] + Number(v[1] || 0)]; });
      Object.entries(M.pp || {}).forEach(([n, ob]) => { acc.pp[n] = acc.pp[n] || {}; Object.entries(ob).forEach(([k, v]) => { const c = acc.pp[n][k] || [0, 0]; acc.pp[n][k] = [c[0] + Number(v[0] || 0), c[1] + Number(v[1] || 0)]; }); });
    });
    if (any) out[met] = acc;
  });
  return out;
}
/* data for the active period: pairs are [actual, reference] where reference = target (target modes) or last-year actual (growth modes) */
let PD_CACHE = { key: '', d: null };
function opsPeriodData() {
  if (!S.ops?.months) return null;
  const sel = perSel(), key = [mdKey(), sel.fy, sel.p, sel.months.join(',')].join('|');
  if (PD_CACHE.key === key) return PD_CACHE.d;
  if (!sel.months.length) { PD_CACHE = { key, d: null }; return null; }
  const cur = sumData(sel.months.map((m) => monthData(sel.fy, m)));
  let d = cur;
  if (isGrowth(sel.p)) {
    const prev = sumData(sel.months.map((m) => monthData(sel.fy - 1, m)));
    d = {};
    ['revenue', 'enforce'].forEach((met) => {
      const C = cur[met], P = prev[met]; if (!C) return; const o = { prov: {}, pp: {} };
      Object.entries(C.prov).forEach(([n, v]) => { o.prov[n] = [v[0], P?.prov?.[n]?.[0] ?? 0]; });
      Object.entries(C.pp).forEach(([n, ob]) => { o.pp[n] = {}; Object.entries(ob).forEach(([k, v]) => { o.pp[n][k] = [v[0], P?.pp?.[n]?.[k]?.[0] ?? 0]; }); });
      d[met] = o;
    });
    if (cur.audit) { d.audit = cur.audit; d.auditRef = prev.audit; }
  }
  PD_CACHE = { key, d }; return d;
}
/* full-year target for a scope (for the “ทั้งปี” secondary line) */
function fullYearTarget(metric, provs, prod) {
  const fy = selFy(); let t = 0;
  if (!prod && provs.length === allProvs().length && metric !== 'audit') { const ann = fy === fyCur() ? Number(S.ops?.annual?.[metric]) : YEAR_BASE[metric]?.[fy]?.[1]; if (ann) return ann; }
  for (let m = 0; m < 12; m++) { const d = monthData(fy, m, { tgt: true }); const r = opsAgg(metric, d, provs, prod); if (!r.none) t += metric === 'audit' ? 0 : r.target || 0; }
  return t;
}
const scopeName = () => (S.opsProv ? (S.opsProv === BKK ? 'กรุงเทพฯ (5 พื้นที่)' : S.opsProv) : S.opsRegion || 'ทั้งประเทศ');

/* ---------- period bar ---------- */
function periodBar() {
  const sel = perSel(), fc = fyCur();
  const seg = (arr) => arr.map(([k, l]) => `<button type="button" data-act="per" data-v="${k}" aria-pressed="${sel.p === k}">${l}</button>`).join('');
  const msel = sel.p === 'month' || sel.p === 'mom' ? `<label class="perm"><span>เดือน</span><select class="select zsel" data-pm="1">${MONTHS.map((_, i) => `<option value="${i}" ${i === sel.m ? 'selected' : ''} ${i > sel.last ? 'disabled' : ''}>${monFy(i, sel.fy)}${i > sel.last ? ' · ยังไม่มีข้อมูล' : ''}</option>`).join('')}</select></label>` : '';
  const qsel = sel.p === 'qoq' ? `<label class="perm"><span>ไตรมาส</span><select class="select zsel" data-pq="1">${QN.map((x, i) => `<option value="${i}" ${i === sel.q ? 'selected' : ''} ${i * 3 > sel.last ? 'disabled' : ''}>${x}${i * 3 > sel.last ? ' · ยังไม่มีข้อมูล' : ''}</option>`).join('')}</select></label>` : '';
  return `<div class="perbar" role="group" aria-label="ตัวกรองช่วงเวลา">
    <label class="perm"><span>ปีงบ</span><select class="select zsel" data-fy="1"><option value="${fc}" ${sel.fy === fc ? 'selected' : ''}>${fc}</option><option value="${fc - 1}" ${sel.fy === fc - 1 ? 'selected' : ''}>${fc - 1}${isSampleFy(fc - 1) ? ' (ตัวอย่าง)' : ''}</option></select></label>
    <div class="pergrp"><span>เก็บจริงเทียบเป้า</span><div class="perseg">${seg(PER_T)}</div></div>
    <div class="pergrp"><span>เทียบเก็บจริงปีก่อน</span><div class="perseg">${seg(PER_G)}</div></div>
    ${msel}${qsel}
    <span class="perhint">${ic('calendar', 'ic-sm')}${esc(perLabel(sel))}</span></div>`;
}

/* ---------- 3 metric cards (follow area + product) ---------- */
function opsCards(opt = {}) {
  const sel = perSel(), { d } = opsMonth(), prod = S.opsProd || '', provs = scopeProvs(), metric = opt.metric || S.opsMetric || 'revenue';
  const scope = `${esc(scopeName())}${prod ? ' · ' + esc(prod) : ''}`;
  const cards = (opt.metrics || Object.keys(OPS)).map((k) => {
    const o = OPS[k], r = d ? opsAgg(k, d, provs, prod) : { none: true }, aud = k === 'audit';
    const fmt = (v) => (v == null ? '—' : aud ? v.toFixed(1) : fmtM(v));
    let body;
    if (r.none) body = `<b class="pc-v num">—</b><span class="pc-s">ยังไม่มีข้อมูลในช่วงนี้</span>`;
    else if (isGrowth(sel.p)) {
      const g = r.target ? (aud ? r.value - r.target : r.value / r.target - 1) : null, tone = g == null ? 'none' : achTone(r.pct);
      body = `<b class="pc-v num">${fmt(r.value)}</b><span class="pc-pill pc-${tone}">${g == null ? '—' : `${g >= 0 ? '▲ +' : '▼ '}${aud ? g.toFixed(1) + ' จุด' : (g * 100).toFixed(1) + '%'}`}</span><span class="pc-s">ปีก่อน ${fmt(r.target)}${isSampleFy(sel.fy - 1) ? ' <i title="ข้อมูลปีก่อนเป็นตัวอย่าง">*</i>' : ''}</span>`;
    } else if (sel.p === 'year' && !aud) {
      const full = fullYearTarget(k, provs, prod), pf = full ? r.value / full : null, part = sel.last < 11;
      body = `<b class="pc-v num">${fmt(r.value)}</b><span class="pc-pill pc-${part ? 'info' : achTone(pf)}">${pf == null ? '—' : (pf * 100).toFixed(1) + '%'} ของเป้าทั้งปี</span><span class="pc-s">เป้าทั้งปี ${fmt(full)}${part ? ` · ช่วงเดียวกัน <b class="t-${achTone(r.pct)}">${(r.pct * 100).toFixed(1)}%</b> ของเป้า ${fmt(r.target)}` : ''}</span><span class="pc-bar"><i class="hb-${part ? 'info' : achTone(pf)}" style="width:${Math.min(100, (pf || 0) * 100)}%"></i></span>`;
    } else {
      const tone = achTone(r.pct);
      body = `<b class="pc-v num">${fmt(r.value)}</b><span class="pc-pill pc-${tone}">${r.pct == null ? '—' : (r.pct * 100).toFixed(1) + '%'} ของเป้า</span><span class="pc-s">เป้า ${fmt(r.target)}</span><span class="pc-bar"><i class="hb-${tone}" style="width:${Math.min(100, (r.pct || 0) * 100)}%"></i></span>`;
    }
    return `<button type="button" class="pc pc-m ${metric === k ? 'on' : ''}" data-act="${opt.act || 'ops-metric'}" data-v="${k}" aria-pressed="${metric === k}">
      <span class="pc-h"><span class="pc-ic">${ic(o.icon, 'ic-sm')}</span><span class="pc-t">${o.label}<small>${scope}</small></span><em>${o.unit}</em></span>${body}</button>`;
  }).join('');
  return `<section class="pcs ${opt.extra ? 'pcs-4' : ''}" aria-label="ผลการดำเนินงาน">${cards}${opt.extra || ''}</section>`;
}

/* ---------- carousel (used by pillar pages) ---------- */
function carousel(inner, key) {
  return `<div class="car" data-car="${esc(key)}"><button type="button" class="car-b car-l" data-car-go="-1" aria-label="เลื่อนซ้าย">${ic('chevron', 'ic-sm')}</button><div class="car-t" tabindex="0">${inner}</div><button type="button" class="car-b car-r" data-car-go="1" aria-label="เลื่อนขวา">${ic('chevron', 'ic-sm')}</button></div>`;
}
function initCarousels() {
  $$('.car').forEach((c) => {
    if (c.dataset.on) return; c.dataset.on = '1';
    const t = c.querySelector('.car-t'), key = c.dataset.car;
    const upd = () => { c.classList.toggle('at-s', t.scrollLeft < 4); c.classList.toggle('at-e', t.scrollLeft + t.clientWidth > t.scrollWidth - 4); };
    if (S.carX?.[key] != null) t.scrollLeft = S.carX[key];
    t.addEventListener('scroll', () => { S.carX = Object.assign({}, S.carX, { [key]: t.scrollLeft }); upd(); }, { passive: true });
    c.querySelectorAll('[data-car-go]').forEach((b) => b.addEventListener('click', () => t.scrollBy({ left: Number(b.dataset.carGo) * t.clientWidth * 0.8, behavior: 'smooth' })));
    upd();
  });
}

/* ---------- monthly statistics: follows period + area + product ---------- */
function monthChart(metric) {
  const sel = perSel(), prod = S.opsProd || '', provs = scopeProvs(), aud = metric === 'audit', grow = isGrowth(sel.p);
  const tAud = Number(S.ops?.targets?.audit) || 60;
  const val = (r) => (r.none ? null : r.value), tg = (r) => (r.none ? null : aud ? tAud : r.target);
  const rows = Array.from({ length: 12 }, (_, m) => {
    const c = m <= sel.last ? opsAgg(metric, monthData(sel.fy, m), provs, prod) : { none: true };
    const t = opsAgg(metric, monthData(sel.fy, m, { tgt: true }), provs, prod);
    const p = grow ? opsAgg(metric, monthData(sel.fy - 1, m), provs, prod) : null;
    return { v: val(c), t: aud ? tAud : t.none ? null : t.target, pv: p ? val(p) : null };
  });
  const all = rows.flatMap((r) => [r.v, grow ? r.pv : r.t]).filter((x) => x != null);
  const mx = Math.max(1, ...all) * 1.12, rawStep = mx / 4, mag = Math.pow(10, Math.floor(Math.log10(rawStep))), step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => s >= rawStep), top = step * 4;
  const W = 760, H0 = 260, L = 50, R = 10, T = 18, B = 34, cw = W - L - R, ch = H0 - T - B, slot = cw / 12;
  const bw = grow ? Math.min(20, slot * 0.34) : Math.min(34, slot * 0.56);
  const yy = (v) => T + ch - (v / top) * ch, px = (i) => L + slot * i + slot / 2;
  const fa = (v) => (aud ? v.toFixed(1) : v >= 1000 ? (v / 1000).toFixed(1) + 'k' : fmtM(v));
  const grid = [0, 1, 2, 3, 4].map((i) => `<line x1="${L}" x2="${W - R}" y1="${yy(step * i)}" y2="${yy(step * i)}" class="hx-g"/><text x="${L - 8}" y="${yy(step * i) + 4}" class="hx-ax" text-anchor="end">${aud ? step * i : fa(step * i)}</text>`).join('');
  const bars = rows.map((r, i) => {
    const on = sel.months.includes(i), ref = grow ? r.pv : r.t;
    const tone = r.v == null || !ref ? 'none' : aud && grow ? (r.v >= ref ? 'ok' : r.v >= ref - 2 ? 'warn' : 'bad') : achTone(r.v / ref);
    let g = '';
    if (grow) {
      const x1 = px(i) - bw - 1, x2 = px(i) + 1;
      if (r.pv != null) g += `<rect x="${x1}" y="${yy(r.pv)}" width="${bw}" height="${Math.max(1, T + ch - yy(r.pv))}" rx="3" class="mc-pb"/>`;
      if (r.v != null) g += `<rect x="${x2}" y="${yy(r.v)}" width="${bw}" height="${Math.max(1, T + ch - yy(r.v))}" rx="3" class="mc-b mc-${tone} ${on ? 'on' : ''}"/>`;
      else g += `<rect x="${x2}" y="${T + ch - 18}" width="${bw}" height="18" rx="3" class="mc-ghost"/>`;
    } else {
      if (r.v != null) g += `<rect x="${px(i) - bw / 2}" y="${yy(r.v)}" width="${bw}" height="${Math.max(1, T + ch - yy(r.v))}" rx="4" class="mc-b mc-${tone} ${on ? 'on' : ''}"/>`;
      else if (r.t != null) g += `<rect x="${px(i) - bw / 2}" y="${yy(r.t)}" width="${bw}" height="${T + ch - yy(r.t)}" rx="4" class="mc-ghost"/>`;
      if (r.t != null) g += `<line x1="${px(i) - bw / 2 - 4}" x2="${px(i) + bw / 2 + 4}" y1="${yy(r.t)}" y2="${yy(r.t)}" class="hx-t"/>`;
    }
    if (r.v != null && on) g += `<text x="${px(i) + (grow ? bw / 2 + 1 : 0)}" y="${Math.min(yy(r.v), ref != null ? yy(ref) : 1e9) - 6}" class="hx-v on" text-anchor="middle">${fa(r.v)}</text>`;
    g += `<text x="${px(i)}" y="${T + ch + 18}" class="hx-y ${on ? 'on' : ''}" text-anchor="middle">${MONTHS[i].split(' ')[0]}</text>`;
    const tip = `${monFy(i, sel.fy)}${r.v != null ? ` · จริง ${aud ? r.v.toFixed(1) + '%' : fmtM(r.v)}` : ' · ยังไม่มีผล'}${grow ? (r.pv != null ? ` · ${monFy(i, sel.fy - 1)} ${aud ? r.pv.toFixed(1) + '%' : fmtM(r.pv)}${r.v != null && r.pv ? ` (${aud ? (r.v - r.pv >= 0 ? '+' : '') + (r.v - r.pv).toFixed(1) + ' จุด' : (r.v / r.pv - 1 >= 0 ? '+' : '') + ((r.v / r.pv - 1) * 100).toFixed(1) + '%'})` : ''}` : '') : r.t != null ? ` · เป้า ${aud ? r.t.toFixed(1) + '%' : fmtM(r.t)}` : ''}`;
    return `<g class="hx-yr" ${i <= sel.last ? `data-act="mc-month" data-v="${i}"` : ''} role="button" tabindex="0"><title>${tip}</title><rect x="${L + slot * i}" y="${T - 6}" width="${slot}" height="${ch + B}" class="hx-hit ${on ? 'on' : ''}"/>${g}</g>`;
  }).join('');
  const leg = grow ? `<span><i class="hx-lb mc-lpb"></i>ปีงบ ${sel.fy - 1}</span><span><i class="hx-lb" style="background:var(--map-ok)"></i>ปีงบ ${sel.fy} โตขึ้นหรือเท่าเดิม</span><span><i class="hx-lb" style="background:var(--map-warn)"></i>ลดลงไม่เกิน 2%</span><span><i class="hx-lb" style="background:var(--map-bad)"></i>ลดลงเกิน 2%</span>`
    : `<span><i class="hx-lb" style="background:var(--map-ok)"></i>ถึงเป้า</span><span><i class="hx-lb" style="background:var(--map-warn)"></i>ต่ำกว่าเป้าไม่เกิน 2%</span><span><i class="hx-lb" style="background:var(--map-bad)"></i>ต่ำกว่าเป้าเกิน 2%</span><span><i class="hx-lt"></i>เป้า</span><span><i class="hx-lm"></i>ยังไม่มีผล</span>`;
  const smp = isSampleFy(sel.fy) || (grow && isSampleFy(sel.fy - 1));
  return `<div class="mc-top"><span class="mc-scope">${ic('chart', 'ic-sm')}<b>${esc(scopeName())}</b>${prod ? ` · ${pIcon(prod)} ${esc(prod)}` : ' · ทุกสินค้า'} · ${esc(OPS[metric].label)} · ${esc(perLabel(sel))}</span><div class="hx-leg">${leg}</div></div>
    <svg class="hx-svg mc-svg" viewBox="0 0 ${W} ${H0}" role="img" aria-label="${OPS[metric].label}รายเดือน">${grid}<text x="4" y="${T - 6}" class="hx-ax">${aud ? 'Hit rate %' : OPS[metric].unit}</text>${bars}</svg>
    ${smp ? '<p class="help">* ข้อมูลรายเดือนของปีงบก่อนหน้าเป็นข้อมูลตัวอย่าง (ยอดทั้งปีอิงตัวเลขจริง) รอนำเข้าข้อมูลจริง</p>' : ''}`;
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act, v = el.dataset.v;
  const keep = () => { const vw = $('#view'); const y = vw.scrollTop; renderView(); vw.scrollTop = y; };
  if (a === 'per') { S.per = v; keep(); }
  else if (a === 'mc-month') { S.pm = Number(v); S.pq = Math.floor(Number(v) / 3); if (S.per === 'year') S.per = 'month'; else if (S.per === 'yoy') S.per = 'mom'; keep(); }
});
document.addEventListener('change', (e) => {
  const t = e.target; if (!t.dataset) return;
  const keep = () => { const vw = $('#view'); const y = vw.scrollTop; renderView(); vw.scrollTop = y; };
  if (t.dataset.fy) { S.fy = Number(t.value); S.pm = null; S.pq = null; keep(); }
  else if (t.dataset.pm) { S.pm = Number(t.value); keep(); }
  else if (t.dataset.pq) { S.pq = Number(t.value); keep(); }
});

/* ---------- Hot issue bar (weekly news, rotates) ---------- */
const NEWS_IC = { fuel: 'fuel', smoke: 'smoke', liquor: 'liquor', car: 'car', beer: 'beer', cup: 'cup', box: 'box', shield: 'shield', spark: 'spark' };
function hotBar() {
  const N = S.news; if (!N?.items?.length) return '';
  const items = N.items.slice(0, 4), i = Math.min(S.hotI || 0, items.length - 1), it = items[i];
  return `<section class="hot" aria-label="Hot issue สัปดาห์นี้" data-hot>
    <span class="hot-tag">${ic('lightning', 'ic-sm')}Hot issue</span>
    <div class="hot-win" aria-live="polite"><a class="hot-it" href="${esc(it.url || N.url)}" target="_blank" rel="noopener noreferrer" data-hot-i="${i}">
      <span class="hot-ic">${ic(NEWS_IC[it.icon] || 'box', 'ic-sm')}</span><b class="hot-cat">${esc(it.cat)}</b><span class="hot-t">${esc(it.title)}</span><span class="hot-d">${esc(it.date || '')}</span></a></div>
    <div class="hot-nav"><button type="button" data-act="hot-go" data-v="-1" aria-label="ข่าวก่อนหน้า">${ic('chevron', 'ic-sm')}</button><span class="hot-dots">${items.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</span><button type="button" data-act="hot-go" data-v="1" aria-label="ข่าวถัดไป">${ic('chevron', 'ic-sm')}</button>
    <a class="hot-all" href="${esc(N.url)}" target="_blank" rel="noopener noreferrer" title="Excise Insight Update ${esc(N.range || '')}">ทั้งหมด</a></div></section>`;
}
function hotShow(i) {
  const bar = document.querySelector('[data-hot]'); const items = (S.news?.items || []).slice(0, 4); if (!bar || !items.length) return;
  S.hotI = (i + items.length) % items.length; const it = items[S.hotI];
  const a = bar.querySelector('.hot-it'); a.classList.add('out');
  setTimeout(() => { a.href = it.url || S.news.url; a.querySelector('.hot-ic').innerHTML = ic(NEWS_IC[it.icon] || 'box', 'ic-sm'); a.querySelector('.hot-cat').textContent = it.cat; a.querySelector('.hot-t').textContent = it.title; a.querySelector('.hot-d').textContent = it.date || ''; a.classList.remove('out'); a.classList.add('in'); requestAnimationFrame(() => requestAnimationFrame(() => a.classList.remove('in'))); bar.querySelectorAll('.hot-dots i').forEach((d, k) => d.classList.toggle('on', k === S.hotI)); }, 220);
}
setInterval(() => { const bar = document.querySelector('[data-hot]'); if (!bar || bar.matches(':hover') || bar.contains(document.activeElement) || document.hidden) return; if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return; hotShow((S.hotI || 0) + 1); }, 6000);
document.addEventListener('click', (e) => { const el = e.target.closest('[data-act="hot-go"]'); if (el) hotShow((S.hotI || 0) + Number(el.dataset.v)); });
