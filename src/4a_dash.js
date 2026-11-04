/* ===================== Dashboard (metrics-first), KPI, Risk, Pillar pages ===================== */
const PSHORT = { BA: 'จัดเก็บภาษี & มาตรการ', LA: 'HR', N: 'Technology', C: 'กฎหมาย ตรวจสอบ ปราบปราม', E: 'Service & Process & Governance' };
const pillarShort = (pl) => (pl && (pl.short || PSHORT[pl.code])) || '';

function filterBar(withNew) {
  const C = cfg(), f = S.filt;
  const yOpts = `<option value="">ทุกปี</option>` + yearsRange().map((y) => `<option value="${y}" ${String(y) === f.year ? 'selected' : ''}>ปีงบ ${y}</option>`).join('');
  const uOpts = `<option value="">ทุกหน่วยงาน</option>` + visUnits().map((u) => `<option value="${esc(u.id)}" ${u.id === f.unit ? 'selected' : ''}>${esc(u.name)}</option>`).join('');
  return `<div class="zfilters">
    <label class="sr" for="f-year">ปีงบประมาณ</label><select id="f-year" class="select zsel" data-filt="year">${yOpts}</select>
    <label class="sr" for="f-unit">หน่วยงาน</label><select id="f-unit" class="select zsel" data-filt="unit">${uOpts}</select>
    ${withNew ? `<button class="btn btn-primary btn-sm" data-act="go" data-v="new">${ic('plus', 'ic-sm')}สร้างแผนใหม่</button>` : ''}</div>`;
}
const COLL = (() => { try { return JSON.parse(localStorage.getItem('bp_coll') || '{}'); } catch (e) { return {}; } })();
const zcard = (title, desc, body, opts = {}) => { const shut = opts.fold && COLL[opts.fold]; return `<section class="zc ${opts.cls || ''} ${shut ? 'zc-shut' : ''}" ${opts.id ? `id="${opts.id}"` : ''} style="${opts.span ? `grid-column:span ${opts.span}` : ''}">
  <div class="zc-h">${opts.fold ? `<button type="button" class="zc-fold" data-act="fold" data-v="${opts.fold}" aria-expanded="${!shut}" aria-label="${shut ? 'แสดง' : 'ซ่อน'} ${esc(String(title).replace(/<[^>]+>/g, ''))}">${ic('chevron', 'ic-sm')}</button>` : ''}<div style="flex:1;min-width:0"><h2>${title}</h2>${desc && !shut ? `<p>${desc}</p>` : ''}</div>${opts.go ? `<button class="zlink" data-act="go" data-v="${opts.go}">${opts.goLabel || 'ดูทั้งหมด'} ${ic('expand', 'ic-sm')}</button>` : ''}</div>
  ${shut ? '' : body}</section>`; };
const statCard = (label, icon, value, sub) => `<div class="zs"><div class="zs-h"><span>${label}</span>${ic(icon, 'ic-sm')}</div><div class="zs-v">${value}</div><div class="zs-d">${sub}</div></div>`;

function kpiStats(pf) {
  const st = cfg().kpis.filter((k) => !pf || k.pillar === pf).map((k) => ({ k, s: kpiState(k) }));
  const c = (key) => st.filter((x) => x.s.key === key).length;
  return { st, ok: c('ok'), warn: c('warn'), bad: c('bad'), none: c('none'), n: st.length };
}
function segBar(ks) {
  const w = (n) => (ks.n ? (n / ks.n) * 100 : 0);
  return `<span class="segbar" aria-label="On target ${ks.ok}, near ${ks.warn}, below ${ks.bad}, no data ${ks.none}"><i class="sb-ok" style="width:${w(ks.ok)}%"></i><i class="sb-warn" style="width:${w(ks.warn)}%"></i><i class="sb-bad" style="width:${w(ks.bad)}%"></i></span>`;
}
function monthSummary(unit, m) {
  if (m == null) m = curFm();
  const rows = reportablePlans().filter((p) => !unit || p.unitId === unit).map((p) => rowFor(p, m));
  return Object.assign(overviewSum(rows), { m });
}

/* ---------- Ops data (revenue / enforcement / audit) ---------- */
const OPS = {
  revenue: { label: 'จัดเก็บภาษี', icon: 'wallet', unit: 'ล้านบาท', tone: 'ok' },
  enforce: { label: 'ปราบปราม', sub: 'ภาษีที่รักษา/เรียกคืนได้', icon: 'shield', unit: 'ล้านบาท', tone: 'warn' },
  audit: { label: 'ตรวจสอบภาษี (Hit rate)', icon: 'target', unit: '%', tone: 'accent' }
};
const REGIONS = ['ภาค 1', 'ภาค 2', 'ภาค 3', 'ภาค 4', 'ภาค 5', 'ภาค 6', 'ภาค 7', 'ภาค 8', 'ภาค 9', 'ภาค 10'];
const provRegion = {}; THMAP.forEach((x) => { if (x.k === 'p') provRegion[x.n] = x.u; });
function opsMonth() {
  const sel = perSel();
  return { m: sel.months.length ? sel.months[sel.months.length - 1] : sel.last, d: opsPeriodData() };
}
/* value/target for one province (optionally one product) */
function provPair(metric, d, n, prod) {
  const M = d?.[metric]; if (!M) return null;
  if (n === BKK && !M.prov?.[BKK]) { let a = 0, b = 0, any = false; BKK5.forEach((x) => { const v = provPair(metric, d, x, prod); if (v) { any = true; a += v[0]; b += v[1]; } }); return any ? [a, b] : null; }
  if (prod) { const v = M.pp?.[n]?.[prod]; return v ? [Number(v[0]) || 0, Number(v[1]) || 0] : null; }
  const v = M.prov?.[n]; return v ? [Number(v[0]) || 0, Number(v[1]) || 0] : null;
}
function opsAgg(metric, d, provs, prod) {
  let a = 0, b = 0, any = false;
  provs.forEach((n) => { const v = provPair(metric, d, n, prod); if (v) { any = true; a += v[0]; b += v[1]; } });
  if (!any) return { value: null, target: null, pct: null, none: true };
  if (metric === 'audit') { let t = S.ops?.targets?.audit ?? 60; const hr = b ? (a / b) * 100 : null; if (d?.auditRef) { let fa = 0, fb = 0; provs.forEach((n) => { const v = provPair('auditRef', d, n, prod); if (v) { fa += v[0]; fb += v[1]; } }); t = fb ? (fa / fb) * 100 : null; } return { value: hr, target: t, pct: hr == null || !t ? null : hr / t, found: a, audited: b }; }
  return { value: a, target: b, pct: b ? a / b : null };
}
const opsProducts = () => S.ops?.products || ['น้ำมัน', 'รถยนต์', 'เบียร์', 'สุรา', 'ยาสูบ', 'เครื่องดื่ม', 'อื่นๆ'];
function scopeProvs() { return S.opsProv ? [S.opsProv] : S.opsRegion ? regionProvs(S.opsRegion) : allProvs(); }
const allProvs = () => THMAP.filter((x) => x.k === 'p').map((x) => x.n);
const regionProvs = (u) => THMAP.filter((x) => x.k === 'p' && x.u === u).map((x) => x.n);
const fmtM = (v) => (v == null ? '—' : Number(v).toLocaleString('th-TH', { maximumFractionDigits: v >= 100 ? 0 : 1 }));
const fmtVal = (metric, v) => (v == null ? '—' : metric === 'audit' ? Number(v).toFixed(1) : fmtM(v));
const achTone = (pct) => (pct == null ? 'none' : pct >= 1 ? 'ok' : pct >= 0.98 ? 'warn' : 'bad');

