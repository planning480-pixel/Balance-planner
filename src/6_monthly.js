/* ===================== Monthly reporting, users, hub ===================== */
const RSTAT = { todo: 'ยังไม่ได้ทำ', doing: 'กำลังทำ', done: 'เสร็จแล้ว' };
const RCHIP = { todo: 'chip', doing: 'chip-accent', done: 'chip-ok' };
function curFm() { const d = new Date(); const idx = (d.getFullYear() - 2026) * 12 + (d.getMonth() - 9); return Math.max(0, Math.min(11, idx)); }
const repId = (p, m) => `${p.id}__${m}`;
const repOf = (p, m) => S.reports[repId(p, m)] || null;
function lastRep(p, m) { for (let k = m; k >= 0; k--) { const r = repOf(p, k); if (r) return Object.assign({ m: k }, r); } return null; }
function plannedPct(p, m) {
  if (p.type !== 'kpi' || !Array.isArray(p.steps)) return null;
  let t = 0;
  p.steps.forEach((s) => { if (s.from < 0) return; t += 20 * Math.max(0, Math.min(1, (m - s.from + 1) / (s.to - s.from + 1))); });
  return Math.round(t);
}
function actualPct(p, r) { if (!r) return null; if (p.type === 'kpi') return 20 * (r.steps || []).filter(Boolean).length; return r.pct == null || r.pct === '' ? null : Number(r.pct); }
function rowFor(p, m) {
  const r = repOf(p, m), last = lastRep(p, m);
  const plan = plannedPct(p, m), act = actualPct(p, last);
  const budget = Number(p.budget || 0), spent = last && last.spent != null && last.spent !== '' ? Number(last.spent) : null;
  const late = plan != null && act != null && act < plan - 10;
  return { p, r, last, plan, act, budget, spent, disb: budget && spent != null ? spent / budget : null, status: (r || last)?.status || 'todo', sent: !!r, late, problems: r?.problems || '', progress: r?.progress || '' };
}
const pctTxt = (v) => (v == null ? '—' : v + '%');
const disbTxt = (v) => (v == null ? '—' : (v * 100).toFixed(1) + '%');
function reportablePlans() { return S.plans.filter((p) => p.name); }
function pendingReports() { const m = curFm(); return reportablePlans().filter((p) => p.ownerId === S.uid && !repOf(p, m)).length; }
const canReport = (p) => p.ownerId === S.uid || S.isSuper;
const RW = () => Object.assign({ from: 1, to: 5, always: false }, cfg().reportWindow || {});
function windowOpenFor(m) {
  const w = RW(); if (w.always) return m <= curFm();
  const d = new Date().getDate(), ct = curFm();
  const inWin = d >= Number(w.from) && d <= Number(w.to);
  return inWin && m === ct - 1;
}
const canSubmit = (p, m) => canReport(p) && (S.isSuper || windowOpenFor(m));
function windowText() { const w = RW(); return w.always ? 'เปิดรับรายงานตลอดเวลา' : `เปิดรับรายงานผลของเดือนก่อนหน้า วันที่ ${w.from}–${w.to} ของทุกเดือน`; }
function pillarIdx(code) { const i = cfg().pillars.findIndex((x) => x.code === code); return i < 0 ? 99 : i; }

function monthPicker() {
  const now = curFm();
  return `<div class="mpick" role="group" aria-label="เลือกเดือนที่รายงาน">${MONTHS.map((m, i) => `<button type="button" data-act="rep-mon" data-v="${i}" aria-pressed="${S.mon === i}" class="${i === now ? 'now' : ''}" ${i > now ? 'disabled title="ยังไม่ถึงเดือนนี้"' : ''}>${m}</button>`).join('')}</div>`;
}

function viewMonthly() {
  const g = needCfg(); if (g) return g;
  if (S.mon == null) { const ct = curFm(); S.mon = ct > 0 && windowOpenFor(ct - 1) ? ct - 1 : ct; }
  const tab = S.repTab;
  const open = windowOpenFor(S.mon);
  return `
  <div class="ph"><div class="ph-t"><h1>รายงานผลรายเดือน</h1><span class="sub">ปีงบประมาณ 2570 · ${windowText()}</span></div>
    ${tab === 'mine' ? '' : `<button class="btn btn-primary" data-act="ov-pdf" ${S.pdfBusy ? 'disabled' : ''}>${ic('download', 'ic-sm')}${S.pdfBusy ? 'กำลังสร้าง PDF…' : 'PDF ภาพรวมสำหรับผู้บริหาร'}</button>`}</div>
  <div class="stabs" role="tablist"><button role="tab" aria-selected="${tab === 'mine'}" data-act="rep-tab" data-v="mine">รายงานรายโครงการ</button><button role="tab" aria-selected="${tab === 'ov'}" data-act="rep-tab" data-v="ov">ภาพรวมผู้บริหาร</button></div>
  ${monthPicker()}
  <div class="win ${open ? 'win-open' : ''}">${ic(open ? 'check' : 'lock', 'ic-sm')}<span>${open ? `เปิดรับรายงานเดือน ${MONTHS[S.mon]} อยู่ตอนนี้` : `ปิดรับรายงานเดือน ${MONTHS[S.mon]}`}${S.isSuper && !open ? ' · Super admin แก้ไขได้เสมอ' : ''}</span>${S.isSuper ? `<button class="zlink" data-act="go-setup-tab" data-v="report">ตั้งช่วงวันรายงาน</button>` : ''}</div>
  ${tab === 'mine' ? viewRepList() : viewOverview()}`;
}

