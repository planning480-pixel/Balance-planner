
/* ---------- Excise revenue history (10 fiscal years) ---------- */
const SRC = {
  mgr62: 'https://mgronline.com/stockmarket/detail/9620000096076',
  sr63: 'https://siamrath.co.th/n/185102',
  ts63: 'https://www.thansettakij.com/finance/450578',
  ts64: 'https://www.thansettakij.com/finance/474003',
  iq65: 'https://www.ryt9.com/s/iq03/3298146',
  iq66: 'https://www.infoquest.co.th/?p=276836',
  iq66b: 'https://www.infoquest.co.th/?p=334550',
  ts67: 'https://www.thansettakij.com/business/economy/610531',
  ts68: 'https://www.thansettakij.com/economy/619109',
  dn68: 'https://www.dailynews.co.th/news/5132932/',
  dn68b: 'https://www.dailynews.co.th/news/5236336/',
  bk69: 'https://www.bangkokbiznews.com/economics/1221665',
  ts69: 'https://www.thansettakij.com/economy/654317',
  tp69: 'https://www.thaipost.net/economy-news/1077851/',
  tpb70: 'https://thaipublica.org/2025/11/tax-restructuring-1-2570-revenue-boost-263-billion-bath/',
  tpb61: 'https://thaipublica.org/2018/08/tobacco-tax-restructuring-26-8-2561/'
};
const HIST_DEFAULT = {
  unit: 'ล้านบาท',
  years: {
    2560: { a: null, t: null, ev: [{ i: 'str', t: 'พ.ร.บ.ภาษีสรรพสามิต พ.ศ. 2560 มีผล 16 ก.ย. 2560 เปลี่ยนฐานภาษีเป็นราคาขายปลีกแนะนำ และเริ่มเก็บภาษีเครื่องดื่มตามปริมาณน้ำตาล' }] },
    2561: { a: null, t: null, ev: [{ i: 'neg', t: 'โครงสร้างภาษีบุหรี่ใหม่ ทำให้ยอดขายบุหรี่ในระบบและรายได้โรงงานยาสูบลดลง', u: SRC.tpb61 }] },
    2562: { a: 585407, t: null, prod: { 'เบียร์': 79090, 'สุรา': 62146, 'ยาสูบ': 67410 }, ev: [
      { i: 'pos', t: 'ภาษีสุราและเบียร์สูงกว่าเป้า (สุรา +11% เบียร์ +3.6%) ดันภาพรวมเกินเป้า', u: SRC.mgr62 },
      { i: 'neg', t: 'ภาษีน้ำมันต่ำกว่าเป้าราว 5,000 ล้านบาท จากมาตรการหนุนไบโอดีเซลและรถยนต์ลด PM2.5', u: SRC.mgr62 },
      { i: 'neg', t: 'ภาษียาสูบต่ำกว่าเป้า 2,989 ล้านบาท ช่วงปรับตัวกับอัตราภาษีใหม่', u: SRC.mgr62 }] },
    2563: { a: 546000, t: 580000, prod: { 'น้ำมัน': 221140, 'รถยนต์': 84347, 'เบียร์': 80013, 'สุรา': 61205, 'ยาสูบ': 62761 }, ev: [
      { i: 'neg', t: 'โควิด-19 ล็อกดาวน์ กิจกรรมเศรษฐกิจหยุดชะงัก ปรับเป้าเหลือ 501,000 ล้านบาท', u: SRC.sr63 },
      { i: 'pos', t: 'ไตรมาสสุดท้ายฟื้นตัว เครื่องดื่มผสมวิตามินขายดี จัดเก็บเกินเป้าที่ปรับใหม่ราว 45,000 ล้านบาท', u: SRC.ts63 }] },
    2564: { a: null, t: 634000, ev: [{ i: 'neg', t: 'โควิด-19 ระลอกใหม่ ปรับเป้าลดจาก 634,000 เหลือ 550,000 ล้านบาท', u: SRC.ts64 }] },
    2565: { a: null, t: 597000, ev: [
      { i: 'neg', t: 'ลดภาษีดีเซล 3 บาท/ลิตร ตั้งแต่ ก.พ. 2565 ประเมินสูญรายได้ราว 17,000 ล้านบาทใน 3 เดือน', u: SRC.iq65 },
      { i: 'neg', t: 'เลื่อนปรับโครงสร้างภาษีเพราะโควิด ลดเป้าจาก 597,000 เหลือ 560,000 ล้านบาท', u: SRC.iq65 }] },
    2566: { a: 477132, t: 567000, derived: true, prod: { 'น้ำมัน': 128406, 'รถยนต์': 102452, 'เบียร์': 86476, 'สุรา': 64167, 'ยาสูบ': 57685, 'เครื่องดื่ม': 26949, 'อื่นๆ': 10997 }, ev: [
      { i: 'neg', t: 'ลดภาษีดีเซลต่อเนื่อง สูญรายได้เฉลี่ยกว่า 10,000 ล้านบาท/เดือน', u: SRC.iq66 },
      { i: 'pos', t: 'การบริโภคช่วงเทศกาลฟื้น ภาษีรถยนต์ สุรา เบียร์ เครื่องดื่ม สูงกว่าเป้าราว 10% ช่วงต้นปี', u: SRC.iq66 },
      { i: 'str', t: 'ลดภาษีแบตเตอรี่ EV จาก 8% เหลือ 1% หนุนการผลิตในประเทศ', u: SRC.iq66 }] },
    2567: { a: 523676, t: 598000, prod: { 'น้ำมัน': 209827, 'รถยนต์': 67362, 'เบียร์': 90013, 'สุรา': 64603, 'ยาสูบ': 51247, 'เครื่องดื่ม': 29097, 'อื่นๆ': 11527 }, ev: [
      { i: 'pos', t: 'ภาษีน้ำมันกลับมาเพิ่ม 63% หลังทยอยยกเลิกการลดภาษีดีเซล', u: SRC.ts67 },
      { i: 'neg', t: 'ลดภาษีดีเซล 2.50 บาท/ลิตร 20 ก.ย.–31 ธ.ค. 2566 กระทบรายได้ราว 15,000 ล้านบาท', u: SRC.iq66b },
      { i: 'neg', t: 'ภาษีรถยนต์ลด 34% สถาบันการเงินเข้มงวดสินเชื่อรถ', u: SRC.ts67 },
      { i: 'neg', t: 'ภาษียาสูบลด 11% ผู้บริโภคหันไปบุหรี่เถื่อนและบุหรี่ไฟฟ้า', u: SRC.ts67 }] },
    2568: { a: 537540, t: 609700, ev: [
      { i: 'neg', t: 'ภาษีรถยนต์ต่ำกว่าเป้ามาก จากมาตรการส่งเสริมรถยนต์ไฟฟ้า (EV 3.0/3.5)', u: SRC.dn68b },
      { i: 'neg', t: 'เศรษฐกิจชะลอ หนี้ครัวเรือนสูง ไตรมาสแรกรถยนต์ สุรา ยาสูบ ลดลง', u: SRC.ts68 },
      { i: 'pos', t: 'ปรับขึ้นภาษีน้ำมันเบนซินและดีเซล 1 บาท/ลิตร (ลดเงินส่งกองทุนน้ำมันชดเชย) เพิ่มรายได้ราว 2,800 ล้านบาท/เดือน', u: SRC.dn68 },
      { i: 'str', t: 'ภาษีความหวานระยะ 4 (1 เม.ย. 2568) และภาษีรถยนต์โบราณ 45%', u: SRC.dn68 }] },
    2569: { a: 518737, t: 578200, partial: '11 เดือน (ต.ค. 68–ส.ค. 69)', tp: 530545, ev: [
      { i: 'pos', t: 'ค่ายรถเร่งผลิตและนำเข้าก่อนโครงสร้างภาษีรถยนต์ตาม CO2 ใหม่ (1 ม.ค. 2569) 4 เดือนแรกเกินเป้า 8,300 ล้านบาท', u: SRC.bk69 },
      { i: 'neg', t: 'ความขัดแย้งตะวันออกกลาง ราคาน้ำมันผันผวน คลังศึกษาลดภาษีน้ำมัน (1 บาท/ลิตร ≈ 2,800 ล้านบาท/เดือน)', u: SRC.ts69 },
      { i: 'neg', t: '11 เดือนจัดเก็บ 518,737 ล้านบาท ต่ำกว่าเป้า 11,808 ล้านบาท (2.2%)', u: SRC.tp69 }] },
    2570: { a: null, t: 611200, ev: [{ i: 'str', t: 'แผนการคลังระยะปานกลางเสนอปรับภาษีน้ำมัน +1 บาท/ลิตร ภาษีสินค้าบาป และภาษีสิ่งแวดล้อม/คาร์บอน', u: SRC.tpb70 }] }
  }
};
const histData = () => (S.ops?.history?.years ? S.ops.history : HIST_DEFAULT);
const k1 = (v) => (v == null ? '—' : (v / 1000).toLocaleString('th-TH', { maximumFractionDigits: 1, minimumFractionDigits: 1 }));
const EVI = { pos: ['▲', 'บวก'], neg: ['▼', 'ลบ'], mix: ['◆', 'ผสม'], str: ['●', 'เชิงนโยบาย/โครงสร้าง'] };
function evTone(ev) {
  const s = new Set((ev || []).map((e) => e.i));
  if (!s.size) return null; if (s.has('pos') && s.has('neg')) return 'mix';
  return s.has('pos') ? 'pos' : s.has('neg') ? 'neg' : s.has('mix') ? 'mix' : 'str';
}
function histBody() {
  const H = histData(); const Y = H.years || {};
  const years = Object.keys(Y).map(Number).sort((a, b) => a - b).slice(-11);
  if (!years.length) return '<p class="zempty">ยังไม่มีข้อมูลสถิติ</p>';
  const prod = S.histProd || '';
  const withA = years.filter((y) => Y[y].a != null);
  const sel = years.includes(Number(S.histYear)) ? Number(S.histYear) : (withA[withA.length - 1] || years[years.length - 1]);
  const val = (y) => (prod ? Y[y].prod?.[prod] ?? null : Y[y].a ?? null);
  const tgt = (y) => (prod ? Y[y].pt?.[prod] ?? null : Y[y].t ?? null);
  const prods = opsProducts();
  const chips = `<div class="hx-chips" role="tablist" aria-label="เลือกสินค้า"><button type="button" class="hx-chip ${prod ? '' : 'on'}" data-act="hx-prod" data-v="" aria-pressed="${!prod}">${ic('chart', 'ic-sm')}ภาพรวม</button>${prods.map((k) => `<button type="button" class="hx-chip ${prod === k ? 'on' : ''}" data-act="hx-prod" data-v="${esc(k)}" aria-pressed="${prod === k}" style="--pc:${PCOLS[prods.indexOf(k) % PCOLS.length]}">${pIcon(k)}${esc(k)}</button>`).join('')}</div>`;

  const W = 760, H0 = 300, L = 50, Rr = 14, T = 26, B = 62, cw = W - L - Rr, ch = H0 - T - B;
  const nums = years.flatMap((y) => [val(y), tgt(y)]).filter((x) => x != null);
  const hi = nums.length ? Math.max(...nums) : 1, lo = nums.length ? Math.min(...nums) : 0, span = Math.max(hi - lo, hi * 0.15);
  const rawStep = span * 1.35 / 4, mag = Math.pow(10, Math.floor(Math.log10(rawStep))), step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= rawStep);
  const y0 = Math.max(0, Math.floor((lo - span * 0.18) / step) * step), y1 = y0 + step * Math.ceil((hi + span * 0.12 - y0) / step);
  const yy = (v) => T + ch - ((v - y0) / (y1 - y0)) * ch, slot = cw / years.length, px = (i) => L + slot * i + slot / 2;
  const col = prod ? PCOLS[prods.indexOf(prod) % PCOLS.length] : 'var(--accent)', tcol = '#F2B21B';
  const ticks = []; for (let v = y0; v <= y1 + 1e-9; v += step) ticks.push(v);
  const grid = ticks.map((v) => `<line x1="${L}" x2="${W - Rr}" y1="${yy(v)}" y2="${yy(v)}" class="hx-g"/><text x="${L - 8}" y="${yy(v) + 4}" class="hx-ax" text-anchor="end">${k1(v).replace(/\.0$/, '')}</text>`).join('');
  const seg = (get, cls, dashPartial) => years.map((y, i) => { if (!i) return ''; const a = get(years[i - 1]), b = get(y); if (a == null || b == null) return ''; const dash = dashPartial && (Y[y].partial || Y[years[i - 1]].partial); return `<line x1="${px(i - 1)}" y1="${yy(a)}" x2="${px(i)}" y2="${yy(b)}" class="${cls} ${dash ? 'hx-dash' : ''}"/>`; }).join('');
  const area = (() => { const pts = years.map((y, i) => [i, val(y)]).filter((x) => x[1] != null); if (pts.length < 2) return ''; const runs = []; let cur = []; years.forEach((y, i) => { const v = val(y); if (v == null) { if (cur.length > 1) runs.push(cur); cur = []; } else cur.push([px(i), yy(v)]); }); if (cur.length > 1) runs.push(cur); return runs.map((r) => `<path d="M${r[0][0]} ${T + ch}L${r.map((q) => q.join(' ')).join('L')}L${r[r.length - 1][0]} ${T + ch}Z" class="hx-area" fill="${col}"/>`).join(''); })();
  const lines = `${seg(tgt, 'hx-tl', false)}<g style="color:${col}">${seg(val, 'hx-al', true)}</g>`;
  const marks = years.map((y, i) => {
    const cx = px(i), v = val(y), t = tgt(y), on = y === sel, D = Y[y];
    let g = '';
    if (on) g += `<line x1="${cx}" x2="${cx}" y1="${T - 4}" y2="${T + ch}" class="hx-guide"/>`;
    if (t != null) g += `<rect x="${cx - 5}" y="${yy(t) - 5}" width="10" height="10" transform="rotate(45 ${cx} ${yy(t)})" fill="${tcol}" class="hx-tm"/>`;
    if (v != null) g += `<circle cx="${cx}" cy="${yy(v)}" r="${on ? 6.5 : 5}" class="hx-am ${D.partial && !prod ? 'part' : ''}" style="--c:${col}"/>`;
    else if (!(t != null && y === years[years.length - 1])) g += `<circle cx="${cx}" cy="${T + ch}" r="4" class="hx-na-dot"/>`;
    if (on && (v != null || t != null)) {
      const lines2 = [v != null ? `ผลจริง ${k1(v)}` : null, t != null ? `เป้า ${k1(t)}` : null].filter(Boolean);
      const top = Math.min(v != null ? yy(v) : 1e9, t != null ? yy(t) : 1e9);
      const bw2 = 92, bh = lines2.length * 15 + 8, bx = Math.min(Math.max(cx - bw2 / 2, L), W - Rr - bw2), by = Math.max(2, top - bh - 12);
      g += `<g class="hx-tip"><rect x="${bx}" y="${by}" width="${bw2}" height="${bh}" rx="6"/>${lines2.map((s, k) => `<text x="${bx + 8}" y="${by + 16 + k * 15}">${k === 0 && v != null ? `<tspan class="hx-tip-a" style="fill:${col}">●</tspan> ` : `<tspan style="fill:${tcol}">◆</tspan> `}${s}</text>`).join('')}</g>`;
    }
    g += `<text x="${cx}" y="${T + ch + 18}" class="hx-y ${on ? 'on' : ''} ${v == null && t == null ? 'mute' : ''}" text-anchor="middle">${y}${D.partial ? '*' : ''}</text>`;
    const et = evTone(D.ev); if (et) g += `<g class="hx-e hx-e-${et}"><circle cx="${cx}" cy="${T + ch + 36}" r="8"/><text x="${cx}" y="${T + ch + 39.5}" text-anchor="middle">${(D.ev || []).length}</text></g>`;
    return `<g class="hx-yr" data-act="hx-year" data-v="${y}" role="button" tabindex="0" aria-label="ปีงบ ${y}"><title>ปีงบ ${y}${v != null ? ` · ผลจริง ${fmtM(v)}` : ''}${t != null ? ` · เป้า ${fmtM(t)}` : ''}${v == null && t == null ? ' · ยังไม่มีข้อมูล' : ''} ล้านบาท</title><rect x="${L + slot * i}" y="${T - 10}" width="${slot}" height="${ch + B}" class="hx-hit ${on ? 'on' : ''}"/>${g}</g>`;
  }).join('');
  const svg = `<svg class="hx-svg" viewBox="0 0 ${W} ${H0}" role="img" aria-label="สถิติรายได้ภาษีสรรพสามิตรายปี${prod ? ' ' + esc(prod) : ''}">${grid}<line x1="${L}" x2="${W - Rr}" y1="${T + ch}" y2="${T + ch}" class="hx-base"/><text x="4" y="${T - 12}" class="hx-ax">พันล้านบาท</text>${lines}${marks}</svg>`;
  const leg = `<div class="hx-leg"><span><i class="hx-ll" style="--c:${col}"></i>ผลจัดเก็บ${prod ? ' ' + esc(prod) : ''}</span><span><i class="hx-lt2"></i>เป้าหมาย</span><span><i class="hx-lp2" style="--c:${col}"></i>ข้อมูลบางส่วน (*)</span><span><i class="hx-lm2"></i>ยังไม่มีข้อมูล</span><span class="hx-le"><b class="t-ok">▲</b>บวก <b class="t-bad">▼</b>ลบ <b class="t-warn">◆</b>ผสม <b class="hx-str">●</b>นโยบาย = เหตุการณ์สำคัญ</span></div>`;

  // side panel
  const D = Y[sel] || {}, v = val(sel), t = tgt(sel), prev = Y[sel - 1] ? val(sel - 1) : null;
  const tp = !prod && D.partial ? D.tp : t; const pct = v != null && tp ? v / tp : null;
  const yoy = v != null && prev && !D.partial ? (v - prev) / prev : null;
  const pr = !prod && D.prod ? Object.entries(D.prod).sort((a, b) => b[1] - a[1]) : [];
  const psum = pr.reduce((s, x) => s + x[1], 0);
  const side = `<aside class="hx-side">
    <div class="hx-sh"><span class="muted small">ปีงบประมาณ</span><b>${sel}</b>${D.partial && !prod ? `<span class="chip">${esc(D.partial)}</span>` : ''}</div>
    <div class="hx-big">${v == null && !(t != null && !D.a) ? '<b class="hx-na">ยังไม่มีข้อมูล</b>' : `<b class="num">${v == null ? fmtM(t) : fmtM(v)}</b>`}<small>${v == null && t != null && !D.a ? 'ล้านบาท (เป้าหมาย)' : 'ล้านบาท' + (prod ? ' · ' + esc(prod) : '')}</small></div>
    <div class="hx-kv">${tp != null && v != null ? `<span>เป้า${D.partial && !prod ? ' 11 เดือน' : ''} <b class="num">${fmtM(tp)}</b></span><span class="mstat-p mstat-${achTone(pct)}"><b class="num">${Math.round(pct * 100)}%</b><small>ของเป้า</small></span>` : ''}${yoy != null ? `<span class="${yoy >= 0 ? 't-ok' : 't-bad'}">${yoy >= 0 ? '▲' : '▼'} ${Math.abs(yoy * 100).toFixed(1)}% จากปีก่อน</span>` : ''}</div>
    ${v == null && !(t != null && !D.a) ? `<p class="help">ยังไม่มีตัวเลข${prod ? 'รายสินค้า' : ''}ของปีนี้ ผู้ดูแลระบบเพิ่มได้ที่ ตั้งค่าทั่วไป › ข้อมูลแดชบอร์ด</p>` : ''}
    ${pr.length ? `<ul class="hx-pr">${pr.map(([k, x]) => `<li style="--pc:${PCOLS[prods.indexOf(k) % PCOLS.length] || '#94A3B8'}"><span class="dn-ic">${pIcon(k)}</span><span>${esc(k)}</span><i><i style="width:${(x / pr[0][1]) * 100}%"></i></i><b class="num">${fmtM(x)}</b></li>`).join('')}</ul>${D.derived ? '<p class="help">คำนวณย้อนจาก % เปลี่ยนแปลงที่กรมแถลงในปีถัดไป</p>' : psum && D.a && psum < D.a * 0.97 ? '<p class="help">แสดงเฉพาะสินค้าที่มีตัวเลขเผยแพร่</p>' : ''}` : ''}
    <div class="hx-ev"><span class="lbl">เหตุการณ์สำคัญที่กระทบรายได้</span>${(D.ev || []).length ? `<ul>${D.ev.map((e) => `<li class="hx-ev-${e.i}"><b aria-label="${EVI[e.i]?.[1] || ''}">${EVI[e.i]?.[0] || '•'}</b><span>${esc(e.t)}${e.u ? ` <a href="${esc(e.u)}" target="_blank" rel="noopener" class="hx-src">ที่มา</a>` : ''}</span></li>`).join('')}</ul>` : '<p class="help">ยังไม่มีบันทึกเหตุการณ์</p>'}</div>
  </aside>`;
  return `${chips}<div class="hx"><div class="hx-main">${svg}${leg}</div>${side}</div>`;
}
function histRerender() { const b = document.getElementById('hist-body'); if (b) b.innerHTML = histBody(); }
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act^="hx-"]'); if (!el) return;
  const a = el.dataset.act, v = el.dataset.v;
  if (a === 'hx-prod') { S.histProd = v; histRerender(); }
  else if (a === 'hx-year') { S.histYear = Number(v); histRerender(); }
});
document.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest?.('.hx-yr')) { e.preventDefault(); e.target.closest('.hx-yr').dispatchEvent(new MouseEvent('click', { bubbles: true })); } });

