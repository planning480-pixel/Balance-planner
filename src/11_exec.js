/* ===================== รายงานสรุปสำหรับผู้บริหาร (A4 แนวตั้ง 6 หน้า) =====================
   หน้า 1 ภาพรวม · 2 BA · 3 C · 4 LA · 5 N · 6 E
   แต่ละหน้า: แผน (กลยุทธ์/โครงการ/งบ) · ผล (KPI + ผลรายพื้นที่) · Insight ปัญหา / อุปสรรค / ข้อเสนอ (สรุปอัตโนมัติจากข้อมูล) */
const XR_ORDER = ['BA', 'C', 'LA', 'N', 'E'];
const XR_TIP = {
  '1.1': 'เร่งติดตามสินค้าที่ต่ำกว่าเป้ามากที่สุดรายเดือน และบริหารรายได้ตามศักยภาพพื้นที่ (BA1)',
  '1.2': 'วางกรอบประเมินผลมาตรการภาษีด้าน ESG ให้ชัดตั้งแต่ปีแรก เพื่อเก็บค่าฐาน (BA3–BA4)',
  '3.1': 'ยกระดับมิติที่คะแนนต่ำของ DG Readiness และใช้ AI ในงานจริง (N1–N2)',
  '3.2': 'เลือกกระบวนงานที่ทำซ้ำมากมาทำ Automation ก่อน และวัดผลก่อน–หลัง (N3)',
  '3.3': 'ทดสอบกู้คืนระบบสำคัญทุกปี กำหนด RTO/RPO และยกระดับ Cybersecurity (N4)',
  '4.1': 'ใช้ RIA และรับฟังความเห็นเร็วขึ้น ติดตามกฎหมายที่ค้างตามขั้นตอนรายไตรมาส (C1)',
  '5.1': 'ปิดช่องว่างหมวดที่คะแนนต่ำของ PMQA 4.0 ด้วย Process Owner และมาตรฐานกระบวนงานเดียว (E2)',
  '5.2': 'ยกระดับ OIT และระบบควบคุมพร้อมร่องรอยดิจิทัล เพื่อไปสู่ ITA ≥ 93 (E3)'
};
const xrSt = { ok: ['ผ่านเป้า', '#1D9152'], warn: ['ใกล้เป้า', '#D97706'], bad: ['ต่ำกว่าเป้า', '#D9363E'], none: ['ยังไม่มีผล', '#94A3B8'] };
const xrNum = (v, d = 2) => (v == null || !isFinite(v) ? '—' : Number(v).toLocaleString('th-TH', { maximumFractionDigits: d }));
const xrPct = (x) => (x == null || !isFinite(x) ? '—' : `${x >= 0 ? '+' : ''}${x.toFixed(1)}%`);
const xrDot = (k) => `<i class="xr-dot" style="background:${xrSt[k][1]}"></i>`;
const xrPlanYear = () => Math.max(SO_YEARS[0], kyr());
const xrDate = () => new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

/* ---------- data per pillar ---------- */
function xrKpis(codes) {
  return cfg().kpis.filter((k) => codes.includes(k.pillar)).map((k) => { const e = kpiEff(k), s = kpiState(k); return { k: e, s }; });
}
function xrProjects(codes) {
  const rows = soRows(xrPlanYear()).filter((r) => codes.includes(r.p.pillar));
  const cnt = (k) => rows.filter((r) => r.k === k).length;
  const budget = rows.reduce((a, r) => a + (r.budget || 0), 0), spent = rows.reduce((a, r) => a + (r.spent || 0), 0);
  return { rows, n: rows.length, done: cnt('done'), ontrack: cnt('ontrack'), late: cnt('late'), todo: cnt('todo'), budget, spent };
}
/* national value + weakest/strongest areas for a KPI with a GEO spec */
function xrGeo(id) {
  if (id === '2.3' && S.eng && typeof engGeo === 'function') GEO['2.3'] = engGeo();
  const gs = GEO[id]; if (!gs) return null;
  const items = REGIONS.map((u) => Object.assign({ name: u }, gsRegionRec(id, u, '') || {})).filter((x) => x.a != null);
  if (gs.central || gs.centralList) { const c = gs.centralAgg ? gs.centralAgg() : gsAgg(gs, gsCentral(id)); if (c) items.push(Object.assign({ name: 'ส่วนกลาง' }, c)); }
  if (!items.length) return null;
  const key = (x) => (gs.kind === 'sum' ? (x.t ? (x.a / x.t) * 100 : null) : gsVal(gs, x));
  const agg = gs.nationAgg ? gs.nationAgg() : gsAgg(gs, items);
  const sorted = items.filter((x) => key(x) != null).sort((a, b) => key(a) - key(b));
  const tgt = gs.kind === 'sum' ? 100 : gs.tline || gsTarget(id);
  return { gs, label: gs.label, v: key(agg || {}), tgt, low: sorted.slice(0, 3).map((x) => [x.name, key(x)]), top: sorted.slice(-2).reverse().map((x) => [x.name, key(x)]), below: sorted.filter((x) => key(x) < tgt).length, n: sorted.length, sample: gs.sample(), tip: gs.tip };
}
function xrReported(rows) {
  return rows.map((r) => ({ name: r.p.name, t: String(r.problems || r.last?.problems || '').trim() })).filter((x) => x.t).slice(0, 3);
}

