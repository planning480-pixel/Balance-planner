/* ===================== ภาพรวมยุทธศาสตร์: 18 กลยุทธ์ (การ์ด / ตาราง) ===================== */
const SO_YEARS = [2570, 2571, 2572, 2573, 2574];
const SO_ST = [
  { k: 'done', t: 'เสร็จแล้ว', c: '#1D9152' },
  { k: 'ontrack', t: 'ตามแผน', c: '#2360E0' },
  { k: 'late', t: 'ล่าช้ากว่าแผน', c: '#D9363E' },
  { k: 'todo', t: 'ยังไม่เริ่ม / ยังไม่รายงาน', c: '#C3CBD8' }
];
const soState = () => (S.so = Object.assign({ view: 'card', year: 2570, p: '' }, S.so || {}));
const bahtFull = (v) => Number(v || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 });

function soRows(y) {
  const unit = S.route === 'dashboard' ? S.filt?.unit : '';
  const m = typeof curFm === 'function' ? curFm() : 0;
  return S.plans.filter((p) => p.name && p.status !== 'draft' && planInYear(p, y) && (!unit || p.unitId === unit))
    .map((p) => {
      const R = rowFor(p, m);
      const k = R.status === 'done' ? 'done' : R.late ? 'late' : (R.status === 'doing' || (R.act || 0) > 0) ? 'ontrack' : 'todo';
      return Object.assign(R, { k });
    });
}
function soGroups(y) {
  const C = cfg(), rows = soRows(y), pf = soState().p;
  return C.strategies.filter((s) => !pf || s.pillar === pf).map((s) => {
    const rs = rows.filter((r) => r.p.strategy === s.code);
    const cnt = Object.fromEntries(SO_ST.map((x) => [x.k, rs.filter((r) => r.k === x.k).length]));
    const budget = rs.reduce((a, r) => a + (r.budget || 0), 0);
    const spent = rs.reduce((a, r) => a + (r.spent || 0), 0);
    return { s, rs, cnt, budget, spent, col: PCOL[s.pillar] || '#1A5BD6' };
  });
}

function soCard(g) {
  const n = g.rs.length;
  const bar = n ? SO_ST.map((x) => g.cnt[x.k] ? `<i style="flex:${g.cnt[x.k]};background:${x.c}" title="${x.t} ${g.cnt[x.k]}"></i>` : '').join('') : '<i style="flex:1;background:var(--line)"></i>';
  return `<button type="button" class="so-card" data-act="go" data-v="p-${esc(g.s.pillar)}" style="--pc:${g.col}" title="ดูเสา ${esc(g.s.pillar)}">
    <span class="so-h"><span class="so-dot">${esc(g.s.code)}</span><span class="so-tt"><b>${esc(g.s.name)}</b><small>${n ? `${n} โครงการ` : 'ยังไม่มีโครงการ'}</small></span></span>
    <span class="so-bar">${bar}</span>
    <span class="so-lg">${SO_ST.map((x) => `<span title="${x.t}"><i style="background:${x.c}"></i>${g.cnt[x.k]}</span>`).join('')}</span>
    <span class="so-bd"><span>งบประมาณ</span><b class="num">${bahtFull(g.budget)}</b><small>บาท</small>${g.budget ? `<em>เบิกจ่าย ${((g.spent / g.budget) * 100).toFixed(0)}%</em>` : ''}</span>
  </button>`;
}

function soSteps(r) {
  const st = (r.p.steps || []).slice(0, 5), done = (r.last?.steps || []);
  return `<span class="so-steps">${[0, 1, 2, 3, 4].map((i) => { const s = st[i]; const has = s && s.name; const ok = !!done[i];
    return `<i class="${ok ? 'ok' : has ? 'pl' : ''}" title="ขั้นที่ ${i + 1}${has ? ': ' + esc(String(s.name).trim()) : ''}${ok ? ' (เสร็จ)' : ''}">${i + 1}</i>`; }).join('')}</span>`;
}
const soClip = (t, n = 90) => { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n) + '…' : t; };