let BBOX = null;
function regionBox(u) {
  if (!BBOX) {
    BBOX = {};
    THMAP.forEach((x) => {
      const nums = x.d.match(/-?\d+\.?\d*/g).map(Number);
      const key = x.k === 'r' ? x.u : null; if (!key) return;
      let b = BBOX[key] || [1e9, 1e9, -1e9, -1e9];
      for (let i = 0; i < nums.length - 1; i += 2) { b = [Math.min(b[0], nums[i]), Math.min(b[1], nums[i + 1]), Math.max(b[2], nums[i]), Math.max(b[3], nums[i + 1])]; }
      BBOX[key] = b;
    });
  }
  return BBOX[u];
}
const ML_OFF = { 'ภาค 2': [12, 6], 'ภาค 10': [-8, 2], 'ภาค 1': [2, -4], 'ภาค 7': [-6, 4] };
function opsMap(metric, d, region, prod) {
  const shapes = region ? THMAP.filter((x) => x.k === 'p' && x.u === region) : THMAP.filter((x) => x.k === 'r');
  let vb = '0 0 360 672', scale = 1;
  if (region) { const b = regionBox(region); if (b) { const pad = 8, w = b[2] - b[0], h = b[3] - b[1]; vb = `${b[0] - pad} ${b[1] - pad} ${w + pad * 2} ${h + pad * 2}`; scale = Math.max(0.35, Math.max(w, h) / 360); } }
  const paths = shapes.map((x) => {
    const ag = region ? opsAgg(metric, d, [x.n], prod) : opsAgg(metric, d, regionProvs(x.u), prod);
    const t = ag.none ? 'none' : achTone(ag.pct);
    const name = region ? x.n : x.u, sel = region && (S.opsProv === x.n || areaProv(S.opsProv) === x.n), dim = region && S.opsProv && !sel;
    const act = region ? (ag.none ? '' : `data-act="ops-prov" data-v="${esc(x.n)}"`) : `data-act="ops-region" data-v="${esc(x.u)}"`;
    return `<path d="${x.d}" class="mp mp-${t} ${act ? 'mp-click' : ''} ${sel ? 'mp-sel' : ''} ${dim ? 'mp-dim' : ''}" ${act}><title>${esc(name)}${ag.none ? ' · ไม่มีข้อมูล' : `\nผลจริง ${fmtVal(metric, ag.value)} · เป้า ${fmtVal(metric, ag.target)} ${OPS[metric].unit}${ag.pct == null ? '' : ' · ' + Math.round(ag.pct * 100) + '% ของเป้า'}`}</title></path>`;
  }).join('');
  const labels = region ? shapes.map((x) => `<text class="pl ${S.opsProv === x.n || areaProv(S.opsProv) === x.n ? 'pl-sel' : ''}" x="${x.x}" y="${x.y}" style="font-size:${(9 * scale).toFixed(2)}px">${esc(x.n === BKK ? 'กทม. 1–5' : x.n)}</text>`).join('')
    : shapes.map((x) => { const ag = opsAgg(metric, d, regionProvs(x.u), prod); const o = ML_OFF[x.u] || [0, 0]; return `<g class="ml" transform="translate(${x.x + o[0]},${x.y + o[1]})">${ag.none ? `<rect x="-24" y="-10" width="48" height="20" rx="7"/><text class="ml-n" y="4">${esc(x.u)}</text>` : `<rect x="-26" y="-17" width="52" height="34" rx="8"/><text class="ml-n" y="-3">${esc(x.u)}</text><text class="ml-p" y="12">${ag.pct == null ? '—' : Math.round(ag.pct * 100) + '%'}</text>`}</g>`; }).join('');
  return `<div class="mapz"><svg class="thmap" viewBox="${vb}" data-vb="${vb}" data-key="${esc(region || 'TH')}" role="img" aria-label="แผนที่${region ? ' ' + esc(region) : 'ประเทศไทย'}" style="--sw:${(0.8 * scale).toFixed(2)}">${paths}${labels}</svg>
    <div class="mapz-c"><button type="button" data-zoom="in" aria-label="ซูมเข้า">${ic('plus', 'ic-sm')}</button><button type="button" data-zoom="out" aria-label="ซูมออก">${ic('minus', 'ic-sm')}</button><button type="button" data-zoom="reset" aria-label="รีเซ็ตมุมมอง">${ic('expand-all', 'ic-sm')}</button></div></div>`;
}
function opsBars(metric, d, region, prod) {
  let items = region
    ? regionAreas(region).map((n) => Object.assign({ name: n, kind: 'prov' }, opsAgg(metric, d, [n], prod)))
    : REGIONS.map((u) => Object.assign({ name: u, kind: 'region' }, opsAgg(metric, d, regionProvs(u), prod)));
  items = items.filter((x) => !x.none);
  if (!items.length) return '<p class="zempty">ไม่มีจังหวัดที่มีสินค้านี้</p>';
  items.sort((a, b) => (b.value || 0) - (a.value || 0));
  const max = Math.max(1, ...items.map((x) => Math.max(x.value || 0, x.target || 0)));
  return `<div class="hb">${items.map((x) => { const sel = S.opsProv === x.name || (S.opsProv === BKK && BKK5.includes(x.name)), dim = S.opsProv && !sel; return `<div class="hb-r ${sel ? 'hb-sel' : ''} ${dim ? 'hb-dim' : ''}" data-act="${x.kind === 'prov' ? 'ops-prov' : 'ops-region'}" data-v="${esc(x.name)}" role="button" tabindex="0">
    <span class="hb-n" title="${esc(x.name)}">${esc(x.name)}</span>
    <span class="hb-t"><i class="hb-b hb-${achTone(x.pct)}" style="width:${((x.value || 0) / max) * 100}%"></i><i class="hb-tg" style="left:${((x.target || 0) / max) * 100}%" title="${refWord()} ${fmtVal(metric, x.target)}"></i></span>
    <span class="hb-v num">${fmtVal(metric, x.value)}<small>/${fmtVal(metric, x.target)}</small></span>
    <span class="hb-p num ${'t-' + achTone(x.pct)}">${x.pct == null ? '—' : Math.round(x.pct * 100) + '%'}</span></div>`; }).join('')}</div>`;
}
const PICON = { 'น้ำมัน': 'fuel', 'รถยนต์': 'car', 'เบียร์': 'beer', 'สุรา': 'liquor', 'ยาสูบ': 'smoke', 'เครื่องดื่ม': 'cup' };
const pIcon = (k) => ic(PICON[k] || (/น้ำมัน/.test(k) ? 'fuel' : /รถ/.test(k) ? 'car' : /เบียร์/.test(k) ? 'beer' : /สุรา/.test(k) ? 'liquor' : /ยา|บุหรี่/.test(k) ? 'smoke' : /เครื่องดื่ม/.test(k) ? 'cup' : 'box'), 'ic-sm');
const PCOLS = ['#1A5BD6', '#0B7088', '#1D9152', '#7238E0', '#D02A55', '#E08A00', '#94A3B8'];
function prodShare(metric, d, provs) {
  const tot = {}; opsProducts().forEach((k) => { tot[k] = 0; });
  provs.flatMap((p) => (p === BKK ? BKK5 : [p])).forEach((n) => Object.entries(d?.[metric]?.pp?.[n] || {}).forEach(([k, v]) => { tot[k] = (tot[k] || 0) + Number(v[0] || 0); }));
  return tot;
}
function opsDonut(metric, d, prod) {
  const tot = prodShare(metric, d, scopeProvs());
  const items = Object.entries(tot).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]); const sum = items.reduce((s, x) => s + x[1], 0);
  if (!sum) return '<p class="zempty">ยังไม่มีข้อมูลสัดส่วนสินค้า</p>';
  const col = (k) => PCOLS[opsProducts().indexOf(k) % PCOLS.length];
  let ang = -Math.PI / 2; const R = 86, r = 58, cx = 90, cy = 90;
  const arcs = items.map(([k, v]) => {
    const a2 = ang + (v / sum) * Math.PI * 2, large = a2 - ang > Math.PI ? 1 : 0;
    const p = (A, rr) => `${(cx + rr * Math.cos(A)).toFixed(2)} ${(cy + rr * Math.sin(A)).toFixed(2)}`;
    const path = items.length === 1 ? `M${cx} ${cy - R}A${R} ${R} 0 1 1 ${cx - 0.01} ${cy - R}L${cx - 0.01} ${cy - r}A${r} ${r} 0 1 0 ${cx} ${cy - r}Z` : `M${p(ang, R)} A${R} ${R} 0 ${large} 1 ${p(a2 - 0.0001, R)} L${p(a2 - 0.0001, r)} A${r} ${r} 0 ${large} 0 ${p(ang, r)}Z`;
    ang = a2; return `<path d="${path}" fill="${col(k)}" class="${prod && prod !== k ? 'dn-dim' : ''}" data-act="ops-prod" data-v="${esc(k)}" style="cursor:pointer"><title>${esc(k)} ${((v / sum) * 100).toFixed(1)}%</title></path>`;
  }).join('');
  const center = prod && tot[prod] ? `${((tot[prod] / sum) * 100).toFixed(0)}%` : items.length;
  return `<div class="dn"><svg viewBox="0 0 180 180" class="dn-svg" role="img" aria-label="สัดส่วนสินค้า">${arcs}<text x="90" y="86" class="dn-c">${center}</text><text x="90" y="104" class="dn-s">${prod ? esc(prod) : 'ประเภทสินค้า'}</text></svg>
    <ul class="dn-l">${items.map(([k, v]) => `<li class="${prod === k ? 'on' : ''} ${prod && prod !== k ? 'dn-dim' : ''}" data-act="ops-prod" data-v="${esc(k)}" style="--pc:${col(k)}"><span class="dn-ic">${pIcon(k)}</span><span>${esc(k)}</span><b class="num">${((v / sum) * 100).toFixed(1)}%</b></li>`).join('')}</ul></div>`;
}
function prodTargets(metric, d, prod) {
  const provs = scopeProvs();
  const tiles = opsProducts().map((k) => {
    const ag = opsAgg(metric, d, provs, k); const n = provs.filter((x) => provPair(metric, d, x, k)).length;
    return `<button type="button" class="pt ${prod === k ? 'on' : ''} ${ag.none ? 'pt-none' : ''}" data-act="ops-prod" data-v="${esc(k)}" aria-pressed="${prod === k}" ${ag.none ? 'disabled' : ''}>
      <span class="pt-h" style="--pc:${PCOLS[opsProducts().indexOf(k) % PCOLS.length]}"><span class="dn-ic">${pIcon(k)}</span>${esc(k)}</span>
      <span class="pt-v"><b class="num">${ag.none ? '—' : fmtVal(metric, ag.value)}</b><small>ผลจริง</small></span>
      <span class="pt-g"><span>${refWord()} <b class="num">${ag.none ? '—' : fmtVal(metric, ag.target)}</b></span><b class="num t-${achTone(ag.pct)}">${ag.pct == null ? '—' : Math.round(ag.pct * 100) + '%'}</b></span>
      <span class="pt-bar"><i class="hb-${achTone(ag.pct)}" style="width:${Math.min(100, (ag.pct || 0) * 100)}%"></i></span>
      <span class="pt-d"><span>${isGrowth() ? 'เทียบปีก่อน' : '% ของเป้า'}</span><span>${n} จว.</span></span></button>`;
  }).join('');
  return `<div class="pts">${tiles}</div>`;
}

