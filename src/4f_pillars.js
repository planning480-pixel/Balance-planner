
/* ---------- Generic pillar deep-dive: LA · N · C · E ---------- */
const SMP = '<span class="chip chip-warn" title="ข้อมูลตัวอย่าง รอเชื่อมฐานข้อมูลจริง">ข้อมูลตัวอย่าง</span>';
const KPI_EXTRA = { '5.3': { id: '5.3', pillar: 'E', name: 'ระดับความพึงพอใจของผู้รับบริการกรมสรรพสามิต', name_en: 'Customer Satisfaction', target: '≥ 85% ทุกปี', tval: 85, unit: '%', dir: 'ge' } };
const kpiAny = (id) => kpiOf(id) || KPI_EXTRA[id];
const pst = (code) => { S.g = S.g || {}; S.g[code] = S.g[code] || { region: '', prov: '', central: false, sort: 'desc', prod: '' }; return S.g[code]; };

/* ---------- area records ---------- */
function hrRec(area) {
  const H = hrData(); if (H.units[area]) return H.units[area];
  if (BKK5.includes(area)) { const b = H.units[BKK]; if (!b) return null; const i = BKK5.indexOf(area); const pos = Math.round(b.pos * BKK_W[i]); return { pos, staff: Math.round(pos * (0.82 + hsh(area + 'f') * 0.24)), cap: Math.round((70 + hsh(area + 'c') * 26) * 10) / 10, eng: Math.round((82 + hsh(area + 'e') * 15) * 10) / 10 }; }
  return null;
}
const smpRec = (salt, base, span, area, prod) => ({ a: Math.round((base + hsh(salt + area + (prod || '')) * span) * 10) / 10, w: Math.round(40 + hsh(salt + 'w' + area + (prod || '')) * 400) });
function opsRec(metric, area, prod) { const { d } = opsMonth(); const v = provPair(metric, d, area, prod || ''); return v ? { a: v[0], t: v[1], w: v[1] } : null; }
const GEO = {
  '2.1': { kind: 'avg', label: 'ทักษะพร้อมอนาคต', desc: 'ร้อยละบุคลากรที่มีสมรรถนะไม่ต่ำกว่าระดับที่กำหนด', rec: (a) => { const r = hrRec(a); return r ? { a: r.cap, w: r.staff } : null; }, central: (u) => ({ a: u.cap, w: u.staff }), sub: (r) => `บุคลากร ${money(r.w)} คน`, sample: () => hrData().sample, tip: 'แนวทาง LA2: ปิด Skill Gap ด้วย IDP เรียนรู้จากงานจริง และสร้าง AI Controller ในทุกหน่วย' },
  '2.2': { kind: 'ratio', label: 'กำลังคนตรงภารกิจ', desc: 'เจ้าหน้าที่ปฏิบัติงานจริง เทียบอัตรากำลัง', rec: (a) => { const r = hrRec(a); return r ? { a: r.staff, t: r.pos, w: r.pos } : null; }, central: (u) => ({ a: u.staff, t: u.pos, w: u.pos }), sub: (r) => `ปฏิบัติงานจริง ${money(r.a)} / อัตรากำลัง ${money(r.t)} คน`, tone: (v) => fillTone(v), tline: 90, legend: '<span><i class="mp-ok"></i>90–110% ของอัตรา</span><span><i class="mp-warn"></i>85–90% หรือเกิน 110%</span><span><i class="mp-bad"></i>ต่ำกว่า 85%</span>', sample: () => hrData().sample, tip: 'แนวทาง LA1: Strategic Workforce Planning วางแผนกำลังคนด้วยข้อมูล และปรับกำลังคนตามปริมาณงานส่วนกลาง ภาค พื้นที่' },
  '2.3': { kind: 'avg', label: 'ความผูกพันองค์กร', desc: 'คะแนนความผูกพันของบุคลากร (Engagement)', rec: (a) => { const r = hrRec(a); return r ? { a: r.eng, w: r.staff } : null; }, central: (u) => ({ a: u.eng, w: u.staff }), sub: (r) => `บุคลากร ${money(r.w)} คน`, sample: () => hrData().sample, tip: 'แนวทาง LA3–LA4: One Team & ExerCISE Culture ดูแล Work-life Balance และเชื่อมผลงานกับแรงจูงใจ', link: '2.3' },
  '4.2': { kind: 'avg', products: true, label: 'ปฏิบัติตามกฎหมายโดยสมัครใจ', desc: 'ร้อยละผู้เสียภาษีที่ยื่นแบบและชำระภาษีถูกต้อง ครบถ้วน ภายในกำหนด', rec: (a, p) => smpRec('cr', 84, 13, a, p), sub: (r) => `ผู้ประกอบการ ${money(r.w)} ราย`, sample: () => true, tip: 'แนวทาง C1: ปิดช่องว่างการบังคับใช้ · E1: บริการ Digital First ให้ปฏิบัติตามง่ายขึ้น' },
  '4.3': { kind: 'ratio', products: true, label: 'Hit rate ตรวจสอบ', desc: 'พบการไม่ปฏิบัติตามกฎหมาย ÷ ราย ที่ตรวจสอบตามความเสี่ยง', rec: (a, p) => opsRec('audit', a, p), sub: (r) => `พบ ${money(r.a)} จากตรวจ ${money(r.t)} ราย`, target: () => Number(S.ops?.targets?.audit) || 60, sample: () => !!S.ops?.sample, tip: 'แนวทาง C2: คัดเป้าหมายด้วย Risk-based Audit และ Early Warning ป้องกันความเสียหาย' },
  '4.4': { kind: 'sum', products: true, label: 'ภาษีที่รักษา/เรียกคืนได้', unit: 'ล้านบาท', desc: 'มูลค่ารายได้ภาษีที่รักษาและเรียกคืนได้จากการป้องกันและปราบปราม เทียบเป้า', rec: (a, p) => opsRec('enforce', a, p), sub: (r) => `เป้า ${fmtM(r.t)} ล้านบาท`, sample: () => !!S.ops?.sample, tip: 'แนวทาง C3: Supply Chain & Area-based Enforcement และบูรณาการข้อมูลร่วมกับภาคีรัฐ–เอกชน' },
  '5.3': { kind: 'avg', products: true, label: 'ความพึงพอใจผู้รับบริการ', desc: 'คะแนนความพึงพอใจผู้รับบริการ ถ่วงน้ำหนักตามจำนวนผู้ตอบ', rec: (a, p) => smpRec('sat', 80, 17, a, p), sub: (r) => `ผู้ตอบแบบประเมิน ${money(r.w)} ราย`, sample: () => true, tip: 'แนวทาง E1: One Journey · One Form · Once Only และ Customer Feedback Loop' }
};
const gsTarget = (id) => (GEO[id].target ? GEO[id].target() : Number(kpiAny(id)?.tval) || 90);
function gsVal(gs, r) { if (!r) return null; if (gs.kind === 'ratio') return r.t ? (r.a / r.t) * 100 : null; return r.a; }
function gsAgg(gs, recs) {
  recs = recs.filter(Boolean); if (!recs.length) return null;
  if (gs.kind === 'avg') { const w = recs.reduce((s, x) => s + (x.w || 1), 0); return { a: recs.reduce((s, x) => s + x.a * (x.w || 1), 0) / w, w }; }
  return { a: recs.reduce((s, x) => s + x.a, 0), t: recs.reduce((s, x) => s + (x.t || 0), 0), w: recs.reduce((s, x) => s + (x.w || 0), 0) };
}
function gsTone(id, r) {
  const gs = GEO[id], v = gsVal(gs, r); if (v == null) return 'none';
  if (gs.tone) return gs.tone(v, r);
  if (gs.kind === 'sum') return r.t ? achTone(r.a / r.t) : 'none';
  return achTone(v / gsTarget(id));
}
const gsFmt = (id, v) => (v == null ? '—' : GEO[id].kind === 'sum' ? fmtM(v) : v.toFixed(1) + '%');
function gsAreaRec(id, area, prod) { const gs = GEO[id]; if (area === BKK) return gsAgg(gs, BKK5.map((a) => gs.rec(a, prod))); return gs.rec(area, prod); }
const gsRegionRec = (id, u, prod) => gsAgg(GEO[id], regionAreas(u).map((a) => GEO[id].rec(a, prod)));
function gsCentral(id) { const gs = GEO[id]; if (!gs.central) return null; return Object.entries(hrData().central || {}).map(([k, u]) => Object.assign({ id: k, name: u.name, kind: 'unit' }, gs.central(u))); }
function gsScope(code, id) {
  const st = pst(code), gs = GEO[id], prod = gs.products ? st.prod : '';
  if (st.central && gs.central) return { level: 'central', name: 'ส่วนกลาง', items: gsCentral(id) };
  if (st.region) return { level: 'region', name: st.region, items: regionAreas(st.region).map((a) => Object.assign({ id: a, name: a, area: a, kind: 'area' }, gs.rec(a, prod) || {})).filter((x) => x.a != null) };
  const items = REGIONS.map((u) => Object.assign({ id: u, name: u, region: u, kind: 'region' }, gsRegionRec(id, u, prod) || {})).filter((x) => x.a != null);
  if (gs.central) { const c = gsAgg(gs, gsCentral(id)); if (c) items.push(Object.assign({ id: 'central', name: 'ส่วนกลาง', kind: 'central' }, c)); }
  return { level: 'nation', name: 'ทั้งประเทศ', items };
}
function geoMap(code, id) {
  const st = pst(code), gs = GEO[id], prod = gs.products ? st.prod : '', reg = st.region;
  const shapes = reg ? THMAP.filter((x) => x.k === 'p' && x.u === reg) : THMAP.filter((x) => x.k === 'r');
  let vb = '0 0 360 672', scale = 1;
  if (reg) { const b = regionBox(reg); if (b) { const pad = 8, w = b[2] - b[0], h = b[3] - b[1]; vb = `${b[0] - pad} ${b[1] - pad} ${w + pad * 2} ${h + pad * 2}`; scale = Math.max(0.35, Math.max(w, h) / 360); } }
  const paths = shapes.map((x) => {
    const r = reg ? gsAreaRec(id, x.n, prod) : gsRegionRec(id, x.u, prod), t = r ? gsTone(id, r) : 'none';
    const sel = reg && (st.prov === x.n || areaProv(st.prov) === x.n), dim = reg && st.prov && !sel;
    return `<path d="${x.d}" class="mp mp-${t} mp-click ${sel ? 'mp-sel' : ''} ${dim ? 'mp-dim' : ''}" data-act="${reg ? 'g-prov' : 'g-region'}" data-v="${esc(code + '|' + (reg ? x.n : x.u))}"><title>${esc(reg ? x.n : x.u)} · ${esc(gs.label)} ${gsFmt(id, gsVal(gs, r))}</title></path>`;
  }).join('');
  const labels = reg ? shapes.map((x) => `<text class="pl ${st.prov === x.n || areaProv(st.prov) === x.n ? 'pl-sel' : ''}" x="${x.x}" y="${x.y}" style="font-size:${(9 * scale).toFixed(2)}px">${esc(x.n === BKK ? 'กทม. 1–5' : x.n)}</text>`).join('')
    : shapes.map((x) => { const r = gsRegionRec(id, x.u, prod); const o = ML_OFF[x.u] || [0, 0]; const v = gsVal(gs, r); return `<g class="ml" transform="translate(${x.x + o[0]},${x.y + o[1]})"><rect x="-26" y="-17" width="52" height="34" rx="8"/><text class="ml-n" y="-3">${esc(x.u)}</text><text class="ml-p" y="12">${v == null ? '—' : gs.kind === 'sum' ? (r.t ? Math.round((r.a / r.t) * 100) + '%' : '—') : Math.round(v) + '%'}</text></g>`; }).join('');
  return `<div class="mapz"><svg class="thmap" viewBox="${vb}" data-vb="${vb}" data-key="g-${esc(code + id + (reg || 'TH'))}" role="img" aria-label="แผนที่${esc(gs.label)}" style="--sw:${(0.8 * scale).toFixed(2)}">${paths}${labels}</svg>
    <div class="mapz-c"><button type="button" data-zoom="in" aria-label="ซูมเข้า">${ic('plus', 'ic-sm')}</button><button type="button" data-zoom="out" aria-label="ซูมออก">${ic('minus', 'ic-sm')}</button><button type="button" data-zoom="reset" aria-label="รีเซ็ตมุมมอง">${ic('expand-all', 'ic-sm')}</button></div></div>`;
}
function geoList(code, id, sc) {
  const st = pst(code), gs = GEO[id], sort = st.sort || 'desc';
  const v = (x) => gsVal(gs, x) ?? -1e9, key = (x) => (gs.kind === 'sum' ? (x.t ? x.a / x.t : -1) : v(x));
  const ranked = sc.items.slice().sort((a, b) => key(b) - key(a)); const rank = {}; ranked.forEach((x, i) => { rank[x.id] = i + 1; });
  let items = sort === 'desc' ? ranked : sort === 'asc' ? ranked.slice().reverse() : sc.items.slice().sort((a, b) => String(a.name).localeCompare(String(b.name), 'th'));
  const tgt = gs.kind === 'sum' ? 100 : gs.tline || gsTarget(id);
  const bar = (x) => (gs.kind === 'sum' ? (x.t ? (x.a / x.t) * 100 : 0) : gsVal(gs, x) || 0);
  const max = Math.max(110, ...items.map(bar));
  const actFor = (x) => (x.kind === 'region' ? `data-act="g-region" data-v="${esc(code + '|' + x.region)}"` : x.kind === 'central' ? `data-act="g-central" data-v="${esc(code)}"` : x.kind === 'area' ? `data-act="g-prov" data-v="${esc(code + '|' + x.area)}"` : '');
  return `<div class="lal-t"><div class="seg seg-sm" role="group" aria-label="การเรียง">${[['desc', 'อันดับ สูง→ต่ำ'], ['asc', 'ต่ำ→สูง'], ['name', 'ตามชื่อ']].map(([k, l]) => `<button type="button" data-act="g-sort" data-v="${esc(code + '|' + k)}" aria-pressed="${sort === k}">${l}</button>`).join('')}</div></div>
  <ol class="lal">${items.map((x) => { const tone = gsTone(id, x), sel = x.area && (st.prov === x.area || (st.prov === BKK && BKK5.includes(x.area))); return `<li class="${sel ? 'on' : ''} ${st.prov && x.area && !sel ? 'dim' : ''}" ${actFor(x)} role="button" tabindex="0">
    <span class="lal-r ${rank[x.id] <= 3 && sort !== 'name' ? 'lal-top' : ''}">${rank[x.id]}</span>
    <span class="lal-n"><b>${esc(x.name)}</b><small>${gs.sub ? gs.sub(x) : ''}</small></span>
    <span class="lal-b"><i class="hb-${tone}" style="width:${Math.max(0, (bar(x) / max) * 100)}%"></i><em style="left:${(tgt / max) * 100}%"></em></span>
    <b class="lal-v num t-${tone}">${gs.kind === 'sum' ? `${fmtM(x.a)}<small>${x.t ? Math.round((x.a / x.t) * 100) + '%' : ''}</small>` : gsFmt(id, gsVal(gs, x))}</b></li>`; }).join('') || '<li class="zempty">ไม่มีข้อมูลในพื้นที่นี้</li>'}</ol>`;
}
function geoInsight(code, id, sc) {
  const gs = GEO[id], st = pst(code);
  const items = st.prov && sc.level === 'region' ? sc.items.filter((x) => x.area === st.prov || (st.prov === BKK && BKK5.includes(x.area))) : sc.items;
  const name = st.prov && sc.level === 'region' ? (st.prov === BKK ? 'กรุงเทพฯ (5 พื้นที่)' : st.prov) : sc.name;
  const agg = gsAgg(gs, items), v = gsVal(gs, agg), tgt = gs.kind === 'sum' ? null : gs.tline || gsTarget(id);
  const key = (x) => (gs.kind === 'sum' ? (x.t ? x.a / x.t : null) : gsVal(gs, x));
  const sorted = items.filter((x) => key(x) != null).sort((a, b) => key(a) - key(b));
  const low = sorted.slice(0, 3), top = sorted[sorted.length - 1];
  const bad = items.filter((x) => gsTone(id, x) === 'bad').length, warn = items.filter((x) => gsTone(id, x) === 'warn').length;
  const pts = [];
  if (gs.kind === 'sum') { const p = agg?.t ? agg.a / agg.t : null; pts.push({ i: p >= 1 ? 'pos' : 'neg', t: `${esc(name)} ${esc(gs.label)} ${fmtM(agg?.a)} ล้านบาท จากเป้า ${fmtM(agg?.t)} (${p == null ? '—' : (p * 100).toFixed(1) + '%'})` }); }
  else if (id === '2.2') { const gap = (agg?.t || 0) - (agg?.a || 0); pts.push({ i: gap > 0 ? 'neg' : 'pos', t: `${esc(name)} ปฏิบัติงานจริง ${money(agg?.a)} คน จากอัตรากำลัง ${money(agg?.t)} คน (${v?.toFixed(1)}%) ${gap > 0 ? `ขาด ${money(gap)} คน` : `เกินอัตรา ${money(-gap)} คน`}` }); }
  else pts.push({ i: v >= tgt ? 'pos' : 'neg', t: `${esc(gs.label)}ของ${esc(name)} ${gsFmt(id, v)} ${v >= tgt ? 'ถึง' : 'ต่ำกว่า'}เป้า ${tgt}%${v != null ? ` (${v >= tgt ? '+' : ''}${(v - tgt).toFixed(1)} จุด)` : ''}` });
  if (items.length > 1) {
    pts.push({ i: bad ? 'neg' : 'pos', t: `ต่ำกว่าเกณฑ์ ${bad} หน่วย · ใกล้เกณฑ์ ${warn} หน่วย จาก ${items.length} หน่วย` });
    if (low.length) pts.push({ i: 'neg', t: `ควรเร่งติดตาม: ${low.map((x) => `${esc(x.name)} ${gs.kind === 'sum' ? Math.round(key(x) * 100) + '%' : key(x).toFixed(1) + '%'}`).join(' · ')}` });
    if (top) pts.push({ i: 'pos', t: `สูงสุด: ${esc(top.name)} ${gs.kind === 'sum' ? Math.round(key(top) * 100) + '%' : key(top).toFixed(1) + '%'} ใช้เป็นต้นแบบถ่ายทอดแนวปฏิบัติ` });
  }
  if (gs.products && !st.prod) {
    const pr = opsProducts().map((k) => ({ k, r: gs.region !== false ? gsAgg(gs, (st.region ? regionAreas(st.region) : allAreas()).map((a) => gs.rec(a, k))) : null })).filter((x) => x.r);
    const pk = (x) => (gs.kind === 'sum' ? (x.r.t ? x.r.a / x.r.t : null) : gsVal(gs, x.r));
    const ps = pr.filter((x) => pk(x) != null).sort((a, b) => pk(a) - pk(b));
    if (ps.length) pts.push({ i: 'mix', t: `รายสินค้า: ต่ำสุด ${esc(ps[0].k)} ${gs.kind === 'sum' ? Math.round(pk(ps[0]) * 100) + '%' : pk(ps[0]).toFixed(1) + '%'} · สูงสุด ${esc(ps[ps.length - 1].k)} ${gs.kind === 'sum' ? Math.round(pk(ps[ps.length - 1]) * 100) + '%' : pk(ps[ps.length - 1]).toFixed(1) + '%'}` });
  }
  pts.push({ i: 'str', t: gs.tip });
  const k = kpiAny(id);
  return `<div class="lai"><div class="lai-h">${ic('bulb', 'ic-sm')}<b>Insight · ${esc(name)}</b></div>
    <ul>${pts.map((p) => `<li class="hx-ev-${p.i}"><b>${EVI[p.i]?.[0] || '•'}</b><span>${p.t}</span></li>`).join('')}</ul>
    ${gs.link && k?.detailUrl ? `<a class="btn btn-sm" href="${esc(k.detailUrl)}" target="_blank" rel="noopener">${ic('external', 'ic-sm')}ดูผลสำรวจฉบับเต็ม</a>` : ''}</div>`;
}
function geoPanel(code, id) {
  const st = pst(code), gs = GEO[id], sc = gsScope(code, id);
  const crumb = `<nav class="crumb" aria-label="ระดับพื้นที่"><button data-act="g-region" data-v="${esc(code + '|')}">ทั้งประเทศ</button>${st.central ? '<span>›</span><b>ส่วนกลาง</b>' : ''}${st.region ? `<span>›</span><button data-act="g-prov" data-v="${esc(code + '|')}">${esc(st.region)}</button>` : ''}${st.prov ? `<span>›</span><b>${esc(st.prov === BKK ? 'กรุงเทพฯ' : st.prov)}</b>` : ''}</nav>`;
  const agg = gsAgg(gs, sc.items), v = gsVal(gs, agg);
  const prods = gs.products ? `<div class="hx-chips g-prods"><button type="button" class="hx-chip ${st.prod ? '' : 'on'}" data-act="g-prod" data-v="${esc(code + '|')}">${ic('layers', 'ic-sm')}ทุกสินค้า</button>${opsProducts().map((k, i) => `<button type="button" class="hx-chip ${st.prod === k ? 'on' : ''}" data-act="g-prod" data-v="${esc(code + '|' + k)}" style="--pc:${PCOLS[i % PCOLS.length]}">${pIcon(k)}${esc(k)}</button>`).join('')}</div>` : '';
  const head = `<div class="mstat"><span><small>${esc(gs.label)}</small><b class="num">${gs.kind === 'sum' ? fmtM(v) : gsFmt(id, v)}</b></span>${gs.kind === 'sum' ? `<span><small>เป้า</small><b class="num">${fmtM(agg?.t)}</b></span><span class="mstat-p mstat-${gsTone(id, agg || {})}"><b class="num">${agg?.t ? Math.round((agg.a / agg.t) * 100) + '%' : '—'}</b><small>ของเป้า</small></span>` : `<span><small>เกณฑ์</small><b class="num">${gs.tline || gsTarget(id)}%</b></span>`}${gs.sample() ? '<em>ข้อมูลตัวอย่าง</em>' : ''}</div>`;
  return `${prods}<div class="la3">
    <section class="zc la-map"><div class="zc-h"><div style="width:100%">${crumb}${head}</div></div>
      ${st.central ? `<div class="la-central">${ic('building')}<b>หน่วยงานส่วนกลาง</b><span>${sc.items.length} สำนัก/กอง</span><button class="btn btn-sm" data-act="g-region" data-v="${esc(code + '|')}">กลับแผนที่ทั้งประเทศ</button></div>` : geoMap(code, id)}
      <div class="mp-leg">${gs.legend || '<span><i class="mp-ok"></i>ถึงเกณฑ์</span><span><i class="mp-warn"></i>ต่ำกว่าไม่เกิน 2%</span><span><i class="mp-bad"></i>ต่ำกว่าเกิน 2%</span>'}</div></section>
    <section class="zc la-list"><div class="zc-h"><div><h2>${esc(gs.label)} รายพื้นที่${gs.central ? '/หน่วยงาน' : ''}</h2><p>${esc(sc.name)}${st.prod ? ' · ' + esc(st.prod) : ''} · ${esc(gs.desc)}</p></div></div>${geoList(code, id, sc)}</section>
    <section class="zc la-ins">${geoInsight(code, id, sc)}</section>
  </div>`;
}

