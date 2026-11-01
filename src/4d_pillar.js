
/* ---------- Pillar deep-dive pages (BA, LA) ---------- */
/* แนวทางพัฒนา ตามร่างแผนยุทธศาสตร์กรมสรรพสามิต 2570–2574 */
const APPR = {
  BA1: ['Revenue Intelligence คาดการณ์รายได้รายสินค้าและรายพื้นที่', 'Revenue Transition Map บริหารฐานภาษี Sunset → Sunrise', 'ขยายฐานภาษีใหม่ ทดลองใน Sandbox', 'ทบทวนพิกัด อัตรา มาตรฐานราคา และสิทธิประโยชน์ตามผลลัพธ์'],
  BA2: ['ส่งเสริมการลงทุนมูลค่าสูง', 'ยกระดับ Thai Local Supply Chain', 'หนุนไทยเป็นฐานการผลิตและส่งออกระดับโลก'],
  BA3: ['พัฒนามาตรการภาษีสะท้อนต้นทุนสุขภาพและสังคม', 'ออกแบบภาษีเพื่อปรับพฤติกรรมที่เหมาะสมต่อสุขภาพ', 'ประเมินผลกระทบของมาตรการอย่างเป็นธรรม'],
  BA4: ['มาตรการภาษีหนุน Net Zero และภาษีคาร์บอนตาม พ.ร.บ. Climate Change', 'เร่งการเปลี่ยนผ่านสู่พลังงานสะอาด', 'ส่งเสริม ESG / BCG และ Circular Economy'],
  LA1: ['ปรับโครงสร้าง บทบาท กำลังคน ส่วนกลาง ภาค พื้นที่ ตามภารกิจและปริมาณงาน', 'Strategic Workforce Planning วางแผนกำลังคนด้วยข้อมูล', 'สร้างทีมผู้เชี่ยวชาญข้ามหน่วยงาน'],
  LA2: ['ปิด Skill Gap ด้วย IDP และการเรียนรู้จากงานจริง', 'สร้าง AI Controller คนที่ใช้ AI และข้อมูลในงานของตน', 'สร้างมาตรฐานและการถ่ายทอดความรู้', 'พัฒนาผู้นำการเปลี่ยนแปลงทุกระดับ'],
  LA3: ['ทำงานเป็นทีมด้วยวินัยและความมืออาชีพ One Goal & One Team', 'ยกระดับองค์กรคุณธรรม', 'เปิดพื้นที่เสนอความคิดและนวัตกรรม', 'ดูแลคุณภาพชีวิตและ Work-life Balance'],
  LA4: ['เส้นทางก้าวหน้าทุกสายงาน พร้อมหมุนเวียนงาน', 'เชื่อมผลงานกับแรงจูงใจอย่างโปร่งใส เป็นธรรม', 'ดึง พัฒนา รักษา Talent วางผู้สืบทอด', 'เสนอ HR Sandbox']
};
const PGOAL = { BA: 'รายได้มั่นคง • ภาษีสร้างสมดุล ตอบโจทย์ประเทศ', LA: 'องค์กรกระชับ คล่องตัว • คนเก่ง ดี มีความสุข พร้อมปรับตัว' };
const PLAN_PDF = 'plan-2570-2574.pdf';


const PLAN_PAGES = [1, 2, 3, 4, 5, 6].map((i) => `plan/p-${i}.jpg`);
function openPlanViewer(i = 0) {
  let d = document.getElementById('plan-dlg');
  if (!d) { d = document.createElement('div'); d.id = 'plan-dlg'; d.className = 'pv'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'ร่างแผนยุทธศาสตร์กรมสรรพสามิต 2570–2574'); document.body.append(d); }
  S.pvi = Math.max(0, Math.min(PLAN_PAGES.length - 1, i));
  d.innerHTML = `<div class="pv-box"><div class="pv-h"><span class="pv-ic">${ic('book', 'ic-sm')}</span><b>ร่างแผนยุทธศาสตร์กรมสรรพสามิต ปี 2570–2574</b><span class="muted small">หน้า ${S.pvi + 1} / ${PLAN_PAGES.length}</span>
      <button class="btn btn-sm btn-primary" data-act="plan-pdf">${ic('download', 'ic-sm')}ดาวน์โหลด PDF</button><button class="icon-btn" data-act="pv-close" aria-label="ปิด">${ic('x')}</button></div>
    <div class="pv-m"><button class="car-b car-l" data-act="pv-go" data-v="-1" aria-label="หน้าก่อน" ${S.pvi === 0 ? 'disabled' : ''}>${ic('chevron', 'ic-sm')}</button><img src="${PLAN_PAGES[S.pvi]}" alt="หน้า ${S.pvi + 1}"><button class="car-b car-r" data-act="pv-go" data-v="1" aria-label="หน้าถัดไป" ${S.pvi === PLAN_PAGES.length - 1 ? 'disabled' : ''}>${ic('chevron', 'ic-sm')}</button></div>
    <div class="pv-t">${PLAN_PAGES.map((u, k) => `<button data-act="pv-to" data-v="${k}" class="${k === S.pvi ? 'on' : ''}" aria-label="หน้า ${k + 1}"><img src="${u}" alt=""></button>`).join('')}</div></div>`;
  d.hidden = false;
}
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act^="pv-"],[data-act="plan-view"]'); if (!el) { if (e.target.id === 'plan-dlg') e.target.hidden = true; return; }
  const a = el.dataset.act;
  if (a === 'plan-view') openPlanViewer(0);
  else if (a === 'pv-close') document.getElementById('plan-dlg').hidden = true;
  else if (a === 'pv-go') openPlanViewer(S.pvi + Number(el.dataset.v));
  else if (a === 'pv-to') openPlanViewer(Number(el.dataset.v));
});
document.addEventListener('keydown', (e) => { const d = document.getElementById('plan-dlg'); if (!d || d.hidden) return; if (e.key === 'Escape') d.hidden = true; else if (e.key === 'ArrowRight') openPlanViewer(S.pvi + 1); else if (e.key === 'ArrowLeft') openPlanViewer(S.pvi - 1); });