function viewRepList() {
  const m = S.mon, uid = S.profile?.unitId;
  if (S.repScope === 'all' && !S.isSuper) S.repScope = 'unit';
  let plans = reportablePlans();
  if (S.repScope === 'mine') plans = plans.filter((p) => p.ownerId === S.uid);
  else if (S.repScope === 'unit') plans = plans.filter((p) => p.unitId === uid);
  plans.sort((a, b) => pillarIdx(a.pillar) - pillarIdx(b.pillar) || String(a.name).localeCompare(String(b.name), 'th'));
  const sent = plans.filter((p) => repOf(p, m)).length;
  return `<div class="bar-row"><span class="muted small">ส่งแล้ว ${sent} จาก ${plans.length} โครงการ</span>
    <div class="tabs" role="tablist" style="min-width:min(100%,340px)"><button role="tab" aria-selected="${S.repScope === 'mine'}" data-act="rep-scope" data-v="mine">ของฉัน</button><button role="tab" aria-selected="${S.repScope === 'unit'}" data-act="rep-scope" data-v="unit">หน่วยงาน</button>${S.isSuper ? `<button role="tab" aria-selected="${S.repScope === 'all'}" data-act="rep-scope" data-v="all">ทั้งกรม</button>` : ''}</div></div>
  ${plans.length ? `<div class="rep-list">${plans.map((p) => repCard(p, m)).join('')}</div>` : `<div class="empty">${ic('chart')}<b>ยังไม่มีโครงการให้รายงาน</b><span>สร้างแผนที่เมนูสร้างแผนใหม่ก่อน แล้วกลับมารายงานผลที่นี่</span><button class="btn" data-act="go" data-v="new">ไปสร้างแผน</button></div>`}`;
}

function repCard(p, m) {
  const R = rowFor(p, m);
  const open = S.repOpen === p.id;
  const st = stratOf(p.strategy);
  return `<article class="card rep" ${p.pillar ? `data-p="${esc(p.pillar)}"` : ''} id="rep-${esc(p.id)}">
    <div class="rep-h">
      <div class="t"><b>${esc(p.name)}</b><span>${p.pillar ? `<span class="pcode">${esc(st?.code || p.pillar)}</span> · ` : ''}${esc(unitName(p.unitId))} · ${esc(ownerName(p))}${p.status !== 'done' ? ' · แผนยังเป็นร่าง' : ''}</span></div>
      <div class="m">
        ${R.sent ? `<span class="chip ${RCHIP[R.status]}">${RSTAT[R.status]}</span>` : '<span class="chip chip-warn">ยังไม่ส่ง</span>'}
        ${R.late ? '<span class="chip chip-bad">ล่าช้ากว่าแผน</span>' : ''}
      </div>
      <div class="prog" style="grid-column:1/-1;max-width:520px">
        <span>ผล ${pctTxt(R.act)}${R.plan != null ? ` · แผน ${R.plan}%` : ''} · เบิกจ่าย ${R.spent != null ? money(R.spent) : '—'} / ${money(R.budget)} บาท (${disbTxt(R.disb)})</span>
        <span class="pbar" aria-hidden="true"><i style="width:${Math.min(100, R.act || 0)}%"></i>${R.plan != null ? `<b style="left:calc(${Math.min(100, R.plan)}% - 1px)"></b>` : ''}</span>
      </div>
    </div>
    ${open ? repForm(p, m) : `<div style="display:flex;gap:8px;flex-wrap:wrap">
      ${canSubmit(p, m) ? `<button class="btn btn-sm ${R.sent ? '' : 'btn-primary'}" data-act="rep-open" data-v="${esc(p.id)}">${ic('edit', 'ic-sm')}${R.sent ? 'แก้ไขรายงานเดือนนี้' : 'กรอกรายงานเดือนนี้'}</button>` : ''}
      ${(R.r?.files || []).map((f) => `<a class="btn btn-sm btn-ghost" href="/_blob/${esc(f.id)}" target="_blank" rel="noopener noreferrer">${ic('file', 'ic-sm')}${esc(f.name)}</a>`).join('')}
      <button class="btn btn-sm" data-act="rep-pdf" data-v="${esc(p.id)}" ${S.pdfBusy ? 'disabled' : ''}>${ic('download', 'ic-sm')}PDF โครงการนี้</button></div>`}
  </article>`;
}