/* ---------- non-geo panels ---------- */
function barsPanel(title, desc, rows, opt = {}) {
  const max = Math.max(opt.max || 100, ...rows.map((r) => r.v || 0));
  const tg = opt.target;
  const sorted = rows.slice().sort((a, b) => (opt.keepOrder ? 0 : (b.v || 0) - (a.v || 0)));
  const low = rows.filter((r) => r.v != null).sort((a, b) => a.v - b.v);
  const tone = (r) => (r.v == null ? 'none' : achTone(r.v / (r.t ?? tg)));
  return `<div class="pn2">
    <section class="zc"><div class="zc-h"><div><h2>${esc(title)} ${SMP}</h2><p>${esc(desc)}</p></div></div>
      <ol class="lal lal-static">${sorted.map((r, i) => `<li><span class="lal-r ${i < 3 && !opt.keepOrder ? 'lal-top' : ''}">${opt.keepOrder ? r.k || i + 1 : i + 1}</span><span class="lal-n"><b>${esc(r.name)}</b><small>${esc(r.sub || '')}</small></span><span class="lal-b"><i class="hb-${tone(r)}" style="width:${((r.v || 0) / max) * 100}%"></i>${(r.t ?? tg) != null ? `<em style="left:${((r.t ?? tg) / max) * 100}%"></em>` : ''}</span><b class="lal-v num t-${tone(r)}">${r.v == null ? '—' : r.v.toLocaleString('th-TH', { maximumFractionDigits: 1 })}${opt.unit || ''}</b></li>`).join('')}</ol></section>
    <section class="zc la-ins"><div class="lai"><div class="lai-h">${ic('bulb', 'ic-sm')}<b>Insight</b></div><ul>
      <li class="hx-ev-${opt.total >= (opt.totalTarget ?? tg) ? 'pos' : 'neg'}"><b>${opt.total >= (opt.totalTarget ?? tg) ? '▲' : '▼'}</b><span>${esc(opt.totalLabel || 'ภาพรวม')} ${opt.total == null ? '—' : opt.total.toLocaleString('th-TH', { maximumFractionDigits: 2 })}${opt.unit || ''} เทียบเกณฑ์ ${opt.totalTarget ?? tg}${opt.unit || ''}</span></li>
      ${low.length ? `<li class="hx-ev-neg"><b>▼</b><span>จุดที่ควรพัฒนาก่อน: ${low.slice(0, 3).map((r) => `${esc(r.name)} ${r.v.toLocaleString('th-TH', { maximumFractionDigits: 1 })}${opt.unit || ''}`).join(' · ')}</span></li>` : ''}
      ${low.length ? `<li class="hx-ev-pos"><b>▲</b><span>จุดแข็ง: ${esc(low[low.length - 1].name)} ${low[low.length - 1].v.toLocaleString('th-TH', { maximumFractionDigits: 1 })}${opt.unit || ''}</span></li>` : ''}
      ${opt.tip ? `<li class="hx-ev-str"><b>●</b><span>${esc(opt.tip)}</span></li>` : ''}</ul></div></section></div>`;
}
const LAWS = [
  { cat: 'น้ำมันและพลังงาน', icon: 'fuel', items: [['ลดภาษีดีเซล B20 / แก๊สโซฮอล์ E20 ชั่วคราว 3 เดือน', 5], ['ปรับโครงสร้างภาษีน้ำมันตามปริมาณคาร์บอน', 4], ['ภาษีคาร์บอนตาม พ.ร.บ. Climate Change', 2]] },
  { cat: 'ยาสูบ', icon: 'smoke', items: [['ภาษีบุหรี่อัตราเดียว (Single Tier)', 2], ['เก็บภาษีบุหรี่ส่งออกล่วงหน้า ขอคืนเมื่อส่งออกจริง', 3], ['กำกับบุหรี่ไฟฟ้า', 1]] },
  { cat: 'สุรา เบียร์ และสถานบริการ', icon: 'liquor', items: [['Sandbox ข้าวสาร–รามบุตรี ทบทวนโซนนิ่งสถานบริการ', 2], ['ส่งเสริมสุราชุมชน', 3], ['อัตราภาษีเครื่องดื่มแอลกอฮอล์ 0%', 1]] },
  { cat: 'รถยนต์และยานยนต์ไฟฟ้า', icon: 'car', items: [['โครงสร้างภาษีรถยนต์ตามการปล่อย CO2', 5], ['แก้ไขประกาศมาตรการ EV3 / EV3.5', 3], ['ภาษีรถยนต์โบราณ', 5]] },
  { cat: 'เครื่องดื่มและสุขภาพ', icon: 'cup', items: [['ภาษีเครื่องดื่มตามปริมาณน้ำตาล ระยะ 4', 5], ['ภาษีความเค็ม (โซเดียม)', 1]] },
  { cat: 'กระบวนการกฎหมาย', icon: 'book', items: [['ทบทวนกฎหมายด้วย RIA (Regulatory Impact Assessment)', 2], ['Regulatory Sandbox ธุรกิจใหม่', 2], ['One Rule – One Standard ตีความและตอบข้อหารือ', 3]] }
];
const STAGES = ['เริ่มต้น', 'ศึกษา/RIA', 'รับฟังความเห็น', 'เสนอ/ประกาศ', 'บังคับใช้/ประเมินผล'];
function lawsPanel() {
  const all = LAWS.flatMap((c) => c.items), done = all.filter((x) => x[1] >= 4).length;
  return `<div class="lawh"><span>สถานะ</span><ol class="stg">${STAGES.map((s, i) => `<li>${i + 1}. ${s}</li>`).join('')}</ol><span class="muted small">กฎหมาย/มาตรการ ${all.length} เรื่อง · ถึงขั้นประกาศแล้ว ${done} เรื่อง ${SMP}</span></div>
  ${carousel(LAWS.map((c) => `<div class="law"><div class="law-h"><span class="dn-ic" style="--pc:var(--accent)">${ic(c.icon, 'ic-sm')}</span><b>${esc(c.cat)}</b><span class="muted small">${c.items.length} เรื่อง</span></div>
    <ul>${c.items.map(([n, s]) => `<li><span title="${esc(n)}">${esc(n)}</span><span class="stgb">${STAGES.map((_, i) => `<i class="${i < s ? 'on' : ''} ${i === s - 1 ? 'cur' : ''}">${i < s ? i + 1 : ''}</i>`).join('')}</span></li>`).join('')}</ul></div>`).join(''), 'laws')}
  <p class="help">สถานะเป็นข้อมูลตัวอย่างจากข่าวและร่างแผน รอยืนยันจากสำนักกฎหมาย</p>`;
}
const JOURNEY = {
  'รถยนต์': { tabs: { 'รถยนต์เชื้อเพลิง / HEV / PHEV': ['จดทะเบียน', 'ขอ Eco sticker', 'ขอใช้สิทธิทางภาษี', 'แจ้งราคาขายปลีกแนะนำ', 'ชำระภาษี', 'ยื่นบัญชีงบเดือน'], 'รถยนต์ไฟฟ้า': ['จดทะเบียน', 'ขอใช้สิทธิทางภาษี', 'แจ้งราคาขายปลีกแนะนำ', 'ชำระภาษี', 'ยื่นบัญชีงบเดือน', 'เข้าร่วมมาตรการสนับสนุนยานยนต์ไฟฟ้า'] } },
  _: ['จดทะเบียน', 'แจ้งราคาขายปลีกแนะนำ', 'ชำระภาษี', 'ยื่นบัญชีงบเดือน', 'ขอคืน/ยกเว้นภาษี']
};
const STEP_DETAIL = {
  'จดทะเบียน': [['ขอจดทะเบียนสรรพสามิต (กรณีเป็นผู้ประกอบอุตสาหกรรม)', 'ยื่นคำขอจดทะเบียนสรรพสามิต ณ สำนักงานสรรพสามิตพื้นที่ที่โรงอุตสาหกรรมตั้งอยู่ ภายใน 30 วันก่อนเริ่มการผลิต ใช้เวลาพิจารณาประมาณ 3 วัน (แบบ ภส. 01-01)'], ['ขอจดทะเบียนสรรพสามิต (กรณีเป็นผู้นำเข้า)', 'ยื่นคำขอจดทะเบียน ณ สำนักงานสรรพสามิตพื้นที่ที่สำนักงานใหญ่ของสถานประกอบการผู้นำเข้าตั้งอยู่ ภายใน 30 วันก่อนนำเข้าสินค้า (แบบ ภส. 01-01)']]
};
function journeyPanel(code) {
  const st = pst(code), prod = st.prod || 'รถยนต์';
  const J = JOURNEY[prod]; const tabs = J?.tabs ? Object.keys(J.tabs) : null;
  const tab = tabs ? (tabs.includes(st.jtab) ? st.jtab : tabs[0]) : null;
  const steps = tabs ? J.tabs[tab] : JOURNEY._;
  const si = Math.min(st.jstep || 0, steps.length - 1);
  const sat = (i) => Math.round((78 + hsh('st' + prod + (tab || '') + i) * 19) * 10) / 10;
  const t = gsTarget('5.3');
  const det = STEP_DETAIL[steps[si]];
  return `<div class="jr">
    ${tabs ? `<div class="jr-tabs" role="tablist">${tabs.map((x) => `<button type="button" role="tab" aria-selected="${x === tab}" data-act="j-tab" data-v="${esc(code + '|' + x)}">${esc(x)}</button>`).join('')}</div>` : ''}
    <ol class="jr-steps">${steps.map((s, i) => { const v = sat(i), tone = achTone(v / t); return `<li class="${i === si ? 'on' : ''} ${i < si ? 'past' : ''}"><button type="button" data-act="j-step" data-v="${esc(code + '|' + i)}"><i class="jr-dot"></i><b>STEP ${i + 1}</b><span>${esc(s)}</span><em class="t-${tone}">${v}%</em></button></li>`; }).join('')}</ol>
    <div class="jr-d"><h3>${si + 1}. ${esc(steps[si])}</h3>
      <div class="jr-kv"><span>ความพึงพอใจขั้นตอนนี้ <b class="t-${achTone(sat(si) / t)}">${sat(si)}%</b></span><span>เกณฑ์ ${t}%</span><span>ผู้ตอบ ${money(Math.round(80 + hsh('n' + prod + si) * 900))} ราย</span>${SMP}</div>
      ${det ? det.map((d, i) => `<div class="jr-c"><span class="jr-n">0${i + 1}</span><div><b>${esc(d[0])}</b><p>${esc(d[1])}</p></div></div>`).join('') : `<div class="jr-c"><span class="jr-n">01</span><div><b>${esc(steps[si])}</b><p>รายละเอียดขั้นตอน เอกสาร และระยะเวลามาตรฐานของขั้นตอนนี้ ผู้ดูแลระบบจะเพิ่มจากคู่มือประชาชนของกรม</p></div></div>`}
      <p class="help">ข้อเสนอแนะ: ขั้นตอนที่คะแนนต่ำกว่าเกณฑ์ ใช้แนวทาง E1 One Journey · One Form · Once Only และ E2 Redesign End-to-End Process</p></div>
  </div>`;
}

