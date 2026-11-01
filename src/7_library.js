/* ===================== คลังแผน: เมนู "แผนระดับต่างๆ" ===================== */
const LIB_DEFAULT = {
  groups: [
    { id: 'l1', name: 'แผนระดับ 1', color: '#1A5BD6', items: [
      { title: 'ยุทธศาสตร์ชาติ 20 ปี', sub: 'พ.ศ. 2561–2580', url: 'https://www.nesdc.go.th/nscr/ns/', cover: 'lib/national-strategy.jpg' }] },
    { id: 'l2', name: 'แผนระดับ 2', color: '#0E9F6E', items: [
      { title: 'แผนแม่บทภายใต้ยุทธศาสตร์ชาติ (พ.ศ. 2566–2580)', sub: 'ฉบับแก้ไขเพิ่มเติม', url: 'https://www.nesdc.go.th/nscr/masterplan-plans/', cover: 'lib/master-plan.jpg' },
      { title: 'แผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ ฉบับที่ 13', sub: 'พ.ศ. 2566–2570', url: 'https://www.nesdc.go.th/the-national-economic-and-social-development-plan/', cover: 'lib/nesdp13.jpg' },
      { title: 'แผนการปฏิรูปประเทศ', sub: 'ฉบับปรับปรุง', url: 'https://www.nesdc.go.th/nscr/cr/', cover: 'lib/reform.jpg' },
      { title: 'นโยบายและแผนระดับชาติว่าด้วยความมั่นคงแห่งชาติ', sub: 'พ.ศ. 2566–2570', url: 'https://www.nsc.go.th/%E0%B8%99%E0%B9%82%E0%B8%A2%E0%B8%9A%E0%B8%B2%E0%B8%A2%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B9%81%E0%B8%9C%E0%B8%99%E0%B8%A3%E0%B8%B0%E0%B8%94%E0%B8%B1%E0%B8%9A%E0%B8%8A%E0%B8%B2%E0%B8%95%E0%B8%B4%E0%B8%A7-3/', cover: 'lib/security.jpg' }] },
    { id: 'l3', name: 'แผนระดับ 3', color: '#7C3AED', items: [
      { title: 'แผนยุทธศาสตร์กรมสรรพสามิต', sub: 'พ.ศ. 2570–2574 (ร่าง)', url: 'plan-2570-2574.pdf', cover: 'plan/p-1.jpg' }] },
    { id: 'budget', name: 'เอกสารงบประมาณรายจ่ายประจำปี', color: '#D97706', items: [
      { title: 'ร่าง พ.ร.บ. งบประมาณรายจ่ายประจำปี พ.ศ. 2570', sub: 'สำนักงบประมาณ', url: 'https://www.bb.go.th/topic3.php?catID=1538&gid=860&mid=544#', cover: 'lib/budget-2570.jpg' }] },
    { id: 'action', name: 'แผนปฏิบัติราชการ', color: '#DB2777', items: [] }
  ]
};
/* ปกมาตรฐาน: ใช้เมื่อรายการยังไม่ได้ใส่รูปปกเอง (จับคู่จากคำในชื่อ) */
const LIB_COVERS = [[/ยุทธศาสตร์ชาติ/, 'lib/national-strategy.jpg', /แผนแม่บท/], [/แผนแม่บท/, 'lib/master-plan.jpg'], [/เศรษฐกิจและสังคมแห่งชาติ/, 'lib/nesdp13.jpg'], [/ปฏิรูปประเทศ/, 'lib/reform.jpg'], [/ความมั่นคงแห่งชาติ/, 'lib/security.jpg'], [/งบประมาณรายจ่าย/, 'lib/budget-2570.jpg'], [/ยุทธศาสตร์กรมสรรพสามิต/, 'plan/p-1.jpg']];
const libCoverOf = (it) => it.cover || (LIB_COVERS.find(([re, , not]) => re.test(it.title || '') && !(not && not.test(it.title || ''))) || [])[1] || '';
const libData = () => (cfg().library?.groups ? cfg().library : LIB_DEFAULT);
const libOk = (u) => !!u && (/^https:\/\/\S+\.\S+/.test(u) || /^[\w./-]+\.(pdf|html?)$/i.test(u));