function opsFlow(metric, d, region, prod) {
  const areas = region ? regionAreas(region).map((n) => ({ name: n, provs: [n], act: 'ops-prov' })) : REGIONS.map((u) => ({ name: u, provs: regionAreas(u), act: 'ops-region' }));
  const prods = opsProducts();
  const val = (provs, k) => provs.reduce((s, n) => s + Number(d?.[metric]?.pp?.[n]?.[k]?.[0] || 0), 0);
  const links = []; areas.forEach((a, i) => prods.forEach((k, j) => { const v = val(a.provs, k); if (v > 0) links.push({ i, j, v }); }));
  const L = areas.map((a, i) => ({ ...a, v: links.filter((x) => x.i === i).reduce((s, x) => s + x.v, 0) })).filter((a) => a.v > 0);
  const R = prods.map((k, j) => ({ name: k, j, v: links.filter((x) => x.j === j).reduce((s, x) => s + x.v, 0) })).filter((r) => r.v > 0);
  const sum = L.reduce((s, a) => s + a.v, 0);
  if (!sum) return '<p class="zempty">ยังไม่มีข้อมูลแยกตามสินค้า</p>';
  L.sort((a, b) => b.v - a.v); R.sort((a, b) => b.v - a.v);
  const W = 1000, NW = 12, XL = 250, XR = W - 300, GAP = 5, MINH = 31;
  const n = Math.max(L.length, R.length), k = (Math.max(250, n * 32) - GAP * (n - 1)) / sum;
  const lay = (arr) => { let y = 0; arr.forEach((nd) => { nd.h = Math.max(2, nd.v * k); const slot = Math.max(nd.h, MINH); nd.y = y + (slot - nd.h) / 2; nd.off = 0; y += slot + GAP; }); return y - GAP; };
  const H = Math.max(lay(L), lay(R));
  const li = {}; L.forEach((a) => { li[areas.indexOf(areas.find((x) => x.name === a.name))] = a; });
  const rj = {}; R.forEach((r) => { rj[r.j] = r; });
  links.sort((a, b) => R.indexOf(rj[a.j]) - R.indexOf(rj[b.j]) || L.indexOf(li[a.i]) - L.indexOf(li[b.i]));
  const col = (j) => PCOLS[j % PCOLS.length], unit = OPS[metric].unit;
  const sel = S.opsProv;
  const bands = links.map((x) => {
    const a = li[x.i], r = rj[x.j]; if (!a || !r) return '';
    const h = x.v * k, y0 = a.y + a.off + h / 2; a.off += h;
    const y1 = r.y + r.off + h / 2; r.off += h;
    const x0 = XL + NW, x1 = XR, cx = (x0 + x1) / 2;
    const dim = (prod && prods[x.j] !== prod) || (sel && a.name !== sel);
    return `<path class="sk-l ${dim ? 'sk-dim' : ''}" d="M${x0} ${y0.toFixed(1)}C${cx} ${y0.toFixed(1)} ${cx} ${y1.toFixed(1)} ${x1} ${y1.toFixed(1)}" stroke="${col(x.j)}" stroke-width="${Math.max(1, h).toFixed(1)}" data-a="${esc(a.name)}" data-p="${esc(prods[x.j])}"><title>${esc(a.name)} → ${esc(prods[x.j])}\n${fmtVal(metric, x.v)} ${unit} (${((x.v / a.v) * 100).toFixed(1)}% ของ${esc(a.name)} · ${((x.v / r.v) * 100).toFixed(1)}% ของ${esc(prods[x.j])})</title></path>`;
  }).join('');
  const pctT = (ag) => (ag.pct == null ? '—' : Math.round(ag.pct * 100) + '%');
  const ln = L.map((a) => {
    const ag = opsAgg(metric, d, a.provs), t = achTone(ag.pct), cy = a.y + a.h / 2, on = sel === a.name, dim = sel && !on;
    return `<g class="sk-n ${dim ? 'sk-dim' : ''} ${on ? 'sk-on' : ''}" data-act="${a.act}" data-v="${esc(a.name)}" data-a="${esc(a.name)}" role="button" tabindex="0">
      <rect x="${XL}" y="${a.y.toFixed(1)}" width="${NW}" height="${a.h.toFixed(1)}" rx="3" class="sk-bar"/>
      <text x="${XL - 10}" y="${(cy - 3).toFixed(1)}" text-anchor="end" class="sk-t">${esc(a.name)}</text>
      <text x="${XL - 10}" y="${(cy + 12).toFixed(1)}" text-anchor="end" class="sk-s">${fmtVal(metric, ag.value)} / ${fmtVal(metric, ag.target)} · <tspan class="t-${t}">${pctT(ag)}</tspan></text><title>${esc(a.name)}\nผลจริง ${fmtVal(metric, ag.value)} · เป้า ${fmtVal(metric, ag.target)} ${unit} · ${pctT(ag)} ของเป้า</title></g>`;
  }).join('');
  const scope = region ? regionProvs(region) : allProvs();
  const rn = R.map((r) => {
    const ag = opsAgg(metric, d, scope, r.name), t = achTone(ag.pct), cy = r.y + r.h / 2, on = prod === r.name, dim = prod && !on;
    return `<g class="sk-n ${dim ? 'sk-dim' : ''} ${on ? 'sk-on' : ''}" data-act="ops-prod" data-v="${esc(r.name)}" data-p="${esc(r.name)}" role="button" tabindex="0">
      <rect x="${XR}" y="${r.y.toFixed(1)}" width="${NW}" height="${r.h.toFixed(1)}" rx="3" fill="${col(r.j)}"/>
      <text x="${XR + NW + 10}" y="${(cy - 3).toFixed(1)}" class="sk-t">${esc(r.name)} <tspan class="sk-sh">${((r.v / sum) * 100).toFixed(1)}%</tspan></text>
      <text x="${XR + NW + 10}" y="${(cy + 12).toFixed(1)}" class="sk-s">${fmtVal(metric, ag.value)} / ${fmtVal(metric, ag.target)} · <tspan class="t-${t}">${pctT(ag)}</tspan></text><title>${esc(r.name)}\nผลจริง ${fmtVal(metric, ag.value)} · เป้า ${fmtVal(metric, ag.target)} ${unit} · ${pctT(ag)} ของเป้า</title></g>`;
  }).join('');
  const tot = opsAgg(metric, d, scope);
  return `<div class="sk-wrap">
    <div class="sk-sum"><span>รวม${region ? esc(region) : 'ทั้งประเทศ'}</span><b class="num">${fmtVal(metric, tot.value)}</b><span>${refWord()} <b class="num">${fmtVal(metric, tot.target)}</b> ${unit}</span><b class="num t-${achTone(tot.pct)}">${isGrowth() ? growTxt(metric, tot) + ' จากปีก่อน' : pctT(tot) + ' ของเป้า'}</b>
      <span class="sk-hd">ตัวเลขใต้ชื่อ = ผลจริง / ${refWord()} · %</span></div>
    <svg class="sk" viewBox="-4 -8 ${W + 8} ${H + 16}" role="img" aria-label="${OPS[metric].label}มาจากไหน แยกตามพื้นที่และกลุ่มสินค้า">${bands}${ln}${rn}</svg></div>`;
}
function initSankey() {
  document.querySelectorAll('svg.sk').forEach((sv) => {
    if (sv.dataset.on) return; sv.dataset.on = '1';
    const clear = () => { sv.classList.remove('sk-hov'); sv.querySelectorAll('.sk-hl').forEach((e) => e.classList.remove('sk-hl')); };
    sv.addEventListener('pointerover', (e) => {
      const g = e.target.closest('[data-a],[data-p]'); clear(); if (!g) return;
      const a = g.dataset.a, p = g.dataset.p; sv.classList.add('sk-hov');
      sv.querySelectorAll('.sk-l').forEach((l) => { if ((a && l.dataset.a === a && (!p || l.dataset.p === p)) || (!a && p && l.dataset.p === p)) l.classList.add('sk-hl'); });
      g.classList.add('sk-hl');
      if (a && p) sv.querySelectorAll(`.sk-n`).forEach((n) => { if (n.dataset.a === a || n.dataset.p === p) n.classList.add('sk-hl'); });
      else sv.querySelectorAll('.sk-l.sk-hl').forEach((l) => sv.querySelectorAll('.sk-n').forEach((n) => { if ((a && n.dataset.p === l.dataset.p) || (p && n.dataset.a === l.dataset.a)) n.classList.add('sk-hl'); }));
    });
    sv.addEventListener('pointerleave', clear);
  });
}

