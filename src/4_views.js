/* ===================== Views ===================== */
function needCfg() {
  if (!S.cfgLoaded) return `<div class="skel" style="height:120px"></div>`;
  if (!S.cfg) return `<div class="empty">${ic('sliders')}<b>ยังไม่มีข้อมูลแผนยุทธศาสตร์ในระบบ</b><span>ผู้ดูแลระบบเพิ่มเสายุทธศาสตร์ กลยุทธ์ และ KPI ได้ที่เมนูตั้งค่าทั่วไป</span></div>`;
  return '';
}
function planInYear(p, y) { if (!y) return true; const s = Number(p.startYear), d = Number(p.duration || 1); return y >= s && y < s + d; }
function filteredPlans() {
  const f = S.filt;
  return S.plans.filter((p) => p.name && planInYear(p, Number(f.year)) && (!f.unit || p.unitId === f.unit) && (!f.pillar || p.pillar === f.pillar));
}

/* ---------- Dashboard ---------- */
/* ---------- Risk map component ---------- */
const LIKELY = ['', 'น้อยมาก', 'น้อย', 'ปานกลาง', 'สูง', 'สูงมาก'];
const RLEGEND = [
  { n: 4, t: 'สูงมาก', r: '17–25', d: 'จัดการทันที และรายงานผู้บริหาร' },
  { n: 3, t: 'สูง', r: '10–16', d: 'ต้องมีมาตรการลดความเสี่ยง' },
  { n: 2, t: 'ปานกลาง', r: '5–9', d: 'ติดตามอย่างใกล้ชิด' },
  { n: 1, t: 'ต่ำ', r: '1–4', d: 'ยอมรับได้ ติดตามตามปกติ' }
];
function riskMapHTML({ pick = false, sel = {}, markers = [], size = 'lg' } = {}) {
  let g = '';
  for (let l = 5; l >= 1; l--) {
    g += `<span class="rm-yl"><b>${l}</b><small>${LIKELY[l]}</small></span>`;
    for (let i = 1; i <= 5; i++) {
      const sc = l * i, lv = riskLevel(sc).c.slice(1), on = Number(sel.l) === l && Number(sel.i) === i;
      const dots = markers.filter((m) => Number(m.l) === l && Number(m.i) === i);
      const inner = dots.length ? `<span class="rm-dots">${dots.map((m) => m.act ? `<button type="button" class="rm-mk ${m.on ? 'on' : ''}" data-act="${m.act}" data-v="${m.v}" aria-pressed="${!!m.on}" aria-label="ความเสี่ยงอันดับ ${m.label}">${m.label}</button>` : `<b class="${m.dim ? 'dim' : ''}" data-rk="${m.label}">${m.label}</b>`).join('')}</span>` : sc;
      g += pick
        ? `<button type="button" class="rm-c lv${lv} ${on ? 'sel' : ''}" data-act="p-rm" data-l="${l}" data-i="${i}" aria-pressed="${on}" aria-label="โอกาส ${l} ${LIKELY[l]} ผลกระทบ ${i} ${LIKELY[i]} คะแนน ${sc}">${sc}</button>`
        : `<span class="rm-c lv${lv} ${dots.length ? 'has-dot' : ''}" title="โอกาส ${l} × ผลกระทบ ${i} = ${sc}">${inner}</span>`;
    }
  }
  g += '<span></span>' + [1, 2, 3, 4, 5].map((i) => `<span class="rm-xl"><b>${i}</b><small>${LIKELY[i]}</small></span>`).join('');
  return `<div class="rm ${size === 'md' ? 'rm-md' : size === 'xl' ? 'rm-big' : ''}" role="group" aria-label="risk map 5x5"><span class="rm-yt">โอกาสเกิด</span><div class="rm-grid">${g}</div><span class="rm-xt">ผลกระทบ</span></div>`;
}

/* ---------- KPI scoreboard ---------- */
function kpiState(k) {
  const v = k.latest === '' || k.latest == null ? null : Number(k.latest), t = k.tval === '' || k.tval == null ? null : Number(k.tval);
  if (v == null || isNaN(v)) return { key: 'none', t: 'ยังไม่มีผล', ratio: 0, v: null, tv: t };
  if (t == null || isNaN(t) || !t) return { key: 'none', t: 'ยังไม่ตั้งค่าเป้า', ratio: 0, v, tv: null };
  const le = k.dir === 'le';
  const pass = le ? v <= t : v >= t;
  const near = le ? v <= t * 1.05 : v >= t * 0.95;
  const ratio = le ? Math.min(1, t / v) : Math.min(1, v / t);
  return pass ? { key: 'ok', t: 'ผ่านเป้า', ratio, v, tv: t } : near ? { key: 'warn', t: 'ใกล้เป้า', ratio, v, tv: t } : { key: 'bad', t: 'ต่ำกว่าเป้า', ratio, v, tv: t };
}
const fmtNum = (v) => Number(v).toLocaleString('th-TH', { maximumFractionDigits: 2 });
function kpiBoard(pf, opt = {}) {
  const noHead = opt === true || opt.noHead;
  const ks = cfg().kpis.filter((k) => !pf || k.pillar === pf);
  const st = ks.map((k) => ({ k, s: kpiState(k) }));
  const n = (key) => st.filter((x) => x.s.key === key).length;
  const EN = { ok: 'On target', warn: 'Near target', bad: 'Below target', none: 'No data' };
  const fy = (t) => String(t || '').replace(/ปีงบ(ประมาณ)?\s*/, 'FY').replace(/ไตรมาส\s*/, 'Q');
  const tile = ({ k, s }) => {
    const unit = k.unit === 'คะแนน' ? 'pts' : (k.unit || '');
    const go = k.detailUrl ? `<a class="kt-go" href="${esc(k.detailUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(k.id)} details" title="ดูรายละเอียด">${ic('external', 'ic-sm')}</a>`
      : `<button type="button" class="kt-go" data-act="kpi-nolink" data-v="${esc(k.id)}" aria-label="${esc(k.id)} details">${ic('external', 'ic-sm')}</button>`;
    return `<article class="kt" data-p="${esc(k.pillar)}" data-st="${s.key}">
      <div class="kt-top"><span class="kt-id">${esc(k.id)}</span><span class="kt-dot" aria-hidden="true"></span><span class="kt-st">${EN[s.key]}</span>
        <button type="button" class="kt-info" data-act="kpi-info" aria-expanded="false" aria-label="รายละเอียดภาษาไทยของ ${esc(k.id)}">${ic('info', 'ic-sm')}</button>${go}</div>
      <h3 class="kt-name" title="${esc(k.name_en || '')}">${esc(k.name_en || k.id)}</h3>
      <div class="kt-val"><b>${s.v == null ? '—' : fmtNum(s.v)}</b>${s.v == null ? '' : `<small>${esc(unit)}</small>`}<span class="kt-tgt">${k.dir === 'le' ? '≤' : '≥'} ${s.tv == null ? '—' : fmtNum(s.tv)}${k.latestAt ? ` · ${esc(fy(k.latestAt))}` : ''}</span></div>
      <div class="kt-bar" aria-hidden="true"><i style="width:${Math.round(s.ratio * 100)}%"></i></div>
      <div class="kc-pop" role="tooltip"><b>${esc(k.name)}</b><span>เป้าหมาย: ${esc(k.target || '—')}</span>${k.baseline ? `<span>ค่าฐาน: ${esc(k.baseline)}</span>` : ''}<span>${s.v == null ? 'ยังไม่มีผลการดำเนินงาน' : `ผลล่าสุด ${fmtNum(s.v)} ${esc(k.unit || '')}${k.latestAt ? ' (' + esc(k.latestAt) + ')' : ''}`}</span><span class="pop-calc"><b>วิธีคำนวณ</b> ${k.calc ? esc(k.calc) : 'รอระบุ'}</span></div>
    </article>`;
  };
  const summary = `<div class="sb-sum">
    <div class="sbs"><span>KPIs</span><b>${st.length}</b></div>
    <div class="sbs sbs-ok"><span>On target</span><b>${n('ok')}</b></div>
    <div class="sbs sbs-warn"><span>Near target</span><b>${n('warn')}</b></div>
    <div class="sbs sbs-bad"><span>Below target</span><b>${n('bad')}</b></div>
    <div class="sbs sbs-none"><span>No data</span><b>${n('none')}</b></div></div>`;
  const cols = cfg().pillars.filter((pl) => st.some((x) => x.k.pillar === pl.code)).map((pl) => {
    const g = st.filter((x) => x.k.pillar === pl.code);
    return `<div class="sb-col" data-p="${pl.code}"><div class="sb-h"><span class="pbadge">${esc(pl.code)}</span><span class="sb-ht"><b>${esc(pillarShort(pl))}</b><span>${g.filter((x) => x.s.key === 'ok').length}/${g.length} on target</span></span></div>${g.map(tile).join('')}</div>`;
  }).join('');
  return `<section class="dsec" id="kpi-board" aria-labelledby="h-kpi">
    ${noHead ? '<h2 id="h-kpi" class="sr">KPI Scoreboard</h2>' : `<div class="dsec-h"><div><h2 id="h-kpi">KPI Scoreboard</h2><span class="sub">Latest result vs target · กด ${ic('info', 'ic-sm')} ดูคำอธิบายภาษาไทย</span></div></div>`}
    ${opt.noSum ? '' : summary}
    <div class="sb ${pf ? 'sb-one' : ''} ${opt.bare ? 'sb-bare' : ''}">${cols}</div>
  </section>`;
}