/* ---------- specs per pillar ---------- */
function nPanels(id) {
  const k = kpiAny(id);
  if (id === '3.1') { const dims = [['ยุทธศาสตร์และการนำองค์กรดิจิทัล', 0], ['บริการดิจิทัลแก่ประชาชน', 1], ['ธรรมาภิบาลข้อมูลและข้อมูลเปิด', 2], ['โครงสร้างพื้นฐานดิจิทัล', 3], ['บุคลากรดิจิทัล', 4], ['ความมั่นคงปลอดภัยไซเบอร์', 5]].map(([n, i]) => ({ name: n, v: Math.round((82 + hsh('dg' + i) * 16) * 100) / 100, k: i + 1 })); return barsPanel('คะแนน DG Readiness รายมิติ', 'คะแนนประเมินความพร้อมรัฐบาลดิจิทัล แยกตามมิติ (เต็ม 100)', dims, { target: 90, unit: '', total: k?.latest ?? dims.reduce((s, x) => s + x.v, 0) / dims.length, totalLabel: 'คะแนนรวม DG Readiness', keepOrder: true, tip: 'แนวทาง N1–N2: ยกระดับ AI สู่การใช้งานจริง และวางระบบข้อมูลชุดเดียวใช้ทั้งกรม' }); }
  if (id === '3.2') { const rows = (cfg().units || []).map((u) => { const tot = Math.round(6 + hsh('pr' + u.id) * 14), up = Math.round(tot * (0.55 + hsh('pu' + u.id) * 0.45)); return { name: u.name, v: Math.round((up / tot) * 1000) / 10, sub: `ยกระดับแล้ว ${up}/${tot} กระบวนงาน` }; }); const tot = rows.reduce((s, r) => s + r.v, 0) / (rows.length || 1); return barsPanel('กระบวนงานที่ยกระดับด้วยเทคโนโลยี รายหน่วยงาน', 'ร้อยละกระบวนงานที่ยกระดับและบรรลุผลเพิ่มประสิทธิภาพตามเป้า', rows, { target: Number(k?.tval) || 80, unit: '%', total: tot, totalLabel: 'ภาพรวมทั้งกรม', tip: 'แนวทาง N3: เชื่อมระบบดิจิทัลทั้งกรมเป็นหนึ่งเดียว (One Portal) และพัฒนา Automation งาน Routine' }); }
  const sys = ['e-Excise ยื่นแบบและชำระภาษี', 'ระบบทะเบียนและใบอนุญาต', 'Direct Coding / Track & Trace', 'ระบบปราบปรามและคดี', 'Data Platform / Dashboard ผู้บริหาร', 'ระบบบริหารทรัพยากรบุคคล', 'เว็บไซต์และ Call Center'].map((n, i) => ({ name: n, v: Math.round((70 + hsh('rs' + i) * 30) * 10) / 10, sub: `Uptime ${(99 + hsh('up' + i) * 0.99).toFixed(2)}% · ทดสอบกู้คืน ${hsh('dr' + i) > 0.35 ? 'ผ่าน' : 'ยังไม่ผ่าน'}` }));
  return barsPanel('ความพร้อมให้บริการและฟื้นตัวของระบบดิจิทัล', 'คะแนนความยืดหยุ่น (Resilience) รายระบบ ตามเกณฑ์ RTO/RPO และผลทดสอบกู้คืน', sys, { target: Number(k?.tval) || 80, unit: '%', total: sys.filter((s) => s.v >= 80).length / sys.length * 100, totalLabel: 'ระบบที่ผ่านเกณฑ์', tip: 'แนวทาง N4: วาง AI & Technology Governance พัฒนาโครงสร้างพื้นฐานที่ต่อเนื่อง ฟื้นตัวเร็ว และยกระดับ Cybersecurity' });
}
function ePanels(id, code) {
  const k = kpiAny(id);
  if (id === '5.1') { const cats = ['หมวด 1 การนำองค์การ', 'หมวด 2 การวางแผนเชิงยุทธศาสตร์', 'หมวด 3 การให้ความสำคัญกับผู้รับบริการ', 'หมวด 4 การวัด วิเคราะห์ และจัดการความรู้', 'หมวด 5 การมุ่งเน้นบุคลากร', 'หมวด 6 การมุ่งเน้นระบบปฏิบัติการ', 'หมวด 7 ผลลัพธ์การดำเนินการ'].map((n, i) => ({ name: n, v: Math.round((380 + hsh('pm' + i) * 110)), k: i + 1, t: 470 })); return barsPanel('คะแนน PMQA 4.0 รายหมวด', 'คะแนนประเมินสถานะการเป็นระบบราชการ 4.0 รายหมวด (เต็ม 500)', cats, { target: 470, max: 500, unit: '', keepOrder: true, total: cats.reduce((s, x) => s + x.v, 0) / cats.length, totalLabel: 'คะแนนเฉลี่ยทุกหมวด', tip: 'แนวทาง E2: Redesign End-to-End Process ใช้มาตรฐานกระบวนงานเดียวทั้งกรม และกำหนด Process Owner' }); }
  if (id === '5.2') { const ind = [['IIT การรับรู้ของผู้มีส่วนได้ส่วนเสียภายใน', 'ประเมินจากบุคลากร'], ['EIT การรับรู้ของผู้มีส่วนได้ส่วนเสียภายนอก', 'ประเมินจากผู้รับบริการ'], ['OIT การเปิดเผยข้อมูล', 'ข้อมูลสาธารณะบนเว็บไซต์'], ['OIT การป้องกันการทุจริต', 'มาตรการป้องกันการทุจริต']].map(([n, s], i) => ({ name: n, sub: s, v: Math.round((86 + hsh('ita' + i) * 13) * 100) / 100, k: i + 1 })); return barsPanel('คะแนน ITA รายตัวชี้วัด', 'การประเมินคุณธรรมและความโปร่งใสในการดำเนินงานของหน่วยงานภาครัฐ (เต็ม 100)', ind, { target: 93, unit: '', keepOrder: true, total: k?.latest ?? ind.reduce((s, x) => s + x.v, 0) / ind.length, totalLabel: 'คะแนน ITA รวม', tip: 'แนวทาง E3: วางระบบควบคุมอนุมัติพร้อมร่องรอยดิจิทัล เน้นตรวจสอบภายในแบบเตือนก่อนเกิดเหตุ' }); }
  return `${geoPanel(code, '5.3')}${zcard('ความพึงพอใจตามขั้นตอนบริการ', 'เลือกสินค้าด้านบน แล้วกดแต่ละขั้นตอนเพื่อดูรายละเอียดและคะแนน', journeyPanel(code), { fold: 'e-journey' })}`;
}
const PSPEC = {
  LA: { kpis: ['2.1', '2.2', '2.3'], panel: (id, code) => geoPanel(code, id) },
  N: { kpis: ['3.1', '3.2', '3.3'], panel: (id) => nPanels(id) },
  C: { kpis: ['4.1', '4.2', '4.3', '4.4'], panel: (id, code) => (id === '4.1' ? zcard('ทบทวนและปรับปรุงกฎหมายตามแผน', 'กฎหมายและมาตรการรายกลุ่มสินค้า แยกตามสถานะ 5 ขั้น · เลื่อนการ์ดซ้ายขวาได้', lawsPanel(), {}) : geoPanel(code, id)) },
  E: { kpis: ['5.1', '5.2', '5.3'], panel: (id, code) => ePanels(id, code) }
};
function kpiCardVal(id) {
  const k = kpiAny(id); if (k?.latest != null) return { v: k.latest, sub: k.latestAt || '' };
  if (GEO[id]) { const gs = GEO[id]; const items = allAreas().map((a) => gs.rec(a, '')); const ag = gsAgg(gs, [...items, ...(gs.central ? gsCentral(id) : [])]); if (!ag) return { v: null, sub: '' }; if (gs.kind === 'sum') return { v: ag.t ? (ag.a / ag.t) * 100 : null, sub: `${fmtM(ag.a)} / ${fmtM(ag.t)} ล้านบาท` }; if (id === '2.2') { const all = allAreas().map((a) => gs.rec(a)).concat(gsCentral(id) || []).filter(Boolean); return { v: (all.filter((r) => fillTone(gsVal(gs, r)) === 'ok').length / all.length) * 100, sub: `กำลังคนจริง ${gsVal(gs, ag).toFixed(1)}% ของอัตรา` }; } return { v: gsVal(gs, ag), sub: 'จากข้อมูลรายพื้นที่' }; }
  if (id === '4.1') { const all = LAWS.flatMap((c) => c.items); return { v: Math.round((all.filter((x) => x[1] >= 4).length / all.length) * 1000) / 10, sub: 'ถึงขั้นประกาศ/บังคับใช้' }; }
  return { v: null, sub: '' };
}
const KICON = { '2.1': 'bulb', '2.2': 'user', '2.3': 'spark', '3.1': 'chart', '3.2': 'layers', '3.3': 'shield', '4.1': 'book', '4.2': 'check', '4.3': 'target', '4.4': 'shield', '5.1': 'flag', '5.2': 'eye', '5.3': 'spark' };
function viewPillarGeneric(code) {
  const pl = pillarOf(code), spec = PSPEC[code], st = pst(code);
  const kid = spec.kpis.includes(st.k) ? st.k : spec.kpis[0];
  const cards = carousel(spec.kpis.map((id) => { const k = kpiAny(id); if (!k) return ''; const c = kpiCardVal(id); return bigKpi(k, c.v, c.sub, { act: 'g-k', v: code + '|' + id, on: id === kid, badge: `<span class="bk-ic">${ic(KICON[id] || 'target')}</span>` }); }).join(''), 'k-' + code);
  return `${pillarHead(code, pl)}
  ${cards}
  ${spec.panel(kid, code)}
  <div class="zgrid">${zcard('ความเสี่ยงของเสานี้', 'กดหมายเลขบน risk map เพื่อดูรายละเอียดและโครงการที่ช่วยลด', pillarRiskPanel(code), { span: 12, go: 'risks', fold: code + '-risk' })}</div>
  ${zcard('กลยุทธ์ → แนวทาง → โครงการ', 'กดกลยุทธ์เพื่อเปิด/ปิด กดโครงการเพื่อดูวัตถุประสงค์ ขั้นตอน ความก้าวหน้า และงบประมาณ', projTree(code), { fold: code + '-proj' })}`;
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act^="g-"],[data-act^="j-"]'); if (!el) return;
  const a = el.dataset.act, [code, v] = String(el.dataset.v || '').split('|');
  const st = pst(code);
  const keep = () => { const vw = $('#view'); const y = vw.scrollTop; renderView(); vw.scrollTop = y; };
  if (a === 'g-k') { st.k = v; }
  else if (a === 'g-region') { st.central = false; st.region = v || ''; st.prov = ''; }
  else if (a === 'g-prov') { if (!v) st.prov = ''; else { st.prov = st.prov === v ? '' : v; if (!st.region) st.region = provRegion[areaProv(v)] || ''; } }
  else if (a === 'g-central') { st.central = true; st.region = ''; st.prov = ''; }
  else if (a === 'g-sort') { st.sort = v; }
  else if (a === 'g-prod') { st.prod = v || ''; st.jstep = 0; }
  else if (a === 'j-tab') { st.jtab = v; st.jstep = 0; }
  else if (a === 'j-step') { st.jstep = Number(v); }
  else return;
  keep();
});
document.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.lal li[data-act]')) { e.preventDefault(); e.target.click(); } });