function annualLine(k, om) {
  const A = S.ops?.annual || {}; const tg = Number(A[k]); if (!tg || k === 'audit') return '';
  const keys = Object.keys(S.ops?.months || {}).map(Number).filter((m) => om == null || m <= om);
  const cum = keys.reduce((s, m) => s + (opsAgg(k, S.ops.months[String(m)], allProvs()).value || 0), 0);
  const fy = A.fy ? String(A.fy).slice(-2) : '';
  return `<span class="oc-y"><span>เป้าปีงบ ${fy} <b class="num">${fmtVal(k, tg)}</b></span><span>สะสม <b class="num">${fmtVal(k, cum)}</b> · ${(cum / tg * 100).toFixed(1)}%</span><i class="oc-yb"><i style="width:${Math.min(100, cum / tg * 100)}%"></i></i></span>`;
}
function opsPanel(metric, opt = {}) {
  const { m: om, d } = opsMonth(); const region = S.opsRegion || '';
  const prod = S.opsProd || '';
  const scopeAg = opsAgg(metric, d, scopeProvs(), prod);
  const crumb = `<nav class="crumb" aria-label="ระดับพื้นที่"><button data-act="ops-region" data-v="">ทั้งประเทศ</button>${region ? `<span>›</span><button data-act="ops-prov" data-v="">${esc(region)}</button>` : ''}${S.opsProv ? `<span>›</span><b>${esc(S.opsProv)}</b>` : ''}</nav>`;
  const scopeName = S.opsProv || region || 'ทั้งประเทศ';
  const panel = d ? `<div class="ops">
    <section class="zc ops-map"><div class="zc-h"><div style="width:100%">${crumb}${scopeAg.none ? `<p>${prod ? esc(prod) + ' · ' : ''}ไม่มีข้อมูล</p>` : `<div class="mstat">${prod ? `<span class="mstat-pd">${pIcon(prod)}${esc(prod)}</span>` : ''}<span><small>ผลจริง</small><b class="num">${fmtVal(metric, scopeAg.value)}</b></span><span><small>${refWord()}</small><b class="num">${fmtVal(metric, scopeAg.target)}</b></span><span class="mstat-p mstat-${achTone(scopeAg.pct)}"><b class="num">${scopeAg.pct == null ? '—' : isGrowth() ? growTxt(metric, scopeAg) : Math.round(scopeAg.pct * 100) + '%'}</b><small>${isGrowth() ? 'จากปีก่อน' : 'ของเป้า'}</small></span><em>${OPS[metric].unit}</em></div>`}</div></div>
      ${opsMap(metric, d, region, prod)}
      <div class="mp-leg">${isGrowth() ? '<span><i class="mp-ok"></i>โตขึ้นหรือเท่าเดิม</span><span><i class="mp-warn"></i>ลดลงไม่เกิน 2%</span><span><i class="mp-bad"></i>ลดลงเกิน 2%</span>' : '<span><i class="mp-ok"></i>ถึงเป้าหรือเกิน</span><span><i class="mp-warn"></i>ต่ำกว่าเป้าไม่เกิน 2%</span><span><i class="mp-bad"></i>ต่ำกว่าเป้าเกิน 2%</span>'}${prod ? '<span><i class="mp-none"></i>ไม่มีสินค้านี้</span>' : ''}</div>
</section>
    <section class="zc"><div class="zc-h"><div><h2>${OPS[metric].label}${prod ? ' · ' + esc(prod) : ''} ${region ? 'รายพื้นที่' : 'รายภาค'} เทียบ${isGrowth() ? 'ปีก่อน' : 'เป้า'}</h2><p>${OPS[metric].unit} · เส้นตั้งคือ${isGrowth() ? 'ยอดปีก่อน' : 'เป้าหมาย'}${prod ? ' · แสดงเฉพาะพื้นที่ที่มีสินค้านี้' : ''}</p></div>${prod ? `<button class="zlink" data-act="ops-prod" data-v="">ล้างสินค้า ${ic('x', 'ic-sm')}</button>` : ''}</div>${opsBars(metric, d, region, prod)}</section>
    <section class="zc"><div class="zc-h"><div><h2>สัดส่วนสินค้า</h2><p>${esc(scopeName)} · กดเพื่อเลือกสินค้า</p></div></div>${opsDonut(metric, d, prod)}</section>
  </div>
  ${zcard(isGrowth() ? 'กลุ่มสินค้าเทียบปีก่อน' : 'กลุ่มสินค้าเทียบเป้า', `${esc(scopeName)} · ${OPS[metric].label} · กดสินค้าเพื่อดูเฉพาะพื้นที่ที่มีสินค้านั้น${prod ? ` · <button class="zlink" data-act="ops-prod" data-v="">ทุกสินค้า</button>` : ''}`, prodTargets(metric, d, prod), { fold: 'prod' })}` : `<div class="empty">${ic('chart')}<b>ยังไม่มีข้อมูลผลการดำเนินงานในช่วงที่เลือก</b></div>`;
  return panel;
}
const growTxt = (metric, ag) => { if (!ag.target) return '—'; const g = metric === 'audit' ? ag.value - ag.target : ag.value / ag.target - 1; return metric === 'audit' ? `${g >= 0 ? '+' : ''}${g.toFixed(1)} จุด` : `${g >= 0 ? '+' : ''}${(g * 100).toFixed(1)}%`; };
function opsTail(metric, key = '') {
  const { d } = opsMonth(), region = S.opsRegion || '', prod = S.opsProd || '';
  return `${zcard('สถิติรายเดือน', 'ตามตัวกรองที่เลือกทั้งหมด: ช่วงเวลา · พื้นที่ · สินค้า · กดแท่งเพื่อเลือกเดือน', monthChart(metric), { fold: key + 'mchart' })}
  ${d ? zcard(metric === 'revenue' ? 'ภาษีมาจากไหน' : OPS[metric].label + 'มาจากไหน', `${region ? esc(region) + ' รายพื้นที่' : 'รายภาค'} → กลุ่มสินค้า · ความหนาของเส้นคือ${OPS[metric].label} · ชี้เพื่อไล่เส้น กดเพื่อเลือก`, opsFlow(metric, d, region, prod), { fold: key + 'flow' }) : ''}`;
}
function viewDashboard() {
  const g = needCfg(); if (g) return g;
  const C = cfg(), f = S.filt, plans = filteredPlans();
  const { m: om, d } = opsMonth();
  const metric = S.opsMetric || 'revenue', region = S.opsRegion || '';
  const ks = kpiStats();
  const ms = monthSummary(f.unit, f.month === '' || f.month == null ? undefined : Number(f.month));
  const opsMonths = S.ops?.months ? Object.keys(S.ops.months).map(Number).sort((a, b) => a - b) : [];
  const monOpts = `<option value="">ล่าสุด${om != null ? ' (' + MONTHS[om] + ')' : ''}</option>` + MONTHS.map((x, i) => `<option value="${i}" ${String(i) === String(f.month) ? 'selected' : ''}>${x}${opsMonths.includes(i) ? '' : ' · ไม่มีข้อมูล'}</option>`).join('');
  const yOpts = `<option value="">ทุกปี</option>` + yearsRange().map((y) => `<option value="${y}" ${String(y) === f.year ? 'selected' : ''}>ปีงบ ${y}</option>`).join('');
  const uOpts = `<option value="">ทุกหน่วยงาน</option>` + visUnits().map((u) => `<option value="${esc(u.id)}" ${u.id === f.unit ? 'selected' : ''}>${esc(u.name)}</option>`).join('');

  const cards = Object.entries(OPS).map(([k, o]) => {
    const ag = opsAgg(k, d, allProvs());
    const pct = ag.pct;
    return `<button type="button" class="oc oc-${o.tone} ${metric === k ? 'on' : ''}" data-act="ops-metric" data-v="${k}" aria-pressed="${metric === k}">
      <span class="oc-t"><span>${o.label}${o.sub ? `<i class="oc-sub">${o.sub}</i>` : ''}</span><b class="num">${fmtVal(k, ag.value)}<small>${o.unit}</small></b>
        <span class="oc-d">เป้าเดือนนี้ ${fmtVal(k, ag.target)}${pct == null ? '' : ` · <span class="t-${achTone(pct)}">${Math.round(pct * 100)}% ของเป้า</span>`}</span>${annualLine(k, om)}</span>
      <span class="oc-ic">${ic(o.icon)}</span></button>`;
  }).join('');
  const panel = opsPanel(metric);

  const pillarRows = C.pillars.map((pl) => {
    const pp = plans.filter((p) => p.pillar === pl.code);
    const b = pp.reduce((s, p) => s + Number(p.budget || 0), 0);
    const acts = pp.map((p) => rowFor(p, ms.m).act).filter((v) => v != null);
    const prog = acts.length ? Math.round(acts.reduce((s, v) => s + v, 0) / acts.length) : null;
    return `<button class="prow prow2" data-p="${pl.code}" data-act="go" data-v="p-${pl.code}">
      <span class="pbadge">${esc(pl.code)}</span>
      <span class="prow-t"><b>${esc(pillarShort(pl))}</b><span>${esc(pl.name_en)}</span></span>
      <span class="prow-n"><b class="num">${pp.length}</b><span>โครงการ</span></span>
      <span class="prow-n"><b class="num">${mb(b)}</b><span>ล้านบาท</span></span>
      <span class="prow-k"><span class="zbar"><i style="width:${prog || 0}%"></i></span><span>คืบหน้า ${prog == null ? '—' : prog + '%'}</span></span></button>`;
  }).join('');
  const rk = rankedRisks().filter((x) => x.sc > 0).slice(0, 5);
  const ri = Math.min(S.dashRisk || 0, Math.max(0, rk.length - 1));
  const sel = rk[ri];
  const riskBody = rk.length ? `<div class="drk3">
    ${riskMapHTML({ markers: rk.map((x, k) => ({ l: x.r.l, i: x.r.i, label: k + 1, act: 'dash-risk', v: k, on: k === ri })), size: 'md' })}
    ${(() => { const r = sel.r, lv = riskLevel(sel.sc), pl = pillarOf(r.pillar), n = S.plans.filter((p) => p.name && (p.risks || []).includes(r.id)); return `<div class="rdet" aria-live="polite">
      <span class="rdet-k">อันดับ ${ri + 1} จาก ${rk.length} · <span class="pcode" data-p="${esc(r.pillar)}">${esc(r.pillar)}</span> ${esc(pillarShort(pl))} · ${esc(r.id)}</span>
      <h3>${esc(r.name)}</h3>
      <div class="rdet-m"><span class="lvtag lv${lv.c.slice(1)}">ระดับ${lv.t} · ${sel.sc} คะแนน</span><span>โอกาส ${r.l} (${LIKELY[r.l]}) × ผลกระทบ ${r.i} (${LIKELY[r.i]})</span></div>
      <span class="rdet-p">โครงการที่ช่วยลด: ${n.length ? n.slice(0, 3).map((p) => esc(p.name)).join(' · ') + (n.length > 3 ? ` และอีก ${n.length - 3}` : '') : 'ยังไม่มี'}</span>
      <span class="help">กดหมายเลขบน risk map เพื่อดูความเสี่ยงเรื่องอื่น</span></div>`; })()}
  </div>` : '<p class="zempty">ยังไม่ได้ประเมินคะแนนความเสี่ยง</p>';
  const sentPct = ms.n ? Math.round((ms.sent / ms.n) * 100) : 0;

  return `
  <section class="xhead">
    <div class="xh-t"><span class="xh-ic">${ic('chart')}</span><div class="xh-tt"><h1>Excise Dashboard${S.ops?.sample ? ' <span class="chip chip-warn" title="ผลการจัดเก็บ ปราบปราม ตรวจสอบ และสัดส่วนสินค้า เป็นข้อมูลตัวอย่าง รอข้อมูลจริง">ข้อมูลตัวอย่าง</span>' : ''}</h1><p class="xh-v" title="${esc(C.vision)}"><b>วิสัยทัศน์</b> ${esc(C.vision)}</p></div></div>
    <div class="xh-f">
      <label><span>ปีงบประมาณ</span><select class="select zsel" data-filt="year">${yOpts}</select></label>
      <label><span>หน่วยงาน</span><select class="select zsel" data-filt="unit">${uOpts}</select></label>
    </div>
    ${periodBar()}
  </section>
  ${hotBar()}
  ${opsCards()}
  ${panel}
  ${opsTail(metric)}
  ${zcard('สถิติรายได้ภาษีสรรพสามิต', 'ย้อนหลัง 10 ปีงบประมาณ · เลือกภาพรวมหรือรายสินค้า · กดปีเพื่อดูเหตุการณ์สำคัญที่กระทบรายได้', `<div id="hist-body">${histBody()}</div>`, { fold: 'hist' })}
  <div class="zgrid">
    ${zcard('KPI Scoreboard', `${ks.n} KPI · On target ${ks.ok} · Near ${ks.warn} · Below ${ks.bad} · No data ${ks.none}`, kpiBoard(null, { noHead: true, noSum: true }), { span: 12, go: 'kpis', goLabel: 'ดูเชิงลึก', fold: 'kpi' })}
    ${zcard('ภาพรวมยุทธศาสตร์', '18 กลยุทธ์ · สถานะโครงการ ความคืบหน้า และงบประมาณ · กดการ์ดเพื่อดูเสา', stratOverview(), { span: 12, fold: 'pillar' })}
    ${zcard('Top 5 Risk', 'ความเสี่ยงระดับกรม' + (C.riskSample ? ' · <span class="chip chip-warn">คะแนนตัวอย่าง</span>' : ''), riskBody, { span: 5, go: 'risks', goLabel: 'ดูเชิงลึก', fold: 'risk' })}
    ${zcard('รายงานผลเดือน ' + MONTHS[ms.m], f.unit ? esc(unitName(f.unit)) : 'ทุกหน่วยงาน', `<div class="zrep">
      <div class="zm-g"><div><b class="num">${ms.sent}/${ms.n}</b><span>ส่งรายงาน</span></div><div><b class="num">${ms.done}</b><span>เสร็จแล้ว</span></div><div><b class="num">${ms.doing}</b><span>กำลังทำ</span></div><div><b class="num ${ms.late ? 'late-t' : ''}">${ms.late}</b><span>ล่าช้า</span></div><div><b class="num">${disbTxt(ms.disb)}</b><span>เบิกจ่าย</span></div></div>
      <span class="zbar"><i style="width:${sentPct}%"></i></span>
      <div class="zrep-a"><button class="btn btn-primary" data-act="dash-pdf" data-v="${ms.m}" ${S.pdfBusy ? 'disabled' : ''}>${ic('download', 'ic-sm')}${S.pdfBusy ? 'กำลังสร้าง PDF…' : 'ดาวน์โหลด PDF สรุปรายงานผล'}</button><button class="btn" data-act="go" data-v="monthly">ไปหน้ารายงานผล</button></div></div>`, { span: 7, fold: 'rep' })}
  </div>`;
}