function libCover(it, g) {
  const cv = libCoverOf(it); if (cv) return `<img src="${esc(cv)}" alt="" loading="lazy">`;
  return `<span class="lib-gen" style="--c:${esc(g.color)}">${ic('book')}<b>${esc(it.title)}</b>${it.sub ? `<small>${esc(it.sub)}</small>` : ''}</span>`;
}
function libCard(it, g) {
  const inner = `<span class="lib-cov">${libCover(it, g)}</span>
    <span class="lib-b"><b class="lib-t">${esc(it.title || 'ไม่มีชื่อ')}</b>${it.sub ? `<span class="lib-s">${esc(it.sub)}</span>` : ''}<i class="lib-bar" style="background:${esc(g.color)}"></i></span>
    <span class="lib-x">${ic(libOk(it.url) ? 'external' : 'lock', 'ic-sm')}</span>`;
  return libOk(it.url)
    ? `<a class="lib-card" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer" title="${esc(it.title)} (เปิดแท็บใหม่)">${inner}</a>`
    : `<button type="button" class="lib-card lib-nolink" data-lib-nolink title="${esc(it.title)}">${inner}</button>`;
}
function libBody() {
  const q = (S.libQ || '').trim().toLowerCase();
  const gs = libData().groups.map((g) => ({ g, items: (g.items || []).filter((it) => !q || `${it.title} ${it.sub}`.toLowerCase().includes(q)) }))
    .filter((x) => !q || x.items.length);
  if (!gs.length) return `<div class="empty">${ic('book')}<b>ไม่พบแผนที่ค้นหา</b><span>ลองใช้คำอื่น</span></div>`;
  return gs.map(({ g, items }) => `<section class="lib-g">
    <div class="lib-h"><span class="lib-chip" style="--c:${esc(g.color)}">${esc(g.name)}</span><span class="muted small">${items.length} รายการ</span></div>
    ${items.length ? carousel(items.map((it) => libCard(it, g)).join(''), 'lib-' + g.id)
      : `<div class="lib-empty">${ic('file', 'ic-sm')}ยังไม่มีเอกสารในหมวดนี้${S.isSuper ? ' · เพิ่มได้ที่ ตั้งค่าทั่วไป › คลังแผน' : ''}</div>`}
  </section>`).join('');
}
function viewLibrary() {
  return `<div class="ph lib-ph"><div class="ph-t"><h1>แผนระดับต่างๆ</h1><span class="muted small">คลังแผนและเอกสารที่เกี่ยวข้องกับแผนยุทธศาสตร์กรมสรรพสามิต · กดการ์ดเพื่อเปิดเอกสาร</span></div>
    <label class="lib-q"><span class="sr">ค้นหาแผน</span><input class="input" id="lib-q" type="search" placeholder="ค้นหาแผนในระบบ" value="${esc(S.libQ || '')}"></label></div>
  <div id="lib-body" class="lib">${libBody()}</div>`;
}
document.addEventListener('input', (e) => {
  if (e.target.id !== 'lib-q') return;
  S.libQ = e.target.value; S.carX = {};
  $('#lib-body').innerHTML = libBody(); initCarousels();
});
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-lib-nolink]')) toast(S.isSuper ? 'ยังไม่ได้ใส่ลิงก์ ใส่ได้ที่ ตั้งค่าทั่วไป › คลังแผน' : 'ยังไม่มีลิงก์ของเอกสารนี้');
});

/* ---------- ตั้งค่า: คลังแผน ---------- */
function libSetupBody(D) {
  if (!D.library?.groups) D.library = clone(libData());
  const dis = S.canAdmin ? '' : 'disabled';
  const inp = (path, val, label, w) => `<input class="input" data-d="${path}" value="${esc(val || '')}" aria-label="${label}" style="min-width:${w}px" ${dis}>`;
  const gin = (path, val) => `<input class="input" data-d="${path}" value="${esc(val || '')}" aria-label="ชื่อหมวด" style="max-width:320px" ${dis}>`;
  return `<p class="help">รายการในเมนู “แผนระดับต่างๆ” ลิงก์ต้องขึ้นต้นด้วย https:// (หรือชื่อไฟล์ในแอป เช่น plan-2570-2574.pdf) · รูปปกใส่เป็นลิงก์รูป https:// หรือชื่อไฟล์ ถ้าเว้นว่างระบบสร้างปกให้อัตโนมัติ</p>` +
    D.library.groups.map((g, gi) => `<div class="card lib-set">
      <div class="lib-set-h"><span class="lib-chip" style="--c:${esc(g.color)}">${esc(g.name)}</span>${gin(`library.groups.${gi}.name`, g.name)}</div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>ชื่อแผน / เอกสาร</th><th>รายละเอียด (ปี / ฉบับ)</th><th>ลิงก์</th><th>รูปปก</th><th></th></tr></thead><tbody>
      ${(g.items || []).map((it, i) => `<tr><td>${inp(`library.groups.${gi}.items.${i}.title`, it.title, 'ชื่อแผน', 220)}</td><td>${inp(`library.groups.${gi}.items.${i}.sub`, it.sub, 'รายละเอียด', 150)}</td><td>${inp(`library.groups.${gi}.items.${i}.url`, it.url, 'ลิงก์', 220)}</td><td>${inp(`library.groups.${gi}.items.${i}.cover`, it.cover, 'รูปปก', 160)}</td>
        <td>${S.canAdmin ? `<button class="icon-btn btn-danger" data-act="d-del" data-v="library.groups.${gi}.items.${i}" aria-label="ลบรายการ">${ic('trash', 'ic-sm')}</button>` : ''}</td></tr>`).join('')}
      </tbody></table></div>
      ${S.canAdmin ? `<button class="btn btn-sm btn-ghost" data-lib-add="${gi}" style="justify-self:start">${ic('plus', 'ic-sm')}เพิ่มรายการใน ${esc(g.name)}</button>` : ''}
    </div>`).join('');
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-lib-add]'); if (!b || !S.draft) return;
  if (!S.draft.library?.groups) S.draft.library = clone(libData());
  S.draft.library.groups[Number(b.dataset.libAdd)].items.push({ title: '', sub: '', url: '', cover: '' });
  markDirty(); draftRerender();
});