function repDraftFor(p, m) {
  const key = repId(p, m);
  if (!S.repDraft[key]) {
    const r = repOf(p, m), last = lastRep(p, m - 1 >= 0 ? m - 1 : 0);
    const base = r || (m > 0 && last ? { status: last.status === 'done' ? 'done' : last.status, steps: last.steps, pct: last.pct, spent: last.spent } : {});
    S.repDraft[key] = { status: base.status || 'todo', steps: Array.from({ length: 5 }, (_, i) => !!(base.steps || [])[i]), pct: base.pct ?? '', spent: base.spent ?? '', progress: r?.progress || '', problems: r?.problems || '', prevProgress: !r && last && last.m < m ? last.progress : '', files: (r?.files || []).slice() };
  }
  return S.repDraft[key];
}
function repForm(p, m) {
  const d = repDraftFor(p, m);
  const plan = plannedPct(p, m);
  const steps = p.type === 'kpi' ? `<div class="field"><span class="lbl">ขั้นตอนที่ทำเสร็จแล้ว (ขั้นละ 20%)</span>
      <div class="stepchk">${p.steps.map((s, i) => `<label><input type="checkbox" data-r="steps.${i}" ${d.steps[i] ? 'checked' : ''}><span>${i + 1}. ${esc(s.name || 'ขั้นตอนที่ ' + (i + 1))}</span><small>${s.from >= 0 ? `${MONTHS[s.from]}–${MONTHS[s.to]}` : 'ไม่ได้กำหนดเดือน'}</small></label>`).join('')}</div>
      <span class="help">ผล ${20 * d.steps.filter(Boolean).length}%${plan != null ? ` · ตามแผนควรถึง ${plan}% ภายใน${MONTHS[m]}` : ''}</span></div>`
    : `<div class="field"><label class="lbl" for="r-pct">ความก้าวหน้าโดยประมาณ</label><select id="r-pct" class="select" data-r="pct" style="max-width:200px">${['', ...Array.from({ length: 11 }, (_, i) => i * 10)].map((v) => `<option value="${v}" ${String(d.pct) === String(v) ? 'selected' : ''}>${v === '' ? 'เลือก' : v + '%'}</option>`).join('')}</select></div>`;
  return `<div class="rep-form" data-plan="${esc(p.id)}">
    <div class="field"><span class="lbl req">สถานะเดือน ${MONTHS[m]}</span><div class="seg" role="group">${Object.entries(RSTAT).map(([k, v]) => `<button type="button" data-act="rep-status" data-v="${k}" aria-pressed="${d.status === k}">${v}</button>`).join('')}</div></div>
    ${steps}
    <div class="grid2">
      <div class="field"><label class="lbl" for="r-spent">เบิกจ่ายจริงสะสม</label><div class="money"><input id="r-spent" class="input" data-r="spent" inputmode="numeric" value="${d.spent !== '' && d.spent != null ? money(d.spent) : ''}" placeholder="0"><span>บาท</span></div><span class="help">งบประมาณทั้งโครงการ ${money(p.budget)} บาท</span></div>
    </div>
    <div class="grid2">
      <div class="field"><label class="lbl req" for="r-progress">ผลความก้าวหน้า</label><textarea id="r-progress" class="textarea" data-r="progress" placeholder="ทำอะไรไปแล้วในเดือนนี้ ได้ผลอะไร">${esc(d.progress)}</textarea>${d.prevProgress ? `<span class="help">เดือนก่อน: ${esc(d.prevProgress.slice(0, 140))}${d.prevProgress.length > 140 ? '…' : ''}</span>` : ''}</div>
      <div class="field"><label class="lbl" for="r-problems">ปัญหาอุปสรรค</label><textarea id="r-problems" class="textarea" data-r="problems" placeholder="ปัญหา สาเหตุ และสิ่งที่ต้องการให้ผู้บริหารช่วย (ถ้ามี)">${esc(d.problems)}</textarea></div>
    </div>
    <div class="field"><span class="lbl">ไฟล์แนบ (PDF ไม่เกิน 10 MB)</span>
      <div class="att">${d.files.map((f, i) => `<span class="att-f">${ic('file', 'ic-sm')}<a href="/_blob/${esc(f.id)}" target="_blank" rel="noopener noreferrer">${esc(f.name)}</a><small>${(f.size / 1048576).toFixed(1)} MB</small><button type="button" class="icon-btn" data-act="att-del" data-v="${i}" aria-label="ลบไฟล์ ${esc(f.name)}">${ic('x', 'ic-sm')}</button></span>`).join('')}
      ${S.assets ? `<label class="btn btn-sm att-add">${ic('plus', 'ic-sm')}${S.attBusy ? 'กำลังอัปโหลด…' : 'แนบไฟล์ PDF'}<input type="file" id="r-file" accept="application/pdf,.pdf" hidden ${S.attBusy ? 'disabled' : ''}></label>` : '<span class="help">แนบไฟล์ได้เฉพาะผู้ที่ได้รับสิทธิ์ Editor ในแอปนี้ ติดต่อผู้ดูแลระบบ</span>'}</div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary" data-act="rep-save" data-v="${esc(p.id)}">${ic('check', 'ic-sm')}ส่งรายงาน</button><button class="btn" data-act="rep-close">ยกเลิก</button></div>
  </div>`;
}