/* ---------- Top 5 risks ---------- */
function riskBoard(fixed) {
  const C = cfg();
  const rp = fixed || S.riskP || '';
  const all = C.risks.map((r) => ({ r, sc: riskScore(Number(r.l) || 0, Number(r.i) || 0) }))
    .filter((x) => !rp || x.r.pillar === rp)
    .sort((a, b) => b.sc - a.sc || String(a.r.id).localeCompare(String(b.r.id)));
  const top = all.filter((x) => x.sc > 0).slice(0, 5);
  const chips = fixed ? '' : `<div class="seg seg-sm" role="group" aria-label="เลือกเสา">${[['', 'ทุกเสา'], ...C.pillars.map((p) => [p.code, p.code])].map(([c, l]) => `<button type="button" data-act="risk-p" data-v="${c}" aria-pressed="${rp === c}" ${c ? `data-p="${c}"` : ''}>${l}</button>`).join('')}</div>`;
  const cells = riskMapHTML({ markers: top.map((x, k) => ({ l: x.r.l, i: x.r.i, label: k + 1 })), size: 'md' });
  return `<section class="dsec" id="risk-board" aria-labelledby="h-risk">
    <div class="dsec-h"><div><h2 id="h-risk">Top 5 ความเสี่ยงระดับกรม</h2><span class="sub">${rp ? 'ยุทธศาสตร์ ' + esc(rp) : 'ทุกยุทธศาสตร์'} · เรียงตามคะแนนโอกาส × ผลกระทบ${C.riskSample ? ' · <span class="chip chip-warn">คะแนนตัวอย่าง</span>' : ''}</span></div>${chips}</div>
    <div class="card rk">
      ${top.length ? `<ol class="rk-list">${top.map(({ r, sc }, k) => { const lv = riskLevel(sc); const n = S.plans.filter((p) => p.name && (p.risks || []).includes(r.id)).length; return `<li>
        <span class="rk-n">${k + 1}</span>
        <span class="rk-t"><b>${esc(r.name)}</b><span><span class="pcode" data-p="${esc(r.pillar)}">${esc(r.pillar)}</span> · ${esc(r.id)} · โครงการที่ช่วยลด ${n}</span></span>
        <span class="rk-s"><b class="num">${sc}</b><span class="chip chip-${lv.k}">${lv.t}</span></span></li>`; }).join('')}</ol>`
      : `<p class="muted small" style="padding:16px">${all.length ? 'ยังไม่ได้ประเมินคะแนนความเสี่ยง ตั้งค่าได้ที่ ตั้งค่าทั่วไป › ความเสี่ยงระดับกรม' : 'ไม่มีความเสี่ยงของยุทธศาสตร์นี้'}</p>`}
      <div class="rk-map">${cells}</div>
    </div>
  </section>`;
}

function pillarCard(p, plans) {
  const C = cfg();
  const strats = C.strategies.filter((s) => s.pillar === p.code);
  const pp = plans.filter((x) => x.pillar === p.code).sort((a, b) => (a.category === 'flagship' ? -1 : 1) - (b.category === 'flagship' ? -1 : 1));
  return `<article class="card pcard" data-p="${p.code}">
    <div class="pc-h"><span class="pc-num">${p.num}</span><h3>ยุทธศาสตร์ที่ ${p.num}</h3>${p.balance ? `<span class="chip chip-p">${esc(p.balance)}</span>` : ''}</div>
    <div class="pc-id"><span class="pc-letter">${esc(p.code)}</span><span class="pc-en">${esc(p.name_en)}</span><span class="pc-desc">${esc(p.desc)}</span></div>
    <div class="pc-sec"><h4>เป้าหมาย</h4><p class="goal">${esc(p.goal)}</p></div>
    <div class="pc-sec"><h4>กลยุทธ์ <span>จำนวนโครงการ</span></h4>${strats.map((s) => { const n = pp.filter((x) => x.strategy === s.code).length; return `<div class="st-li"><span class="mono">${esc(s.code)}</span><span>${esc(s.name)}</span><span class="cnt ${n ? 'on' : ''}">${n}</span></div>`; }).join('')}</div>
    <div class="pc-sec"><h4>โครงการ <span>${pp.length}</span></h4>
      ${pp.length ? `<div style="display:grid;gap:6px;max-height:300px;overflow:auto">${pp.map((x) => `<button class="prj" data-act="go" data-v="report-${esc(x.id)}"><b>${esc(x.name)}</b><span>${esc(x.strategy)} · ${esc(unitName(x.unitId))} · ${money(x.budget)} บาท</span><span>${x.category === 'flagship' ? '<span class="chip chip-accent" style="font-size:11px">Flagship</span> ' : ''}${x.status !== 'done' ? '<span class="chip chip-warn" style="font-size:11px">ร่าง</span>' : ''}</span></button>`).join('')}</div>`
      : `<p class="small muted">ยังไม่มีโครงการตามตัวกรองนี้</p>`}
    </div>
  </article>`;
}

/* ---------- Journey ---------- */
function journey(step) {
  const steps = [['เลือกประเภท', 'ผูก KPI หรือไม่ผูก'], ['กรอกข้อมูลแผน', 'บันทึกอัตโนมัติ'], ['ตรวจรายงาน', 'รายงาน 1 หน้า'], ['เสร็จสิ้น', 'โหลด PDF เสนอ ผอ.']];
  return `<ol class="journey" aria-label="ขั้นตอน">${steps.map((s, i) => `<li class="${i + 1 === step ? 'cur' : i + 1 < step ? 'done' : ''}" ${i + 1 === step ? 'aria-current="step"' : ''}><span class="jn">${i + 1 < step ? ic('check', 'ic-sm') : i + 1}</span><span class="jt"><b>${s[0]}</b><span>${s[1]}</span></span></li>`).join('')}</ol>`;
}