function soTable(gs) {
  const body = gs.map((g) => {
    const head = `<tr class="so-gr" style="--pc:${g.col}"><td colspan="7"><span class="so-dot">${esc(g.s.code)}</span><b>${esc(g.s.name)}</b><span class="muted small">${g.rs.length} โครงการ · งบ ${bahtFull(g.budget)} บาท</span></td></tr>`;
    if (!g.rs.length) return head + `<tr><td colspan="7" class="muted small so-none">ยังไม่มีโครงการในปีที่เลือก</td></tr>`;
    return head + g.rs.map((r) => {
      const st = SO_ST.find((x) => x.k === r.k);
      return `<tr>
        <td class="so-pn"><a href="#report-${esc(r.p.id)}">${esc(r.p.name)}</a><small>${esc(unitName(r.p.unitId))}</small></td>
        <td>${soSteps(r)}</td>
        <td class="so-tx" title="${esc(r.p.output12 || r.p.output6 || '')}">${esc(soClip(r.p.output12 || r.p.output6) || '—')}</td>
        <td class="so-tx" title="${esc(r.p.outcome12 || '')}">${esc(soClip(r.p.outcome12) || '—')}</td>
        <td class="num"><b>${r.act == null ? '—' : r.act + '%'}</b>${r.plan != null ? `<small>แผน ${r.plan}%</small>` : ''}</td>
        <td><span class="so-chip" style="--sc:${st.c}">${st.t}</span></td>
        <td class="num">${bahtFull(r.budget)}${r.disb != null ? `<small>เบิก ${(r.disb * 100).toFixed(0)}%</small>` : ''}</td></tr>`;
    }).join('');
  }).join('');
  return `<div class="so-tw"><table class="tbl so-tbl"><thead><tr><th>โครงการ</th><th>ขั้นตอน 1–5</th><th>Output</th><th>Outcome</th><th class="num">Progress</th><th>สถานะ</th><th class="num">งบประมาณ (บาท)</th></tr></thead><tbody>${body}</tbody></table></div>`;
}

function stratOverview() {
  const o = soState(), C = cfg(), gs = soGroups(o.year);
  const tot = gs.reduce((a, g) => { a.n += g.rs.length; a.b += g.budget; SO_ST.forEach((x) => { a[x.k] = (a[x.k] || 0) + g.cnt[x.k]; }); return a; }, { n: 0, b: 0 });
  const tools = `<div class="so-tools">
    <label class="so-y"><span>ปีงบประมาณ</span><select class="select" data-so="year">${SO_YEARS.map((y) => `<option value="${y}" ${y === o.year ? 'selected' : ''}>${y}</option>`).join('')}</select></label>
    <div class="seg seg-sm" role="group" aria-label="เลือกเสา">${[['', 'ทุกเสา'], ...C.pillars.map((p) => [p.code, p.code])].map(([c, l]) => `<button type="button" data-so-p="${c}" aria-pressed="${o.p === c}" ${c ? `data-p="${c}"` : ''}>${l}</button>`).join('')}</div>
    <span class="so-sum muted small">${tot.n} โครงการ · งบ ${bahtFull(tot.b)} บาท</span>
    <div class="seg seg-sm so-view" role="group" aria-label="รูปแบบการแสดงผล"><button type="button" data-so-v="card" aria-pressed="${o.view === 'card'}">${ic('grid', 'ic-sm')}การ์ด</button><button type="button" data-so-v="table" aria-pressed="${o.view === 'table'}">${ic('layers', 'ic-sm')}ตาราง</button></div>
  </div>
  <div class="so-legend">${SO_ST.map((x) => `<span><i style="background:${x.c}"></i>${x.t} <b>${tot[x.k] || 0}</b></span>`).join('')}</div>`;
  const pils = C.pillars.map((pl) => pl.code).filter((c) => gs.some((g) => g.s.pillar === c));
  const body = o.view === 'table' ? soTable(gs) : `<div class="so-rows">${pils.map((c) => `<div class="so-grid">${gs.filter((g) => g.s.pillar === c).map(soCard).join('')}</div>`).join('')}</div>`;
  return `<div class="so" id="so">${tools}${body}</div>`;
}
function soRerender() { const el = $('#so'); if (el) el.outerHTML = stratOverview(); }
document.addEventListener('click', (e) => {
  const v = e.target.closest('[data-so-v]'), p = e.target.closest('[data-so-p]');
  if (v) { soState().view = v.dataset.soV; soRerender(); }
  else if (p) { soState().p = p.dataset.soP; soRerender(); }
});
document.addEventListener('change', (e) => { if (e.target.dataset?.so === 'year') { soState().year = Number(e.target.value); soRerender(); } });