function overviewRows() {
  const f = S.ovFilt, m = S.mon;
  return reportablePlans().filter((p) => (!f.unit || p.unitId === f.unit) && (!f.pillar || p.pillar === f.pillar))
    .map((p) => rowFor(p, m))
    .sort((a, b) => pillarIdx(a.p.pillar) - pillarIdx(b.p.pillar) || String(a.p.name).localeCompare(String(b.p.name), 'th'));
}
function overviewSum(rows) {
  const n = rows.length, sent = rows.filter((r) => r.sent).length;
  const by = (s) => rows.filter((r) => r.sent && r.status === s).length;
  const budget = rows.reduce((a, r) => a + r.budget, 0), spent = rows.reduce((a, r) => a + (r.spent || 0), 0);
  const withPlan = rows.filter((r) => r.plan != null && r.act != null);
  const avgPlan = withPlan.length ? Math.round(withPlan.reduce((a, r) => a + r.plan, 0) / withPlan.length) : null;
  const avgAct = withPlan.length ? Math.round(withPlan.reduce((a, r) => a + r.act, 0) / withPlan.length) : null;
  return { n, sent, done: by('done'), doing: by('doing'), todo: by('todo'), late: rows.filter((r) => r.late).length, budget, spent, disb: budget ? spent / budget : null, avgPlan, avgAct };
}
function viewOverview() {
  const C = cfg(), f = S.ovFilt;
  const rows = overviewRows(), s = overviewSum(rows);
  return `<section class="card filters" aria-label="ตัวกรอง">
      <div class="field"><label for="ov-unit" class="small muted">หน่วยงาน</label><select id="ov-unit" class="select" data-ov="unit"><option value="">ทุกหน่วยงาน</option>${visUnits().map((u) => `<option value="${esc(u.id)}" ${u.id === f.unit ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select></div>
      <div class="field"><label for="ov-pillar" class="small muted">ยุทธศาสตร์</label><select id="ov-pillar" class="select" data-ov="pillar"><option value="">ทุกยุทธศาสตร์</option>${C.pillars.map((p) => `<option value="${p.code}" ${p.code === f.pillar ? 'selected' : ''}>${p.num}. ${esc(p.code)} ${esc(p.name_en)}</option>`).join('')}</select></div></section>
    <section class="stats" aria-label="สรุปเดือน ${MONTHS[S.mon]}">
      <div class="stat"><span class="k">ส่งรายงานแล้ว</span><span class="v">${s.sent}<small>/ ${s.n}</small></span><span class="d">${s.n - s.sent ? `ยังไม่ส่ง ${s.n - s.sent} โครงการ` : 'ส่งครบทุกโครงการ'}</span></div>
      <div class="stat"><span class="k">สถานะ</span><span class="v">${s.done}<small>เสร็จ</small></span><span class="d">กำลังทำ ${s.doing} · ยังไม่ได้ทำ ${s.todo}</span></div>
      <div class="stat"><span class="k">ผลเทียบแผน (เฉลี่ย)</span><span class="v">${pctTxt(s.avgAct)}</span><span class="d">${s.avgPlan != null ? `แผน ${s.avgPlan}% · ` : ''}<span class="${s.late ? 'late-t' : ''}">ล่าช้า ${s.late} โครงการ</span></span></div>
      <div class="stat"><span class="k">เบิกจ่ายสะสม</span><span class="v">${mb(s.spent)}<small>/ ${mb(s.budget)} ล้านบาท</small></span><span class="d">เบิกจ่ายแล้ว ${disbTxt(s.disb)}</span></div>
    </section>
    ${rows.length ? `<div class="gov-wrap" id="gov-preview" aria-label="ตัวอย่างรายงาน"></div>` : `<div class="empty">${ic('chart')}<b>ไม่มีโครงการตามตัวกรองนี้</b></div>`}`;
}

/* ---------- PDF (multi-page, landscape A4) ---------- */
async function pdfFromPages(build, filename) {
  if (!S.dl) { toast('ดาวน์โหลดไฟล์ไม่ได้ในมุมมองนี้ ลองเปิดหน้านี้ใน claude.ai', 'err'); return; }
  S.pdfBusy = true; renderView();
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-14000px;top:0;width:1123px;z-index:-1';
  document.body.append(host);
  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    try { await document.fonts.ready; } catch (e) {}
    const pages = build(host);
    const pdf = new window.jspdf.jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
    for (let i = 0; i < pages.length; i++) {
      const c = await window.html2canvas(pages[i], { scale: 2, backgroundColor: '#ffffff', logging: false });
      if (i) pdf.addPage();
      pdf.addImage(c.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 297, 210);
    }
    await S.dl.save({ filename, data: pdf.output('blob') });
    toast('ดาวน์โหลด PDF แล้ว');
  } catch (e) {
    toast(e?.code === 'declined' ? 'ยกเลิกการดาวน์โหลด' : 'สร้าง PDF ไม่สำเร็จ ลองอีกครั้ง', 'err');
  } finally { host.remove(); S.pdfBusy = false; renderView(); }
}
function paginate(host, { first, cont, cols, rows, foot }) {
  const pages = []; let tbody;
  const add = (isFirst) => {
    const pg = document.createElement('div'); pg.className = 'pg';
    pg.innerHTML = (isFirst ? first : cont) + `<table class="rtbl">${cols}<tbody></tbody></table><div class="pg-foot"><span>${esc(foot)}</span><span class="pn"></span></div>`;
    host.append(pg); pages.push(pg); tbody = pg.querySelector('tbody');
  };
  add(true);
  const limit = 794 - 40;
  rows.forEach((html) => {
    tbody.insertAdjacentHTML('beforeend', html);
    const tbl = tbody.closest('table');
    if (tbl.offsetTop + tbl.offsetHeight > limit && tbody.rows.length > 1) { const last = tbody.lastElementChild; last.remove(); add(false); tbody.append(last); }
  });
  pages.forEach((pg, i) => { pg.querySelector('.pn').textContent = `หน้า ${i + 1} / ${pages.length}`; });
  return pages;
}
const thDate = () => new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
const rsTag = (r) => (r.sent ? `<span class="rs rs-${r.status}">${RSTAT[r.status]}</span>` : '<span class="rs rs-none">ยังไม่ส่ง</span>') + (r.late ? ' <span class="rs rs-late">ล่าช้า</span>' : '');

/* ---------- Government-style progress report (A4 landscape) ---------- */
const MFULL = ['ตุลาคม', 'พฤศจิกายน', 'ธันวาคม', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน'];
const FY = 2570;
const beOf = (m) => (m < 3 ? FY - 1 : FY);
const lastDay = (m) => new Date(beOf(m) - 543, ((m + 9) % 12) + 1, 0).getDate();
const periodLong = (m) => `1 ตุลาคม ${FY - 1} - ${lastDay(m)} ${MFULL[m]} ${beOf(m)}`;
const periodShort = (m) => `1 ต.ค. ${String(FY - 1).slice(2)} - ${lastDay(m)} ${MONTHS[m].split(' ')[0]} ${String(beOf(m)).slice(2)}`;
const planSpan = (p) => { const s0 = Number(p.startYear || FY), d = Number(p.duration || 1); return `1 ต.ค. ${String(s0 - 1).slice(2)} - 30 ก.ย. ${String(s0 + d - 1).slice(2)}`; };
const isStrategic = (p) => p.category === 'flagship';
function govRows(rows, m) {
  return rows.map((R, i) => {
    const p = R.p, pil = p.pillar || '', last = R.last;
    const unitShort = unitName(p.unitId);
    const prog = last?.progress ? esc(last.progress) : '<span class="g-m">ยังไม่รายงานผล</span>';
    const budget = Number(p.budget || 0);
    const money2 = (v) => Number(v).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const bud = budget ? `<td class="r">${money2(budget)}</td><td class="r">${R.spent != null ? money2(R.spent) : '-'}</td>` : '<td colspan="2" class="c">ไม่มีงบประมาณที่ใช้<br>ในการดำเนินงาน</td>';
    return `<tr><td class="c">${i + 1}</td><td class="c"><b>${esc(pil)}</b>${p.strategy ? `<br>${esc(p.strategy)}` : ''}</td><td>${esc(p.name)}<br>(${esc(unitShort)})</td><td class="c">${planSpan(p)}</td><td>${prog}</td><td class="c">${R.act == null ? '-' : R.act + '%'}</td>${bud}<td class="c">${R.problems ? esc(R.problems) : '-ไม่มี-'}</td></tr>`;
  });
}
function govHead(m, rows) {
  const n = rows.length, a = rows.filter((r) => isStrategic(r.p)).length;
  return `<div class="g-title"><b>แผนและความก้าวหน้าในการดำเนินงานและการใช้งบประมาณ ประจำปีงบประมาณ พ.ศ. ${FY}</b><b>โครงการตามแผนยุทธศาสตร์และแผนปฏิบัติการกรมสรรพสามิต</b><b>รอบ ${m + 1} เดือน (${periodLong(m)})</b><b>จำนวน ${n} โครงการ (โครงการยุทธศาสตร์ จำนวน ${a} โครงการ และแผนปฏิบัติการ จำนวน ${n - a} โครงการ)</b></div>`;
}
function govCols(m) {
  return `<colgroup><col style="width:4.5%"><col style="width:8%"><col style="width:16%"><col style="width:9.5%"><col style="width:22%"><col style="width:7%"><col style="width:10%"><col style="width:10%"><col style="width:13%"></colgroup>
  <thead><tr><th rowspan="2">ลำดับ<br>ที่</th><th rowspan="2">ยุทธศาสตร์<br>BALANCE</th><th rowspan="2">โครงการ</th><th rowspan="2">ระยะเวลาดำเนินการ</th><th rowspan="2">ผลการดำเนินงาน รอบ ${m + 1} เดือน<br>(${periodShort(m)})</th><th rowspan="2">ร้อยละ<br>ความสำเร็จ</th><th colspan="2">ผลการใช้จ่ายงบประมาณ (บาท)</th><th rowspan="2">ปัญหา/<br>อุปสรรค</th></tr>
  <tr><th>ที่ได้รับ</th><th>ที่ใช้จริง</th></tr></thead>`;
}
function govPaginate(host, m, rows) {
  const pages = []; let tbody;
  const add = (first) => {
    const pg = document.createElement('div'); pg.className = 'pg gov';
    pg.innerHTML = `<div class="g-pn"></div>${first ? govHead(m, rows) : ''}<table class="g-tbl">${govCols(m)}<tbody></tbody></table>`;
    host.append(pg); pages.push(pg); tbody = pg.querySelector('tbody');
  };
  add(true);
  govRows(rows, m).forEach((html) => {
    tbody.insertAdjacentHTML('beforeend', html);
    const tbl = tbody.closest('table');
    if (tbl.offsetTop + tbl.offsetHeight > 794 - 36 && tbody.rows.length > 1) { const last = tbody.lastElementChild; last.remove(); add(false); tbody.append(last); }
  });
  pages.forEach((pg, i) => { pg.querySelector('.g-pn').textContent = `- ${i + 1} -`; });
  return pages;
}
function govPreview() {
  const box = $('#gov-preview'); if (!box) return;
  box.innerHTML = '';
  const rows = overviewRows(); if (!rows.length) return;
  govPaginate(box, S.mon, rows);
}
function planPdf(p) {
  const m = S.mon == null ? curFm() : S.mon;
  const name = String(p.name).replace(/[\\/:*?"<>|]/g, '').slice(0, 60);
  pdfFromPages((host) => govPaginate(host, m, [rowFor(p, m)]), `รายงานผล-${name}-${MONTHS[m].replace(' ', '')}.pdf`);
}
function overviewPdf(m, rows) {
  if (m == null) m = S.mon;
  rows = rows || overviewRows();
  if (!rows.length) { toast('ไม่มีโครงการตามตัวกรองนี้', 'err'); return; }
  pdfFromPages((host) => govPaginate(host, m, rows), `ความก้าวหน้าโครงการ-รอบ${m + 1}เดือน-${MONTHS[m].replace(' ', '')}.pdf`);
}
function dashPdf(m) {
  const unit = S.filt.unit;
  const rows = reportablePlans().filter((p) => !unit || p.unitId === unit).map((p) => rowFor(p, m))
    .sort((a, b) => pillarIdx(a.p.pillar) - pillarIdx(b.p.pillar) || String(a.p.name).localeCompare(String(b.p.name), 'th'));
  overviewPdf(m, rows);
}

/* ---------- Users (super admin) ---------- */
function viewUsers() {
  if (!S.isSuper) return `<div class="empty">${ic('lock')}<b>เฉพาะ Super admin</b></div>`;
  const list = Object.entries(S.accounts).map(([id, a]) => Object.assign({ id }, a)).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const units = cfg().units;
  return `<div class="ph"><div class="ph-t"><h1>จัดการผู้ใช้</h1><span class="sub">${list.length} บัญชี · รหัสผ่านเก็บแบบเข้ารหัสทางเดียว ผู้ดูแลจึงไม่เห็นรหัสผ่านจริง</span></div>
    <button class="btn" data-act="u-csv" ${list.length ? '' : 'disabled'}>${ic('download', 'ic-sm')}ส่งออก CSV</button></div>
  <input class="input" id="u-q" type="search" placeholder="ค้นหาชื่อ ชื่อผู้ใช้ อีเมล หรือหน่วยงาน" aria-label="ค้นหาผู้ใช้" style="max-width:420px">
  ${list.length ? `<div class="card tbl-wrap"><table class="tbl" id="u-tbl"><thead><tr><th>ชื่อ</th><th>ชื่อผู้ใช้</th><th>หน่วยงาน</th><th>อีเมล</th><th>เบอร์ติดต่อ</th><th>สมัครเมื่อ</th><th class="r">แผน</th><th>รหัสผ่าน</th><th><span class="sr">จัดการ</span></th></tr></thead><tbody>
    ${list.map((a) => `<tr data-q="${esc([a.name, a.username, a.email, unitName(a.unitId)].join(' ').toLowerCase())}"><td style="min-width:160px"><b style="font-weight:500">${esc(a.name)}</b>${a.id === S.uid ? ' <span class="chip chip-accent">คุณ · Super admin</span>' : ''}</td><td class="mono">${esc(a.username)}</td>
      <td style="min-width:200px"><select class="select" data-uunit="${esc(a.id)}" aria-label="หน่วยงานของ ${esc(a.name)}">${units.map((u) => `<option value="${esc(u.id)}" ${u.id === a.unitId ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select></td>
      <td>${esc(a.email || '—')}</td><td class="num">${esc(a.phone || '—')}</td><td class="num">${a.createdAt ? new Date(a.createdAt).toLocaleDateString('th-TH') : '—'}</td><td class="r">${S.plans.filter((p) => p.ownerId === a.id && p.name).length}</td>
      <td><span class="chip">${ic('lock', 'ic-sm')}เข้ารหัสแล้ว</span></td>
      <td>${a.id === S.uid ? '' : S.confirmAcct === a.id ? `<span class="confirm" style="flex-wrap:nowrap">ยกเลิก?<button class="btn btn-sm btn-danger" data-act="u-cancel-yes" data-v="${esc(a.id)}">ยืนยัน</button><button class="btn btn-sm" data-act="u-cancel-no">ไม่</button></span>` : `<button class="btn btn-sm btn-ghost btn-danger" data-act="u-cancel" data-v="${esc(a.id)}">ยกเลิกบัญชี</button>`}</td></tr>`).join('')}
  </tbody></table></div>` : `<div class="empty">${ic('user')}<b>ยังไม่มีผู้สมัครใช้งาน</b></div>`}
  <p class="help">ยกเลิกบัญชีแล้ว ผู้ใช้สมัครใหม่ได้ด้วยบัญชี Claude เดิม และแผนที่เคยสร้างจะกลับมาเป็นของเขา</p>`;
}
function usersCsv() {
  const head = ['ชื่อ', 'ชื่อผู้ใช้', 'หน่วยงาน', 'อีเมล', 'เบอร์ติดต่อ', 'วันที่สมัคร', 'จำนวนแผน'];
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = Object.entries(S.accounts).map(([id, a]) => [a.name, a.username, unitName(a.unitId), a.email, a.phone, a.createdAt ? new Date(a.createdAt).toLocaleDateString('th-TH') : '', S.plans.filter((p) => p.ownerId === id && p.name).length].map(q).join(','));
  S.dl.save({ filename: 'ผู้ใช้-BALANCE-Planner.csv', data: '﻿' + [head.map(q).join(','), ...lines].join('\r\n') }).catch((e) => { if (e?.code !== 'declined') toast('ส่งออกไม่สำเร็จ', 'err'); });
}

/* ---------- Knowledge hub ---------- */
function viewHub() {
  const url = cfg().hubUrl;
  return `<div class="ph"><div class="ph-t"><h1>Strategic &amp; ERM Knowledge Hub</h1><span class="sub">คลังความรู้ด้านยุทธศาสตร์และการบริหารความเสี่ยงของกรม</span></div></div>
  ${url ? `<section class="card hub"><h2>เปิด Knowledge Hub</h2><span class="url">${esc(url)}</span>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn-primary" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${ic('external', 'ic-sm')}เปิดในแท็บใหม่</a><button class="btn" data-act="copy-hub">${ic('copy', 'ic-sm')}คัดลอกลิงก์</button></div></section>`
    : `<div class="empty">${ic('book')}<b>ยังไม่ได้ใส่ลิงก์ Knowledge Hub</b>${S.isSuper ? `<span>ใส่ลิงก์ได้ที่ตั้งค่าทั่วไป › ลิงก์ Knowledge Hub</span><button class="btn" data-act="hub-setup">ไปใส่ลิงก์</button>` : '<span>ผู้ดูแลระบบจะเพิ่มลิงก์เร็วๆ นี้</span>'}</div>`}`;
}

/* ---------- AI context for monthly ---------- */
function monthlyAiLines() {
  const m = S.mon == null ? curFm() : S.mon, rows = overviewRows(), s = overviewSum(rows);
  return [`รายงานผลเดือน ${MONTHS[m]}: ส่งแล้ว ${s.sent}/${s.n}, เสร็จ ${s.done}, กำลังทำ ${s.doing}, ยังไม่ทำ ${s.todo}, ล่าช้า ${s.late}, ผลเฉลี่ย ${pctTxt(s.avgAct)} เทียบแผน ${pctTxt(s.avgPlan)}, เบิกจ่าย ${money(s.spent)}/${money(s.budget)} บาท`,
    'รายโครงการ: ' + rows.slice(0, 60).map((r) => `${r.p.name} [${unitName(r.p.unitId)}; ${r.sent ? RSTAT[r.status] : 'ยังไม่ส่ง'}; แผน ${pctTxt(r.plan)} ผล ${pctTxt(r.act)}; เบิกจ่าย ${r.spent != null ? money(r.spent) : '-'}/${money(r.budget)}; ปัญหา: ${(r.problems || '-').slice(0, 160)}]`).join(' | ')];
}

/* ---------- Events ---------- */
document.addEventListener('mouseover', (e) => {
  const t = e.target.closest?.('.rk2 [data-rk], .prk [data-rk]');
  const box = e.target.closest?.('.rk2, .prk');
  if (!box) return;
  $$('.hl', box).forEach((x) => x.classList.remove('hl'));
  if (t) $$(`[data-rk="${t.dataset.rk}"]`, box).forEach((x) => x.classList.add('hl'));
});
document.addEventListener('click', (e) => {
  const info = e.target.closest('[data-act="kpi-info"]');
  $$('.kc.pop-open, .kt.pop-open').forEach((c) => { if (!info || c !== info.closest('.kc, .kt')) { c.classList.remove('pop-open'); c.querySelector('.kc-info, .kt-info')?.setAttribute('aria-expanded', 'false'); } });
  if (info) { const c = info.closest('.kc, .kt'); const on = c.classList.toggle('pop-open'); info.setAttribute('aria-expanded', on); }
});
document.addEventListener('click', async (e) => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const a = t.dataset.act, v = t.dataset.v;
  if (a === 'acct-cancel') {
    try { await cancelAccount(S.uid); S.account = null; S.profile = null; ss.del('bp_in'); S.authMode = 'signup'; S.authMsg = 'ยกเลิกบัญชีเดิมแล้ว สมัครใช้งานใหม่ได้เลย'; S.authErr = {}; renderAuth(); }
    catch (er) { toast('ยกเลิกบัญชีไม่สำเร็จ ติดต่อผู้ดูแลระบบ', 'err'); }
  } else if (a === 'rep-tab') { S.repTab = v; S.repOpen = null; renderView(); }
  else if (a === 'rep-mon') { S.mon = Number(v); S.repOpen = null; renderView(); }
  else if (a === 'rep-scope') { S.repScope = v; S.repOpen = null; renderView(); }
  else if (a === 'rep-open') { S.repOpen = v; renderView(); document.getElementById('rep-' + v)?.scrollIntoView({ block: 'nearest' }); }
  else if (a === 'rep-close') { if (S.repOpen) { const p = S.plans.find((x) => x.id === S.repOpen); if (p) delete S.repDraft[repId(p, S.mon)]; } S.repOpen = null; renderView(); }
  else if (a === 'rep-status') { const p = S.plans.find((x) => x.id === S.repOpen); const d = repDraftFor(p, S.mon); d.status = v; $$('.rep-form [data-act="rep-status"]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === v)); }
  else if (a === 'rep-save') {
    const p = S.plans.find((x) => x.id === v); const d = repDraftFor(p, S.mon);
    if (!d.progress.trim()) { toast('กรอกผลความก้าวหน้าก่อนส่ง', 'err'); $('#r-progress')?.focus(); return; }
    const doc = { planId: p.id, m: S.mon, status: d.status, steps: d.steps, pct: d.pct === '' ? null : Number(d.pct), spent: d.spent === '' || d.spent == null ? null : Number(d.spent), progress: d.progress.trim(), problems: d.problems.trim(), files: d.files, by: S.uid, byName: S.profile?.name || '', at: Date.now() };
    try { await S.db.doc('reports/' + repId(p, S.mon)).set(doc); S.reports[repId(p, S.mon)] = doc; delete S.repDraft[repId(p, S.mon)]; S.repOpen = null; toast('ส่งรายงานแล้ว'); renderNav(); renderView(); }
    catch (er) { toast('ส่งรายงานไม่สำเร็จ บัญชีนี้อาจไม่มีสิทธิ์แก้ไข', 'err'); }
  } else if (a === 'rep-pdf') { const p = S.plans.find((x) => x.id === v); if (p) planPdf(p); }
  else if (a === 'ov-pdf') overviewPdf();
  else if (a === 'dash-pdf') dashPdf(Number(v));
  else if (a === 'att-del') { const p = S.plans.find((x) => x.id === S.repOpen); const d = repDraftFor(p, S.mon); d.files.splice(Number(v), 1); renderView(); }
  else if (a === 'go-setup-tab') { S.setupTab = v; go('setup'); }
  else if (a === 'u-cancel') { S.confirmAcct = v; renderView(); }
  else if (a === 'u-cancel-no') { S.confirmAcct = null; renderView(); }
  else if (a === 'u-cancel-yes') { S.confirmAcct = null; try { await cancelAccount(v); toast('ยกเลิกบัญชีแล้ว'); } catch (er) { toast('ยกเลิกบัญชีไม่สำเร็จ', 'err'); } }
  else if (a === 'u-csv') usersCsv();
  else if (a === 'copy-hub') { const u = cfg().hubUrl; try { await navigator.clipboard.writeText(u); toast('คัดลอกลิงก์แล้ว'); } catch (er) { const el = $('.hub .url'); if (el) { const r = document.createRange(); r.selectNodeContents(el); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); } toast('เลือกลิงก์ไว้แล้ว กดคัดลอกได้เลย'); } }
  else if (a === 'hub-setup') { S.setupTab = 'links'; go('setup'); }
});
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'u-q') { const q = t.value.trim().toLowerCase(); $$('#u-tbl tbody tr').forEach((tr) => { tr.hidden = q && !tr.dataset.q.includes(q); }); return; }
  if (!t.dataset.r || !S.repOpen) return;
  const p = S.plans.find((x) => x.id === S.repOpen); const d = repDraftFor(p, S.mon); const f = t.dataset.r;
  if (f.startsWith('steps.')) { d.steps[Number(f.split('.')[1])] = t.checked; const h = t.closest('.field').querySelector('.help'); const plan = plannedPct(p, S.mon); if (h) h.textContent = `ผล ${20 * d.steps.filter(Boolean).length}%${plan != null ? ` · ตามแผนควรถึง ${plan}% ภายใน${MONTHS[S.mon]}` : ''}`; return; }
  if (f === 'spent') { const digits = t.value.replace(/[^\d]/g, ''); d.spent = digits === '' ? '' : Number(digits); t.value = digits === '' ? '' : money(d.spent); return; }
  d[f] = t.value;
});
document.addEventListener('change', async (e) => {
  const t = e.target;
  if (t.id === 'r-file') {
    const file = t.files && t.files[0]; t.value = '';
    if (!file) return;
    if (!/pdf$/i.test(file.type) && !/\.pdf$/i.test(file.name)) { toast('แนบได้เฉพาะไฟล์ PDF', 'err'); return; }
    if (file.size > 10 * 1048576) { toast('ไฟล์ใหญ่เกิน 10 MB', 'err'); return; }
    const p = S.plans.find((x) => x.id === S.repOpen); const d = repDraftFor(p, S.mon);
    S.attBusy = true; renderView();
    try { const r = await S.assets.upload(file); d.files.push({ id: r.id, name: file.name, size: r.sizeBytes || file.size }); toast('แนบไฟล์แล้ว กดส่งรายงานเพื่อบันทึก'); }
    catch (er) { toast(er?.code === 'quota_exceeded' ? 'พื้นที่เก็บไฟล์เต็ม' : 'อัปโหลดไม่สำเร็จ', 'err'); }
    S.attBusy = false; renderView(); return;
  }
  if (t.dataset.ov) { S.ovFilt[t.dataset.ov] = t.value; renderView(); return; }
  if (t.dataset.r && S.repOpen && (t.type === 'checkbox' || t.tagName === 'SELECT')) { t.dispatchEvent(new Event('input', { bubbles: true })); return; }
  if (t.dataset.uunit) {
    const id = t.dataset.uunit;
    try { await S.db.doc('accounts/' + id).update({ unitId: t.value }); await S.db.doc('profiles/' + id).update({ unitId: t.value }); toast('เปลี่ยนหน่วยงานแล้ว'); }
    catch (er) { toast('เปลี่ยนหน่วยงานไม่สำเร็จ', 'err'); }
  }
});
syncThemeBtn();
boot();