/* ---------- New plan ---------- */
function viewNew() {
  const g = needCfg(); if (g) return g;
  const unitId = S.profile?.unitId;
  const kpiCount = S.plans.filter((p) => p.unitId === unitId && p.type === 'kpi' && p.name).length;
  const mine = S.plans.filter((p) => S.scope === 'mine' ? p.ownerId === S.uid : p.unitId === unitId).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return `
  ${journey(1)}
  <div class="ph"><div class="ph-t"><span class="eyebrow">${esc(unitName(unitId))}</span><h1>เลือกประเภทโครงการ</h1></div></div>
  <section class="types">
    <article class="card type">
      <div class="type-h"><span class="type-ic">${ic('target')}</span><div><h3>ผูกกับตัวชี้วัดหน่วยงาน</h3><p class="muted small">หน่วยงานต้องมีอย่างน้อย 3 โครงการ</p></div></div>
      <ul><li>ข้อมูลแผน เชื่อมเสา กลยุทธ์ และ KPI</li><li>ขั้นตอน 5 ขั้น (ขั้นละ 20%) พร้อมเดือนดำเนินการ</li><li>Output 6/12 เดือน และ Outcome 12 เดือน</li><li>ERM1 และ ERM2 (Plan B, KRI, timeline)</li></ul>
      <div class="quota"><span>หน่วยงานของคุณ</span><span class="bar"><i style="width:${Math.min(100, kpiCount / 3 * 100)}%"></i></span><b class="num">${kpiCount}/3</b>${kpiCount >= 3 ? '<span class="chip chip-ok">ครบแล้ว</span>' : ''}</div>
      <div class="pick">
        <button data-act="create" data-type="kpi" data-cat="flagship"><b>${ic('flag', 'ic-sm')}Flagship ยุทธศาสตร์</b><span>งานใหม่</span></button>
        <button data-act="create" data-type="kpi" data-cat="routine"><b>${ic('steps', 'ic-sm')}ปฏิบัติการ</b><span>งานประจำ</span></button>
      </div>
    </article>
    <article class="card type">
      <div class="type-h"><span class="type-ic">${ic('file')}</span><div><h3>ไม่ผูกตัวชี้วัด</h3><p class="muted small">โครงการที่สนับสนุนยุทธศาสตร์ทั่วไป</p></div></div>
      <ul><li>ข้อมูลแผน เชื่อมเสา กลยุทธ์ และ KPI ที่เกี่ยวข้อง</li><li>เชื่อมแผนระดับต่างๆ และความท้าทายอัตโนมัติ</li><li>เลือกความเสี่ยงระดับกรม และกรอกงบประมาณ</li></ul>
      <div class="pick">
        <button data-act="create" data-type="free" data-cat="flagship"><b>${ic('flag', 'ic-sm')}Flagship</b><span>โครงการสำคัญ</span></button>
        <button data-act="create" data-type="free" data-cat="nonflagship"><b>${ic('file', 'ic-sm')}ไม่ใช่ Flagship</b><span>โครงการทั่วไป</span></button>
      </div>
    </article>
  </section>
  <div class="ph"><div class="ph-t"><h2>แผนที่สร้างแล้ว</h2><span class="muted small">กดการ์ดเพื่อแก้ไข หรือเปิดรายงานเพื่อโหลด PDF</span></div>
    <div class="tabs" role="tablist" style="min-width:260px"><button role="tab" aria-selected="${S.scope === 'mine'}" data-act="scope" data-v="mine">ของฉัน</button><button role="tab" aria-selected="${S.scope === 'unit'}" data-act="scope" data-v="unit">ทั้งหน่วยงาน</button></div></div>
  ${mine.length ? `<section class="plans">${mine.map(planCard).join('')}</section>` : `<div class="empty">${ic('fileplus')}<b>ยังไม่มีแผน</b><span>เลือกประเภทโครงการด้านบนเพื่อเริ่มสร้างแผนแรก</span></div>`}`;
}
function planCard(p) {
  const canEdit = !S.publicMode && (p.ownerId === S.uid || S.canAdmin);
  const st = stratOf(p.strategy);
  const miss = missing(Object.assign(newPlan(p.type, p.category), p)).length;
  return `<article class="card plan" ${p.pillar ? `data-p="${esc(p.pillar)}"` : ''}>
    <div class="meta">${p.status === 'done' ? '<span class="chip chip-ok">เสร็จสิ้น</span>' : `<span class="chip chip-warn">ร่าง · ขาด ${miss} รายการ</span>`}<span class="chip">${TYPE_LABEL[p.type]}</span><span class="chip ${p.category === 'flagship' ? 'chip-accent' : ''}">${esc(CAT[p.type][p.category])}</span></div>
    <h4>${p.name ? esc(p.name) : '<span class="muted">(ยังไม่ตั้งชื่อแผน)</span>'}</h4>
    <div class="facts"><span>กลยุทธ์</span><b>${st ? `<span class="pcode">${esc(st.code)}</span> ${esc(st.name)}` : '—'}</b><span>ระยะเวลา</span><b>${periodText(p)}</b><span>งบประมาณ</span><b class="num">${p.budget != null && p.budget !== '' ? money(p.budget) + ' บาท' : '—'}</b><span>เจ้าของ</span><b>${esc(ownerName(p))}</b></div>
    ${S.confirmDel === p.id ? `<div class="confirm">${ic('alert', 'ic-sm')}ลบแผนนี้ถาวร?<button class="btn btn-sm btn-danger" data-act="del-yes" data-v="${esc(p.id)}">ลบ</button><button class="btn btn-sm" data-act="del-no">ยกเลิก</button></div>` : ''}
    <div class="acts">
      ${canEdit ? `<button class="btn btn-sm btn-primary" data-act="go" data-v="edit-${esc(p.id)}">${ic('edit', 'ic-sm')}แก้ไข</button>` : ''}
      <button class="btn btn-sm" data-act="go" data-v="report-${esc(p.id)}">${ic('eye', 'ic-sm')}รายงาน / PDF</button>
      ${canEdit && S.confirmDel !== p.id ? `<button class="btn btn-sm btn-ghost btn-danger" data-act="del" data-v="${esc(p.id)}" aria-label="ลบแผน">${ic('trash', 'ic-sm')}</button>` : ''}
    </div>
  </article>`;
}

/* ---------- Editor ---------- */
function fld(f, label, inner, opts = {}) {
  const miss = S.showMiss && S.missSet?.has(f);
  return `<div class="field ${miss ? 'invalid' : ''}" ${opts.span ? 'style="grid-column:1/-1"' : ''}>
    <div class="lbl-row"><label class="lbl ${opts.req ? 'req' : ''}" for="e-${f.replace(/\./g, '-')}">${label}</label>${opts.ai ? `<button type="button" class="ai-btn" data-act="ai-draft" data-f="${f}" ${S.sugBusy[f] ? 'disabled' : ''}>${ic('spark', 'ic-sm')}${S.sugBusy[f] ? 'กำลังร่าง…' : 'ให้ AI ช่วยร่าง'}</button>` : ''}</div>
    ${inner}
    ${opts.help || opts.max ? `<span class="help">${opts.help || ''}${opts.max ? `${opts.help ? ' · ' : ''}แนะนำไม่เกิน ${opts.max} ตัวอักษร <span class="cc ${String(getPath(S.plan, f) || '').length > opts.max ? 'over' : ''}" data-cc="${f}" data-max="${opts.max}">(${String(getPath(S.plan, f) || '').length}/${opts.max})</span>` : ''}</span>` : ''}
    <div data-sug="${f}">${S.sug[f] ? sugBox(f) : ''}</div>
  </div>`;
}
function sugBox(f) { return `<div class="ai-sug"><span class="auto-tag">${ic('spark', 'ic-sm')}ข้อเสนอจาก AI</span><span>${esc(S.sug[f])}</span><span style="display:flex;gap:8px"><button type="button" class="btn btn-sm btn-primary" data-act="ai-use" data-f="${f}">ใช้ข้อความนี้</button><button type="button" class="btn btn-sm" data-act="ai-dismiss" data-f="${f}">ไม่ใช้</button></span></div>`; }
const ta = (f, ph) => `<textarea id="e-${f.replace(/\./g, '-')}" class="textarea" data-f="${f}" placeholder="${esc(ph || '')}">${esc(getPath(S.plan, f))}</textarea>`;