function viewKpis() {
  const g = needCfg(); if (g) return g;
  const C = cfg(), pf = S.kpiP || '';
  const chips = `<div class="seg seg-sm" role="group" aria-label="เลือกเสา">${[['', 'ทุกเสา'], ...C.pillars.map((p) => [p.code, p.code])].map(([c, l]) => `<button type="button" data-act="kpi-p" data-v="${c}" aria-pressed="${pf === c}" ${c ? `data-p="${c}"` : ''}>${l}</button>`).join('')}</div>`;
  return `<div class="ph"><div class="ph-t"><h1>KPI Scoreboard</h1><span class="sub">Latest result vs target · กด ${ic('info', 'ic-sm')} ดูคำอธิบายภาษาไทย</span></div>${chips}</div>${kpiBoard(pf, true)}<div class="zgrid" style="margin-top:16px">${zcard('ภาพรวมยุทธศาสตร์', '18 กลยุทธ์ · สถานะโครงการ ความคืบหน้า และงบประมาณ', stratOverview(), { span: 12 })}</div>`;
}

function rankedRisks(pf) {
  return cfg().risks.map((r) => ({ r, sc: riskScore(Number(r.l) || 0, Number(r.i) || 0) }))
    .filter((x) => !pf || x.r.pillar === pf)
    .sort((a, b) => b.sc - a.sc || String(a.r.id).localeCompare(String(b.r.id)));
}
function riskRow({ r, sc }, k, big) {
  const lv = riskLevel(sc); const n = S.plans.filter((p) => p.name && (p.risks || []).includes(r.id)).length;
  return `<li class="${big ? 'rr-big' : 'rr-sm'}" data-rk="${k + 1}"><span class="rk-n">${k + 1}</span>
    <span class="rr-t"><b>${esc(r.name)}</b>${big ? `<span><span class="pcode" data-p="${esc(r.pillar)}">${esc(r.pillar)}</span> · ${esc(r.id)} · โอกาส ${r.l || '—'} × ผลกระทบ ${r.i || '—'} · โครงการที่ช่วยลด ${n}</span>` : ''}</span>
    ${big ? '' : `<span class="pcode" data-p="${esc(r.pillar)}">${esc(r.pillar)}</span>`}
    <span class="rr-s">${lv ? `<b class="num lvt-${lv.c}">${sc}</b><span class="lvtag lv${lv.c.slice(1)}">${lv.t}</span>` : '<span class="muted small">ยังไม่ประเมิน</span>'}</span></li>`;
}
function viewRisks() {
  const g = needCfg(); if (g) return g;
  const C = cfg(), rp = S.riskP || '';
  const all = rankedRisks(rp), scored = all.filter((x) => x.sc > 0);
  const markers = scored.map((x, k) => ({ l: x.r.l, i: x.r.i, label: k + 1, dim: k >= 5 }));
  const chips = `<div class="seg seg-sm" role="group" aria-label="เลือกเสา">${[['', 'ทุกเสา'], ...C.pillars.map((p) => [p.code, p.code])].map(([c, l]) => `<button type="button" data-act="risk-p" data-v="${c}" aria-pressed="${rp === c}" ${c ? `data-p="${c}"` : ''}>${l}</button>`).join('')}</div>`;
  const rest = all.slice(5);
  return `<div class="ph"><div class="ph-t"><h1>TOP5 Risk</h1><span class="sub">ความเสี่ยงระดับกรม ${all.length} เรื่อง${rp ? ' · ยุทธศาสตร์ ' + esc(rp) : ''} · เรียงตามโอกาส × ผลกระทบ${C.riskSample ? ' · <span class="chip chip-warn">คะแนนตัวอย่าง</span>' : ''}</span></div>${chips}</div>
  <div class="rk2">
    <section class="zc rk2-map" aria-label="Risk map">
      ${riskMapHTML({ markers, size: 'xl' })}
      <ul class="rk2-leg">${RLEGEND.slice().reverse().map((x) => `<li><i style="background:var(--risk-${x.n})"></i>${x.t} ${x.r}</li>`).join('')}</ul>
    </section>
    <section class="zc rk2-list" aria-label="รายการความเสี่ยง">
      <div class="zc-h"><div><h2>Top 5</h2><p>ชี้ที่รายการเพื่อดูตำแหน่งบน risk map</p></div></div>
      ${all.length ? `<ol class="rr">${all.slice(0, 5).map((x, k) => riskRow(x, k, true)).join('')}</ol>` : '<p class="zempty">ไม่มีความเสี่ยงของยุทธศาสตร์นี้</p>'}
      ${rest.length ? `<div class="rr-more"><span>ความเสี่ยงอื่น ${rest.length} เรื่อง</span><ol class="rr">${rest.map((x, k) => riskRow(x, k + 5, false)).join('')}</ol></div>` : ''}
    </section>
  </div>`;
}

