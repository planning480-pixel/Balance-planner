/* ===================== ข้อมูลรายได้จริง (ops-real.json) =====================
   ทั้งประเทศรายสินค้า + รายภาค จากรายงานสถิติของสำนักแผนภาษี
   รายภาค×สินค้า และรายจังหวัด เป็นค่าประมาณ (ปรับสัดส่วนให้ยอดรวมภาคและยอดรวมสินค้าตรงข้อมูลจริง) */
const RP = ['น้ำมัน', 'รถยนต์', 'เบียร์', 'สุรา', 'ยาสูบ', 'เครื่องดื่ม', 'อื่นๆ'];
const realFy = (fy) => S.real?.fy?.[String(fy)] || null;
const realMonth = (fy, m) => realFy(fy)?.m?.[String(m)] || null;
const realHasAct = (R) => !!R && Object.values(R.nat || {}).some((v) => v[0] != null);
function loadReal() {
  fetch('ops-real.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((j) => {
    if (!j?.fy) return; S.real = j; S.realV = j.updatedAt || '1'; MD_CACHE = {}; PD_CACHE = { key: '', d: null };
    if (S.inApp) renderView();
  }).catch(() => {});
}
/* iterative proportional fitting: seed[region][prod] → matches row (region) and column (product) totals */
function ras(seed, rowM, colM) {
  const G = Object.keys(rowM), P = RP.filter((p) => (colM[p] || 0) > 0 || G.some((g) => (seed[g]?.[p] || 0) > 0));
  const X = {}; const colT = P.reduce((s, p) => s + (colM[p] || 0), 0) || 1;
  G.forEach((g) => { X[g] = {}; const rs = P.reduce((s, p) => s + (seed[g]?.[p] || 0), 0); P.forEach((p) => { X[g][p] = rs > 0 ? (seed[g]?.[p] || 0) : (colM[p] || 0) / colT; }); });
  for (let it = 0; it < 60; it++) {
    G.forEach((g) => { const s = P.reduce((a, p) => a + X[g][p], 0); const f = s > 0 ? (rowM[g] || 0) / s : 0; P.forEach((p) => { X[g][p] *= f; }); });
    P.forEach((p) => { const s = G.reduce((a, g) => a + X[g][p], 0); const f = s > 0 ? (colM[p] || 0) / s : 0; G.forEach((g) => { X[g][p] *= f; }); });
  }
  return X;
}
/* real revenue for one month in the app's {prov, pp} shape (Bangkok as one province; splitBkk runs after) */
function realRevenue(fy, m, base) {
  const R = realMonth(fy, m); if (!R) return null;
  const F = realFy(fy), seed = F.seed || realFy(2569)?.seed || {};
  const hasA = realHasAct(R), hasT = Object.values(R.nat || {}).some((v) => v[1] != null);
  const regs = REGIONS.filter((g) => R.reg?.[g]);
  const col = (j) => Object.fromEntries(RP.map((p) => [p, Number(R.nat?.[p]?.[j] || 0)]));
  const row = (j) => Object.fromEntries(regs.map((g) => [g, Number(R.reg[g][j] || 0)]));
  const A = hasA ? ras(seed, row(0), col(0)) : null, T = hasT ? ras(seed, row(1), col(1)) : null;
  const tpl = S.ops?.months?.[String(tmplMonth()?.m ?? 0)]?.revenue || {};
  const out = { prov: {}, pp: {} };
  regs.forEach((g) => {
    const provs = regionProvs(g);
    RP.forEach((p) => {
      const av = A?.[g]?.[p] || 0, tv = T?.[g]?.[p] || 0; if (!av && !tv) return;
      let w = provs.map((pv) => Number(tpl.pp?.[pv]?.[p]?.[1] || tpl.pp?.[pv]?.[p]?.[0] || 0));
      if (!w.some((x) => x > 0)) w = provs.map((pv) => Number(tpl.prov?.[pv]?.[1] || tpl.prov?.[pv]?.[0] || 0));
      if (!w.some((x) => x > 0)) w = provs.map(() => 1);
      const ws = w.reduce((a, b) => a + b, 0);
      provs.forEach((pv, i) => {
        const k = w[i] / ws; if (!k) return;
        const bt = base?.pp?.[pv]?.[p]?.[1];
        out.pp[pv] = out.pp[pv] || {};
        out.pp[pv][p] = [hasA ? av * k : null, hasT ? tv * k : (bt ?? 0)];
      });
    });
  });
  Object.entries(out.pp).forEach(([pv, ob]) => { out.prov[pv] = Object.values(ob).reduce((s, x) => [x[0] == null ? s[0] : (s[0] || 0) + x[0], s[1] + (x[1] || 0)], [hasA ? 0 : null, 0]); });
  return out;
}
/* national sums for the selected months: actual, dept target, MOF target */
function realSums(fy, months, prod) {
  let a = 0, t = 0, mof = 0, ok = false;
  months.forEach((m) => { const R = realMonth(fy, m); if (!R) return; ok = true;
    Object.entries(R.nat || {}).forEach(([p, v]) => { if (prod && p !== prod) return; a += Number(v[0] || 0); t += Number(v[1] || 0); mof += Number(v[2] || 0); }); });
  return ok ? { a, t, mof } : null;
}
const rlPct = (x) => (x == null || !isFinite(x) ? '—' : `${x >= 0 ? '+' : ''}${x.toFixed(1)}%`);
const pTone = (x) => (x == null ? 'none' : x >= 0 ? 'ok' : x >= -2 ? 'warn' : 'bad');
/* MOF line for the revenue card (national scope only) */
function mofLine(sel) {
  if (!S.real || S.opsRegion || S.opsProv || isGrowth(sel.p)) return '';
  const r = realSums(sel.fy, sel.months, S.opsProd || ''); if (!r || !r.mof || !r.a) return '';
  return ` · กระทรวงฯ ${fmtM(r.mof)} (${rlPct((r.a / r.mof - 1) * 100)})`;
}