function viewEdit() {
  const g = needCfg(); if (g) return g;
  const p = S.plan;
  if (!p) return S.plansLoaded ? `<div class="empty">${ic('alert')}<b>ไม่พบแผนนี้</b><button class="btn" data-act="go" data-v="new">กลับไปหน้าสร้างแผน</button></div>` : `<div class="skel" style="height:200px"></div>`;
  const C = cfg();
  const miss = missing(p); S.missSet = new Set(miss.map((m) => m.f));
  const secDone = (id) => !miss.some((m) => m.sec === id);
  const isK = p.type === 'kpi';
  const secs = wizSteps(p);
  if (S.edStep == null || S.edStep >= secs.length) S.edStep = 0;
  const unit = unitOf(p.unitId);
  const st = stratOf(p.strategy);
  const strats = C.strategies.filter((s) => s.pillar === p.pillar);
  const kpis = C.kpis.filter((k) => k.pillar === p.pillar);
  const catOpts = Object.entries(CAT[p.type]).map(([k, v]) => `<button type="button" data-act="p-cat" data-v="${k}" aria-pressed="${p.category === k}">${v}</button>`).join('');
  const sec = (id, title, icon, desc, body) => `<section class="card sec" id="${id}"><div class="sec-h"><span class="type-ic">${ic(icon)}</span><div><h3>${title}</h3>${desc ? `<p>${desc}</p>` : ''}</div></div>${body}</section>`;

  const sInfo = sec('w-info', 'ข้อมูลแผน', 'file', 'ชื่อแผน วัตถุประสงค์ ปีเริ่ม และระยะเวลา', `
    <div class="grid2">
      ${fld('name', 'ชื่อแผน', `<input id="e-name" class="input" data-f="name" value="${esc(p.name)}" placeholder="เช่น ระบบวิเคราะห์ความเสี่ยงผู้ประกอบการด้วย AI">`, { req: true, span: true })}
      ${fld('objective', 'วัตถุประสงค์โครงการ', ta('objective', 'โครงการนี้ทำเพื่ออะไร แก้ปัญหาอะไร (1–3 ข้อ)'), { max: 300, req: true, ai: true, span: true })}
      <div class="field"><label class="lbl req" for="e-start">ปีเริ่มแผน (พ.ศ.)</label><select id="e-start" class="select" data-act-change="p-start">${[2569, 2570, 2571, 2572, 2573].map((y) => `<option ${Number(p.startYear) === y ? 'selected' : ''}>${y}</option>`).join('')}</select></div>
      <div class="field"><span class="lbl req">ระยะเวลาแผน</span><div class="seg" role="group" aria-label="ระยะเวลาแผน">${[1, 2, 3, 4, 5].map((d) => `<button type="button" data-act="p-dur" data-v="${d}" aria-pressed="${Number(p.duration) === d}">${d} ปี</button>`).join('')}</div></div>
      <div class="field" style="grid-column:1/-1"><span class="lbl">ประเภท</span><div class="seg" role="group">${catOpts}</div></div>
      <div class="owner-line" style="grid-column:1/-1">${ic('user', 'ic-sm')}<span>เจ้าของแผน <b>${esc(ownerName(p))}</b></span><span>ผู้บริหาร <b>${esc(directorOf(p.unitId) || 'ยังไม่ระบุ')}</b></span><span>${esc(unit?.name || '')}</span></div>
    </div>`);

  const sLink = (autoHtml) => sec('w-link', 'เชื่อมโยงยุทธศาสตร์', 'target', 'เลือกเสา แล้วเลือกกลยุทธ์และ KPI ของเสานั้น', `
    <div class="field ${S.showMiss && S.missSet.has('pillar') ? 'invalid' : ''}"><span class="lbl req">เสายุทธศาสตร์ BALANCE</span>
      <div class="pchips">${C.pillars.map((x) => `<button type="button" data-p="${x.code}" data-act="p-pillar" data-v="${x.code}" aria-pressed="${p.pillar === x.code}"><b>${esc(x.code)}</b><span>${esc(x.name_en)}</span></button>`).join('')}</div>
      ${S.showMiss && S.missSet.has('pillar') ? '<span class="err">เลือกเสายุทธศาสตร์</span>' : ''}</div>
    ${p.pillar ? `
    <div class="field ${S.showMiss && S.missSet.has('strategy') ? 'invalid' : ''}"><span class="lbl req">กลยุทธ์ของเสา ${esc(p.pillar)}</span>
      <div class="opts" role="radiogroup">${strats.map((s) => `<label class="opt"><input type="radio" name="strat" value="${esc(s.code)}" data-act-change="p-strat" ${p.strategy === s.code ? 'checked' : ''}><b><span class="pcode" data-p="${esc(s.pillar)}">${esc(s.code)}</span> ${esc(s.name)}</b><span class="d">${esc(s.desc)}</span></label>`).join('')}</div>
      ${S.showMiss && S.missSet.has('strategy') ? '<span class="err">เลือกกลยุทธ์</span>' : ''}</div>
    <div class="field ${S.showMiss && S.missSet.has('kpis') ? 'invalid' : ''}"><span class="lbl ${isK ? 'req' : ''}">ตัวชี้วัด (KPI) ของเสา ${esc(p.pillar)}</span>
      <div class="opts">${kpis.map((k) => `<label class="opt"><input type="checkbox" value="${esc(k.id)}" data-act-change="p-kpi" ${p.kpis.includes(k.id) ? 'checked' : ''}><b><span class="mono">${esc(k.id)}</span> ${esc(k.name)}</b><span class="d">เป้าหมาย ${esc(k.target)}${k.baseline ? ' · ฐาน ' + esc(k.baseline) : ''}</span></label>`).join('')}</div>
      ${S.showMiss && S.missSet.has('kpis') ? '<span class="err">เลือก KPI อย่างน้อย 1 ตัว</span>' : ''}</div>` : `<p class="muted small">เลือกเสาก่อน แล้วระบบจะแสดงเฉพาะกลยุทธ์และ KPI ของเสานั้น</p>`}
    ${autoHtml}`);

  const links = st ? (st.links || []).map(levelItem).filter(Boolean) : [];
  const chain = C.planLevels.map((L, i) => {
    const items = links.filter((x) => x.level.id === L.id).map((x) => x.item.name);
    return `<li><span class="cd">${i + 1}</span><span class="ct"><small>${esc(L.name)}</small><b>${items.length ? items.map(esc).join(' · ') : '<span class="muted">ไม่มีการเชื่อมโยง</span>'}</b></span></li>`;
  }).join('') + (st ? `<li><span class="cd">${C.planLevels.length + 1}</span><span class="ct"><small>แผนยุทธศาสตร์กรมสรรพสามิต</small><b>ยุทธศาสตร์ที่ ${pillarOf(p.pillar)?.num} ${esc(pillarOf(p.pillar)?.name_en)} › ${esc(st.code)} ${esc(st.name)}</b></span></li>` : '');
  const chals = st ? (st.challenges || []).map(chalOf).filter(Boolean) : [];
  const sAuto = st ? `<details class="auto-d"><summary>${ic('link', 'ic-sm')}เชื่อมโยงอัตโนมัติ: แผน ${links.length} ประเด็น · ความท้าทาย ${chals.length} เรื่อง <span class="muted">(กดเพื่อดู)</span></summary>
    <div class="grid2">
      <div class="auto-box"><span class="auto-tag">${ic('link', 'ic-sm')}แผนระดับต่างๆ</span><ol class="chain">${chain}</ol></div>
      <div class="auto-box" style="align-content:start"><span class="auto-tag">${ic('bulb', 'ic-sm')}ความท้าทายที่โครงการนี้ตอบ</span>${chals.length ? `<ul class="chal">${chals.map((c) => `<li>${esc(c.name)}</li>`).join('')}</ul>` : '<p class="small muted">ยังไม่ได้ผูกความท้าทายกับกลยุทธ์นี้ (ตั้งค่าได้ที่ตั้งค่าทั่วไป › กลยุทธ์)</p>'}</div>
    </div></details>` : '';

  const rOpt = (r) => `<label class="opt"><input type="checkbox" value="${esc(r.id)}" data-act-change="p-risk" ${p.risks.includes(r.id) ? 'checked' : ''}><b><span class="mono">${esc(r.id)}</span> ${esc(r.name)}</b></label>`;
  const rMine = C.risks.filter((r) => r.pillar === p.pillar), rOther = C.risks.filter((r) => r.pillar !== p.pillar);
  const otherSel = rOther.filter((r) => p.risks.includes(r.id)).length;
  const sRisk = sec('w-risk', 'งบประมาณและความเสี่ยงระดับกรม', 'wallet', 'กรอกงบ แล้วเลือกความเสี่ยงระดับกรมที่โครงการนี้ช่วยลด', `
    <div class="grid2">${fld('budget', 'งบประมาณที่ใช้', `<div class="money"><input id="e-budget" class="input" data-f="budget" inputmode="numeric" value="${p.budget != null && p.budget !== '' ? money(p.budget) : ''}" placeholder="0"><span>บาท</span></div>`, { req: true, help: 'ใส่ 0 ถ้าไม่ใช้งบประมาณ' })}</div>
    <div class="field ${S.showMiss && S.missSet.has('risks') ? 'invalid' : ''}"><span class="lbl req">ความเสี่ยงระดับกรมที่เกี่ยวข้อง${p.pillar ? ` <span class="muted">(เสา ${esc(p.pillar)})</span>` : ''}</span>
      <div class="opts">${(p.pillar ? rMine : C.risks).map(rOpt).join('')}</div>
      ${p.pillar && rOther.length ? `<details class="auto-d" ${otherSel ? 'open' : ''}><summary>ความเสี่ยงของเสาอื่น ${rOther.length} เรื่อง${otherSel ? ` · เลือกไว้ ${otherSel}` : ''}</summary><div class="opts" style="margin-top:8px">${rOther.map(rOpt).join('')}</div></details>` : ''}
      ${S.showMiss && S.missSet.has('risks') ? '<span class="err">เลือกอย่างน้อย 1 เรื่อง</span>' : ''}</div>`);

  let extra = {};
  if (isK) {
    const sSteps = sec('w-steps', 'ขั้นตอนดำเนินงาน 5 ขั้น', 'steps', 'ขั้นละ 20% ลากบนแถบเดือนเพื่อเลือกช่วงเดือน (ต.ค. 69 – ก.ย. 70)', `<div class="steps">${p.steps.map((s, i) => `
      <div class="step ${S.showMiss && (!s.name.trim() || s.from < 0) ? 'field invalid' : ''}">
        <div class="step-h"><span class="sn">${i + 1}</span><label class="sr" for="e-steps-${i}-name">ชื่อขั้นตอนที่ ${i + 1}</label><input id="e-steps-${i}-name" class="input" data-f="steps.${i}.name" value="${esc(s.name)}" placeholder="ชื่อขั้นตอนที่ ${i + 1}"><span class="chip chip-accent num">${(i + 1) * 20}%</span></div>
        <div class="months-wrap"><div class="months" data-step="${i}" role="group" aria-label="เดือนดำเนินการขั้นตอนที่ ${i + 1}">${MONTHS.map((m, j) => `<button type="button" data-m="${j}" class="${s.from >= 0 && j >= s.from && j <= s.to ? 'on' : ''}" aria-pressed="${s.from >= 0 && j >= s.from && j <= s.to}">${m.replace(' ', '<br>')}</button>`).join('')}</div></div>
        <span class="help">${s.from >= 0 ? `ดำเนินการ ${MONTHS[s.from]} – ${MONTHS[s.to]}` : 'ยังไม่ได้เลือกเดือน'}</span>
      </div>`).join('')}</div>`);
    const sOut = sec('w-out', 'ผลผลิตและผลลัพธ์', 'chart', '', `<div class="grid2">
      ${fld('output6', 'Output 6 เดือน', ta('output6', 'ผลผลิตที่ส่งมอบได้ภายใน มี.ค. 70'), { max: 200, req: true, ai: true })}
      ${fld('output12', 'Output 12 เดือน', ta('output12', 'ผลผลิตที่ส่งมอบได้ภายใน ก.ย. 70'), { max: 200, req: true, ai: true })}
      ${fld('outcome12', 'Outcome 12 เดือน', ta('outcome12', 'ผลลัพธ์ที่เกิดกับ KPI หรือผู้รับบริการ'), { max: 200, req: true, ai: true, span: true })}</div>`);
    const L = p.erm1.l, I = p.erm1.i, sc = riskScore(L, I), lv = riskLevel(sc);
    const sE1 = sec('w-erm', 'การบริหารความเสี่ยงโครงการ (ERM)', 'shield', 'ERM1 ระบุความเสี่ยง 1 เรื่องและประเมิน · ERM2 แผนรองรับ', `
      <h4 class="sub-h">ERM1 ความเสี่ยงโครงการ</h4>
      <div class="grid2">${fld('erm1.risk', 'ความเสี่ยงโครงการ (1 เรื่อง)', ta('erm1.risk', 'เหตุการณ์ที่อาจทำให้โครงการไม่บรรลุเป้า'), { max: 180, req: true, ai: true })}${fld('erm1.current', 'การจัดการในปัจจุบัน', ta('erm1.current', 'มาตรการหรือการควบคุมที่มีอยู่แล้ว'), { max: 180, req: true })}</div>
      <div class="field ${S.showMiss && S.missSet.has('erm1.map') ? 'invalid' : ''}"><span class="lbl req">ประเมินด้วย risk map</span>
        <div class="erm-eval">
          ${riskMapHTML({ pick: true, sel: { l: L, i: I } })}
          <div class="erm-res">
            <div class="erm-score ${lv ? 'lv' + lv.c.slice(1) : ''}">${lv ? `<span>คะแนนความเสี่ยง</span><b class="num">${sc}</b><span class="lvtag lv${lv.c.slice(1)}">ระดับ${lv.t}</span><span class="small muted">โอกาส ${L} (${LIKELY[L]}) × ผลกระทบ ${I} (${LIKELY[I]})</span>` : `<span>ยังไม่ได้ประเมิน</span><b class="num muted">–</b><span class="small muted">แตะช่องบนตาราง เลือกโอกาสเกิด (แนวตั้ง) และผลกระทบ (แนวนอน)</span>`}</div>
            <ul class="erm-legend">${RLEGEND.map((x) => `<li class="${lv && lv.c === 'l' + x.n ? 'on' : ''}"><i style="background:var(--risk-${x.n})"></i><b>${x.t} ${x.r}</b><span>${x.d}</span></li>`).join('')}</ul>
          </div>
        </div>
        ${S.showMiss && S.missSet.has('erm1.map') ? '<span class="err">แตะช่องบน risk map</span>' : ''}</div>`);
    const sE2 = `
      <h4 class="sub-h">ERM2 แผนรองรับ</h4>
      <div class="grid2">${fld('erm2.planB', 'Plan B', ta('erm2.planB', 'ทำอะไรถ้าความเสี่ยงเกิดขึ้นจริง'), { max: 180, req: true, ai: true })}${fld('erm2.kri', 'KRI (ตัวชี้วัดความเสี่ยง)', ta('erm2.kri', 'สัญญาณเตือนและเกณฑ์ เช่น ความก้าวหน้าต่ำกว่าแผนเกิน 15%'), { max: 150, req: true, ai: true })}</div>
      <div class="field ${S.showMiss && S.missSet.has('erm2.months') ? 'invalid' : ''}"><span class="lbl req">Timeline การติดตาม KRI</span>
        <div class="seg" role="group" aria-label="เลือกไตรมาส">${[['Q1', [0, 1, 2]], ['Q2', [3, 4, 5]], ['Q3', [6, 7, 8]], ['Q4', [9, 10, 11]]].map(([q, ms]) => `<button type="button" data-act="p-q" data-v="${ms.join(',')}" aria-pressed="${ms.every((m) => p.erm2.months.includes(m))}">${q}</button>`).join('')}</div>
        <div class="months-wrap"><div class="months">${MONTHS.map((m, j) => `<button type="button" data-act="p-erm-m" data-v="${j}" class="${p.erm2.months.includes(j) ? 'on' : ''}" aria-pressed="${p.erm2.months.includes(j)}">${m.replace(' ', '<br>')}</button>`).join('')}</div></div>
        <span class="help">แตะเดือนที่จะรายงาน KRI หรือเลือกทั้งไตรมาส</span></div>`;
    extra = { 'w-steps': sSteps, 'w-out': sOut, 'w-erm': sE1.replace(/<\/section>$/, sE2 + '</section>') };
  }

  const body = Object.assign({ 'w-info': sInfo, 'w-link': sLink(sAuto), 'w-risk': sRisk }, extra);
  const cur = secs[S.edStep], last = S.edStep === secs.length - 1;
  return `
  ${journey(2)}
  <div class="ed1">
  <div class="ph"><div class="ph-t"><span class="eyebrow">${TYPE_LABEL[p.type]} · ${esc(CAT[p.type][p.category])}</span><h1>${p.name ? esc(p.name) : 'แผนใหม่'}</h1></div>
    <button class="btn btn-ghost" data-act="go" data-v="new">${ic('collapse', 'ic-sm')}รายการแผน</button></div>
  ${S.readOnly ? `<div class="ro-note">${ic('lock', 'ic-sm')}บัญชีนี้มีสิทธิ์ดูอย่างเดียว การแก้ไขจะไม่ถูกบันทึก</div>` : ''}
  <ol class="wiz" aria-label="ขั้นตอนการกรอก">${secs.map(([id, t], i) => `<li><button type="button" data-act="wstep" data-v="${i}" data-sec="${id}" ${i === S.edStep ? 'aria-current="step"' : ''} class="${secDone(id) ? 'ok' : ''}"><span class="wn">${secDone(id) && i !== S.edStep ? ic('check') : i + 1}</span><span class="wt">${t}</span></button></li>`).join('')}</ol>
  ${S.showMiss && miss.length ? `<div class="miss"><b>ยังขาดข้อมูล ${miss.length} รายการ</b><span>${miss.map((m) => esc(m.t)).join(' · ')}</span></div>` : ''}
  ${['w-info', 'w-out', 'w-erm'].includes(cur[0]) ? tipsBox() : ''}
  ${body[cur[0]]}
  <div class="savebar"><span class="status" id="save-status">${saveStatusHTML()}</span>
    ${S.edStep > 0 ? `<button class="btn" data-act="wstep" data-v="${S.edStep - 1}">← ย้อนกลับ</button>` : ''}
    <button class="btn btn-ghost" data-act="p-preview">${ic('eye', 'ic-sm')}<span class="only-desk">ดูตัวอย่าง</span></button>
    ${last ? `<button class="btn btn-primary" data-act="p-save">${ic('check', 'ic-sm')}บันทึกแผน</button>` : `<button class="btn btn-primary" data-act="wstep" data-v="${S.edStep + 1}">ถัดไป: ${secs[S.edStep + 1][1]} →</button>`}</div>
  </div>`;
}
function tipsBox() {
  return `<details class="tips" ${S.tipsClosed ? '' : 'open'} data-act-toggle="tips"><summary>${ic('bulb', 'ic-sm')}คำแนะนำการกรอก <span class="muted">ให้รายงาน PDF พอดี 1 หน้า</span></summary>
    <ul>
      <li><b>ดูตัวนับใต้ช่อง</b> ตัวนับจะขึ้นสีส้มเมื่อเกินความยาวที่แนะนำ · วัตถุประสงค์ไม่เกิน 300 ตัวอักษร · Output / Outcome ช่องละไม่เกิน 200 · ERM ช่องละ 150–180</li>
      <li><b>เขียนเป็นข้อสั้น ๆ 2–3 ข้อ</b> และวัดผลได้ เช่น “ระบบใช้งานจริง 10 พื้นที่”</li>
      <li><b>รายละเอียดเชิงลึก</b> เก็บไว้ในเอกสารแนบหรือ Knowledge Hub แทนการเขียนยาวในแผน</li>
    </ul></details>`;
}
function wizSteps(p) {
  return [['w-info', 'ข้อมูลแผน'], ['w-link', 'ยุทธศาสตร์'], ['w-risk', 'งบและความเสี่ยง']]
    .concat(p.type === 'kpi' ? [['w-steps', 'ขั้นตอน'], ['w-out', 'ผลผลิต/ผลลัพธ์'], ['w-erm', 'ERM']] : []);
}
function saveStatusHTML() {
  if (S.saveErr) return `<span style="color:var(--bad);display:inline-flex;gap:6px;align-items:center">${ic('alert', 'ic-sm')}${esc(S.saveMsg)}</span>`;
  return S.saveMsg ? `${ic('check', 'ic-sm')}${esc(S.saveMsg)}` : 'แก้ไขแล้วระบบบันทึกให้อัตโนมัติ';
}
function setStatus(msg, err) { S.saveMsg = msg; S.saveErr = !!err; const el = $('#save-status'); if (el) el.innerHTML = saveStatusHTML(); }
function queueSave() {
  if (!S.plan) return;
  setStatus('กำลังบันทึก…');
  clearTimeout(S.saveT);
  S.saveT = setTimeout(flushSave, 1200);
}
async function flushSave() {
  clearTimeout(S.saveT); S.saveT = null;
  const p = S.plan; if (!p || !S.db) return;
  if (S.writing) { S.pending = true; return; }
  S.writing = true;
  p.updatedAt = Date.now();
  if (p.status === 'done' && missing(p).length) p.status = 'draft';
  try {
    await S.db.doc('plans/' + p.id).set(clone(p));
    const t = new Date(); setStatus(`บันทึกอัตโนมัติแล้ว ${t.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`);
  } catch (e) {
    setStatus(e?.code === 'quota_exceeded' ? 'บันทึกไม่ได้ พื้นที่จัดเก็บเต็ม' : e?.code === 'invalid_argument' ? 'บันทึกไม่ได้ บัญชีนี้ไม่มีสิทธิ์แก้ไข' : 'บันทึกไม่สำเร็จ ระบบจะลองใหม่เมื่อแก้ไขครั้งถัดไป', true);
  }
  S.writing = false;
  if (S.pending) { S.pending = false; flushSave(); }
}
function refreshToc() {
  if (!S.plan) return;
  const miss = missing(S.plan);
  $$('.wiz button[data-sec]').forEach((b) => { const done = !miss.some((m) => m.sec === b.dataset.sec); b.classList.toggle('ok', done); if (b.getAttribute('aria-current') !== 'step') b.querySelector('.wn').innerHTML = done ? ic('check') : String(Number(b.dataset.v) + 1); });
}
function rerenderEdit() { const v = $('#view'); const y = v.scrollTop; renderView(); v.scrollTop = y; }

