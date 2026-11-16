/* ===================== LA · Engagement Survey (engagement.json) ===================== */
const ED = ['ภาพรวม', 'เก่ง', 'ดี', 'มีสุข'];
const ED_COL = ['#0E2756', '#2360E0', '#1D9152', '#D97706'];
const ETYPES = [['', 'ทุกระดับ'], ['ส่วนกลาง', 'ส่วนกลาง'], ['ภาค', 'สำนักงานภาค'], ['พื้นที่', 'พื้นที่'], ['คบส.', 'คบส.']];
function loadEng() {
  fetch('engagement.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((j) => {
    if (!j?.rounds) return; S.eng = j; if (S.inApp && S.route === 'pillar' && S.param === 'LA') renderView();
  }).catch(() => {});
}
const eR = () => S.eng?.rounds || [];
const eFind = (id) => eR().find((r) => r.id === id);
function eSt() {
  const rs = eR(), last = rs[rs.length - 1];
  const o = (S.es = Object.assign({ r: last?.id, cmp: rs[rs.length - 2]?.id || '', dim: 0, typ: '', g: '', q: '', asc: false, fy: '', lines: [1, 1, 1, 1] }, S.es || {}));
  if (!eFind(o.r)) o.r = last?.id;
  return o;
}
const eNum = (v) => (v == null ? '—' : Number(v).toFixed(2));
const eDel = (a, b) => (a == null || b == null ? null : a - b);
const eDelTxt = (d, unit = '') => (d == null ? '' : `<span class="ed-d ${d >= 0 ? 'up' : 'dn'}">${d >= 0 ? '▲' : '▼'} ${Math.abs(d).toFixed(2)}${unit}</span>`);
const eBand = (v) => (v == null ? 'none' : v >= 95 ? 'hi' : v >= 90 ? 'ok' : v >= 85 ? 'mid' : 'lo');