function viewPillar() {
  const g = needCfg(); if (g) return g;
  if (S.param === 'BA') return viewPillarBA();
  if (PSPEC[S.param]) return viewPillarGeneric(S.param);
  const C = cfg(), code = S.param, pl = pillarOf(code);
  if (!pl) return `<div class="empty">${ic('alert')}<b>ไม่พบเสายุทธศาสตร์นี้</b></div>`;
  const plans = filteredPlans().filter((p) => p.pillar === code);
  const budget = plans.reduce((s, p) => s + Number(p.budget || 0), 0);
  const ks = kpiStats(code);
  const strats = C.strategies.filter((s) => s.pillar === code);
  const stratBlocks = strats.map((s) => {
    const pp = plans.filter((p) => p.strategy === s.code);
    return `<div class="zst" data-p="${esc(code)}"><div class="zst-h"><span class="pcode">${esc(s.code)}</span><b>${esc(s.name)}</b><span class="cnt ${pp.length ? 'on' : ''}">${pp.length}</span></div>
      ${pp.length ? `<div class="zst-l">${pp.map((p) => `<button class="prj" data-act="go" data-v="report-${esc(p.id)}"><b>${esc(p.name)}</b><span>${esc(unitName(p.unitId))} · ${money(p.budget)} บาท${p.category === 'flagship' ? ' · Flagship' : ''}${p.status !== 'done' ? ' · ร่าง' : ''}</span></button>`).join('')}</div>` : '<p class="zempty">ยังไม่มีโครงการ</p>'}</div>`;
  }).join('');
  return `<div class="ph" data-p="${code}"><div class="ph-t ph-pillar"><span class="pbadge pbadge-lg">${esc(code)}</span><div><h1>${esc(pillarShort(pl))}</h1><span class="sub">ยุทธศาสตร์ที่ ${pl.num} · ${esc(pl.name_en)}</span></div></div>${filterBar(true)}</div>
  <section class="zgoal" data-p="${code}"><span>เป้าหมาย</span><p>${esc(pl.goal)}</p></section>
  <section class="zstats" aria-label="ภาพรวมเสา ${esc(code)}">
    ${statCard('โครงการ', 'file', `<span class="num">${plans.length}</span>`, `Flagship ${plans.filter((p) => p.category === 'flagship').length}`)}
    ${statCard('งบประมาณ', 'wallet', `<span class="num">${mb(budget)}</span><small>ล้านบาท</small>`, `${money(budget)} บาท`)}
    ${statCard('KPI ผ่านเป้า', 'target', `<span class="num">${ks.ok}</span><small>/ ${ks.n}</small>`, `ใกล้เป้า ${ks.warn} · ต่ำกว่าเป้า ${ks.bad}`)}
    ${statCard('กลยุทธ์', 'layers', `<span class="num">${strats.length}</span>`, `มีโครงการแล้ว ${strats.filter((s) => plans.some((p) => p.strategy === s.code)).length} กลยุทธ์`)}
  </section>
  <div class="zgrid">
    ${zcard('KPI Scoreboard', `${ks.n} KPI · On target ${ks.ok}`, kpiBoard(code, { noHead: true, noSum: true, bare: true }), { span: 7, go: 'kpis' })}
    ${(() => { const rk = rankedRisks(code).filter((x) => x.sc > 0); return zcard('Top Risk ของเสานี้', 'เรียงตามโอกาส × ผลกระทบ', rk.length ? `<div class="prk">${riskMapHTML({ markers: rk.slice(0, 5).map((x, k) => ({ l: x.r.l, i: x.r.i, label: k + 1 })), size: 'md' })}<ol class="rr">${rk.slice(0, 5).map((x, k) => riskRow(x, k, false)).join('')}</ol></div>` : '<p class="zempty">ยังไม่มีความเสี่ยงที่ประเมินแล้ว</p>', { span: 5, go: 'risks' }); })()}
  </div>
  <div class="zgrid">${zcard('กลยุทธ์และโครงการ', 'โครงการภายใต้แต่ละกลยุทธ์ของเสานี้', `<div class="zsts">${stratBlocks}</div>`, { span: 12 })}</div>`;
}