/* ---------- Settings: dashboard data (admin) ---------- */
const OD_TEMPL = {
  revenue: ['จังหวัด', 'สินค้า', 'ผลจริง (ล้านบาท)', 'เป้าหมาย (ล้านบาท)'],
  enforce: ['จังหวัด', 'สินค้า', 'ผลจริง (ล้านบาท)', 'เป้าหมาย (ล้านบาท)'],
  audit: ['จังหวัด', 'สินค้า', 'พบความผิด (ราย)', 'ตรวจสอบทั้งหมด (ราย)']
};
function odDraft() {
  if (!S.opsDraft) {
    const o = S.ops ? clone(S.ops) : { sample: false, products: opsProducts(), months: {}, targets: { audit: 60 } };
    if (!o.history) o.history = clone(HIST_DEFAULT);
    if (!o.annual) o.annual = { fy: 2570, revenue: null, enforce: null };
    if (!o.targets) o.targets = { audit: 60 };
    S.opsDraft = o;
  }
  return S.opsDraft;
}
function odBody() {
  const O = odDraft(), dis = S.canAdmin ? '' : 'disabled';
  const nin = (path, val, label, w = 140) => `<input class="input num" type="number" step="any" data-o="${path}" value="${val ?? ''}" aria-label="${label}" style="max-width:${w}px" ${dis}>`;
  const imp = S.odImp || { metric: 'revenue', m: O.asOf ?? 0 };
  const yrs = Object.keys(O.history.years).map(Number).sort((a, b) => a - b);
  const prods = O.products || opsProducts();
  const evY = Number(S.odEvYear) || yrs[yrs.length - 1];
  const evText = (O.history.years[evY]?.ev || []).map((e) => `${{ pos: '+', neg: '-', mix: '~', str: '*' }[e.i] || '*'} ${e.t}${e.u ? ' | ' + e.u : ''}`).join('\n');
  const monthsHave = Object.keys(O.months || {}).map(Number);
  const pv = S.odPreview;
  return `<p class="help">ข้อมูลชุดนี้ใช้กับหน้า Excise Dashboard (การ์ด แผนที่ สินค้า ภาษีมาจากไหน และสถิติย้อนหลัง) แยกจากการตั้งค่าแผน กด “บันทึกข้อมูลแดชบอร์ด” ด้านล่างเพื่อบันทึก</p>
  <div class="card lvl"><span class="lbl">เป้าหมายประจำปี</span>
    <div class="od-grid">
      <label>ปีงบประมาณ ${nin('annual.fy', O.annual.fy, 'ปีงบประมาณ', 110)}</label>
      <label>เป้าจัดเก็บภาษีทั้งปี (ล้านบาท) ${nin('annual.revenue', O.annual.revenue, 'เป้าจัดเก็บภาษีทั้งปี', 160)}</label>
      <label>ปราบปราม: ภาษีที่รักษา/เรียกคืนได้ทั้งปี (ล้านบาท) ${nin('annual.enforce', O.annual.enforce, 'เป้าปราบปรามทั้งปี', 160)}</label>
      <label>Hit rate เป้าหมาย (%) ${nin('targets.audit', O.targets.audit, 'เป้า hit rate', 110)}</label>
    </div></div>
  <div class="card lvl"><span class="lbl">นำเข้าผลรายเดือน (Excel หรือ CSV)</span>
    <p class="help">1 ไฟล์ = 1 ตัวชี้วัด × 1 เดือน คอลัมน์: จังหวัด · สินค้า · ผลจริง · เป้าหมาย (ตรวจสอบภาษีใช้ พบความผิด · ตรวจสอบทั้งหมด) ระบบรวมยอดรายจังหวัดและรายภาคให้เอง นำเข้าซ้ำเดือนเดิมจะแทนที่ข้อมูลเดิมของตัวชี้วัดนั้น</p>
    <div class="od-imp">
      <label>ตัวชี้วัด <select class="select" data-od="metric" ${dis}>${Object.entries(OPS).map(([k, o]) => `<option value="${k}" ${imp.metric === k ? 'selected' : ''}>${o.label}</option>`).join('')}</select></label>
      <label>เดือน <select class="select" data-od="m" ${dis}>${MONTHS.map((x, i) => `<option value="${i}" ${Number(imp.m) === i ? 'selected' : ''}>${x}${monthsHave.includes(i) ? ' · มีข้อมูล' : ''}</option>`).join('')}</select></label>
      <label class="btn btn-sm od-file ${dis ? 'disabled' : ''}">${ic('fileplus', 'ic-sm')}เลือกไฟล์<input type="file" accept=".xlsx,.xls,.csv" data-od-file ${dis} hidden></label>
      <button class="btn btn-sm btn-ghost" data-act="od-templ">${ic('download', 'ic-sm')}ดาวน์โหลดแบบฟอร์ม</button>
    </div>
    ${pv ? `<div class="od-pv ${pv.bad.length ? 'warn' : ''}"><b>${esc(pv.file)}</b> · ${OPS[pv.metric].label} · ${MONTHS[pv.m]}<br>อ่านได้ ${pv.rows} แถว · ${pv.provs} จังหวัด · ${pv.prods.length} สินค้า · ผลจริงรวม <b class="num">${fmtVal(pv.metric, pv.metric === 'audit' ? pv.sa / (pv.st || 1) * 100 : pv.sa)}</b> · เป้ารวม <b class="num">${fmtVal(pv.metric, pv.metric === 'audit' ? null : pv.st)}</b>${pv.bad.length ? `<br><span class="t-bad">ไม่รู้จักชื่อจังหวัด ${pv.bad.length} แถว: ${esc(pv.bad.slice(0, 8).join(', '))}${pv.bad.length > 8 ? ' …' : ''}</span>` : ''}
      <div class="item-row"><button class="btn btn-sm btn-primary" data-act="od-apply">${ic('check', 'ic-sm')}ใส่ข้อมูลนี้</button><button class="btn btn-sm btn-ghost" data-act="od-cancel">ยกเลิก</button></div></div>` : ''}
  </div>
  <div class="card lvl"><span class="lbl">สถิติรายได้ย้อนหลัง (ล้านบาท)</span>
    <div class="tbl-wrap"><table class="tbl od-hist"><thead><tr><th>ปีงบ</th><th>ผลจริง</th><th>เป้าหมาย</th><th>บางส่วน</th>${prods.map((k) => `<th>${esc(k)}</th>`).join('')}<th></th></tr></thead><tbody>
      ${yrs.map((y) => { const Y = O.history.years[y]; return `<tr><td class="num"><b>${y}</b></td><td>${nin(`history.years.${y}.a`, Y.a, 'ผลจริง ' + y, 110)}</td><td>${nin(`history.years.${y}.t`, Y.t, 'เป้าหมาย ' + y, 110)}</td><td><input class="input" data-o="history.years.${y}.partial" data-str value="${esc(Y.partial || '')}" placeholder="เช่น 11 เดือน" style="max-width:120px" ${dis}></td>${prods.map((k) => `<td>${nin(`history.years.${y}.prod.${k}`, Y.prod?.[k], k + ' ' + y, 100)}</td>`).join('')}<td>${S.canAdmin ? `<button class="icon-btn btn-danger" data-act="od-yr-del" data-v="${y}" aria-label="ลบปี ${y}">${ic('trash', 'ic-sm')}</button>` : ''}</td></tr>`; }).join('')}
    </tbody></table></div>
    ${S.canAdmin ? `<button class="btn btn-sm" data-act="od-yr-add">${ic('plus', 'ic-sm')}เพิ่มปีงบประมาณ</button>` : ''}
    <div class="od-ev"><label>เหตุการณ์สำคัญ ปีงบ <select class="select" data-od="evyear">${yrs.map((y) => `<option ${y === evY ? 'selected' : ''}>${y}</option>`).join('')}</select></label>
      <textarea class="textarea" rows="5" data-od-ev="${evY}" ${dis} placeholder="+ ผลบวก   - ผลลบ   ~ ผสม   * นโยบาย/โครงสร้าง  (ใส่ | ตามด้วยลิงก์ที่มาได้)">${esc(evText)}</textarea>
      <span class="help">1 บรรทัดต่อ 1 เหตุการณ์ ขึ้นต้นด้วย + − ~ หรือ * ตามผลกระทบ เช่น “- ลดภาษีดีเซล 3 บาท/ลิตร | https://…”</span></div>
  </div>
  ${S.canAdmin ? `<div class="card" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:space-between"><span><b>หน้าแสดงผลสาธารณะ (Vercel)</b><br><span class="help">ดาวน์โหลดไฟล์ public-data.json แล้วอัปโหลดทับใน GitHub โฟลเดอร์ dist/ หน้าเว็บบน Vercel จะอัปเดตเองภายในไม่กี่นาที (รวมแผนที่ไม่ใช่ร่าง โดยไม่มีชื่อผู้สร้าง · ไม่มีรายงานผลรายเดือนและข้อมูลผู้ใช้)</span></span><button class="btn" data-act="od-public">${ic('download', 'ic-sm')}ส่งออก public-data.json</button></div>` : ''}
  ${S.canAdmin ? `<div class="savebar od-save"><span class="status">${S.opsDirty ? `${ic('alert', 'ic-sm')}มีการแก้ไขข้อมูลแดชบอร์ดที่ยังไม่บันทึก` : 'ข้อมูลแดชบอร์ดเป็นปัจจุบัน'}</span><button class="btn btn-ghost" data-act="od-revert" ${S.opsDirty ? '' : 'disabled'}>ยกเลิกการแก้ไข</button><button class="btn btn-primary" data-act="od-save" ${S.opsDirty ? '' : 'disabled'}>${ic('check', 'ic-sm')}บันทึกข้อมูลแดชบอร์ด</button></div>` : ''}`;
}
function odDirty() { if (!S.opsDirty) { S.opsDirty = true; const b = $('.od-save'); if (b) { b.querySelector('.status').innerHTML = `${ic('alert', 'ic-sm')}มีการแก้ไขข้อมูลแดชบอร์ดที่ยังไม่บันทึก`; $$('button', b).forEach((x) => { x.disabled = false; }); } } }
const normProv = (n) => {
  let s = String(n || '').replace(/^\s*(สำนักงานสรรพสามิตพื้นที่|สสพ\.?|จังหวัด|จ\.)\s*/, '').replace(/\s+/g, '').trim();
  const bk = s.match(/^(กรุงเทพมหานคร|กรุงเทพฯ?|กทม\.?|bangkok)(พื้นที่)?([1-5])$/i); if (bk) return 'กรุงเทพ ' + bk[3];
  if (/^(กทม\.?|กรุงเทพ(ฯ|มหานคร)?|bangkok)$/i.test(s)) s = 'กรุงเทพมหานคร';
  return s;
};
const pnum = (v) => { if (v == null || v === '') return null; const n = Number(String(v).replace(/[,\s]/g, '')); return Number.isFinite(n) ? n : null; };
async function odReadFile(file) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
  const buf = await file.arrayBuffer(); let wb;
  if (/\.csv$/i.test(file.name)) {
    let txt = new TextDecoder('utf-8').decode(buf);
    if (txt.includes(String.fromCharCode(0xFFFD))) txt = new TextDecoder('windows-874').decode(buf);
    wb = window.XLSX.read(txt.replace(/^﻿/, ''), { type: 'string', raw: true });
  } else wb = window.XLSX.read(buf, { type: 'array' });
  return window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '', raw: true });
}
function odParse(rows, metric, m, fname) {
  const hi = rows.findIndex((r) => r.some((c) => /จังหวัด|province/i.test(String(c))));
  if (hi < 0) throw new Error('ไม่พบหัวคอลัมน์ “จังหวัด”');
  const h = rows[hi].map((c) => String(c));
  const find = (re) => h.findIndex((c) => re.test(c));
  const cP = find(/จังหวัด|province/i), cK = find(/สินค้า|product/i);
  const cA = find(metric === 'audit' ? /พบ|found|ผลจริง|actual/i : /ผลจริง|ผลการจัดเก็บ|actual/i);
  const cT = find(metric === 'audit' ? /ตรวจสอบทั้งหมด|ตรวจ|audited|เป้า|target/i : /เป้า|target|ประมาณการ/i);
  if (cA < 0) throw new Error('ไม่พบคอลัมน์ผลจริง'); if (cT < 0) throw new Error('ไม่พบคอลัมน์เป้าหมาย');
  const known = new Set([...allProvs(), ...BKK5]); const pp = {}, bad = [], prods = new Set(); let n = 0, sa = 0, st = 0;
  rows.slice(hi + 1).forEach((r) => {
    if (!r.some((c) => String(c).trim())) return;
    const pv = normProv(r[cP]); const a = pnum(r[cA]), t = pnum(r[cT]); if (a == null && t == null) return;
    if (!known.has(pv)) { bad.push(String(r[cP]).trim() || '(ว่าง)'); return; }
    const k = cK >= 0 ? String(r[cK]).trim() || 'อื่นๆ' : 'อื่นๆ'; prods.add(k);
    pp[pv] = pp[pv] || {}; const c = pp[pv][k] || [0, 0]; pp[pv][k] = [c[0] + (a || 0), c[1] + (t || 0)];
    n++; sa += a || 0; st += t || 0;
  });
  if (!n) throw new Error('ไม่พบแถวข้อมูลที่ใช้ได้');
  const prov = {}; Object.entries(pp).forEach(([p, o]) => { prov[p] = Object.values(o).reduce((s, x) => [s[0] + x[0], s[1] + x[1]], [0, 0]); });
  return { file: fname, metric, m: Number(m), rows: n, provs: Object.keys(pp).length, prods: [...prods], sa, st, bad, data: { prov, pp, real: true } };
}
function odTemplate() {
  if (!S.dl) { toast('ดาวน์โหลดไฟล์ไม่ได้ในมุมมองนี้ ลองเปิดหน้านี้ใน claude.ai', 'err'); return; }
  const imp = S.odImp || { metric: 'revenue' }; const head = OD_TEMPL[imp.metric];
  const lines = [head.join(',')]; allProvs().forEach((p) => opsProducts().forEach((k) => lines.push(`${p},${k},,`)));
  S.dl.save({ filename: `แบบฟอร์ม-${OPS[imp.metric].label.replace(/[^฀-๿a-zA-Z0-9]+/g, '')}.csv`, data: '﻿' + lines.join('\r\n') }).catch((e) => { if (e?.code !== 'declined') toast('ดาวน์โหลดไม่สำเร็จ', 'err'); });
}
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.dataset?.o) { setPath(odDraft(), t.dataset.o, t.dataset.str !== undefined ? t.value.trim() || null : pnum(t.value)); odDirty(); }
  else if (t.dataset?.odEv) {
    const y = t.dataset.odEv, map = { '+': 'pos', '-': 'neg', '−': 'neg', '~': 'mix', '*': 'str' };
    odDraft().history.years[y].ev = t.value.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const i = map[l[0]] || 'str'; const body = map[l[0]] ? l.slice(1).trim() : l; const [tx, u] = body.split('|').map((x) => x.trim()); return Object.assign({ i, t: tx }, /^https:\/\//.test(u || '') ? { u } : {}); });
    odDirty();
  }
});
document.addEventListener('change', async (e) => {
  const t = e.target;
  if (t.dataset?.od) {
    if (t.dataset.od === 'evyear') { S.odEvYear = Number(t.value); draftRerender(); return; }
    S.odImp = Object.assign({ metric: 'revenue', m: odDraft().asOf ?? 0 }, S.odImp || {}, { [t.dataset.od]: t.value }); return;
  }
  if (t.dataset && 'odFile' in t.dataset && t.files?.[0]) {
    const f = t.files[0]; t.value = '';
    if (f.size > 10 * 1024 * 1024) { toast('ไฟล์ใหญ่เกิน 10 MB', 'err'); return; }
    const imp = Object.assign({ metric: 'revenue', m: odDraft().asOf ?? 0 }, S.odImp || {});
    try { S.odPreview = odParse(await odReadFile(f), imp.metric, imp.m, f.name); draftRerender(); }
    catch (er) { toast('อ่านไฟล์ไม่สำเร็จ: ' + (er.message || 'รูปแบบไม่ถูกต้อง'), 'err'); }
  }
});
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act^="od-"]'); if (!el) return;
  const a = el.dataset.act, v = el.dataset.v, O = odDraft();
  if (a === 'od-templ') odTemplate();
  else if (a === 'od-cancel') { S.odPreview = null; draftRerender(); }
  else if (a === 'od-apply') {
    const p = S.odPreview; if (!p) return;
    O.months = O.months || {}; const mo = O.months[String(p.m)] = O.months[String(p.m)] || {};
    mo[p.metric] = p.data; O.asOf = Math.max(Number(O.asOf ?? -1), p.m);
    O.products = Array.from(new Set([...(O.products || opsProducts()), ...p.prods]));
    S.odPreview = null; odDirty(); draftRerender(); toast('ใส่ข้อมูลแล้ว กด “บันทึกข้อมูลแดชบอร์ด” เพื่อยืนยัน');
  }
  else if (a === 'od-yr-add') { const ys = Object.keys(O.history.years).map(Number); const n = (ys.length ? Math.max(...ys) : 2569) + 1; O.history.years[n] = { a: null, t: null, ev: [] }; odDirty(); draftRerender(); }
  else if (a === 'od-yr-del') { delete O.history.years[v]; odDirty(); draftRerender(); }
  else if (a === 'od-revert') { S.opsDraft = null; S.opsDirty = false; S.odPreview = null; draftRerender(); }
  else if (a === 'od-public') {
    const plans = (S.allPlans || []).filter((p) => p.name && p.status !== 'draft').map((p) => { const q = Object.assign({}, p); delete q.ownerId; delete q.ownerName; return q; });
    const data = JSON.stringify({ exportedAt: Date.now(), org: Object.assign({}, cfg(), { contacts: undefined }), ops: S.ops || null, hr: S.hr || null, plans });
    S.dl.save({ filename: 'public-data.json', data }).catch((e) => { if (e?.code !== 'declined') toast('ดาวน์โหลดไม่สำเร็จ', 'err'); });
  }
  else if (a === 'od-save') {
    const d = clone(O); d.updatedAt = Date.now();
    const allReal = Object.values(d.months || {}).every((mo) => ['revenue', 'enforce', 'audit'].every((k) => mo[k]?.real));
    d.sample = !allReal;
    S.db.doc('config/ops').set(d).then(() => { S.opsDirty = false; S.opsDraft = null; toast('บันทึกข้อมูลแดชบอร์ดแล้ว'); draftRerender(); })
      .catch(() => toast('บันทึกไม่สำเร็จ เฉพาะผู้ดูแลระบบแก้ไขได้', 'err'));
  }
});