/* ---------- auto insights for one round ---------- */
function eInsights(R, C, dim) {
  const out = [], dn = ED[dim];
  const dO = eDel(R.v[0], C?.v[0]);
  const dims = [1, 2, 3].map((i) => [ED[i], R.v[i]]).sort((a, b) => b[1] - a[1]);
  out.push(`ภาพรวม <b>${eNum(R.v[0])}</b>${C ? ` ${dO >= 0 ? 'เพิ่มขึ้น' : 'ลดลง'} ${Math.abs(dO).toFixed(2)} จุดจาก${C.label}` : ''} · ด้านที่สูงสุดคือ <b>${dims[0][0]}</b> (${eNum(dims[0][1])}) ต่ำสุดคือ <b>${dims[2][0]}</b> (${eNum(dims[2][1])})`);
  const regs = Object.entries(R.regions || {}).filter(([, v]) => v?.[dim] != null).sort((a, b) => b[1][dim] - a[1][dim]);
  if (regs.length > 1) {
    const top = regs[0], bot = regs[regs.length - 1];
    out.push(`ด้าน${dn === 'ภาพรวม' ? 'ภาพรวม' : dn} ระดับภาค: สูงสุด <b>${top[0]}</b> ${eNum(top[1][dim])} · ต่ำสุด <b>${bot[0]}</b> ${eNum(bot[1][dim])} ห่างกัน ${(top[1][dim] - bot[1][dim]).toFixed(2)} จุด`);
    if (C?.regions) {
      const ch = regs.map(([g, v]) => [g, eDel(v[dim], C.regions[g]?.[dim])]).filter((x) => x[1] != null).sort((a, b) => b[1] - a[1]);
      if (ch.length > 1) out.push(`เทียบ${C.label}: ดีขึ้นมากสุด <b>${ch[0][0]}</b> (+${ch[0][1].toFixed(2)}) · ${ch[ch.length - 1][1] < 0 ? `ลดลงมากสุด <b>${ch[ch.length - 1][0]}</b> (${ch[ch.length - 1][1].toFixed(2)})` : `ทุกภาคดีขึ้น น้อยสุด ${ch[ch.length - 1][0]} (+${ch[ch.length - 1][1].toFixed(2)})`}`);
    }
    const cen = eR().filter((x) => x.regions?.['ส่วนกลาง']).map((x) => { const s = Object.entries(x.regions).filter(([, v]) => v?.[0] != null).sort((a, b) => a[1][0] - b[1][0]); return s.findIndex(([g]) => g === 'ส่วนกลาง'); });
    if (cen.length && cen.every((i) => i <= 1)) out.push(`<b>ส่วนกลาง</b> อยู่อันดับต่ำสุดหรือรองต่ำสุดในทุกครั้งที่มีข้อมูลรายภาค เป็นจุดที่ควรมีแผนเฉพาะ`);
  }
  const U = (R.units || []).filter((u) => u.v[dim] != null);
  if (U.length) {
    const s = [...U].sort((a, b) => b.v[dim] - a.v[dim]);
    const low = U.filter((u) => u.v[dim] < 85).length;
    out.push(`รายหน่วยงาน ${U.length} หน่วย: ต่ำกว่า 85 จำนวน <b>${low}</b> หน่วย · ต่ำสุด ${s.slice(-3).reverse().map((u) => `${esc(u.n)} (${eNum(u.v[dim])})`).join(', ')}`);
    if (C?.units?.length) {
      const cm = Object.fromEntries(C.units.map((u) => [u.n, u.v[dim]]));
      const ch = U.map((u) => [u.n, eDel(u.v[dim], cm[u.n])]).filter((x) => x[1] != null).sort((a, b) => a[1] - b[1]);
      const dn5 = ch.filter((x) => x[1] <= -3);
      if (ch.length) out.push(`ลดลงจาก${C.label} ≥ 3 จุด <b>${dn5.length}</b> หน่วย${dn5.length ? ` เช่น ${dn5.slice(0, 3).map((x) => `${esc(x[0])} (${x[1].toFixed(2)})`).join(', ')}` : ''}`);
    }
  }
  const sg = R.sugg;
  if (sg?.k) out.push(`สิ่งที่บุคลากรอยากให้ทำมากสุด: เก่ง → <b>${esc(sg.k[0][0])}</b> · ดี → <b>${esc(sg.d[0][0])}</b> · มีสุข → <b>${esc(sg.s[0][0])}</b>`);
  else if (sg?.top3) out.push(`ข้อเสนอแนะ 3 อันดับแรก: เก่ง → ${esc(sg.top3.k)} · ดี → ${esc(sg.top3.d)} · มีสุข → ${esc(sg.top3.s)}`);
  if (R.meta?.rr != null && C?.meta?.rr != null) { const d = R.meta.rr - C.meta.rr; if (Math.abs(d) >= 1) out.push(`อัตราการตอบ ${R.meta.rr.toFixed(2)}% ${d < 0 ? 'ลดลง' : 'เพิ่มขึ้น'} ${Math.abs(d).toFixed(2)} จุด${d < -5 ? ' ควรติดตามว่าหน่วยใดตอบน้อย' : ''}`); }
  return out;
}