function wireEditor() {
  const v = $('#view');
  $$('[data-f]', v).forEach((el) => {
    if (el.tagName === 'BUTTON') return;
    el.addEventListener('input', () => {
      const f = el.dataset.f; let val = el.value;
      if (f === 'budget') {
        const digits = val.replace(/[^\d]/g, '');
        val = digits === '' ? null : Number(digits);
        const pos = el.value.length - el.selectionStart;
        el.value = digits === '' ? '' : money(val);
        try { el.setSelectionRange(el.value.length - pos, el.value.length - pos); } catch (e) {}
      }
      setPath(S.plan, f, val);
      const cc = v.querySelector(`[data-cc="${f}"]`); if (cc) { const n = String(val || '').length, mx = Number(cc.dataset.max); cc.textContent = `(${n}/${mx})`; cc.classList.toggle('over', n > mx); }
      if (f === 'name') { const h = $('.ph h1', v); if (h) h.textContent = val || 'แผนใหม่'; }
      queueSave(); refreshToc();
    });
  });
  $$('.months[data-step]', v).forEach((row) => {
    const i = Number(row.dataset.step);
    const paint = () => { const s = S.plan.steps[i]; $$('button', row).forEach((b) => { const j = Number(b.dataset.m); const on = s.from >= 0 && j >= s.from && j <= s.to; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }); const help = row.closest('.step').querySelector('.help'); help.textContent = s.from >= 0 ? `ดำเนินการ ${MONTHS[s.from]} – ${MONTHS[s.to]}` : 'ยังไม่ได้เลือกเดือน'; };
    let anchor = -1, moved = false;
    row.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('[data-m]'); if (!b) return;
      e.preventDefault(); anchor = Number(b.dataset.m); moved = false;
      const s = S.plan.steps[i];
      S.dragWasSingle = s.from === anchor && s.to === anchor;
      s.from = anchor; s.to = anchor; paint();
      try { row.setPointerCapture(e.pointerId); } catch (er) {}
    });
    row.addEventListener('pointermove', (e) => {
      if (anchor < 0) return;
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-m]');
      if (!el || !row.contains(el)) return;
      const j = Number(el.dataset.m); const s = S.plan.steps[i];
      if (j !== anchor) moved = true;
      s.from = Math.min(anchor, j); s.to = Math.max(anchor, j); paint();
    });
    const end = () => {
      if (anchor < 0) return;
      if (!moved && S.dragWasSingle) { S.plan.steps[i].from = -1; S.plan.steps[i].to = -1; paint(); }
      anchor = -1; queueSave(); refreshToc();
    };
    row.addEventListener('pointerup', end); row.addEventListener('pointercancel', end);
    row.addEventListener('keydown', (e) => {
      const b = e.target.closest('[data-m]'); if (!b || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault(); const j = Number(b.dataset.m); const s = S.plan.steps[i];
      if (s.from < 0) { s.from = j; s.to = j; } else if (j < s.from) s.from = j; else if (j > s.to) s.to = j; else { s.from = j; s.to = j; }
      paint(); queueSave(); refreshToc();
    });
  });
}