async function downloadPlanPdf() {
  try {
    const res = await fetch(PLAN_PDF); if (!res.ok) throw new Error('nf');
    const blob = await res.blob();
    if (S.dl) { await S.dl.save({ filename: 'ร่างแผนยุทธศาสตร์กรมสรรพสามิต 2570-2574.pdf', data: blob }); return; }
    window.open(PLAN_PDF, '_blank', 'noopener');
  } catch (e) {
    if (e?.code === 'declined') return;
    try { window.open(PLAN_PDF, '_blank', 'noopener'); } catch (er) { toast('เปิดไฟล์แผนไม่สำเร็จ', 'err'); }
  }
}

/* ---------- shared: risk panel + project tree ---------- */
function pillarRiskPanel(code) {
  const rk = rankedRisks(code).filter((x) => x.sc > 0);
  if (!rk.length) return '<p class="zempty">ยังไม่มีความเสี่ยงที่ประเมินแล้วของเสานี้</p>';
  const ri = Math.min(S.pRisk?.[code] || 0, rk.length - 1), sel = rk[ri], r = sel.r, lv = riskLevel(sel.sc);
  const n = S.plans.filter((p) => p.name && (p.risks || []).includes(r.id));
  return `<div class="drk3">${riskMapHTML({ markers: rk.map((x, k) => ({ l: x.r.l, i: x.r.i, label: k + 1, act: 'pr-risk', v: code + ':' + k, on: k === ri })), size: 'md' })}
    <div class="rdet" aria-live="polite"><span class="rdet-k">อันดับ ${ri + 1} จาก ${rk.length} · ${esc(r.id)}</span><h3>${esc(r.name)}</h3>
      <div class="rdet-m"><span class="lvtag lv${lv.c.slice(1)}">ระดับ${lv.t} · ${sel.sc} คะแนน</span><span>โอกาส ${r.l} (${LIKELY[r.l]}) × ผลกระทบ ${r.i} (${LIKELY[r.i]})</span></div>
      ${r.kri ? `<span class="rdet-p"><b>KRI</b> ${esc(r.kri)}</span>` : ''}
      <span class="rdet-p">โครงการที่ช่วยลด: ${n.length ? n.map((p) => `<button class="zlink" data-act="pr-open" data-v="${esc(p.id)}">${esc(p.name)}</button>`).join(' · ') : 'ยังไม่มี'}</span>
      <span class="help">กดหมายเลขบน risk map เพื่อดูความเสี่ยงเรื่องอื่น</span></div></div>`;
}
function projDetail(p, m) {
  const r = rowFor(p, m), st = r.status;
  const steps = (p.steps || []).filter((x) => x && x.name);
  const done = r.last?.steps || [];
  return `<div class="pj-d">
    <div class="pj-dg">
      <div><span class="lbl">วัตถุประสงค์</span><p>${esc(p.objective || '—')}</p></div>
      <div><span class="lbl">ผลผลิต / ผลลัพธ์</span><p>${esc(p.output12 || p.output6 || '—')}${p.outcome12 ? `<br><span class="muted">Outcome: ${esc(p.outcome12)}</span>` : ''}</p></div>
      <div><span class="lbl">ความก้าวหน้าล่าสุด${r.last ? ' · ' + MONTHS[r.last.m] : ''}</span><p>${esc(r.last?.progress || 'ยังไม่มีรายงาน')}</p>${r.last?.problems ? `<p class="t-bad small">ปัญหา: ${esc(r.last.problems)}</p>` : ''}</div>
    </div>
    ${steps.length ? `<ol class="pj-steps">${steps.map((x, i) => `<li class="${done[i] ? 'ok' : ''}"><i>${done[i] ? ic('check', 'ic-sm') : i + 1}</i><span>${esc(x.name)}</span><small>${x.from != null ? MONTHS[x.from] : ''}${x.to != null && x.to !== x.from ? '–' + MONTHS[x.to] : ''}</small></li>`).join('')}</ol>` : ''}
    <div class="pj-df"><span>งบประมาณ <b class="num">${money(p.budget)}</b> บาท</span><span>เบิกจ่าย <b class="num">${disbTxt(r.disb)}</b></span><span>สถานะ <span class="chip ${RCHIP[st] || 'chip'}">${RSTAT[st] || '—'}</span></span><button class="btn btn-sm" data-act="go" data-v="report-${esc(p.id)}">${ic('file', 'ic-sm')}เปิดรายงานแผนเต็ม</button></div>
  </div>`;
}
function projTree(code) {
  const C = cfg(), m = typeof curFm === 'function' ? curFm() : 0;
  const plans = filteredPlans().filter((p) => p.pillar === code && p.name);
  const strats = C.strategies.filter((s) => s.pillar === code);
  S.pOpen = S.pOpen || {};
  return `<div class="pt3">${strats.map((s) => {
    const pp = plans.filter((p) => p.strategy === s.code);
    const acts = pp.map((p) => rowFor(p, m).act).filter((v) => v != null);
    const prog = acts.length ? Math.round(acts.reduce((a, b) => a + b, 0) / acts.length) : null;
    const bud = pp.reduce((a, p) => a + Number(p.budget || 0), 0);
    const open = S.pOpen[s.code] ?? pp.length > 0;
    return `<section class="pt3-s ${open ? 'open' : ''}" data-p="${esc(code)}">
      <button class="pt3-h" data-act="pt-strat" data-v="${esc(s.code)}" aria-expanded="${open}"><span class="pcode">${esc(s.code)}</span><b>${esc(s.name)}</b>
        <span class="pt3-m"><span><b class="num">${pp.length}</b> โครงการ</span><span><b class="num">${mb(bud)}</b> ลบ.</span><span class="pt3-pg"><span class="zbar"><i style="width:${prog || 0}%"></i></span>${prog == null ? '—' : prog + '%'}</span></span>${ic('chevron', 'ic-sm pt3-cv')}</button>
      ${open ? `<div class="pt3-b">
        ${APPR[s.code] ? `<div class="pt3-ap"><span class="lbl">แนวทางพัฒนา</span><ul>${APPR[s.code].map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>` : ''}
        ${pp.length ? `<div class="pj-l">${pp.map((p) => { const r = rowFor(p, m), o = S.pOpen['p:' + p.id]; return `<div class="pj ${o ? 'open' : ''}">
          <button class="pj-h" data-act="pt-proj" data-v="${esc(p.id)}" aria-expanded="${!!o}"><span class="pj-n"><b>${esc(p.name)}</b><span>${esc(unitName(p.unitId))}${p.category === 'flagship' ? ' · <span class="chip chip-accent">Flagship</span>' : ''}${p.status !== 'done' ? ' · ร่าง' : ''}</span></span>
            <span class="pj-pg"><span class="zbar ${r.late ? 'late' : ''}"><i style="width:${r.act || 0}%"></i>${r.plan != null ? `<em style="left:${r.plan}%"></em>` : ''}</span><small>${pctTxt(r.act)}${r.plan != null ? ` / แผน ${r.plan}%` : ''}</small></span>
            <span class="chip ${RCHIP[r.status] || 'chip'}">${RSTAT[r.status] || '—'}</span>${ic('chevron', 'ic-sm pt3-cv')}</button>
          ${o ? projDetail(p, m) : ''}</div>`; }).join('')}</div>` : '<p class="zempty">ยังไม่มีโครงการภายใต้กลยุทธ์นี้ <button class="zlink" data-act="go" data-v="new">สร้างแผนงานใหม่</button></p>'}
      </div>` : ''}</section>`;
  }).join('')}</div>`;
}
function pillarHead(code, pl, extra = '') {
  return `<div class="ph" data-p="${code}"><div class="ph-t ph-pillar"><span class="pbadge pbadge-lg">${esc(code)}</span><div><h1>${esc(pillarShort(pl))}</h1><span class="sub">ยุทธศาสตร์ที่ ${pl.num} · ${esc(pl.name_en)}${extra}</span></div></div>${filterBar(true)}</div>
  <section class="zgoal" data-p="${code}"><span>เป้าหมาย 5 ปี</span><p>${esc(PGOAL[code] || pl.goal)}</p></section>`;
}

function bigKpi(k, val, sub, opts = {}) {
  const t = Number(k?.tval), pct = val != null && t ? val / t : null, tone = val == null ? 'none' : achTone(pct);
  return `<${opts.act ? 'button type="button"' : 'div'} class="bk bk-${tone} ${opts.on ? 'on' : ''}" ${opts.act ? `data-act="${opts.act}" data-v="${esc(opts.v ?? k.id)}" aria-pressed="${!!opts.on}"` : ''}>
    <span class="bk-h"><span class="bk-id">KPI ${esc(k.id)}</span><span class="bk-en">${esc(k.name_en || '')}</span>${opts.badge || ''}</span>
    <span class="bk-v"><b class="num">${val == null ? '—' : (Math.round(val * 100) / 100).toLocaleString('th-TH')}</b><small>${val == null ? 'รอข้อมูล' : esc(k.unit || '')}</small></span>
    <span class="bk-t" title="${esc(k.name)}">${esc(k.name)}</span>
    <span class="bk-f"><span>เป้า ${esc(k.target || '—')}</span>${sub ? `<span>${sub}</span>` : ''}</span></${opts.act ? 'button' : 'div'}>`;
}

/* ---------- BA ---------- */
function viewPillarBA() {
  const C = cfg(), code = 'BA', pl = pillarOf(code);
  const { m: om, d } = opsMonth();
  const A = S.ops?.annual || {};
  const keys = Object.keys(S.ops?.months || {}).map(Number).filter((m) => om == null || m <= om);
  const cum = keys.reduce((s, m) => s + (opsAgg('revenue', S.ops.months[String(m)], allProvs()).value || 0), 0);
  const cumT = keys.reduce((s, m) => s + (opsAgg('revenue', S.ops.months[String(m)], allProvs()).target || 0), 0);
  const plans = filteredPlans().filter((p) => p.pillar === code && p.name);
  const k11 = kpiOf('1.1'), k12 = kpiOf('1.2');
  const ytd = cumT ? (cum / cumT) * 100 : null;
  const H = histData().years || {}, polEv = Object.keys(H).map(Number).sort((a, b) => b - a).flatMap((y) => (H[y].ev || []).map((e) => Object.assign({ y }, e))).filter((e) => e.i === 'str' || /ภาษี/.test(e.t)).slice(0, 8);
  const kcards = [k11 ? bigKpi(k11, k11.latest, k11.latestAt || '') : '', k12 ? bigKpi(k12, k12.latest, k12.latestAt || 'ประเมินเมื่อมาตรการครบกำหนด') : '',
    `<div class="bk"><span class="bk-h"><span class="bk-id">โครงการ BA</span><span class="bk-en">Projects</span></span><span class="bk-v"><b class="num">${plans.length}</b><small>โครงการ</small></span><span class="bk-t">งบประมาณรวม ${mb(plans.reduce((s, p) => s + Number(p.budget || 0), 0))} ล้านบาท</span><span class="bk-f"><span>Flagship ${plans.filter((p) => p.category === 'flagship').length}</span><button class="zlink" data-act="pt-jump">ดูโครงการ ${ic('chevron', 'ic-sm')}</button></span></div>`].join('');
  const cards = `${periodBar()}${opsCards({ metrics: ['revenue'], metric: 'revenue', extra: kcards })}`;
  const policy = `<div class="pol">${['BA1', 'BA2', 'BA3', 'BA4'].map((s) => { const st = C.strategies.find((x) => x.code === s); const n = plans.filter((p) => p.strategy === s).length; return `<div class="pol-c" data-p="BA"><span class="pcode">${s}</span><b>${esc(st?.name || '')}</b><ul>${(APPR[s] || []).slice(0, 3).map((a) => `<li>${esc(a)}</li>`).join('')}</ul><span class="pol-n">${n} โครงการ</span></div>`; }).join('')}</div>
    ${polEv.length ? `<div class="pol-tl"><span class="lbl">มาตรการและเหตุการณ์ภาษีล่าสุด</span><ul>${polEv.map((e) => `<li class="hx-ev-${e.i}"><span class="pol-y">${e.y}</span><b>${EVI[e.i]?.[0] || '•'}</b><span>${esc(e.t)}${e.u ? ` <a class="hx-src" href="${esc(e.u)}" target="_blank" rel="noopener">ที่มา</a>` : ''}</span></li>`).join('')}</ul></div>` : ''}`;
  return `${pillarHead(code, pl)}
  ${cards}
  ${opsPanel('revenue')}
  ${opsTail('revenue', 'ba-')}
  ${zcard('สถิติรายได้ภาษีสรรพสามิต', 'ย้อนหลัง 10 ปีงบประมาณ · เลือกภาพรวมหรือรายสินค้า · กดปีเพื่อดูเหตุการณ์สำคัญ', `<div id="hist-body">${histBody()}</div>`, { fold: 'hist' })}
  ${zcard('นโยบายภาษีตามกลยุทธ์ BA', 'กลยุทธ์ แนวทางพัฒนา 2570–2574 และมาตรการภาษีที่กระทบรายได้', policy, { fold: 'ba-pol' })}
  <div class="zgrid">
    ${zcard('KPI ของเสา BA', 'ผลจัดเก็บภาษีเทียบเป้า · ผลมาตรการภาษี', kpiBoard(code, { noHead: true, noSum: true, bare: true }), { span: 5, go: 'kpis', fold: 'ba-kpi' })}
    ${zcard('ความเสี่ยงด้านรายได้และนโยบายภาษี', 'กดหมายเลขบน risk map เพื่อดูรายละเอียด', pillarRiskPanel(code), { span: 7, go: 'risks', fold: 'ba-risk' })}
  </div>
  <div id="pt-anchor"></div>
  ${zcard('กลยุทธ์ → แนวทาง → โครงการ', 'กดกลยุทธ์เพื่อเปิด/ปิด กดโครงการเพื่อดูวัตถุประสงค์ ขั้นตอน ความก้าวหน้า และงบประมาณ', projTree(code), { fold: 'ba-proj' })}`;
}

/* ---------- LA: workforce map ---------- */
const hsh = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; };
let HR_SAMPLE = null;
function hrData() {
  if (S.hr?.units) return S.hr;
  if (!HR_SAMPLE) {
    const units = {};
    allProvs().forEach((p) => {
      const big = p === 'กรุงเทพมหานคร' ? 6 : ['ชลบุรี', 'สมุทรปราการ', 'เชียงใหม่', 'ขอนแก่น', 'สงขลา', 'นครราชสีมา'].includes(p) ? 2 : 1;
      const pos = Math.round((24 + hsh(p) * 46) * big), fill = 0.8 + hsh(p + 'f') * 0.26;
      units[p] = { pos, staff: Math.round(pos * fill), cap: Math.round((70 + hsh(p + 'c') * 26) * 10) / 10, eng: Math.round((82 + hsh(p + 'e') * 15) * 10) / 10 };
    });
    const central = {};
    (cfg().units || []).forEach((u) => { const pos = Math.round(40 + hsh(u.id) * 110), fill = 0.82 + hsh(u.id + 'f') * 0.22; central[u.id] = { name: u.name, pos, staff: Math.round(pos * fill), cap: Math.round((72 + hsh(u.id + 'c') * 24) * 10) / 10, eng: Math.round((84 + hsh(u.id + 'e') * 13) * 10) / 10 }; });
    HR_SAMPLE = { sample: true, units, central };
  }
  return HR_SAMPLE;
}
const LAK = {
  '2.1': { key: 'cap', short: 'ทักษะพร้อมอนาคต', unit: '%', icon: 'bulb', desc: 'ร้อยละบุคลากรที่มีสมรรถนะไม่ต่ำกว่าระดับที่กำหนด' },
  '2.2': { key: 'fill', short: 'กำลังคนตรงภารกิจ', unit: '%', icon: 'user', desc: 'เจ้าหน้าที่ปฏิบัติงานจริง เทียบอัตรากำลัง' },
  '2.3': { key: 'eng', short: 'ความผูกพันองค์กร', unit: '%', icon: 'spark', desc: 'คะแนนความผูกพันของบุคลากร (Engagement)' }
};
function hrAgg(list) {
  const pos = list.reduce((s, x) => s + x.pos, 0), staff = list.reduce((s, x) => s + x.staff, 0);
  const w = (k) => (staff ? list.reduce((s, x) => s + x[k] * x.staff, 0) / staff : null);
  return { pos, staff, fill: pos ? (staff / pos) * 100 : null, cap: w('cap'), eng: w('eng'), n: list.length, aligned: list.filter((x) => x.pos && x.staff / x.pos >= 0.9 && x.staff / x.pos <= 1.1).length };
}
const fillTone = (f) => (f == null ? 'none' : f >= 90 && f <= 110 ? 'ok' : f >= 85 ? 'warn' : f > 110 ? 'warn' : 'bad');
function laTone(kid, a) {
  if (kid === '2.2') return fillTone(a.fill);
  const v = a[LAK[kid].key], t = Number(kpiOf(kid)?.tval) || 90; return v == null ? 'none' : achTone(v / t);
}
const laVal = (kid, a) => a[LAK[kid].key];
function laScope() {
  const H = hrData(), reg = S.laRegion || '';
  if (S.laCentral) return { level: 'central', name: 'ส่วนกลาง', items: Object.entries(H.central || {}).map(([id, u]) => Object.assign({ id, name: u.name, kind: 'unit' }, u)) };
  if (reg) return { level: 'region', name: reg, items: regionProvs(reg).map((p) => Object.assign({ id: p, name: 'สสพ.' + p, prov: p, kind: 'prov' }, H.units[p] || { pos: 0, staff: 0, cap: null, eng: null })) };
  const items = REGIONS.map((r) => Object.assign({ id: r, name: 'สสภ.' + r.replace('ภาค ', ''), region: r, kind: 'region' }, hrAgg(regionProvs(r).map((p) => H.units[p]).filter(Boolean))));
  items.push(Object.assign({ id: 'central', name: 'ส่วนกลาง', kind: 'central' }, hrAgg(Object.values(H.central || {}))));
  return { level: 'nation', name: 'ทั้งประเทศ', items };
}
function laMap(kid) {
  const H = hrData(), reg = S.laRegion || '';
  const shapes = reg ? THMAP.filter((x) => x.k === 'p' && x.u === reg) : THMAP.filter((x) => x.k === 'r');
  let vb = '0 0 360 672', scale = 1;
  if (reg) { const b = regionBox(reg); if (b) { const pad = 8, w = b[2] - b[0], h = b[3] - b[1]; vb = `${b[0] - pad} ${b[1] - pad} ${w + pad * 2} ${h + pad * 2}`; scale = Math.max(0.35, Math.max(w, h) / 360); } }
  const fmt = (v) => (v == null ? '—' : Math.round(v) + '%');
  const paths = shapes.map((x) => {
    const a = reg ? Object.assign({}, H.units[x.n], { fill: H.units[x.n] ? (H.units[x.n].staff / H.units[x.n].pos) * 100 : null }) : hrAgg(regionProvs(x.u).map((p) => H.units[p]).filter(Boolean));
    const t = laTone(kid, a), sel = reg && S.laProv === x.n, dim = reg && S.laProv && !sel;
    return `<path d="${x.d}" class="mp mp-${t} mp-click ${sel ? 'mp-sel' : ''} ${dim ? 'mp-dim' : ''}" data-act="${reg ? 'la-prov' : 'la-region'}" data-v="${esc(reg ? x.n : x.u)}"><title>${esc(reg ? 'สสพ.' + x.n : x.u)} · ${LAK[kid].short} ${fmt(laVal(kid, a))}</title></path>`;
  }).join('');
  const labels = reg ? shapes.map((x) => `<text class="pl ${S.laProv === x.n ? 'pl-sel' : ''}" x="${x.x}" y="${x.y}" style="font-size:${(9 * scale).toFixed(2)}px">${esc(x.n)}</text>`).join('')
    : shapes.map((x) => { const a = hrAgg(regionProvs(x.u).map((p) => H.units[p]).filter(Boolean)); const o = ML_OFF[x.u] || [0, 0]; return `<g class="ml" transform="translate(${x.x + o[0]},${x.y + o[1]})"><rect x="-26" y="-17" width="52" height="34" rx="8"/><text class="ml-n" y="-3">${esc(x.u)}</text><text class="ml-p" y="12">${fmt(laVal(kid, a))}</text></g>`; }).join('');
  return `<div class="mapz"><svg class="thmap" viewBox="${vb}" data-vb="${vb}" data-key="la-${esc(reg || 'TH')}" role="img" aria-label="แผนที่${esc(LAK[kid].short)}" style="--sw:${(0.8 * scale).toFixed(2)}">${paths}${labels}</svg>
    <div class="mapz-c"><button type="button" data-zoom="in" aria-label="ซูมเข้า">${ic('plus', 'ic-sm')}</button><button type="button" data-zoom="out" aria-label="ซูมออก">${ic('minus', 'ic-sm')}</button><button type="button" data-zoom="reset" aria-label="รีเซ็ตมุมมอง">${ic('expand-all', 'ic-sm')}</button></div></div>`;
}
function laList(kid, sc) {
  const sort = S.laSort || 'desc';
  let items = sc.items.map((x) => Object.assign({}, x, { fill: x.fill ?? (x.pos ? (x.staff / x.pos) * 100 : null) }));
  const v = (x) => laVal(kid, x) ?? -1;
  const ranked = items.slice().sort((a, b) => v(b) - v(a)); const rank = {}; ranked.forEach((x, i) => { rank[x.id] = i + 1; });
  if (sort === 'desc') items = ranked; else if (sort === 'asc') items = ranked.slice().reverse(); else items.sort((a, b) => String(a.name).localeCompare(String(b.name), 'th'));
  const t = Number(kpiOf(kid)?.tval) || 90;
  const max = Math.max(110, ...items.map((x) => v(x)));
  const actFor = (x) => (x.kind === 'region' ? `data-act="la-region" data-v="${esc(x.region)}"` : x.kind === 'central' ? 'data-act="la-central"' : x.kind === 'prov' ? `data-act="la-prov" data-v="${esc(x.prov)}"` : '');
  return `<div class="lal-t"><div class="seg seg-sm" role="group" aria-label="การเรียง">${[['desc', 'อันดับ สูง→ต่ำ'], ['asc', 'ต่ำ→สูง'], ['name', 'ตามชื่อ']].map(([k, l]) => `<button type="button" data-act="la-sort" data-v="${k}" aria-pressed="${sort === k}">${l}</button>`).join('')}</div></div>
  <ol class="lal">${items.map((x) => { const val = laVal(kid, x), tone = laTone(kid, x), sel = (x.prov && S.laProv === x.prov); return `<li class="${sel ? 'on' : ''} ${S.laProv && x.prov && !sel ? 'dim' : ''}" ${actFor(x)} role="button" tabindex="0">
    <span class="lal-r ${rank[x.id] <= 3 && sort !== 'name' ? 'lal-top' : ''}">${rank[x.id]}</span>
    <span class="lal-n"><b>${esc(x.name)}</b><small>${kid === '2.2' ? `ปฏิบัติงานจริง ${money(x.staff)} / อัตรากำลัง ${money(x.pos)} คน` : `บุคลากร ${money(x.staff)} คน`}</small></span>
    <span class="lal-b"><i class="hb-${tone}" style="width:${Math.max(0, (val || 0) / max * 100)}%"></i><em style="left:${(kid === '2.2' ? 90 : t) / max * 100}%"></em></span>
    <b class="lal-v num t-${tone}">${val == null ? '—' : val.toFixed(1) + '%'}</b></li>`; }).join('')}</ol>`;
}
function laInsight(kid, sc) {
  const items = sc.items.map((x) => Object.assign({}, x, { fill: x.fill ?? (x.pos ? (x.staff / x.pos) * 100 : null) }));
  const a = hrAgg(sc.level === 'nation' ? [...Object.values(hrData().units), ...Object.values(hrData().central || {})] : items);
  const t = Number(kpiOf(kid)?.tval) || 90, v = laVal(kid, a);
  const sorted = items.filter((x) => laVal(kid, x) != null).sort((p, q) => laVal(kid, p) - laVal(kid, q));
  const low = sorted.slice(0, 3), top = sorted[sorted.length - 1];
  const below = items.filter((x) => laTone(kid, x) === 'bad').length, warn = items.filter((x) => laTone(kid, x) === 'warn').length;
  const pts = [];
  if (kid === '2.2') {
    const gap = a.pos - a.staff;
    pts.push({ i: gap > 0 ? 'neg' : 'pos', t: `${esc(sc.name)} มีเจ้าหน้าที่ปฏิบัติงานจริง ${money(a.staff)} คน จากอัตรากำลัง ${money(a.pos)} คน (${a.fill.toFixed(1)}%) ${gap > 0 ? `ขาดอยู่ ${money(gap)} คน` : `เกินอัตรา ${money(-gap)} คน`}` });
    pts.push({ i: 'str', t: `หน่วยงานที่กำลังคนสอดคล้องภารกิจ (90–110%) ${a.aligned != null && sc.level !== 'nation' ? a.aligned : items.filter((x) => fillTone(x.fill) === 'ok').length} จาก ${items.length} หน่วย` });
    if (low.length) pts.push({ i: 'neg', t: `ขาดแคลนมากที่สุด: ${low.map((x) => `${esc(x.name)} ${x.fill.toFixed(0)}% (ขาด ${money(x.pos - x.staff)} คน)`).join(' · ')}` });
    const over = items.filter((x) => x.fill > 110); if (over.length) pts.push({ i: 'mix', t: `กำลังคนเกินอัตรา ${over.length} หน่วย เช่น ${over.slice(0, 2).map((x) => esc(x.name)).join(', ')} พิจารณาหมุนเวียนไปหน่วยที่ขาด` });
    pts.push({ i: 'str', t: 'แนวทาง LA1: Strategic Workforce Planning วางแผนกำลังคนด้วยข้อมูล และปรับกำลังคนตามปริมาณงานส่วนกลาง ภาค พื้นที่' });
  } else {
    const nm = LAK[kid].short;
    pts.push({ i: v >= t ? 'pos' : 'neg', t: `${nm}ของ${esc(sc.name)} ${v == null ? '—' : v.toFixed(1) + '%'} ${v >= t ? 'ถึง' : 'ต่ำกว่า'}เป้า ${t}%${v != null ? ` (${v >= t ? '+' : ''}${(v - t).toFixed(1)} จุด)` : ''}` });
    pts.push({ i: below ? 'neg' : 'pos', t: `ต่ำกว่าเป้าเกิน 2% จำนวน ${below} หน่วย · ใกล้เป้า ${warn} หน่วย จาก ${items.length} หน่วย` });
    if (low.length) pts.push({ i: 'neg', t: `ควรเร่งพัฒนา: ${low.map((x) => `${esc(x.name)} ${laVal(kid, x).toFixed(1)}%`).join(' · ')}` });
    if (top) pts.push({ i: 'pos', t: `สูงสุด: ${esc(top.name)} ${laVal(kid, top).toFixed(1)}% ใช้เป็นต้นแบบถ่ายทอดแนวปฏิบัติ` });
    pts.push({ i: 'str', t: kid === '2.1' ? 'แนวทาง LA2: ปิด Skill Gap ด้วย IDP เรียนรู้จากงานจริง และสร้าง AI Controller ในทุกหน่วย' : 'แนวทาง LA3–LA4: One Team & ExerCISE Culture ดูแล Work-life Balance และเชื่อมผลงานกับแรงจูงใจ' });
  }
  const k = kpiOf(kid);
  return `<div class="lai"><div class="lai-h">${ic('bulb', 'ic-sm')}<b>Insight · ${esc(sc.name)}</b></div>
    <ul>${pts.map((p) => `<li class="hx-ev-${p.i}"><b>${EVI[p.i]?.[0] || '•'}</b><span>${p.t}</span></li>`).join('')}</ul>
    ${kid === '2.3' && k?.detailUrl ? `<a class="btn btn-sm" href="${esc(k.detailUrl)}" target="_blank" rel="noopener">${ic('external', 'ic-sm')}ผลสำรวจ Engagement ฉบับเต็ม</a>` : ''}</div>`;
}
function viewPillarLA() {
  const code = 'LA', pl = pillarOf(code), kid = LAK[S.laK] ? S.laK : '2.2';
  const H = hrData(), sc = laScope();
  const allU = [...Object.values(H.units), ...Object.values(H.central || {})], nat = hrAgg(allU);
  const allFill = allU.map((x) => (x.staff / x.pos) * 100);
  const k22 = allFill.length ? (allFill.filter((f) => f >= 90 && f <= 110).length / allFill.length) * 100 : null;
  const vals = { '2.1': kpiOf('2.1')?.latest ?? nat.cap, '2.2': kpiOf('2.2')?.latest ?? k22, '2.3': kpiOf('2.3')?.latest ?? nat.eng };
  const subs = { '2.1': kpiOf('2.1')?.latest != null ? kpiOf('2.1').latestAt : 'จากข้อมูลรายหน่วยงาน', '2.2': `กำลังคนจริง ${nat.fill.toFixed(1)}% ของอัตรา`, '2.3': kpiOf('2.3')?.latest != null ? (kpiOf('2.3').latestAt || '') : 'จากข้อมูลรายหน่วยงาน' };
  const cards = `<section class="bks bks-3">${['2.1', '2.2', '2.3'].map((id) => { const k = kpiOf(id); return k ? bigKpi(k, vals[id], subs[id], { act: 'la-k', on: id === kid, badge: `<span class="bk-ic">${ic(LAK[id].icon)}</span>` }) : ''; }).join('')}</section>`;
  const crumb = `<nav class="crumb" aria-label="ระดับหน่วยงาน"><button data-act="la-region" data-v="">ทั้งประเทศ</button>${S.laCentral ? '<span>›</span><b>ส่วนกลาง</b>' : ''}${S.laRegion ? `<span>›</span><button data-act="la-prov" data-v="">${esc(S.laRegion)}</button>` : ''}${S.laProv ? `<span>›</span><b>สสพ.${esc(S.laProv)}</b>` : ''}</nav>`;
  const scAgg = hrAgg(sc.items.map((x) => x).filter((x) => x.pos != null));
  const sv = kid === '2.2' ? scAgg.fill : laVal(kid, scAgg);
  const panel = `<div class="la3">
    <section class="zc la-map"><div class="zc-h"><div style="width:100%">${crumb}<div class="mstat"><span><small>${esc(LAK[kid].short)}</small><b class="num">${sv == null ? '—' : sv.toFixed(1) + '%'}</b></span>${kid === '2.2' ? `<span><small>จริง/อัตรา</small><b class="num">${money(scAgg.staff)}/${money(scAgg.pos)}</b></span>` : `<span><small>เป้า</small><b class="num">${kpiOf(kid)?.tval ?? '—'}%</b></span>`}<em>${H.sample ? 'ข้อมูลตัวอย่าง' : ''}</em></div></div></div>
      ${S.laCentral ? `<div class="la-central">${ic('building')}<b>หน่วยงานส่วนกลาง</b><span>${sc.items.length} สำนัก/กอง ในกรุงเทพมหานคร</span><button class="btn btn-sm" data-act="la-region" data-v="">${ic('chevron', 'ic-sm')}กลับแผนที่ทั้งประเทศ</button></div>` : laMap(kid)}
      <div class="mp-leg">${kid === '2.2' ? '<span><i class="mp-ok"></i>90–110% ของอัตรา</span><span><i class="mp-warn"></i>85–90% หรือเกิน 110%</span><span><i class="mp-bad"></i>ต่ำกว่า 85%</span>' : '<span><i class="mp-ok"></i>ถึงเป้า</span><span><i class="mp-warn"></i>ต่ำกว่าเป้าไม่เกิน 2%</span><span><i class="mp-bad"></i>ต่ำกว่าเป้าเกิน 2%</span>'}</div></section>
    <section class="zc la-list"><div class="zc-h"><div><h2>${esc(LAK[kid].short)} รายหน่วยงาน</h2><p>${esc(sc.name)} · ${esc(LAK[kid].desc)} · กดหน่วยงานเพื่อลงลึก</p></div></div>${laList(kid, sc)}</section>
    <section class="zc la-ins">${laInsight(kid, S.laProv && sc.level === 'region' ? { level: 'prov', name: 'สสพ.' + S.laProv, items: sc.items.filter((x) => x.prov === S.laProv) } : sc)}</section>
  </div>`;
  return `${pillarHead(code, pl, H.sample ? ' · <span class="chip chip-warn" title="ข้อมูลรายหน่วยงาน (อัตรากำลัง ทักษะ ความผูกพัน) เป็นข้อมูลตัวอย่าง รอข้อมูลจริงจากสำนักบริหารทรัพยากรบุคคล">รายหน่วยงาน: ข้อมูลตัวอย่าง</span>' : '')}
  ${cards}
  ${panel}
  <div class="zgrid">
    ${zcard('ความเสี่ยงด้านองค์กรและคน', 'กดหมายเลขบน risk map เพื่อดูรายละเอียด', pillarRiskPanel(code), { span: 12, go: 'risks', fold: 'la-risk' })}
  </div>
  ${zcard('กลยุทธ์ → แนวทาง → โครงการ', 'กดกลยุทธ์เพื่อเปิด/ปิด กดโครงการเพื่อดูวัตถุประสงค์ ขั้นตอน ความก้าวหน้า และงบประมาณ', projTree(code), { fold: 'la-proj' })}`;
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act, v = el.dataset.v;
  const keep = () => { const vw = $('#view'); const y = vw.scrollTop; renderView(); vw.scrollTop = y; };
  if (a === 'plan-pdf') { e.preventDefault(); downloadPlanPdf(); }
  else if (a === 'pr-risk') { const [c, k] = v.split(':'); S.pRisk = Object.assign({}, S.pRisk, { [c]: Number(k) }); keep(); }
  else if (a === 'pr-open') { S.pOpen = Object.assign({}, S.pOpen, { ['p:' + v]: true }); const p = S.plans.find((x) => x.id === v); if (p) S.pOpen[p.strategy] = true; keep(); setTimeout(() => document.querySelector('.pj.open')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); }
  else if (a === 'pt-strat') { S.pOpen = S.pOpen || {}; const cur = el.getAttribute('aria-expanded') === 'true'; S.pOpen[v] = !cur; keep(); }
  else if (a === 'pt-proj') { S.pOpen = S.pOpen || {}; S.pOpen['p:' + v] = !S.pOpen['p:' + v]; keep(); }
  else if (a === 'pt-jump') { document.getElementById('pt-anchor')?.scrollIntoView({ behavior: 'smooth' }); }
  else if (a === 'la-k') { S.laK = v; keep(); }
  else if (a === 'la-region') { S.laCentral = false; S.laRegion = v || ''; S.laProv = ''; keep(); }
  else if (a === 'la-prov') { if (!v) { S.laProv = ''; } else { S.laProv = S.laProv === v ? '' : v; if (!S.laRegion) S.laRegion = provRegion[v] || ''; } keep(); }
  else if (a === 'la-central') { S.laCentral = true; S.laRegion = ''; S.laProv = ''; keep(); }
  else if (a === 'la-sort') { S.laSort = v; keep(); }
});
document.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.lal li[data-act]')) { e.preventDefault(); e.target.click(); } });