/* ---------- Map zoom / pan ---------- */
function initMapZoom() {
  $$('.mapz').forEach((box) => {
    const svg = box.querySelector('svg'); if (!svg || svg.dataset.z) return; svg.dataset.z = '1';
    const base = svg.dataset.vb.split(' ').map(Number); const key = svg.dataset.key;
    let st = S.mapZ && S.mapZ.key === key ? S.mapZ : { key, z: 1, cx: base[0] + base[2] / 2, cy: base[1] + base[3] / 2 };
    const apply = () => { const w = base[2] / st.z, h = base[3] / st.z; st.cx = Math.min(base[0] + base[2] - w / 2, Math.max(base[0] + w / 2, st.cx)); st.cy = Math.min(base[1] + base[3] - h / 2, Math.max(base[1] + h / 2, st.cy)); svg.setAttribute('viewBox', `${st.cx - w / 2} ${st.cy - h / 2} ${w} ${h}`); svg.style.setProperty('--zk', st.z); S.mapZ = st; box.classList.toggle('zoomed', st.z > 1.01); };
    const zoom = (f, px, py) => { const nz = Math.max(1, Math.min(8, st.z * f)); if (px != null) { const w = base[2] / st.z, h = base[3] / st.z; const x = st.cx - w / 2 + px * w, y = st.cy - h / 2 + py * h; const nw = base[2] / nz, nh = base[3] / nz; st.cx = x - (px - 0.5) * nw; st.cy = y - (py - 0.5) * nh; } st.z = nz; apply(); };
    apply();
    box.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.zoom; if (k === 'reset') { st = { key, z: 1, cx: base[0] + base[2] / 2, cy: base[1] + base[3] / 2 }; apply(); } else zoom(k === 'in' ? 1.5 : 1 / 1.5); }));
    svg.addEventListener('wheel', (e) => { e.preventDefault(); const r = svg.getBoundingClientRect(); zoom(e.deltaY < 0 ? 1.25 : 0.8, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); }, { passive: false });
    let drag = null;
    svg.addEventListener('pointerdown', (e) => { if (st.z <= 1.01) return; drag = { x: e.clientX, y: e.clientY, cx: st.cx, cy: st.cy, moved: false }; });
    svg.addEventListener('pointermove', (e) => { if (!drag) return; const r = svg.getBoundingClientRect(); const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) { drag.moved = true; try { svg.setPointerCapture(e.pointerId); } catch (er) {} } st.cx = drag.cx - dx * (base[2] / st.z) / r.width; st.cy = drag.cy - dy * (base[3] / st.z) / r.height; apply(); });
    const end = () => { if (drag && drag.moved) { svg.dataset.justDragged = '1'; setTimeout(() => { delete svg.dataset.justDragged; }, 50); } drag = null; };
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
    svg.addEventListener('click', (e) => { if (svg.dataset.justDragged) { e.stopPropagation(); e.preventDefault(); } }, true);
  });
}