/* ---------- Report ---------- */
function reportPlan() { return S.plans.find((x) => x.id === S.param) || (S.plan && S.plan.id === S.param ? S.plan : null); }
function viewReport() {
  const g = needCfg(); if (g) return g;
  const raw = reportPlan();
  if (!raw) return S.plansLoaded ? `<div class="empty">${ic('alert')}<b>ไม่พบแผนนี้</b><button class="btn" data-act="go" data-v="new">กลับ</button></div>` : `<div class="skel" style="height:300px"></div>`;
  const p = Object.assign(newPlan(raw.type, raw.category), raw);
  const miss = missing(p);
  const canEdit = !S.publicMode && (p.ownerId === S.uid || S.canAdmin);
  return `
  ${journey(S.exported === p.id ? 4 : 3)}
  <div class="ph"><div class="ph-t"><span class="eyebrow">${p.status === 'done' ? 'เสร็จสิ้นการสร้างแผน' : 'ตัวอย่างรายงาน (ยังเป็นร่าง)'}</span><h1>${esc(p.name || 'แผนใหม่')}</h1></div>
    <div class="report-tools">
      ${canEdit ? `<button class="btn" data-act="go" data-v="edit-${esc(p.id)}">${ic('edit', 'ic-sm')}แก้ไข</button>` : ''}
      <button class="btn btn-primary" data-act="pdf" ${S.pdfBusy ? 'disabled' : ''}>${ic('download', 'ic-sm')}${S.pdfBusy ? 'กำลังสร้าง PDF…' : 'ดาวน์โหลด PDF'}</button>
      ${S.exported === p.id ? `<button class="btn" data-act="go" data-v="new">${ic('check', 'ic-sm')}กลับไปรายการแผน</button>` : ''}
    </div></div>
  ${miss.length ? `<div class="miss"><b>แผนนี้ยังขาดข้อมูล ${miss.length} รายการ</b><span>${miss.map((m) => esc(m.t)).join(' · ')}</span></div>` : ''}
  <div class="cut-note" id="cut-note" hidden>${ic('alert', 'ic-sm')}<span>ข้อความบางช่องยาวเกินความยาวที่แนะนำ จึงถูกตัดท้าย (…) ให้พอดี 1 หน้า แนะนำให้แก้ไขให้กระชับ</span></div>
  <div class="sheet-wrap" id="sheet-wrap"><div class="sheet" id="sheet">${sheetHTML(p)}</div></div>`;
}
function sheetHTML(p, cut) {
  const C = cfg(); const pil = pillarOf(p.pillar); const st = stratOf(p.strategy); const isK = p.type === 'kpi';
  const pc = PCOL[p.pillar] || '#1A5BD6';
  const links = st ? (st.links || []).map(levelItem).filter(Boolean) : [];
  const chain = C.planLevels.map((L) => { const it = links.filter((x) => x.level.id === L.id).map((x) => x.item.name); return it.length ? `<div><small>${esc(L.name)}</small><span>${it.map(esc).join(' · ')}</span></div>` : ''; }).join('');
  const chals = st ? (st.challenges || []).map(chalOf).filter(Boolean) : [];
  const nl = (v) => { v = String(v || '').trim(); if (!v) return '—'; if (cut && v.length > cut) return esc(v.slice(0, cut).trim()) + '…'; return esc(v); };
  const thDate = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  const kpis = p.kpis.map(kpiOf).filter(Boolean);
  const drisks = p.risks.map(riskOf).filter(Boolean);

  /* top: project details */
  const top = `<section class="sx-top">
    <div class="sx-facts"><div><small>หน่วยงาน</small><b>${esc(unitName(p.unitId))}</b></div><div><small>ระยะเวลา (พ.ศ.)</small><b>${periodText(p)}</b></div><div><small>งบประมาณ</small><b>${p.budget != null && p.budget !== '' ? money(p.budget) + ' บาท' : '—'}</b></div><div><small>ประเภท</small><b>${esc(CAT[p.type][p.category])}</b></div></div>
    <div class="sx-3">
      <div><div class="sh-h">วัตถุประสงค์</div><p class="sh-p">${nl(p.objective)}</p></div>
      <div><div class="sh-h">ความเชื่อมโยงยุทธศาสตร์</div><dl class="sh-kv">
        <dt>เสา</dt><dd>${pil ? `<span class="pill-p" style="background:${pc}">${esc(pil.code)}</span> ${esc(pil.name_en)}` : '—'}</dd>
        <dt>กลยุทธ์</dt><dd>${st ? `${esc(st.code)} ${esc(st.name)}` : '—'}</dd>
        <dt>ตัวชี้วัด</dt><dd>${kpis.length ? kpis.map((k) => `${esc(k.id)} ${esc(k.name_en || k.name)} <span class="sh-m">(เป้า ${esc(k.target)})</span>`).join('<br>') : '—'}</dd>
        <dt>ความท้าทาย</dt><dd>${chals.length ? chals.map((c) => esc(c.name)).join('<br>') : '—'}</dd></dl></div>
      <div><div class="sh-h">แผนระดับต่างๆ</div><div class="sh-chain">${chain || '<span class="sh-m">—</span>'}</div></div>
    </div></section>`;

  /* bottom-left: milestones + outputs */
  let left, right;
  if (isK) {
    left = `<div class="sx-blk"><div class="sh-h">Milestone ขั้นตอนดำเนินงาน ปีงบประมาณ 2570</div><table class="gantt"><colgroup><col class="c-nm"><col class="c-w">${MONTHS.map(() => '<col>').join('')}</colgroup>
      <thead><tr><th style="text-align:left">ขั้นตอน</th><th>%</th>${MONTHS.map((m) => `<th>${m.split(' ')[0]}</th>`).join('')}</tr></thead>
      <tbody>${p.steps.map((s, i) => `<tr><td class="nm">${i + 1}. ${nl(s.name)}</td><td>${(i + 1) * 20}</td>${MONTHS.map((_, j) => `<td class="${s.from >= 0 && j >= s.from && j <= s.to ? 'on' : ''}"></td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <div class="sx-blk sx-grow"><div class="sh-h">ผลผลิตและผลลัพธ์</div><div class="sh-out"><div class="sh-box"><small>OUTPUT 6 เดือน (มี.ค. 70)</small><p>${nl(p.output6)}</p></div><div class="sh-box"><small>OUTPUT 12 เดือน (ก.ย. 70)</small><p>${nl(p.output12)}</p></div><div class="sh-box"><small>OUTCOME 12 เดือน</small><p>${nl(p.outcome12)}</p></div></div></div>`;
    const L = p.erm1.l, I = p.erm1.i, sc = riskScore(L, I), lv = riskLevel(sc);
    let mm = '';
    for (let l = 5; l >= 1; l--) { mm += `<span class="ax">${l}</span>`; for (let i = 1; i <= 5; i++) { const s = l * i; const sel = L === l && I === i; mm += `<i class="${riskLevel(s).c.replace('l', 'm')} ${sel ? 'sel' : ''}">${sel ? `<b>${s}</b>` : s}</i>`; } }
    mm += '<span></span>' + [1, 2, 3, 4, 5].map((i) => `<span class="ax">${i}</span>`).join('');
    right = `<div class="sh-h">การบริหารความเสี่ยงโครงการ (ERM)</div>
      <div class="sx-risk">
        <div class="sx-mapwrap"><span class="sx-yl">โอกาสเกิด</span><div class="big-map">${mm}</div><span class="sx-xl">ผลกระทบ</span></div>
        <div class="sx-score">${lv ? `<span>คะแนนความเสี่ยง</span><b>${sc}</b><span class="rs-l rs-${lv.c}">ระดับ${lv.t}</span><span class="sh-m">โอกาส ${L} × ผลกระทบ ${I}</span>` : '<span class="sh-m">ยังไม่ประเมิน</span>'}</div>
      </div>
      <dl class="sh-kv sx-erm"><dt>ERM1 ความเสี่ยง</dt><dd>${nl(p.erm1.risk)}</dd><dt>การจัดการปัจจุบัน</dt><dd>${nl(p.erm1.current)}</dd><dt>ERM2 Plan B</dt><dd>${nl(p.erm2.planB)}</dd><dt>KRI</dt><dd>${nl(p.erm2.kri)}</dd><dt>ติดตาม KRI</dt><dd>${p.erm2.months.length ? [...p.erm2.months].sort((a, b) => a - b).map((m) => MONTHS[m]).join(', ') : '—'}</dd><dt>ความเสี่ยงระดับกรม</dt><dd>${drisks.length ? drisks.map((r) => `${esc(r.id)} ${esc(r.name)}`).join('<br>') : '—'}</dd></dl>`;
  } else {
    left = `<div class="sx-blk sx-grow"><div class="sh-h">ขอบเขตโครงการ</div><p class="sh-p sh-m">โครงการประเภทไม่ผูกตัวชี้วัด ไม่ต้องระบุ Milestone ผลผลิต และ ERM ระดับโครงการ</p></div>`;
    right = `<div class="sh-h">ความเสี่ยงระดับกรมที่เกี่ยวข้อง</div>${drisks.length ? `<ul class="sh-ul sx-rl">${drisks.map((r) => { const sc = riskScore(Number(r.l) || 0, Number(r.i) || 0), lv = riskLevel(sc); return `<li><b>${esc(r.id)}</b> ${esc(r.name)}${lv ? ` <span class="rs-l rs-${lv.c}">${sc} · ${lv.t}</span>` : ''}</li>`; }).join('')}</ul>` : '<p class="sh-m">—</p>'}`;
  }
  return `<div class="sh-top"><div class="ey"><span>กรมสรรพสามิต · แผนปฏิบัติการภายใต้แผนยุทธศาสตร์ BALANCE</span><span>${p.status === 'done' ? 'ฉบับสมบูรณ์' : 'ฉบับร่าง'} · ${thDate}</span></div>
      <h1>${esc(p.name || 'แผนใหม่')}</h1>
      <div class="sh-tags"><span>${TYPE_LABEL[p.type]}</span><span>${esc(CAT[p.type][p.category])}</span>${pil ? `<span>ยุทธศาสตร์ที่ ${pil.num} ${esc(pil.name_en)}</span>` : ''}</div></div>
    <div class="sx-body">
      ${top}
      <section class="sx-bottom"><div class="sx-left">${left}</div><div class="sx-right">${right}</div></section>
    </div>
    <div class="sh-foot sx-foot">
      <div class="sign"><span class="ln"></span><b>${esc(ownerName(p))}</b><span>ผู้จัดทำแผน · วันที่ ……/……/……</span></div>
      <div class="sign"><span class="ln"></span><b>${esc(directorOf(p.unitId) || '…………………………')}</b><span>ผู้บริหารหน่วยงาน · วันที่ ……/……/……</span></div></div>`;
}
function loadScript(src) { return new Promise((res, rej) => { if ($(`script[src="${src}"]`)) { res(); return; } const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.append(s); }); }
const FIT_STEPS = [[0, 0], [1, 0], [2, 0], [3, 0], [3, 420], [3, 260], [3, 160], [3, 100]];
function fitSheet(el, p) {
  for (const [d, cut] of FIT_STEPS) {
    if (d) el.dataset.d = d; else delete el.dataset.d;
    el.innerHTML = sheetHTML(p, cut);
    if (el.scrollHeight <= 796) return cut;
  }
  return 100;
}
function fullTextHTML(p) {
  const box = (t, v) => (String(v || '').trim() ? `<div><div class="sh-h">${t}</div><p class="sh-p">${esc(v)}</p></div>` : '');
  return `<div class="sh-top"><div class="ey"><span>รายละเอียดฉบับเต็ม (หน้า 2)</span><span>${esc(unitName(p.unitId))}</span></div><h1>${esc(p.name || 'แผนใหม่')}</h1></div>
    <div class="sx-full">${box('วัตถุประสงค์', p.objective)}${box('Output 6 เดือน', p.output6)}${box('Output 12 เดือน', p.output12)}${box('Outcome 12 เดือน', p.outcome12)}${box('ERM1 ความเสี่ยงโครงการ', p.erm1?.risk)}${box('การจัดการในปัจจุบัน', p.erm1?.current)}${box('ERM2 Plan B', p.erm2?.planB)}${box('KRI', p.erm2?.kri)}</div>`;
}
function fitReport() {
  const el = $('#sheet'), raw = reportPlan(); if (!el || !raw) return;
  const p = Object.assign(newPlan(raw.type, raw.category), raw);
  const cut = fitSheet(el, p);
  S.sheetCut = cut;
  const cn = $('#cut-note'); if (cn) cn.hidden = !cut;
}
async function exportPdf() {
  const raw = reportPlan(); if (!raw) return;
  if (!S.dl) { toast('ดาวน์โหลดไฟล์ไม่ได้ในมุมมองนี้ ลองเปิดหน้านี้ใน claude.ai', 'err'); return; }
  S.pdfBusy = true; renderView();
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-12000px;top:0;width:1123px;z-index:-1';
  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    const p = Object.assign(newPlan(raw.type, raw.category), raw);
    document.body.append(host);
    try { await document.fonts.ready; } catch (e) {}
    const s1 = document.createElement('div'); s1.className = 'sheet'; s1.style.boxShadow = 'none'; host.append(s1);
    const cut = fitSheet(s1, p);
    const pages = [s1];
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
    for (let k = 0; k < pages.length; k++) {
      const canvas = await window.html2canvas(pages[k], { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
      let w = 297, h = canvas.height * 297 / canvas.width, x = 0;
      if (h > 210) { w = 297 * 210 / h; h = 210; x = (297 - w) / 2; }
      if (k) pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', x, 0, w, h);
    }
    const name = (p.name || 'แผน').replace(/[\\/:*?"<>|]/g, '').slice(0, 80);
    await S.dl.save({ filename: `แผน-${name}.pdf`, data: pdf.output('blob') });
    S.exported = p.id; toast(cut ? 'ดาวน์โหลด PDF แล้ว (ข้อความบางช่องยาวเกิน ถูกตัดให้พอดี 1 หน้า)' : 'ดาวน์โหลด PDF แล้ว');
  } catch (e) {
    if (e?.code === 'declined') toast('ยกเลิกการดาวน์โหลด', 'err');
    else toast('สร้าง PDF ไม่สำเร็จ ลองอีกครั้ง', 'err');
  } finally { host.remove(); S.pdfBusy = false; renderView(); }
}