/* product rows for one fiscal year: actual, previous year, dept target, MOF target (lines = months reported) */
function realRows(fy) {
  const F = realFy(fy), L = F?.lines || []; if (!L.length) return null;
  const grp = (n) => (n <= 6 ? RP[n - 1] : 'อื่นๆ');
  const rows = RP.map((p) => { const ls = L.filter((x) => grp(x.n) === p); const s = (k) => ls.reduce((a, x) => a + Number(x[k] || 0), 0); return { p, a: s('a'), prev: s('prev'), t: s('tDept'), mof: s('tMof') }; });
  const tot = rows.reduce((o, r) => ({ a: o.a + r.a, prev: o.prev + r.prev, t: o.t + r.t, mof: o.mof + r.mof }), { a: 0, prev: 0, t: 0, mof: 0 });
  return { rows, tot, ins: S.real?.insights?.[fy] || null };
}

/* ---------- BA: ผลรายสินค้า + Insight ---------- */
function realPanel() {
  if (!S.real?.insights) return '';
  const yrs = Object.keys(S.real.insights).sort();
  const fy = S.realFy && S.real.insights[S.realFy] ? S.realFy : yrs[yrs.length - 1];
  const I = S.real.insights[fy], F = realFy(fy), L = F?.lines || [];
  const grp = (n) => (n <= 6 ? RP[n - 1] : 'อื่นๆ');
  const rows = RP.map((p) => { const ls = L.filter((x) => grp(x.n) === p); const s = (k) => ls.reduce((a, x) => a + Number(x[k] || 0), 0);
    return { p, a: s('a'), prev: s('prev'), t: s('tDept'), mof: s('tMof'), ls }; });
  const tot = rows.reduce((o, r) => ({ a: o.a + r.a, prev: o.prev + r.prev, t: o.t + r.t, mof: o.mof + r.mof }), { a: 0, prev: 0, t: 0, mof: 0 });
  const pc = (a, b) => (b ? (a / b - 1) * 100 : null);
  const cell = (x) => `<td class="num"><span class="rl-p rl-${pTone(x)}">${rlPct(x)}</span></td>`;
  const sub = (r) => r.p !== 'อื่นๆ' ? '' : `<div class="rl-sub">${r.ls.filter((x) => x.a >= 200).sort((x, y) => y.a - x.a).slice(0, 4).map((x) => `<span>${esc(x.name.replace(/^ภาษี/, ''))} <b class="num">${fmtM(x.a)}</b> <em class="rl-${pTone(pc(x.a, x.prev))}">${rlPct(pc(x.a, x.prev))}</em></span>`).join('')}</div>`;
  const tb = `<div class="tbl-wrap"><table class="tbl rl-tbl"><thead><tr><th>สินค้า</th><th class="num">เก็บจริง (ล้านบาท)</th><th class="num">เทียบปีก่อน</th><th class="num">เทียบเป้ากรมฯ</th><th class="num">เทียบเป้ากระทรวงฯ</th><th>Insight</th></tr></thead><tbody>
    ${rows.map((r) => `<tr><td><b>${esc(r.p)}</b></td><td class="num"><b>${fmtM(r.a)}</b><small>เป้ากรมฯ ${fmtM(r.t)}</small></td>${cell(pc(r.a, r.prev))}${cell(pc(r.a, r.t))}${cell(pc(r.a, r.mof))}<td class="rl-ins">${esc(I.p?.[r.p] || '—')}${sub(r)}</td></tr>`).join('')}
    <tr class="rl-tot"><td><b>รวม</b></td><td class="num"><b>${fmtM(tot.a)}</b><small>เป้ากรมฯ ${fmtM(tot.t)}</small></td>${cell(pc(tot.a, tot.prev))}${cell(pc(tot.a, tot.t))}${cell(pc(tot.a, tot.mof))}<td class="rl-ins">${esc(I.overall || '')}</td></tr>
    </tbody></table></div>`;
  const tabs = `<div class="seg seg-sm" role="group" aria-label="เลือกปี">${yrs.map((y) => `<button type="button" data-realfy="${y}" aria-pressed="${y === fy}">${esc(S.real.insights[y].title.replace('ปีงบประมาณ ', 'ปีงบ '))}</button>`).join('')}</div>`;
  return `<div class="rl" id="rl">${tabs}<p class="muted small">ที่มา: ${esc(I.src)} · ตัวเลขรวมใช้ข้อมูลเบื้องต้นจากระบบ BI</p>${tb}</div>`;
}
document.addEventListener('click', (e) => { const b = e.target.closest('[data-realfy]'); if (!b) return; S.realFy = b.dataset.realfy; const el = $('#rl'); if (el) el.outerHTML = realPanel(); });