/* ---------- Insight: ปัญหา / อุปสรรค / ข้อเสนอ ---------- */
function xrInsight(codes, K, PJ, extra = {}) {
  const P = [], O = [], R = [];
  K.filter((x) => x.s.key === 'bad' || x.s.key === 'warn').forEach(({ k, s }) => P.push(`KPI ${k.id} ${k.name_en || ''} ${xrNum(s.v)} ${s.key === 'bad' ? 'ต่ำกว่า' : 'ใกล้'}เป้า ${xrNum(s.tv)}${s.tv ? ` (ขาด ${xrNum(Math.abs(s.tv - s.v))})` : ''}`));
  (extra.p || []).forEach((t) => P.push(t));
  K.map((x) => x.k.id).concat(codes.includes('E') ? ['5.3'] : []).filter((id) => GEO[id] && id !== '2.3').forEach((id) => { const g = xrGeo(id); if (g?.below) P.push(`${g.label} ต่ำกว่าเกณฑ์ ${g.below} จาก ${g.n} พื้นที่ (ต่ำสุด ${g.low[0][0]})${g.sample ? ' [ข้อมูลตัวอย่าง]' : ''}`); });
  if (PJ.late) P.push(`โครงการล่าช้ากว่าแผน ${PJ.late} จาก ${PJ.n} โครงการ`);
  const nd = K.filter((x) => x.s.key === 'none');
  if (nd.length) { const bp = nd.filter((x) => x.k.basePhase).length; O.push(`ยังไม่มีผล KPI ${nd.length} ตัว (${nd.map((x) => x.k.id).join(', ')})${bp ? ` โดย ${bp} ตัวต้องเก็บค่าฐานในปี 2570` : ''}`); }
  xrReported(PJ.rows).forEach((x) => O.push(`${x.name}: ${x.t}`));
  rankedRisks().filter((x) => codes.includes(x.r.pillar) && x.sc > 0).slice(0, 2).forEach((x) => O.push(`ความเสี่ยง ${x.r.id} ${x.r.name} (ระดับ${riskLevel(x.sc).t})`));
  (extra.o || []).forEach((t) => O.push(t));
  (extra.r || []).forEach((t) => R.push(t));
  K.filter((x) => x.s.key !== 'ok').forEach(({ k }) => { const t = GEO[k.id]?.tip || XR_TIP[k.id]; if (t && !R.includes(t)) R.push(t); });
  if (PJ.late) R.push('ประชุมติดตามโครงการล่าช้ารายเดือน ปรับแผนขั้นตอนและงบให้ทันในไตรมาสถัดไป');
  if (PJ.budget && PJ.n) { const d = PJ.spent / PJ.budget; if (!PJ.spent) R.push('ให้โครงการรายงานผลการเบิกจ่ายทุกเดือน เพื่อติดตามงบได้ทันเวลา'); else if (d < 0.3) R.push(`เร่งเบิกจ่าย ปัจจุบันเบิกจ่าย ${(d * 100).toFixed(1)}% ของงบ`); }
  if (!P.length) P.push('ไม่พบ KPI ที่ต่ำกว่าเป้าในปีที่เลือก');
  if (!O.length) O.push('ยังไม่มีการรายงานปัญหาจากโครงการ');
  if (!R.length) R.push('รักษาระดับผลการดำเนินงาน และถ่ายทอดแนวปฏิบัติที่ดี');
  const col = (t, ic0, xs) => `<div class="xr-ic"><h4>${ic0} ${t}</h4><ul>${xs.slice(0, 5).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
  return `<section class="xr-ins"><div class="xr-sh">Insight</div><div class="xr-ins3">${col('ปัญหา', '●', P)}${col('อุปสรรค', '▲', O)}${col('ข้อเสนอ', '➜', R)}</div></section>`;
}

/* ---------- blocks ---------- */
function xrHead(title, sub, color, page) {
  return `<header class="xr-hd" style="--pc:${color}"><div><span class="xr-k">รายงานสรุปสำหรับผู้บริหาร · ปีงบประมาณ ${kyr()}${kyr() === KYEARS[0] ? ' (ค่าฐาน)' : ''}</span><h1>${title}</h1><p>${sub}</p></div><span class="xr-pg">${page}/6</span></header>`;
}
function xrFoot() { return `<footer class="xr-ft"><span>BALANCE Planner · แผนยุทธศาสตร์กรมสรรพสามิต 2570–2574</span><span>พิมพ์ ${xrDate()}</span></footer>`; }
function xrKpiCards(K) {
  return `<div class="xr-kc">${K.map(({ k, s }) => `<div class="xr-kpi" style="--st:${xrSt[s.key][1]}"><div class="xr-kh"><b>KPI ${esc(k.id)}</b><span>${xrDot(s.key)}${xrSt[s.key][0]}</span></div>
    <div class="xr-kn">${esc(k.name_en || '')}</div><div class="xr-kv"><b>${s.v == null ? '—' : xrNum(s.v)}</b><small>${s.v == null ? (k.basePhase && kyr() <= 2570 ? 'เก็บค่าฐาน' : '') : esc(k.unit || '')}</small></div>
    <div class="xr-kt">เป้า ${esc(k.target || '—')}${k.latestAt ? ` · ${esc(k.latestAt)}` : ''}</div></div>`).join('')}</div>`;
}
function xrPlanTable(codes, PJ) {
  const strats = cfg().strategies.filter((s) => codes.includes(s.pillar));
  const rows = strats.map((s) => { const rs = PJ.rows.filter((r) => r.p.strategy === s.code); const b = rs.reduce((a, r) => a + (r.budget || 0), 0), sp = rs.reduce((a, r) => a + (r.spent || 0), 0);
    const c = (k) => rs.filter((r) => r.k === k).length;
    return `<tr><td><b>${esc(s.code)}</b> ${esc(s.name)}</td><td class="n">${rs.length || '—'}</td><td class="n">${b ? mb(b) : '—'}</td><td class="n">${b && sp ? ((sp / b) * 100).toFixed(0) + '%' : '—'}</td><td class="n">${rs.length ? `<span class="xr-c ok">${c('done')}</span><span class="xr-c on">${c('ontrack')}</span><span class="xr-c bad">${c('late')}</span><span class="xr-c no">${c('todo')}</span>` : '—'}</td></tr>`; }).join('');
  const late = PJ.rows.filter((r) => r.k === 'late').slice(0, 3);
  return `<section><div class="xr-sh">แผน · กลยุทธ์และโครงการ ปีงบ ${xrPlanYear()}</div>
    <table class="xr-t"><thead><tr><th>กลยุทธ์</th><th class="n">โครงการ</th><th class="n">งบ (ล้านบาท)</th><th class="n">เบิกจ่าย</th><th class="n">เสร็จ · ตามแผน · ล่าช้า · ยังไม่เริ่ม</th></tr></thead><tbody>${rows}
    <tr class="xr-tot"><td>รวม</td><td class="n">${PJ.n}</td><td class="n">${mb(PJ.budget)}</td><td class="n">${PJ.budget && PJ.spent ? ((PJ.spent / PJ.budget) * 100).toFixed(0) + '%' : '—'}</td><td class="n"><span class="xr-c ok">${PJ.done}</span><span class="xr-c on">${PJ.ontrack}</span><span class="xr-c bad">${PJ.late}</span><span class="xr-c no">${PJ.todo}</span></td></tr></tbody></table>
    ${late.length ? `<p class="xr-note">โครงการล่าช้า: ${late.map((r) => `${esc(r.p.name)} (ผล ${r.act ?? 0}% / แผน ${r.plan ?? 0}%)`).join(' · ')}</p>` : ''}</section>`;
}
function xrGeoBlock(ids) {
  const G = ids.map((id) => [id, xrGeo(id)]).filter((x) => x[1]);
  if (!G.length) return '';
  const f = (g, v) => (v == null ? '—' : g.gs.kind === 'sum' ? Math.round(v) + '%' : v.toFixed(1));
  return `<section><div class="xr-sh">ผล · รายภาค/ส่วนกลาง</div><table class="xr-t"><thead><tr><th>ตัวชี้วัด</th><th class="n">ทั้งประเทศ</th><th class="n">เกณฑ์</th><th>ต่ำสุด 3 อันดับ</th><th>สูงสุด</th></tr></thead><tbody>
    ${G.map(([id, g]) => `<tr><td><b>${esc(id)}</b> ${esc(g.label)}${g.sample ? ' <em class="xr-smp">ตัวอย่าง</em>' : ''}</td><td class="n"><b>${f(g, g.v)}</b></td><td class="n">${g.gs.kind === 'sum' ? '100%' : g.tgt}</td><td>${g.low.map(([n, v]) => `${esc(n)} ${f(g, v)}`).join(' · ')}</td><td>${g.top.slice(0, 1).map(([n, v]) => `${esc(n)} ${f(g, v)}`).join('')}</td></tr>`).join('')}</tbody></table></section>`;
}
function xrRisks(codes, n = 3) {
  const rk = rankedRisks().filter((x) => codes.includes(x.r.pillar) && x.sc > 0).slice(0, n);
  return rk.length ? `<section><div class="xr-sh">ความเสี่ยงสำคัญ</div><ol class="xr-rk">${rk.map((x) => { const lv = riskLevel(x.sc); return `<li><b>${esc(x.r.id)}</b> ${esc(x.r.name)} <span class="xr-lv xr-${lv.k}">${lv.t} · ${x.sc}</span></li>`; }).join('')}</ol></section>` : '';
}

/* ---------- BA: revenue by product ---------- */
function xrRevenue() {
  const fy = realFy(kyr()) ? kyr() : realFy(KYEARS[0]) ? KYEARS[0] : null; const R = fy ? realRows(fy) : null;
  if (!R) return { html: '', p: [], r: [] };
  const pc = (a, b) => (b ? (a / b - 1) * 100 : null), T = R.tot;
  const tone = (x) => (x == null ? '' : x >= 0 ? 'ok' : x >= -2 ? 'warn' : 'bad');
  const cell = (x) => `<td class="n xr-${tone(x)}">${xrPct(x)}</td>`;
  const html = `<section><div class="xr-sh">ผล · รายได้ภาษีรายสินค้า ${esc(R.ins?.title || 'ปีงบ ' + fy)}</div>
    <table class="xr-t"><thead><tr><th>สินค้า</th><th class="n">เก็บจริง (ล้านบาท)</th><th class="n">เทียบปีก่อน</th><th class="n">เทียบเป้ากรมฯ</th><th class="n">เทียบเป้ากระทรวงฯ</th></tr></thead><tbody>
    ${R.rows.map((r) => `<tr><td>${esc(r.p)}</td><td class="n">${fmtM(r.a)}</td>${cell(pc(r.a, r.prev))}${cell(pc(r.a, r.t))}${cell(pc(r.a, r.mof))}</tr>`).join('')}
    <tr class="xr-tot"><td>รวม</td><td class="n">${fmtM(T.a)}</td>${cell(pc(T.a, T.prev))}${cell(pc(T.a, T.t))}${cell(pc(T.a, T.mof))}</tr></tbody></table>
    ${R.ins?.overall ? `<p class="xr-note">${esc(R.ins.overall)}</p>` : ''}</section>`;
  const gaps = R.rows.map((r) => ({ p: r.p, gap: r.a - r.t, pct: pc(r.a, r.t) })).filter((x) => x.gap < 0).sort((a, b) => a.gap - b.gap);
  const P = gaps.slice(0, 2).map((x) => `${x.p} ต่ำกว่าเป้ากรมฯ ${fmtM(-x.gap)} ล้านบาท (${xrPct(x.pct)})`);
  const Rr = gaps.length ? [`เน้นติดตามภาษี${gaps[0].p} ซึ่งขาดเป้ามากที่สุด ร่วมกับเฝ้าระวังภาคที่ผลต่ำกว่าเป้า`] : [];
  return { html, p: P, r: Rr };
}

/* ---------- LA: engagement summary ---------- */
function xrEng() {
  if (!S.eng?.rounds?.length) return { html: '', p: [], r: [] };
  const rs = S.eng.rounds.filter((r) => r.fy <= Math.max(kyr(), S.eng.rounds[0].fy)); const R = rs[rs.length - 1] || S.eng.rounds[S.eng.rounds.length - 1];
  const C = S.eng.rounds[S.eng.rounds.indexOf(R) - 1];
  const U = (R.units?.length ? R : [...S.eng.rounds].reverse().find((r) => r.units?.length))?.units || [];
  const low = [...U].sort((a, b) => a.v[0] - b.v[0]).slice(0, 5);
  const html = `<section><div class="xr-sh">ผล · Engagement ${esc(R.label)}</div><div class="xr-eng">${['ภาพรวม', 'เก่ง', 'ดี', 'มีสุข'].map((t, i) => `<div><small>${t}</small><b>${xrNum(R.v[i])}</b>${C ? `<em class="xr-${R.v[i] - C.v[i] >= 0 ? 'ok' : 'bad'}">${R.v[i] - C.v[i] >= 0 ? '▲' : '▼'} ${Math.abs(R.v[i] - C.v[i]).toFixed(2)}</em>` : ''}</div>`).join('')}</div>
    ${low.length ? `<p class="xr-note">หน่วยงานคะแนนต่ำสุด: ${low.map((u) => `${esc(u.n)} ${u.v[0].toFixed(1)}`).join(' · ')}</p>` : ''}</section>`;
  const dims = [1, 2, 3].map((i) => [['', 'เก่ง', 'ดี', 'มีสุข'][i], R.v[i]]).sort((a, b) => a[1] - b[1]);
  return { html, p: [`ด้านที่ต่ำสุดของความผูกพันคือ "${dims[0][0]}" ${xrNum(dims[0][1])}`], o: (R.notes || []).slice(0, 1), r: ['จัดแผนพัฒนาเฉพาะหน่วยงาน 10 อันดับสุดท้ายและส่วนกลาง ภายใต้กลยุทธ์ LA3', 'ขอข้อมูลดิบผลสำรวจเป็น Excel และวิเคราะห์ปัจจัยขับเคลื่อนทุกครั้ง'] };
}

/* ---------- pages ---------- */
function xrPillarPage(code, page) {
  const pl = pillarOf(code), color = PCOL[code] || '#1A5BD6', grp = (kGroup(kGroupOf(code)) || [])[1] || '';
  const K = xrKpis([code]), PJ = xrProjects([code]);
  const geoIds = K.map((x) => x.k.id).filter((id) => GEO[id] && id !== '2.3');
  let special = { html: '', p: [], r: [] };
  if (code === 'BA') special = xrRevenue();
  if (code === 'LA') special = xrEng();
  if (code === 'N' && typeof xrDG === 'function') special = xrDG();
  if (code === 'E' && GEO['5.3']) geoIds.push('5.3');
  return `<div class="xr-page">${xrHead(`${esc(grp)} · ${esc(code)} ${esc(pl ? pillarShort(pl) : code)}`, `ยุทธศาสตร์ที่ ${pl?.num || ''} ${esc(pl?.name_en || '')} · เป้าหมาย 5 ปี: ${esc(PGOAL[code] || pl?.goal || '')}`, color, page)}
    <div class="xr-sh">ผล · KPI ปีงบ ${kyr()}</div>${xrKpiCards(K)}
    ${special.html}${xrGeoBlock(geoIds)}${xrPlanTable([code], PJ)}${xrRisks([code])}
    ${xrInsight([code], K, PJ, { p: special.p, o: special.o, r: special.r })}${xrFoot()}</div>`;
}
function xrOverview() {
  const C = cfg(), K = xrKpis(XR_ORDER), PJ = xrProjects(XR_ORDER);
  const cnt = (k) => K.filter((x) => x.s.key === k).length;
  const rev = realFy(kyr()) ? realRows(kyr()) : null;
  const tiles = [['KPI ผ่านเป้า', `${cnt('ok')}/${K.length}`, `ใกล้ ${cnt('warn')} · ต่ำกว่า ${cnt('bad')} · ยังไม่มีผล ${cnt('none')}`],
    ['โครงการปีงบ ' + xrPlanYear(), PJ.n, `ล่าช้า ${PJ.late} · เสร็จ ${PJ.done}`],
    ['งบประมาณ (ล้านบาท)', mb(PJ.budget), `เบิกจ่าย ${PJ.budget && PJ.spent ? ((PJ.spent / PJ.budget) * 100).toFixed(1) + '%' : '—'}`],
    ['รายได้ภาษี (ล้านบาท)', rev ? fmtM(rev.tot.a) : '—', rev ? `เทียบเป้ากรมฯ ${xrPct((rev.tot.a / rev.tot.t - 1) * 100)}` : 'ยังไม่มีข้อมูลปีนี้']];
  const prow = XR_ORDER.map((code) => { const pl = pillarOf(code), k = xrKpis([code]), pj = xrProjects([code]); const weak = k.filter((x) => x.s.key === 'bad' || x.s.key === 'warn');
    return `<tr><td><span class="xr-pb" style="background:${PCOL[code]}">${code}</span> ${esc(pl ? pillarShort(pl) : code)}<small>${esc((kGroup(kGroupOf(code)) || [])[1] || '')}</small></td><td class="n">${k.filter((x) => x.s.key === 'ok').length}/${k.length}</td><td class="n">${pj.n}</td><td class="n">${mb(pj.budget)}</td><td class="n">${pj.late || '—'}</td><td>${weak.length ? weak.map((x) => `${x.k.id} ${xrNum(x.s.v)} (เป้า ${xrNum(x.s.tv)})`).join(' · ') : k.some((x) => x.s.key === 'none') ? 'รอผล ' + k.filter((x) => x.s.key === 'none').map((x) => x.k.id).join(', ') : 'ผ่านเป้าทุกตัว'}</td></tr>`; }).join('');
  const ktab = `<table class="xr-t xr-tk"><thead><tr><th>KPI</th><th class="n">ผล</th><th class="n">เป้า</th><th>สถานะ</th></tr></thead><tbody>${K.map(({ k, s }) => `<tr><td><b>${esc(k.id)}</b> ${esc(k.name_en || '')}</td><td class="n">${s.v == null ? '—' : xrNum(s.v)}</td><td class="n">${s.tv == null ? '—' : xrNum(s.tv)}</td><td>${xrDot(s.key)}${xrSt[s.key][0]}${k.latestAt ? ` <span class="xr-at">${esc(k.latestAt)}</span>` : ''}</td></tr>`).join('')}</tbody></table>`;
  const rk = rankedRisks().filter((x) => x.sc > 0).slice(0, 5);
  const revSp = xrRevenue(), engSp = xrEng();
  return `<div class="xr-page">${xrHead('ภาพรวมแผนยุทธศาสตร์ 2570–2574', `${esc(C.vision || 'กรมสรรพสามิต')} · ข้อมูล ณ ${xrDate()}`, '#0E2756', 1)}
    <div class="xr-tiles">${tiles.map(([a, b, c]) => `<div><small>${a}</small><b>${b}</b><span>${c}</span></div>`).join('')}</div>
    <section><div class="xr-sh">ผลรายเสา · กองหน้า กองกลาง กองหลัง</div><table class="xr-t"><thead><tr><th>เสา</th><th class="n">KPI ผ่าน</th><th class="n">โครงการ</th><th class="n">งบ (ลบ.)</th><th class="n">ล่าช้า</th><th>ประเด็นที่ต้องติดตาม</th></tr></thead><tbody>${prow}</tbody></table></section>
    <section><div class="xr-sh">KPI ทั้ง 14 ตัว ปีงบ ${kyr()}</div>${ktab}</section>
    ${rk.length ? `<section><div class="xr-sh">Top 5 ความเสี่ยงระดับกรม</div><ol class="xr-rk xr-rk2">${rk.map((x) => { const lv = riskLevel(x.sc); return `<li><b>${esc(x.r.id)}</b> ${esc(x.r.name)} <span class="xr-lv xr-${lv.k}">${esc(x.r.pillar)} · ${lv.t}</span></li>`; }).join('')}</ol></section>` : ''}
    ${xrInsight(XR_ORDER, K, PJ, { p: revSp.p.slice(0, 1).concat(engSp.p || []).slice(0, 2), r: revSp.r.slice(0, 1) })}${xrFoot()}</div>`;
}
function execPdf() {
  const y = kyr();
  pdfFromPages((host) => {
    host.innerHTML = [xrOverview(), ...XR_ORDER.map((c, i) => xrPillarPage(c, i + 2))].join('');
    const pages = [...host.querySelectorAll('.xr-page')];
    pages.forEach((pg) => { const body = pg; let f = 1; while (body.scrollHeight > 1123 && f > 0.78) { f -= 0.04; body.style.setProperty('--xf', f); } });
    return pages;
  }, `รายงานผู้บริหาร-BALANCE-FY${y}.pdf`, { orient: 'p' });
}