/* ---------- trend chart (SVG) ---------- */
function eTrend(o) {
  const rs = eR().filter((r) => !o.fy || String(r.fy) === o.fy); if (!rs.length) return '';
  const W = 640, H = 230, L = 34, Rr = 12, T = 14, B = 34;
  const vals = rs.flatMap((r) => r.v.filter((x, i) => o.lines[i]));
  const lo = Math.floor(Math.min(...vals) - 1), hi = Math.ceil(Math.max(...vals) + 1);
  const x = (i) => L + (rs.length === 1 ? (W - L - Rr) / 2 : (i * (W - L - Rr)) / (rs.length - 1));
  const y = (v) => T + ((hi - v) * (H - T - B)) / (hi - lo);
  const grid = Array.from({ length: 5 }, (_, i) => lo + ((hi - lo) * i) / 4).map((v) => `<line x1="${L}" x2="${W - Rr}" y1="${y(v)}" y2="${y(v)}" class="et-g"/><text x="${L - 6}" y="${y(v) + 4}" class="et-ax" text-anchor="end">${v.toFixed(0)}</text>`).join('');
  const sel = rs.findIndex((r) => r.id === o.r);
  const band = sel >= 0 ? `<rect x="${x(sel) - 18}" y="${T - 6}" width="36" height="${H - T - B + 12}" rx="8" class="et-sel"/>` : '';
  const lines = [0, 1, 2, 3].filter((i) => o.lines[i]).map((i) => {
    const pts = rs.map((r, j) => [x(j), y(r.v[i])]);
    return `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${ED_COL[i]}" stroke-width="${i ? 2 : 3}" ${i ? 'stroke-dasharray="0"' : ''}/>` +
      pts.map((p, j) => `<circle cx="${p[0]}" cy="${p[1]}" r="${i ? 3.5 : 5}" fill="${ED_COL[i]}"><title>${ED[i]} ${rs[j].label}: ${eNum(rs[j].v[i])}</title></circle>${i === 0 ? `<text x="${p[0]}" y="${p[1] - 9}" class="et-lb" text-anchor="middle">${rs[j].v[0].toFixed(2)}</text>` : ''}`).join('');
  }).join('');
  const xl = rs.map((r, j) => `<text x="${x(j)}" y="${H - 14}" class="et-ax ${j === sel ? 'on' : ''}" text-anchor="middle">${r.r}/${String(r.fy).slice(2)}</text>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="et" role="img" aria-label="แนวโน้มคะแนนความผูกพันทุกครั้ง">${grid}${band}${lines}${xl}<text x="${W - Rr}" y="${H - 1}" class="et-ax" text-anchor="end">ครั้งที่/ปีงบ</text></svg>`;
}

/* ---------- panel ---------- */
function engPanel() {
  if (!S.eng) return `<div class="empty">${ic('spark')}<b>กำลังโหลดผลสำรวจความผูกพัน…</b></div>`;
  const o = eSt(), R = eFind(o.r), C = o.cmp ? eFind(o.cmp) : null, dim = o.dim;
  const chips = `<div class="ed-rounds" role="group" aria-label="เลือกครั้งที่สำรวจ">${eR().map((r) => `<button type="button" data-es-r="${r.id}" aria-pressed="${r.id === o.r}"><b>${r.v[0].toFixed(2)}</b><small>${r.label}</small></button>`).join('')}</div>`;
  const tools = `<div class="ed-tools">
    <label class="ed-sel"><span>เทียบกับ</span><select class="select" data-es="cmp"><option value="">— ไม่เทียบ —</option>${eR().filter((r) => r.id !== o.r).map((r) => `<option value="${r.id}" ${r.id === o.cmp ? 'selected' : ''}>${r.label}</option>`).join('')}</select></label>
    <div class="seg seg-sm" role="group" aria-label="มิติ">${ED.map((t, i) => `<button type="button" data-es-dim="${i}" aria-pressed="${i === dim}">${t}</button>`).join('')}</div></div>`;
  const tiles = `<div class="ed-tiles">${ED.map((t, i) => `<div class="ed-tile ${i === dim ? 'on' : ''}" style="--c:${ED_COL[i]}"><small>${i ? 'ด้าน' + t : 'คะแนนความผูกพัน'}</small><b class="num">${eNum(R.v[i])}</b>${C ? eDelTxt(eDel(R.v[i], C.v[i])) : ''}</div>`).join('')}
    <div class="ed-tile ed-meta"><small>ผู้ตอบแบบสำรวจ</small><b class="num">${R.meta?.n ? money(R.meta.n) : '—'}</b><span class="muted small">${R.meta?.pop ? `จาก ${money(R.meta.pop)} คน · ${R.meta.rr != null ? R.meta.rr.toFixed(2) + '%' : ''}` : 'ไม่มีข้อมูล'}</span></div></div>`;
  const ins = `<ul class="ed-ins">${eInsights(R, C, dim).map((t) => `<li>${t}</li>`).join('')}</ul>${(R.notes || []).length ? `<div class="ed-note">${ic('flag', 'ic-sm')}<span>${R.notes.map(esc).join(' · ')}</span></div>` : ''}`;
  const trend = `<div class="ed-trend-h"><div class="seg seg-sm" role="group" aria-label="ปีงบ">${[['', 'ทุกปี'], ...[...new Set(eR().map((r) => String(r.fy)))].map((y) => [y, 'ปี ' + y])].map(([v, t]) => `<button type="button" data-es-fy="${v}" aria-pressed="${o.fy === v}">${t}</button>`).join('')}</div>
    <div class="ed-lg">${ED.map((t, i) => `<button type="button" data-es-line="${i}" aria-pressed="${!!o.lines[i]}"><i style="background:${ED_COL[i]}"></i>${t}</button>`).join('')}</div></div>${eTrend(o)}
    <div class="tbl-wrap"><table class="tbl ed-dt"><thead><tr><th></th>${eR().filter((r) => !o.fy || String(r.fy) === o.fy).map((r) => `<th class="num ${r.id === o.r ? 'on' : ''}">${r.r}/${String(r.fy).slice(2)}</th>`).join('')}</tr></thead><tbody>
    ${ED.map((t, i) => { const rs = eR().filter((r) => !o.fy || String(r.fy) === o.fy); return `<tr><td>${t}</td>${rs.map((r) => { const p = eR()[eR().indexOf(r) - 1]; const d = p ? r.v[i] - p.v[i] : null; return `<td class="num ${r.id === o.r ? 'on' : ''}">${eNum(r.v[i])}${d != null ? `<small class="${d >= 0 ? 'up' : 'dn'}">${d >= 0 ? '+' : ''}${d.toFixed(2)}</small>` : ''}</td>`; }).join('')}</tr>`; }).join('')}</tbody></table></div>`;

  /* regions */
  const regs = Object.entries(R.regions || {}).filter(([, v]) => v?.[dim] != null).sort((a, b) => b[1][dim] - a[1][dim]);
  const rmin = Math.floor(Math.min(...regs.map(([, v]) => v[dim])) - 1), rmax = Math.ceil(Math.max(...regs.map(([, v]) => v[dim])));
  const regBody = regs.length ? `<ol class="ed-rk">${regs.map(([g, v], i) => { const d = C ? eDel(v[dim], C.regions?.[g]?.[dim]) : null; const rr = R.rrReg?.[g];
    return `<li><button type="button" data-es-g="${esc(g)}" aria-pressed="${o.g === g}" title="กรองรายหน่วยงานใน ${esc(g)}"><span class="ed-n">${i + 1}</span><span class="ed-gn">${esc(g)}${rr ? `<small>ตอบ ${rr[2].toFixed(0)}%</small>` : ''}</span><span class="ed-bar"><i class="b-${eBand(v[dim])}" style="width:${((v[dim] - rmin) / (rmax - rmin)) * 100}%"></i></span><b class="num">${eNum(v[dim])}</b>${eDelTxt(d)}</button></li>`; }).join('')}</ol>` : `<div class="empty small">ครั้งนี้ไม่มีข้อมูลรายภาค</div>`;

  /* units */
  const cm = C?.units?.length ? Object.fromEntries(C.units.map((u) => [u.n, u])) : null;
  const crk = cm ? Object.fromEntries([...C.units].sort((a, b) => b.v[dim] - a.v[dim]).map((u, i) => [u.n, i + 1])) : null;
  const all = [...(R.units || [])].sort((a, b) => b.v[dim] - a.v[dim]).map((u, i) => Object.assign({ rk: i + 1 }, u));
  const q = (o.q || '').trim();
  let U = all.filter((u) => (!o.typ || u.t === o.typ) && (!o.g || u.g === o.g) && (!q || u.n.includes(q)));
  if (o.asc) U = [...U].reverse();
  const N = all.length;
  const unitBody = !N ? `<div class="empty small">${ic('flag', 'ic-sm')}<span>${esc((R.notes || []).find((t) => /รายหน่วยงาน/.test(t)) || 'ครั้งนี้ไม่มีตารางรายหน่วยงาน')}</span></div>` : `
    <div class="ed-uf"><div class="seg seg-sm" role="group" aria-label="ระดับหน่วยงาน">${ETYPES.map(([v, t]) => `<button type="button" data-es-typ="${v}" aria-pressed="${o.typ === v}">${t}</button>`).join('')}</div>
      ${o.g ? `<button type="button" class="chip chip-accent" data-es-g="">${esc(o.g)} ✕</button>` : ''}
      <input class="input ed-q" id="es-q" type="search" placeholder="ค้นหาหน่วยงาน" value="${esc(o.q || '')}">
      <button type="button" class="btn btn-sm btn-ghost" data-es-asc="1">${o.asc ? 'ต่ำ → สูง' : 'สูง → ต่ำ'}</button></div>
    <div class="ed-tw"><table class="tbl ed-ut"><thead><tr><th class="num">อันดับ</th><th>หน่วยงาน</th><th>สังกัด</th><th class="num">${ED[dim]}</th>${[1, 2, 3].filter((i) => i !== dim).map((i) => `<th class="num">${ED[i]}</th>`).join('')}${cm ? `<th class="num">เทียบ ${C.r}/${String(C.fy).slice(2)}</th>` : ''}</tr></thead><tbody>
    ${U.map((u) => { const pu = cm?.[u.n]; const d = pu ? u.v[dim] - pu.v[dim] : null; const rc = crk?.[u.n] ? crk[u.n] - u.rk : null;
      return `<tr class="${u.rk <= 10 ? 'u-top' : u.rk > N - 10 ? 'u-bot' : ''}"><td class="num">${u.rk}${rc ? `<small class="${rc > 0 ? 'up' : 'dn'}">${rc > 0 ? '▲' : '▼'}${Math.abs(rc)}</small>` : ''}</td><td><b>${esc(u.n)}</b></td><td class="muted small">${esc(u.g)}</td><td class="num"><span class="ed-sc b-${eBand(u.v[dim])}">${eNum(u.v[dim])}</span></td>${[1, 2, 3].filter((i) => i !== dim).map((i) => `<td class="num">${eNum(u.v[i])}</td>`).join('')}${cm ? `<td class="num">${d == null ? '<span class="muted">ใหม่</span>' : eDelTxt(d)}</td>` : ''}</tr>`; }).join('') || `<tr><td colspan="7" class="muted">ไม่พบหน่วยงาน</td></tr>`}
    </tbody></table></div><p class="muted small">แสดง ${U.length} จาก ${N} หน่วย · แถบเขียว = 10 อันดับแรก · แถบแดง = 10 อันดับสุดท้าย · เรียงตาม${ED[dim]}</p>`;

  /* suggestions + demographics */
  const sg = R.sugg;
  const sgBody = sg?.k ? `<div class="ed-sg">${[['k', 'เก่ง'], ['d', 'ดี'], ['s', 'มีสุข']].map(([k, t]) => `<div><h4>ด้าน${t}</h4>${sg[k].map(([n, p]) => `<div class="ed-sgr"><span>${esc(n)}</span><span class="ed-bar"><i style="width:${p}%;background:${ED_COL[k === 'k' ? 1 : k === 'd' ? 2 : 3]}"></i></span><b class="num">${p.toFixed(2)}%</b></div>`).join('')}</div>`).join('')}</div>`
    : sg?.top3 ? `<ul class="ed-ins">${[['k', 'เก่ง'], ['d', 'ดี'], ['s', 'มีสุข']].map(([k, t]) => `<li>ด้าน${t}: ${esc(sg.top3[k])}</li>`).join('')}</ul>` : `<div class="empty small">ครั้งนี้รายงานไม่มีข้อเสนอแนะ (อยู่ใน QR Code)</div>`;
  const drv = R.drivers ? `<div class="ed-drv"><h4>ปัจจัยที่ส่งผลต่อความผูกพันมากที่สุด (Multiple Regression)</h4>${[['k', 'เก่ง'], ['d', 'ดี'], ['s', 'มีสุข']].map(([k, t]) => `<p><b>${t}:</b> ${R.drivers[k].map(esc).join(' → ')}</p>`).join('')}</div>` : '';
  const demoKeys = Object.keys(R.demo || {});
  const demo = demoKeys.length ? `<table class="tbl ed-demo"><thead><tr><th>กลุ่ม</th><th class="num">เก่ง</th><th class="num">ดี</th><th class="num">มีสุข</th></tr></thead><tbody>${demoKeys.map((k, i) => `${i === 0 ? '<tr class="ed-sub"><td colspan="4">อายุราชการ</td></tr>' : ''}${k === 'น้อยกว่า 25 ปี' ? '<tr class="ed-sub"><td colspan="4">อายุตัว</td></tr>' : ''}<tr><td>${esc(k)}</td>${R.demo[k].map((v, j) => { const pv = C?.demo?.[k]?.[j]; return `<td class="num"><span class="ed-sc b-${eBand(v)}">${eNum(v)}</span>${pv != null ? `<small class="${v - pv >= 0 ? 'up' : 'dn'}">${v - pv >= 0 ? '+' : ''}${(v - pv).toFixed(2)}</small>` : ''}</td>`; }).join('')}</tr>`).join('')}</tbody></table>` : '<div class="empty small">ไม่มีข้อมูล</div>';

  return `<div class="engp" id="ed">
    <div class="ed-head">${chips}${tools}</div>
    <div class="zgrid">
      ${zcard(`ผลสำรวจ${R.label}`, `ด้าน${ED[dim]} · ${C ? 'เทียบ' + C.label : 'ไม่เทียบ'}`, tiles + ins, { span: 5 })}
      ${zcard('แนวโน้มทุกครั้งที่สำรวจ', 'กดปีงบหรือเส้นเพื่อกรอง · แถบสีอ่อนคือครั้งที่เลือก', trend, { span: 7 })}
      ${zcard('อันดับรายภาค', `เรียงตามด้าน${ED[dim]} · กดภาคเพื่อดูหน่วยงานในภาค`, regBody, { span: 5 })}
      ${zcard('อันดับรายหน่วยงาน', 'ส่วนกลาง · สำนักงานภาค · สำนักงานพื้นที่', unitBody, { span: 7 })}
      ${zcard('ข้อเสนอแนะจากบุคลากร', 'สิ่งที่อยากให้กรมส่งเสริม เรียงตามจำนวนผู้เสนอ', sgBody + drv, { span: 7 })}
      ${zcard('ตามอายุราชการและอายุตัว', C ? 'ตัวเลขเล็ก = เปลี่ยนจาก' + C.label : 'คะแนนรายด้าน', demo, { span: 5 })}
      ${zcard('ข้อเสนอเพื่อพัฒนาการสำรวจครั้งถัดไป', 'จากการรวบรวมรายงาน 7 ครั้ง', eRecs(), { span: 12, fold: 'eng-rec' })}
    </div>
    <p class="muted small">ที่มา: ${esc(S.eng.source)} · คะแนนภาพรวมรายครั้งใช้ค่าตามข้อ 2.1 ของแต่ละรายงาน</p></div>`;
}
function eRecs() {
  const L = [
    ['ขอข้อมูลดิบเป็น Excel ทุกครั้ง', 'คะแนนรายหน่วยงาน จำนวนผู้ตอบ และรายข้อคำถาม พร้อมรหัสหน่วยงานมาตรฐาน แทนการอยู่ใน PDF/QR Code ทำให้หน้านี้อัปเดตได้ทันทีและเทียบย้อนหลังได้แม่นยำ'],
    ['ตรวจคุณภาพข้อมูลก่อนเผยแพร่', 'พบตารางรายหน่วยงานครั้งที่ 2/2569 ซ้ำกับครั้งที่ 1/2569 และตัวเลขภาพรวมในข้อ 2.1 ไม่ตรงกับตาราง (93.53 กับ 93.78) ควรมีขั้นตอนทวนสอบก่อนออกรายงาน'],
    ['แสดงจำนวนผู้ตอบรายหน่วยงาน', 'หน่วยที่ผู้ตอบน้อย คะแนน 1–2 คนทำให้แกว่งมาก ควรกำหนดขั้นต่ำ (เช่น 5–10 คน) ก่อนแสดงคะแนน เพื่อความน่าเชื่อถือและปกปิดตัวตน'],
    ['วิเคราะห์ปัจจัยขับเคลื่อนทุกครั้ง', 'ครั้งที่ 2/2567 มีการวิเคราะห์ Multiple Regression ว่าปัจจัยใดส่งผลมากที่สุด ครั้งหลังไม่มี ควรทำต่อเนื่อง เพื่อเลือกโครงการ LA ที่ได้ผลจริง'],
    ['ใช้ตัวชี้วัดที่แยกความต่างได้มากขึ้น', 'คะแนนส่วนใหญ่อยู่ 90–100 ใกล้เพดาน ควรรายงานเพิ่ม เช่น % ที่ตอบระดับสูงสุด (top-box) หรือ eNPS เพื่อเห็นการเปลี่ยนแปลงชัดขึ้น'],
    ['ผูกผลสำรวจกับแผนปรับปรุง', 'หน่วยงาน 10 อันดับสุดท้ายและส่วนกลางที่ต่ำต่อเนื่อง ควรมีแผนปรับปรุงและติดตามเป็นโครงการภายใต้กลยุทธ์ LA3 ในระบบนี้'],
    ['รักษารายชื่อหน่วยงานให้ครบทุกครั้ง', 'บางครั้งหน่วยงานหายจากตาราง เช่น สสพ.ประจวบคีรีขันธ์ ในครั้งที่ 2/2568 ทำให้เทียบแนวโน้มไม่ได้'],
    ['จัดหมวดข้อเสนอแนะแบบข้อความรายหน่วยงาน', 'ปัจจุบันอยู่ใน QR Code จัดหมวดและนับความถี่รายหน่วยงาน จะช่วยให้หน่วยงานเห็นประเด็นของตัวเอง']];
  return `<ol class="ed-rec">${L.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join('')}</ol>`;
}
function eRerender() { const el = $('#ed'); if (!el) return; const vw = $('#view'), y = vw?.scrollTop; el.outerHTML = engPanel(); if (vw) vw.scrollTop = y; }
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-es-r],[data-es-dim],[data-es-g],[data-es-typ],[data-es-asc],[data-es-fy],[data-es-line]'); if (!b) return;
  const o = eSt(), d = b.dataset;
  if (d.esR) { const rs = eR(), i = rs.findIndex((r) => r.id === d.esR); o.r = d.esR; o.cmp = rs[i - 1]?.id || ''; o.g = ''; }
  else if (d.esDim != null) o.dim = Number(d.esDim);
  else if (d.esG != null) o.g = o.g === d.esG ? '' : d.esG;
  else if (d.esTyp != null) o.typ = d.esTyp;
  else if (d.esAsc) o.asc = !o.asc;
  else if (d.esFy != null) o.fy = d.esFy;
  else if (d.esLine != null) { const i = Number(d.esLine); o.lines[i] = o.lines[i] ? 0 : 1; if (!o.lines.some(Boolean)) o.lines[i] = 1; }
  eRerender();
});
document.addEventListener('change', (e) => { if (e.target.dataset?.es === 'cmp') { eSt().cmp = e.target.value; eRerender(); } });
document.addEventListener('input', (e) => {
  if (e.target.id !== 'es-q') return; eSt().q = e.target.value;
  const pos = e.target.selectionStart; eRerender(); const q = $('#es-q'); if (q) { q.focus(); try { q.setSelectionRange(pos, pos); } catch (_) {} }
});
