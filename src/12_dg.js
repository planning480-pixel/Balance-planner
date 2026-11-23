/* ===================== N · ความพร้อมรัฐบาลดิจิทัล (DG Readiness) =====================
   ข้อมูลจริงปี 2568 จากรายงานผลสำรวจระดับความพร้อมรัฐบาลดิจิทัล (สพร./DGA) ของกรมสรรพสามิต
   ปี 2569–2574 ยังไม่ประกาศผล → กรอกผลรายปีได้ที่ KPI Setting (KPI 6) แล้วกราฟจะต่อให้เอง */
const DG = {
  year: 2568, score: 91.12, level: 4,
  bench: [['กรมอันดับ 1 (กลุ่มกรมที่ให้บริการ)', 93.81, 'top'], ['กรมสรรพสามิต', 91.12, 'me'], ['เฉลี่ยกรมในประเภทหน่วยงานราชการ', 77.40], ['เฉลี่ยกรมในกระทรวงการคลัง', 68.44], ['เฉลี่ยกรมที่ให้บริการเป็นหลัก', 68.24]],
  // [ชื่อไทย, ชื่ออังกฤษ, กรม, เฉลี่ยกรมบริการ, เฉลี่ยประเภทราชการ, เฉลี่ยกระทรวง, อันดับ 1, ระดับ, ด้านย่อย [ชื่อ, ระดับ]]
  pillars: [
    ['แนวนโยบายและหลักปฏิบัติ', 'Policies & Practices', 88.89, 71.32, 81.25, 71.70, 93.89, 4, [['Digital Policy', 4], ['Cyber Security Policy', 5], ['Legal & Regulatory', 5], ['Data Policy', 5]]],
    ['กระบวนการพัฒนาด้วยข้อมูล', 'Data-driven Practices', 93.85, 66.57, 75.53, 66.78, 96.86, 4, [['Data Governance', 5], ['Shareable Data', 5], ['Open Data', 3], ['Data Privacy', 5]]],
    ['ศักยภาพบุคลากรด้านดิจิทัล', 'Digital Capability', 84.86, 53.75, 66.54, 55.32, 82.87, 4, [['Digital Leadership', 5], ['Training & Development', 4], ['Digital Competency', 5]]],
    ['บริการภาครัฐ', 'Public Services', 96.33, 73.81, 81.74, 72.58, 97.87, 4, [['Service Provision', 5], ['Promotion for Digital Usage', 5], ['Customer Experience', 4], ['Public Participation', 5]]],
    ['บริหารจัดการแบบดิจิทัล', 'Smart Back Office', 92.00, 71.34, 79.29, 74.22, 97.00, 4, [['Integrated Enterprise', 5], ['Process Optimization', 4]]],
    ['โครงสร้างพื้นฐานมั่นคงปลอดภัย', 'Secure & Efficient Infrastructure', 89.00, 74.71, 81.64, 75.00, 96.75, 4, [['Reliable Infrastructure', 4], ['Cyber Security', 5]]],
    ['เทคโนโลยีดิจิทัลและการนำไปใช้', 'Digital Technology Practices', 85.71, 70.51, 78.25, 67.90, 92.86, 5, [['Digital Technology Practices', 5]]]
  ],
  // ด้านย่อยที่ยังไม่ถึงระดับ 5 → สิ่งที่ต้องทำ (สรุปจากข้อเสนอแนะในรายงาน) · กลยุทธ์ที่รับผิดชอบ · ปีที่เสนอ
  gaps: [
    ['Open Data', 3, 'เปิดเผยรายชื่อชุดข้อมูลเป็น Open Data แบบมีโครงสร้าง อ่านด้วยเครื่องได้ (Machine-readable) ครบทุกชุด และปรับให้เป็นปัจจุบัน', 'N2', 2569],
    ['Digital Policy', 4, 'ทำแผนปฏิบัติการดิจิทัลของกรมให้ครอบคลุมประเด็นแผนพัฒนารัฐบาลดิจิทัล 2566–2570 อย่างน้อย 10 จาก 12 ข้อ', 'N1', 2569],
    ['Customer Experience', 4, 'ปรับเว็บไซต์กรมตามมาตรฐานเว็บไซต์ภาครัฐ 3.0 (W3C, WCAG 2.0, HTTPS, ค้นหาขั้นสูง, Responsive) ให้ผ่านรายการตรวจมากขึ้น', 'N3', 2570],
    ['Process Optimization', 4, 'ใช้แพลตฟอร์มทำงานร่วมกันอย่างน้อย 3 ประเภท (แชท อีเมล/ปฏิทิน ประชุมออนไลน์ เอกสารร่วม) และรองรับทำงานนอกสำนักงานครบ (Notebook, VPN/VDI, Check-in)', 'N3', 2570],
    ['Training & Development', 4, 'พัฒนาทักษะดิจิทัลบุคลากรให้ครบ 7 ด้านตามแนวทาง ก.พ. 2566–2570 และวัดผลการพัฒนา', 'N1', 2571],
    ['Reliable Infrastructure', 4, 'ขยายการใช้โครงสร้างพื้นฐานกลางภาครัฐที่มั่นคงปลอดภัย (Cloud GDCC/Cloud First, เครือข่าย GIN/DG-Link, Work D) ให้ครบ', 'N4', 2571]
  ],
  src: 'รายงานผลการสำรวจระดับความพร้อมรัฐบาลดิจิทัล ปี 2568 (สพร.)'
};
const DG_LV = ['', 'Initial', 'Developing', 'Defined', 'Integrated', 'Optimizing'];
const DG_YEARS = [2568, 2569, 2570, 2571, 2572, 2573, 2574];
function dgSeries() {
  const k = kpiAny('3.1'), R = k ? kpiResults(k) : {};
  return DG_YEARS.map((y) => ({ y, v: R[y]?.v ?? (y === DG.year ? DG.score : null) }));
}
function dgTimeline() {
  const S0 = dgSeries(), W = 440, H = 200, L = 30, Rr = 12, T = 18, B = 44;
  const lo = 80, hi = 100, x = (i) => L + (i * (W - L - Rr)) / (DG_YEARS.length - 1), y = (v) => T + ((hi - v) * (H - T - B)) / (hi - lo);
  const pts = S0.map((p, i) => (p.v == null ? null : [x(i), y(p.v), p])).filter(Boolean);
  const grid = [80, 85, 90, 95, 100].map((g) => `<line x1="${L}" x2="${W - Rr}" y1="${y(g)}" y2="${y(g)}" class="dgt-g"/><text x="${L - 6}" y="${y(g) + 4}" class="dgt-a" text-anchor="end">${g}</text>`).join('');
  const tgt = `<line x1="${L}" x2="${W - Rr}" y1="${y(90)}" y2="${y(90)}" class="dgt-t"/><text x="${W - Rr}" y="${y(90) + 13}" class="dgt-tl" text-anchor="end">เป้า KPI 6 ≥ 90</text>`;
  const top = `<line x1="${L}" x2="${W - Rr}" y1="${y(93.81)}" y2="${y(93.81)}" class="dgt-top"/><text x="${W - Rr}" y="${y(93.81) - 5}" class="dgt-tl dgt-tl2" text-anchor="end">กรมอันดับ 1 ปี 2568 = 93.81</text>`;
  const line = pts.length > 1 ? `<polyline points="${pts.map((p) => p[0] + ',' + p[1]).join(' ')}" class="dgt-l"/>` : '';
  const dots = S0.map((p, i) => p.v == null
    ? `<circle cx="${x(i)}" cy="${y(90)}" r="5" class="dgt-p"/><text x="${x(i)}" y="${H - B + 30}" class="dgt-s" text-anchor="middle">รอผล</text>`
    : `<circle cx="${x(i)}" cy="${y(p.v)}" r="6" class="dgt-d"/><text x="${x(i)}" y="${y(p.v) - 11}" class="dgt-v" text-anchor="middle">${p.v.toFixed(2)}</text><text x="${x(i)}" y="${H - B + 30}" class="dgt-s dgt-s1" text-anchor="middle">ข้อมูลจริง</text>`).join('');
  const xl = DG_YEARS.map((yy, i) => `<text x="${x(i)}" y="${H - B + 16}" class="dgt-x" text-anchor="middle">${yy}</text>`).join('');
  return `<svg class="dgt" viewBox="0 0 ${W} ${H}" role="img" aria-label="คะแนน DG Readiness ปี 2568 ถึง 2574: ปี 2568 ได้ ${DG.score} ปีอื่นรอผล">${grid}${top}${tgt}${line}${dots}${xl}</svg>`;
}
function dgPanel() {
  const P = DG.pillars, subs = P.flatMap((p) => p[8]), n5 = subs.filter((s) => s[1] === 5).length;
  const gapTop = DG.score - 93.81, gapAvg = DG.score - 68.24;
  const lvBox = `<div class="dg-lv" aria-label="ระดับความพร้อม ${DG.level} ${DG_LV[DG.level]}">${[1, 2, 3, 4, 5].map((i) => `<span class="${i <= DG.level ? 'on' : ''} l${i}" title="ระดับ ${i} ${DG_LV[i]}"></span>`).join('')}</div>`;
  const head = `<div class="dg-score"><small>คะแนนปี ${DG.year}</small><b>${DG.score.toFixed(2)}<em>%</em></b>${lvBox}<span class="dg-lvt">ระดับ ${DG.level} ${DG_LV[DG.level]} (จาก 5)</span>
    <div class="dg-pills"><span class="dg-up">▲ ${gapAvg.toFixed(1)} คะแนน เหนือค่าเฉลี่ยกรมที่ให้บริการ</span><span class="dg-dn">▼ ${Math.abs(gapTop).toFixed(2)} คะแนน จากกรมอันดับ 1</span><span class="dg-nt">ด้านย่อยระดับ 5 แล้ว ${n5}/${subs.length}</span></div></div>`;
  const bmax = 100;
  const bench = `<div class="dg-bench">${DG.bench.map(([n, v, t]) => `<div class="dgb ${t ? 'dgb-' + t : ''}"><span>${esc(n)}</span><i style="width:${(v / bmax) * 100}%"></i><b>${v.toFixed(2)}</b></div>`).join('')}</div>`;
  const sub = (s) => `<span class="dg-sub l${s[1]}" title="${esc(s[0])} ระดับ ${s[1]} ${DG_LV[s[1]]}">${esc(s[0])}<b>${s[1]}</b></span>`;
  const rows = P.map((p, i) => `<tr><td><span class="dg-lvs l${p[7]}" title="ระดับของด้าน">${p[7]}</span> <b>${i + 1}. ${esc(p[0])}</b> <small>${esc(p[1])}</small><div class="dg-subs">${p[8].map(sub).join('')}</div></td>
    <td class="dg-barc"><div class="dg-bar"><i style="width:${p[2]}%" class="${p[2] >= 90 ? 'ok' : 'mid'}"></i><span class="dg-m dg-mavg" style="left:${p[3]}%" title="เฉลี่ยกรมที่ให้บริการ ${p[3]}"></span><span class="dg-m dg-mtop" style="left:${p[6]}%" title="อันดับ 1 ${p[6]}"></span></div></td>
    <td class="num"><b>${p[2].toFixed(2)}</b></td><td class="num ${p[2] - p[6] >= 0 ? 't-ok' : 't-bad'}">${p[2] - p[6] >= 0 ? '+' : ''}${(p[2] - p[6]).toFixed(2)}</td></tr>`).join('');
  const table = `<div class="tbl-wrap"><table class="tbl dg-tbl"><thead><tr><th>ด้าน · ด้านย่อย (ตัวเลข = ระดับ 1–5)</th><th>คะแนน</th><th class="num">กรม</th><th class="num">vs อันดับ 1</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  const gaps = `<ol class="dg-gaps">${DG.gaps.map(([n, lv, t, st, y]) => `<li><div class="dg-gh"><span class="dg-sub l${lv}">${esc(n)}<b>${lv}</b></span><span class="dg-arrow">→ 5</span><span class="chip">${esc(st)}</span><span class="dg-yr">ปี ${y}</span></div><p>${esc(t)}</p></li>`).join('')}</ol>`;
  const strong = [`คะแนน ${DG.score}% ระดับ ${DG.level} Integrated สูงกว่าค่าเฉลี่ยกรมที่ให้บริการ (68.24%) และค่าเฉลี่ยกรมในกระทรวงการคลัง (68.44%) กว่า 22 คะแนน`,
    'ด้านเด่น: บริการภาครัฐ 96.33% และข้อมูล 93.85% · ด้านเทคโนโลยีดิจิทัลถึงระดับ 5 Optimizing แล้ว',
    `ด้านย่อย ${n5} จาก ${subs.length} ด้านอยู่ระดับสูงสุด (5) แล้ว`,
    'ศักยภาพบุคลากรดิจิทัล 84.86% แม้ต่ำสุดของกรม แต่สูงกว่ากรมอันดับ 1 (82.87%)'];
  const weak = [`ยังห่างกรมอันดับ 1 (93.81%) อยู่ ${Math.abs(gapTop).toFixed(2)} คะแนน`,
    'ห่างอันดับ 1 มากที่สุด: โครงสร้างพื้นฐานมั่นคงปลอดภัย (−7.75) และเทคโนโลยีดิจิทัล (−7.15)',
    'Open Data อยู่ระดับ 3 เป็นด้านย่อยเดียวที่ต่ำกว่าระดับ 4',
    '6 จาก 7 ด้านยังอยู่ระดับ 4 เพราะมีด้านย่อยอย่างน้อย 1 เรื่องยังไม่ถึงระดับ 5'];
  const rec = ['ยกด้านย่อย 6 เรื่องให้ถึงระดับ 5 ทุกด้านมีโอกาสขึ้นระดับ 5 Optimizing',
    'Quick win ปี 2569: Open Data และแผนดิจิทัลกรมให้ครอบคลุมแผนรัฐบาลดิจิทัล ≥ 10/12 ข้อ',
    'รักษา KPI 6 ≥ 90 ทุกปี และตั้งเป้าท้าทายให้ถึงระดับกรมอันดับ 1 (≥ 93.81)',
    'มอบเจ้าภาพรายด้านย่อยตามกลยุทธ์ N1–N4 และติดตามผลทุกไตรมาส'];
  const col = (t, cls, xs) => `<div class="dg-ic ${cls}"><h4>${t}</h4><ul>${xs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
  return `<div class="dg">
    <section class="zc dg-top"><div class="zc-h"><div><h2>ความพร้อมรัฐบาลดิจิทัล (DG Readiness) ปี 2568–2574</h2><p>${esc(DG.src)} · ปี 2569–2574 รอประกาศผล</p></div><span class="chip chip-ok">ข้อมูลจริง ปี 2568</span></div>
      <div class="dg-row">${head}<div class="dg-tl"><div class="dg-cap">เส้นทางการพัฒนาไอที 2568–2574</div>${dgTimeline()}</div><div><div class="dg-cap">เทียบหน่วยงานอื่น ปี 2568</div>${bench}</div></div></section>
    <div class="dg-2"><section class="zc"><div class="zc-h"><div><h2>คะแนนราย 7 ด้าน</h2><p>แท่ง = กรมสรรพสามิต · เส้นเทา = เฉลี่ยกรมที่ให้บริการ · เส้นน้ำเงินเข้ม = กรมอันดับ 1</p></div></div>${table}</section>
      <section class="zc"><div class="zc-h"><div><h2>6 เรื่องที่ต้องยกระดับให้ถึงระดับ 5</h2><p>สรุปจากข้อเสนอแนะในรายงาน · ปีเป็นข้อเสนอลำดับการทำ</p></div></div>${gaps}</section></div>
    <section class="zc"><div class="dg-ins">${col('จุดแข็ง', 'g', strong)}${col('จุดที่ต้องพัฒนา', 'r', weak)}${col('ข้อเสนอต่อผู้บริหาร', 'b', rec)}</div></section>
  </div>`;
}
/* compact block for the executive PDF (page N) */
function xrDG() {
  const P = DG.pillars;
  const html = `<section><div class="xr-sh">ผล · ความพร้อมรัฐบาลดิจิทัล ปี ${DG.year} (ข้อมูลจริง) · ${DG.score}% ระดับ ${DG.level} ${DG_LV[DG.level]} · อันดับ 1 = 93.81 · เฉลี่ยกรมบริการ 68.24</div>
    <table class="xr-t"><thead><tr><th>ด้าน</th><th class="n">กรม</th><th class="n">เฉลี่ยกรมบริการ</th><th class="n">อันดับ 1</th><th class="n">ระดับ</th><th>ด้านย่อยที่ยังไม่ถึงระดับ 5</th></tr></thead><tbody>
    ${P.map((p) => `<tr><td>${esc(p[0])}</td><td class="n"><b>${p[2].toFixed(2)}</b></td><td class="n">${p[3].toFixed(2)}</td><td class="n">${p[6].toFixed(2)}</td><td class="n">${p[7]}</td><td>${p[8].filter((s) => s[1] < 5).map((s) => `${esc(s[0])} (${s[1]})`).join(', ') || '—'}</td></tr>`).join('')}</tbody></table>
    <p class="xr-note">ปี 2569–2574 รอประกาศผล · เป้า KPI 6 ≥ 90 ทุกปี</p></section>`;
  return { html, p: ['ยังห่างกรมอันดับ 1 อยู่ 2.69 คะแนน · ห่างมากสุดด้านโครงสร้างพื้นฐาน (−7.75) และเทคโนโลยีดิจิทัล (−7.15)', 'Open Data อยู่ระดับ 3 ต่ำสุดในด้านย่อย'], r: ['ยกด้านย่อย 6 เรื่องให้ถึงระดับ 5 (Open Data, Digital Policy, Customer Experience, Process Optimization, Training, Reliable Infrastructure)', 'Quick win ปี 2569: Open Data และแผนดิจิทัลกรมให้ครอบคลุมแผนรัฐบาลดิจิทัล ≥ 10/12 ข้อ'] };
}
