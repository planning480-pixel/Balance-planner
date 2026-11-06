/* ---------- KPI Setting ---------- */
function roNote() { return S.canAdmin ? '' : `<div class="ro-note">${ic('lock', 'ic-sm')}ดูได้อย่างเดียว เฉพาะ Super admin แก้ไขได้</div>`; }
function dirtyBar() { return S.canAdmin ? `<div class="savebar"><span class="status">${S.dirty ? `${ic('alert', 'ic-sm')}มีการแก้ไขที่ยังไม่บันทึก` : 'ยังไม่มีการแก้ไข'}</span><button class="btn" data-act="cfg-revert" ${S.dirty ? '' : 'disabled'}>ยกเลิกการแก้ไข</button><button class="btn btn-primary" data-act="cfg-save" ${S.dirty ? '' : 'disabled'}>${ic('check', 'ic-sm')}บันทึกการเปลี่ยนแปลง</button></div>` : ''; }
const din = (path, val, opts = {}) => opts.ta
  ? `<textarea class="textarea" data-d="${path}" aria-label="${esc(opts.label || path)}" ${S.canAdmin ? '' : 'disabled'}>${esc(val)}</textarea>`
  : `<input class="input" data-d="${path}" value="${esc(val)}" aria-label="${esc(opts.label || path)}" ${opts.w ? `style="min-width:${opts.w}"` : ''} ${S.canAdmin ? '' : 'disabled'}>`;

function viewKpi() {
  const g = needCfg(); if (g) return g;
  const D = S.draft;
  const unitsOpt = (sel) => `<option value="">—</option>` + D.units.map((u) => `<option value="${esc(u.id)}" ${u.id === sel ? 'selected' : ''}>${esc(u.name)}</option>`).join('');
  const rows = D.pillars.map((p) => {
    const ks = D.kpis.map((k, i) => ({ k, i })).filter((x) => x.k.pillar === p.code);
    return `<tr class="grp-h" data-p="${p.code}"><td colspan="9">ยุทธศาสตร์ที่ ${p.num} · ${esc(p.code)} ${esc(p.name_en)}</td></tr>` +
      ks.map(({ k, i }) => {
        const n = S.plans.filter((x) => (x.kpis || []).includes(k.id) && x.name).length;
        return `<tr><td>${din(`kpis.${i}.id`, k.id, { w: '64px', label: 'รหัส' })}</td>
          <td style="min-width:280px;display:grid;gap:6px">${din(`kpis.${i}.name`, k.name, { ta: true, label: 'ชื่อตัวชี้วัด' })}${din(`kpis.${i}.name_en`, k.name_en, { label: 'ชื่อภาษาอังกฤษ' })}${din(`kpis.${i}.calc`, k.calc || '', { ta: true, label: 'วิธีคำนวณ' })}<span class="help">ช่องล่าง: วิธีคำนวณ (แสดงเมื่อชี้ที่ไอคอน ⓘ)</span></td>
          <td style="min-width:200px">${din(`kpis.${i}.target`, k.target, { label: 'ค่าเป้าหมาย' })}</td>
          <td style="min-width:130px">${din(`kpis.${i}.baseline`, k.baseline, { label: 'ค่าฐาน' })}</td>
          <td style="min-width:220px"><div class="kset"><span class="help">ผลล่าสุด</span>${din(`kpis.${i}.latest`, k.latest ?? '', { label: 'ผลล่าสุด' })}<span class="help">ณ งวด</span>${din(`kpis.${i}.latestAt`, k.latestAt || '', { label: 'งวดของผลล่าสุด' })}<span class="help">เป้าเทียบ</span><span style="display:flex;gap:6px">${din(`kpis.${i}.tval`, k.tval ?? '', { label: 'ค่าเป้าหมายตัวเลข' })}${din(`kpis.${i}.unit`, k.unit || '', { label: 'หน่วย', w: '72px' })}</span><span class="help">ทิศทาง</span><select class="select" data-d="kpis.${i}.dir" aria-label="ทิศทางที่ดี" ${S.canAdmin ? '' : 'disabled'}><option value="ge" ${k.dir !== 'le' ? 'selected' : ''}>≥ ยิ่งมากยิ่งดี</option><option value="le" ${k.dir === 'le' ? 'selected' : ''}>≤ ยิ่งน้อยยิ่งดี</option></select></div></td>
          <td style="min-width:200px">${din(`kpis.${i}.detailUrl`, k.detailUrl || '', { label: 'ลิงก์หน้ารายละเอียด' })}<span class="help">https:// หน้ารายละเอียดเชิงลึก</span></td>
          <td style="min-width:180px"><select class="select" data-d="kpis.${i}.owner" aria-label="หน่วยงานรับผิดชอบ" ${S.canAdmin ? '' : 'disabled'}>${unitsOpt(k.owner)}</select></td>
          <td class="num" style="text-align:center"><span class="cnt ${n ? 'on' : ''}" data-p="${p.code}">${n}</span></td>
          <td>${S.canAdmin ? `<button class="icon-btn btn-danger" data-act="d-del" data-v="kpis.${i}" aria-label="ลบตัวชี้วัด">${ic('trash', 'ic-sm')}</button>` : ''}</td></tr>`;
      }).join('') + (S.canAdmin ? `<tr><td colspan="9"><button class="btn btn-sm btn-ghost" data-act="d-add-kpi" data-v="${p.code}">${ic('plus', 'ic-sm')}เพิ่มตัวชี้วัดเสา ${esc(p.code)}</button></td></tr>` : '');
  }).join('');
  return `<div class="ph"><div class="ph-t"><span class="eyebrow">ตัวชี้วัดระดับกรม ${D.kpis.length} ตัว</span><h1>KPI Setting</h1><span class="muted small">กำหนดตัวชี้วัด ค่าเป้าหมาย ค่าฐาน และหน่วยงานรับผิดชอบ ซึ่งจะใช้เป็นตัวเลือกตอนสร้างแผน</span></div></div>
  ${roNote()}
  <div class="card tbl-wrap"><table class="tbl"><thead><tr><th>รหัส</th><th>ตัวชี้วัด</th><th>ค่าเป้าหมาย</th><th>ค่าฐาน</th><th>ผลล่าสุดและเป้าเทียบ</th><th>ลิงก์รายละเอียด</th><th>หน่วยงานรับผิดชอบ</th><th>แผนที่ผูก</th><th><span class="sr">ลบ</span></th></tr></thead><tbody>${rows}</tbody></table></div>
  ${dirtyBar()}`;
}

/* ---------- General settings ---------- */
const STABS = [['units', 'หน่วยงาน / ผอ.'], ['levels', 'แผนระดับต่างๆ'], ['pillars', 'เสายุทธศาสตร์'], ['strats', 'กลยุทธ์'], ['chals', 'ความท้าทาย'], ['risks', 'ความเสี่ยงระดับกรม'], ['contacts', 'ผู้ติดต่อ'], ['ops', 'ข้อมูลแดชบอร์ด'], ['report', 'ช่วงวันรายงานผล'], ['links', 'ลิงก์เมนูงาน'], ['library', 'คลังแผน']];
function viewSetup() {
  if (!S.cfgLoaded) return `<div class="skel" style="height:200px"></div>`;
  const D = S.draft; const t = S.setupTab;
  let body = '';
  const pSel = (path, val) => `<select class="select" data-d="${path}" aria-label="เสา" ${S.canAdmin ? '' : 'disabled'}>${D.pillars.map((p) => `<option value="${p.code}" ${p.code === val ? 'selected' : ''}>${p.code}</option>`).join('')}</select>`;
  const lvSel = (path, val) => `<select class="select" data-d="${path}" aria-label="ระดับ 1-5" style="min-width:64px" ${S.canAdmin ? '' : 'disabled'}><option value="">—</option>${[1, 2, 3, 4, 5].map((n) => `<option ${Number(val) === n ? 'selected' : ''}>${n}</option>`).join('')}</select>`;
  const del = (path, label) => S.canAdmin ? `<button class="icon-btn btn-danger" data-act="d-del" data-v="${path}" aria-label="${label}">${ic('trash', 'ic-sm')}</button>` : '';
  const add = (act, label) => S.canAdmin ? `<button class="btn btn-sm" data-act="${act}">${ic('plus', 'ic-sm')}${label}</button>` : '';
  if (t === 'units') {
    body = `<div class="card tbl-wrap"><table class="tbl"><thead><tr><th>หน่วยงาน</th><th>ชื่อ ผอ. / ผู้บริหารหน่วยงาน</th><th>ผู้ใช้</th><th></th></tr></thead><tbody>
      ${D.units.map((u, i) => `<tr><td style="min-width:240px">${din(`units.${i}.name`, u.name, { label: 'ชื่อหน่วยงาน' })}</td><td style="min-width:240px">${din(`units.${i}.director`, u.director, { label: 'ชื่อ ผอ.' })}</td><td class="num">${Object.values(S.profiles).filter((p) => p.unitId === u.id).length}</td><td>${del(`units.${i}`, 'ลบหน่วยงาน')}</td></tr>`).join('')}
      </tbody></table></div>${add('d-add-unit', 'เพิ่มหน่วยงาน')}`;
  } else if (t === 'levels') {
    body = D.planLevels.map((L, i) => `<div class="card lvl"><div class="item-row"><span class="chip chip-accent">ระดับ ${i + 1}</span>${din(`planLevels.${i}.name`, L.name, { label: 'ชื่อแผน' })}${del(`planLevels.${i}`, 'ลบระดับแผน')}</div>
      ${(L.items || []).map((it, j) => `<div class="item-row" style="padding-left:16px"><span class="mono small muted" style="min-width:64px">${esc(it.id)}</span>${din(`planLevels.${i}.items.${j}.name`, it.name, { label: 'ประเด็น' })}${del(`planLevels.${i}.items.${j}`, 'ลบประเด็น')}</div>`).join('')}
      ${S.canAdmin ? `<button class="btn btn-sm btn-ghost" data-act="d-add-item" data-v="${i}" style="justify-self:start">${ic('plus', 'ic-sm')}เพิ่มประเด็น</button>` : ''}</div>`).join('') + add('d-add-level', 'เพิ่มระดับแผน') +
      `<p class="help">ระดับสุดท้าย “แผนยุทธศาสตร์กรมสรรพสามิต” ระบบแสดงจากเสาและกลยุทธ์ที่เลือกเอง ส่วนการผูกแต่ละประเด็นกับกลยุทธ์ ตั้งได้ที่แท็บกลยุทธ์</p>`;
  } else if (t === 'pillars') {
    body = `<div class="card lvl"><label class="lbl" for="d-vision">วิสัยทัศน์</label><textarea id="d-vision" class="textarea" data-d="vision" ${S.canAdmin ? '' : 'disabled'}>${esc(D.vision)}</textarea>
      <label class="lbl" for="d-title">ชื่อแผน</label><input id="d-title" class="input" data-d="planTitle" value="${esc(D.planTitle)}" ${S.canAdmin ? '' : 'disabled'}></div>` +
      D.pillars.map((p, i) => `<div class="card lvl" data-p="${p.code}" style="border-top:4px solid var(--pc)"><div class="item-row"><span class="pcode" style="font-size:22px;min-width:40px">${esc(p.code)}</span>${din(`pillars.${i}.short`, p.short || PSHORT[p.code] || '', { label: 'ชื่อในเมนู' })}${din(`pillars.${i}.name_en`, p.name_en, { label: 'ชื่อเสา' })}${din(`pillars.${i}.balance`, p.balance, { label: 'มิติสมดุล', w: '140px' })}</div>
        <div class="grid2"><div class="field"><span class="lbl">คำอธิบาย</span>${din(`pillars.${i}.desc`, p.desc, { ta: true, label: 'คำอธิบาย' })}</div><div class="field"><span class="lbl">เป้าหมาย</span>${din(`pillars.${i}.goal`, p.goal, { ta: true, label: 'เป้าหมาย' })}</div></div></div>`).join('');
  } else if (t === 'strats') {
    body = D.strategies.map((s, i) => `<div class="card lvl" data-p="${esc(s.pillar)}" style="border-left:4px solid var(--pc)">
      <div class="item-row">${din(`strategies.${i}.code`, s.code, { label: 'รหัส', w: '72px' })}${pSel(`strategies.${i}.pillar`, s.pillar)}${din(`strategies.${i}.name`, s.name, { label: 'ชื่อกลยุทธ์' })}${del(`strategies.${i}`, 'ลบกลยุทธ์')}</div>
      ${din(`strategies.${i}.desc`, s.desc, { ta: true, label: 'คำอธิบาย' })}
      <span class="lbl small">ความท้าทายที่กลยุทธ์นี้ตอบ (ใช้เชื่อมอัตโนมัติ)</span>
      <div class="tog">${D.challenges.map((c) => `<button type="button" data-act="d-tog" data-v="strategies.${i}.challenges" data-id="${esc(c.id)}" aria-pressed="${(s.challenges || []).includes(c.id)}" ${S.canAdmin ? '' : 'disabled'}>${esc(c.name)}</button>`).join('')}</div>
      <span class="lbl small">เชื่อมกับแผนระดับต่างๆ</span>
      ${D.planLevels.map((L) => `<div style="display:grid;gap:4px"><span class="help">${esc(L.name)}</span><div class="tog">${(L.items || []).map((it) => `<button type="button" data-act="d-tog" data-v="strategies.${i}.links" data-id="${esc(it.id)}" aria-pressed="${(s.links || []).includes(it.id)}" ${S.canAdmin ? '' : 'disabled'}>${esc(it.name)}</button>`).join('')}</div></div>`).join('')}
    </div>`).join('') + add('d-add-strat', 'เพิ่มกลยุทธ์');
  } else if (t === 'chals') {
    body = `<div class="card tbl-wrap"><table class="tbl"><thead><tr><th>รหัส</th><th>ความท้าทาย</th><th>กลยุทธ์ที่ผูก</th><th></th></tr></thead><tbody>
      ${D.challenges.map((c, i) => `<tr><td class="mono">${esc(c.id)}</td><td style="min-width:300px">${din(`challenges.${i}.name`, c.name, { label: 'ความท้าทาย' })}</td><td class="small">${D.strategies.filter((s) => (s.challenges || []).includes(c.id)).map((s) => esc(s.code)).join(', ') || '—'}</td><td>${del(`challenges.${i}`, 'ลบ')}</td></tr>`).join('')}
      </tbody></table></div>${add('d-add-chal', 'เพิ่มความท้าทาย')}`;
  } else if (t === 'risks') {
    body = `<div class="card tbl-wrap"><table class="tbl"><thead><tr><th>รหัส</th><th>ความเสี่ยงระดับกรม</th><th>เสาหลัก</th><th>โอกาส</th><th>ผลกระทบ</th><th>คะแนน</th><th>แผนที่เลือก</th><th></th></tr></thead><tbody>
      ${D.risks.map((r, i) => `<tr><td>${din(`risks.${i}.id`, r.id, { label: 'รหัส', w: '64px' })}</td><td style="min-width:300px">${din(`risks.${i}.name`, r.name, { label: 'ความเสี่ยง' })}</td><td>${pSel(`risks.${i}.pillar`, r.pillar)}</td><td>${lvSel(`risks.${i}.l`, r.l)}</td><td>${lvSel(`risks.${i}.i`, r.i)}</td><td class="num"><b>${riskScore(Number(r.l) || 0, Number(r.i) || 0) || '—'}</b></td><td class="num">${S.plans.filter((p) => (p.risks || []).includes(r.id)).length}</td><td>${del(`risks.${i}`, 'ลบ')}</td></tr>`).join('')}
      </tbody></table></div>${add('d-add-risk', 'เพิ่มความเสี่ยง')}`;
  } else if (t === 'contacts') {
    const cs = D.contacts || [];
    body = `<p class="help">แสดงในปุ่มโทรศัพท์ “หากมีข้อสงสัย ติดต่อผู้ดูแลระบบได้ที่” ที่หน้าเข้าสู่ระบบ จัดกลุ่มตามหน่วยงาน</p>
    <div class="card tbl-wrap"><table class="tbl"><thead><tr><th>หน่วยงาน</th><th>ชื่อเจ้าหน้าที่</th><th>เบอร์ติดต่อ</th><th></th></tr></thead><tbody>
      ${cs.length ? cs.map((c, i) => `<tr><td style="min-width:200px"><select class="select" data-d="contacts.${i}.unitId" aria-label="หน่วยงาน" ${S.canAdmin ? '' : 'disabled'}>${D.units.map((u) => `<option value="${esc(u.id)}" ${u.id === c.unitId ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select></td><td style="min-width:200px">${din(`contacts.${i}.name`, c.name, { label: 'ชื่อเจ้าหน้าที่' })}</td><td style="min-width:150px">${din(`contacts.${i}.phone`, c.phone, { label: 'เบอร์ติดต่อ' })}</td><td>${del(`contacts.${i}`, 'ลบผู้ติดต่อ')}</td></tr>`).join('') : '<tr><td colspan="4" class="muted">ยังไม่มีผู้ติดต่อ</td></tr>'}
    </tbody></table></div>${add('d-add-contact', 'เพิ่มผู้ติดต่อ')}`;
  } else if (t === 'report') {
    const w = Object.assign({ from: 1, to: 5, always: false }, D.reportWindow || {});
    const dsel = (k) => `<select class="select" data-d="reportWindow.${k}" style="max-width:120px" ${S.canAdmin ? '' : 'disabled'}>${Array.from({ length: 31 }, (_, i) => i + 1).map((n) => `<option ${Number(w[k]) === n ? 'selected' : ''}>${n}</option>`).join('')}</select>`;
    body = `<div class="card lvl"><span class="lbl">ช่วงวันที่เปิดให้รายงานผลรายเดือน</span>
      <div class="item-row" style="flex-wrap:wrap">ผู้รับผิดชอบรายงานผลของเดือนก่อนหน้าได้ ระหว่างวันที่ ${dsel('from')} ถึง ${dsel('to')} ของทุกเดือน</div>
      <label class="item-row"><input type="checkbox" data-d-bool="reportWindow.always" ${w.always ? 'checked' : ''} ${S.canAdmin ? '' : 'disabled'} style="width:18px;height:18px;accent-color:var(--accent)"> เปิดรับรายงานตลอดเวลา (ช่วงทดสอบ)</label>
      <span class="help">Super admin กรอกหรือแก้ไขรายงานได้ทุกเวลา</span></div>`;
  } else if (t === 'ops') {
    body = odBody();
  } else if (t === 'library') {
    body = libSetupBody(D);
  } else if (t === 'links') {
    if (!Array.isArray(D.workLinks)) D.workLinks = workLinks().map((l) => Object.assign({}, l));
    body = `<p class="help">เมนูในหมวด “งาน” ที่เมนูซ้าย กดแล้วเปิดลิงก์ในแท็บใหม่ ลิงก์ต้องขึ้นต้นด้วย https://</p>
    <div class="card tbl-wrap"><table class="tbl"><thead><tr><th>ชื่อเมนู</th><th>ลิงก์</th><th></th></tr></thead><tbody>
      ${D.workLinks.map((l, i) => `<tr><td style="min-width:220px">${din(`workLinks.${i}.label`, l.label, { label: 'ชื่อเมนู' })}</td><td style="min-width:320px">${din(`workLinks.${i}.url`, l.url, { label: 'ลิงก์' })}</td><td>${del(`workLinks.${i}`, 'ลบเมนู')}</td></tr>`).join('')}
    </tbody></table></div>${add('d-add-link', 'เพิ่มเมนูลิงก์')}`;
  }
  return `<div class="ph"><div class="ph-t"><h1>ตั้งค่าทั่วไป</h1><span class="muted small">ข้อมูลกลางที่ทุกหน่วยงานใช้ร่วมกันตอนสร้างแผน${D.sample ? ' · ข้อมูลในระบบตอนนี้บางส่วนเป็นตัวอย่าง แก้ให้เป็นข้อมูลจริงได้' : ''}</span></div></div>
  ${roNote()}
  <div class="stabs" role="tablist">${STABS.map(([k, l]) => `<button role="tab" aria-selected="${t === k}" data-act="stab" data-v="${k}">${l}</button>`).join('')}</div>
  <div style="display:grid;gap:12px">${body}</div>
  ${t === 'ops' ? '' : dirtyBar()}`;
}
function markDirty() { if (!S.dirty) { S.dirty = true; const b = $('.savebar'); if (b) { b.querySelector('.status').innerHTML = `${ic('alert', 'ic-sm')}มีการแก้ไขที่ยังไม่บันทึก`; $$('button', b).forEach((x) => { x.disabled = false; }); } } }
function draftRerender() { const v = $('#view'); const y = v.scrollTop; renderView(); v.scrollTop = y; }

/* ---------- AI assistant ---------- */
function aiContext() {
  const C = cfg();
  const lines = [
    'คุณคือผู้ช่วยวางแผนยุทธศาสตร์และบริหารความเสี่ยง (ERM) ของกรมสรรพสามิต ประเทศไทย ใช้ภาษาไทยที่สุภาพ กระชับ เป็นภาษาราชการที่อ่านง่าย',
    'ตอบจากข้อมูลด้านล่างเป็นหลัก ถ้าไม่มีข้อมูลให้บอกตรงๆ ห้ามแต่งตัวเลข อย่าใช้ markdown หัวข้อใหญ่ ใช้ขีดหรือเลขข้อได้',
    `แผน: ${C.planTitle || ''}`, `วิสัยทัศน์: ${C.vision}`,
    'เสาและกลยุทธ์:', ...C.pillars.map((p) => `- ${p.code} ${p.name_en}: ${p.desc} | เป้าหมาย: ${p.goal} | กลยุทธ์: ${C.strategies.filter((s) => s.pillar === p.code).map((s) => `${s.code} ${s.name}`).join('; ')}`),
    'ตัวชี้วัด:', ...C.kpis.map((k) => `- ${k.id} ${k.name} (เป้า ${k.target})`),
    `ความเสี่ยงระดับกรม: ${C.risks.map((r) => `${r.id} ${r.name}`).join('; ')}`,
    `ผู้ใช้: ${S.profile?.name || ''} หน่วยงาน ${unitName(S.profile?.unitId)}`,
    `หน้าที่ผู้ใช้เปิดอยู่: ${TITLES[S.route]}`
  ];
  const p = S.route === 'edit' ? S.plan : S.route === 'report' ? reportPlan() : null;
  if (p) lines.push('แผนที่กำลังดู (JSON): ' + JSON.stringify(planForAi(p)));
  if (S.route === 'monthly') lines.push(...monthlyAiLines());
  if (S.route === 'kpis' || S.route === 'dashboard') lines.push('ผล KPI ล่าสุด: ' + cfg().kpis.map((k) => `${k.id} ${k.name_en || k.name}: ${k.latest ?? '-'} / เป้า ${k.tval ?? k.target}`).join('; '));
  if (S.route === 'risks' || S.route === 'dashboard') lines.push('ความเสี่ยงระดับกรม (โอกาส×ผลกระทบ): ' + cfg().risks.map((r) => `${r.id} ${r.name} [${r.pillar}] ${(Number(r.l) || 0) * (Number(r.i) || 0)}`).join('; '));
  if (S.route === 'pillar') { const pp = filteredPlans().filter((p) => p.pillar === S.param); lines.push(`เสาที่เปิด: ${S.param}; กลยุทธ์: ${cfg().strategies.filter((x) => x.pillar === S.param).map((x) => x.code + ' ' + x.name).join('; ')}; โครงการ: ` + pp.map((p) => `${p.name} [${p.strategy}, ${unitName(p.unitId)}, ${money(p.budget)} บาท]`).join(' | ')); }
  if (S.route === 'users' && S.isSuper) lines.push('ผู้ใช้: ' + Object.values(S.accounts).map((a) => `${a.name} (${unitName(a.unitId)})`).join('; '));
  if (S.route === 'dashboard') {
    const ps = filteredPlans().slice(0, 60);
    lines.push(`ตัวกรอง: ปี ${S.filt.year || 'ทุกปี'}, หน่วยงาน ${S.filt.unit ? unitName(S.filt.unit) : 'ทั้งหมด'}, เสา ${S.filt.pillar || 'ทั้งหมด'}`);
    lines.push(`โครงการตามตัวกรอง ${ps.length} โครงการ: ` + ps.map((x) => `${x.name} [${x.pillar}/${x.strategy}, ${unitName(x.unitId)}, ${x.category}, ${money(x.budget)} บาท, ${x.status}]`).join(' | '));
  }
  return lines.join('\n');
}
function planForAi(p) {
  const st = stratOf(p.strategy);
  return { ชื่อ: p.name, ประเภท: TYPE_LABEL[p.type], หมวด: CAT[p.type][p.category], หน่วยงาน: unitName(p.unitId), ปีเริ่ม: p.startYear, ระยะเวลาปี: p.duration, เสา: p.pillar, กลยุทธ์: st ? `${st.code} ${st.name}` : '', KPI: p.kpis.map((id) => `${id} ${kpiOf(id)?.name || ''}`), ความเสี่ยงระดับกรม: p.risks.map((id) => riskOf(id)?.name || id), งบประมาณ: p.budget,
    ขั้นตอน: p.type === 'kpi' ? p.steps.map((s, i) => `${i + 1}. ${s.name} ${s.from >= 0 ? MONTHS[s.from] + '–' + MONTHS[s.to] : ''}`) : undefined,
    output6: p.output6, output12: p.output12, outcome12: p.outcome12, ERM1: p.erm1, ERM2: { planB: p.erm2.planB, kri: p.erm2.kri, เดือนติดตาม: p.erm2.months.map((m) => MONTHS[m]) }, ข้อมูลที่ยังขาด: missing(p).map((m) => m.t) };
}
const QUICK = {
  dashboard: ['สรุปภาพรวมแผนตามตัวกรองนี้', 'สรุปให้ฟังสั้นๆ ไม่เกิน 1 นาที', 'เสาไหนยังมีโครงการน้อย ควรเติมอะไร', 'อธิบายแผน BALANCE แบบสั้นๆ'],
  new: ['ควรเลือกประเภทโครงการแบบไหน', 'Flagship ต่างจากงานประจำอย่างไร', 'ทำไมต้องมีโครงการผูก KPI อย่างน้อย 3 โครงการ'],
  edit: ['ตรวจว่าแผนนี้ยังขาดอะไร', 'เขียนสรุปแผนนี้ 5 บรรทัด', 'แนะนำ KPI และกลยุทธ์ที่ควรผูก', 'แนะนำ KRI ที่วัดได้จริง'],
  report: ['เขียนบทสรุปผู้บริหารสำหรับเสนอ ผอ.', 'ชี้จุดที่ควรปรับก่อนเสนอ'],
  kpi: ['อธิบาย KPI แต่ละเสาให้เข้าใจง่าย', 'KPI ตัวไหนวัดผลยากที่สุด'],
  setup: ['อธิบายว่าแต่ละแท็บใช้ทำอะไร', 'ความท้าทายควรผูกกับกลยุทธ์อย่างไร'],
  kpis: ['สรุป KPI ที่ต่ำกว่าเป้าหรือใกล้เป้า', 'KPI ตัวไหนยังไม่มีผล'],
  risks: ['อธิบาย Top 5 Risk และควรจัดการอย่างไร'],
  pillar: ['สรุปภาพรวมเสานี้', 'กลยุทธ์ไหนยังไม่มีโครงการ'],
  monthly: ['สรุปผลเดือนนี้สำหรับผู้บริหาร', 'โครงการไหนล่าช้าหรือมีปัญหา', 'สรุปให้ฟังสั้นๆ ไม่เกิน 1 นาที'],
  hub: ['ERM คืออะไร อธิบายสั้นๆ', 'KRI ต่างจาก KPI อย่างไร'],
  users: ['สรุปจำนวนผู้ใช้แยกตามหน่วยงาน']
};
/* ---------- Text to speech (browser built-in) ---------- */
const TTS = { auto: ls.get('bp_tts') === '1', speaking: -1, voice: null, warned: false };
const ttsOk = () => { try { return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'; } catch (e) { return false; } };
function thVoice() {
  try {
    const vs = window.speechSynthesis.getVoices() || [];
    const th = vs.filter((v) => /^th/i.test(v.lang));
    return th.find((v) => /premium|enhanced|natural|google/i.test(v.name)) || th[0] || null;
  } catch (e) { return null; }
}
if (ttsOk()) { try { TTS.voice = thVoice(); window.speechSynthesis.addEventListener('voiceschanged', () => { TTS.voice = thVoice(); }); } catch (e) {} }
function speechChunks(text) {
  const clean = String(text || '').replace(/[*#`_>|•]+/g, ' ').replace(/^\s*[-–]\s*/gm, '').replace(/[ \t]+/g, ' ');
  const out = [];
  clean.split(/\n+/).map((l) => l.trim()).filter(Boolean).forEach((line) => {
    let cur = '';
    line.split(' ').forEach((w) => {
      if ((cur + ' ' + w).trim().length > 160 && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
    });
    if (cur) out.push(cur);
  });
  return out;
}
function stopSpeak() { if (ttsOk()) { try { window.speechSynthesis.cancel(); } catch (e) {} } TTS.speaking = -1; }
function speak(i) {
  const m = S.ai.msgs[i];
  stopSpeak();
  if (!m || !m.content) return;
  if (!ttsOk()) { toast('อุปกรณ์หรือเบราว์เซอร์นี้อ่านออกเสียงไม่ได้', 'err'); return; }
  const v = TTS.voice || thVoice();
  if (!v && !TTS.warned) { TTS.warned = true; toast('ไม่พบเสียงภาษาไทยในเครื่องนี้ ติดตั้งเสียงภาษาไทยในการตั้งค่าของเครื่องเพื่อให้ออกเสียงชัด', 'err'); }
  const parts = speechChunks(m.content);
  TTS.speaking = i;
  parts.forEach((p, k) => {
    const u = new SpeechSynthesisUtterance(p);
    u.lang = 'th-TH'; if (v) u.voice = v; u.rate = 1;
    if (k === parts.length - 1) u.onend = () => { if (TTS.speaking === i) { TTS.speaking = -1; renderAi(); } };
    u.onerror = (ev) => { if (ev.error !== 'interrupted' && ev.error !== 'canceled' && TTS.speaking === i) { TTS.speaking = -1; renderAi(); toast('อ่านออกเสียงไม่สำเร็จ', 'err'); } };
    window.speechSynthesis.speak(u);
  });
  renderAi();
}
function syncTtsBtn() {
  const b = $('#tts-auto'); if (!b) return;
  b.hidden = !ttsOk();
  b.setAttribute('aria-pressed', TTS.auto);
  b.innerHTML = ic(TTS.auto ? 'speaker' : 'mute');
  b.title = TTS.auto ? 'ปิดการอ่านออกเสียงอัตโนมัติ' : 'เปิดการอ่านออกเสียงอัตโนมัติ';
}

function renderAi() {
  const body = $('#ai-body');
  syncTtsBtn();
  if (!S.sample) { body.innerHTML = `<div class="msg a">ผู้ช่วย AI ใช้ไม่ได้ในมุมมองนี้ ลองเปิดหน้านี้ใน claude.ai ขณะลงชื่อเข้าใช้</div>`; $('#ai-quick').innerHTML = ''; return; }
  const last = S.ai.msgs.length - 1;
  body.innerHTML = (S.ai.msgs.length ? '' : `<div class="msg a">สวัสดีครับ ผมช่วยอธิบายแผน สรุปข้อมูล และแนะนำการกรอกแผนได้ เลือกคำถามด้านล่างหรือพิมพ์ถามได้เลย${ttsOk() ? '\nกดปุ่มลำโพงด้านบนเพื่อให้ผมอ่านคำตอบออกเสียงทุกครั้ง หรือกด “ฟัง” ใต้คำตอบที่ต้องการ' : ''}</div>`) +
    S.ai.msgs.map((m, i) => {
      const bubble = `<div class="msg ${m.role === 'user' ? 'u' : 'a'} ${m.err ? 'err' : ''}" data-i="${i}">${esc(m.content || (S.ai.busy ? 'กำลังคิด…' : ''))}</div>`;
      const canSpeak = ttsOk() && m.role === 'assistant' && !m.err && m.content && !(S.ai.busy && i === last);
      const on = TTS.speaking === i;
      return bubble + (canSpeak ? `<div class="msg-tools"><button type="button" data-act="tts" data-v="${i}" aria-pressed="${on}">${ic(on ? 'stop' : 'speaker', 'ic-sm')}${on ? 'หยุดอ่าน' : 'ฟัง'}</button></div>` : '');
    }).join('');
  body.scrollTop = body.scrollHeight;
  $('#ai-quick').innerHTML = (QUICK[S.route] || []).map((q) => `<button data-act="ai-q" data-v="${esc(q)}" ${S.ai.busy ? 'disabled' : ''}>${esc(q)}</button>`).join('');
}
async function aiSend(text) {
  text = (text || '').trim(); if (!text || S.ai.busy || !S.sample) return;
  S.ai.msgs.push({ role: 'user', content: text }); S.ai.msgs.push({ role: 'assistant', content: '' });
  S.ai.busy = true; renderAi();
  const hist = S.ai.msgs.slice(0, -1);
  const ok = hist.filter((m, i) => !m.err && !(m.role === 'user' && hist[i + 1]?.err));
  const turns = ok.slice(-10).map((m) => ({ role: m.role, content: m.content }));
  while (turns.length && turns[0].role !== 'user') turns.shift();
  turns[0] = { role: 'user', content: aiContext() + '\n\nคำถาม: ' + turns[0].content };
  const last = S.ai.msgs[S.ai.msgs.length - 1];
  S.ai.ctrl = new AbortController();
  try {
    const r = await S.sample(turns, { cache: false, signal: S.ai.ctrl.signal, onText: ({ text: t }) => { last.content = t; const el = $(`#ai-body [data-i="${S.ai.msgs.length - 1}"]`); if (el) { el.textContent = t; $('#ai-body').scrollTop = 1e9; } } });
    last.content = r.text;
  } catch (e) {
    last.err = true;
    last.content = e?.code === 'not_granted' ? 'ยังไม่ได้อนุญาตให้หน้านี้ใช้ AI' : e?.code === 'rate_limited' ? 'มีคำขอมากเกินไป รอสักครู่แล้วลองใหม่' : e?.code === 'cancelled' ? 'ยกเลิกแล้ว' : (e?.text || 'ตอบไม่สำเร็จ ลองใหม่อีกครั้ง');
  }
  S.ai.busy = false; renderAi();
  if (TTS.auto && !last.err && last.content) speak(S.ai.msgs.length - 1);
}
const DRAFT_HINT = {
  objective: 'วัตถุประสงค์โครงการ 1–3 ข้อ ขึ้นต้นด้วย เพื่อ… วัดผลได้ สอดคล้องกับกลยุทธ์และ KPI ที่เลือก',
  output6: 'Output 6 เดือน (ผลผลิตที่ส่งมอบได้ภายใน มี.ค. 70) เป็นข้อ 2–3 ข้อ วัดได้',
  output12: 'Output 12 เดือน (ผลผลิตที่ส่งมอบได้ภายใน ก.ย. 70) เป็นข้อ 2–3 ข้อ วัดได้',
  outcome12: 'Outcome 12 เดือน (ผลลัพธ์ที่เกิดต่อ KPI หรือผู้รับบริการ) 1–2 ข้อ',
  'erm1.risk': 'ความเสี่ยงสำคัญของโครงการ 1 เรื่อง เขียนแบบ เหตุการณ์ + ผลกระทบ (ไม่ต้องเขียนสาเหตุ เพราะมีช่องแยก)',
  'erm1.cause': 'สาเหตุของความเสี่ยงที่ระบุในช่องความเสี่ยงโครงการ 2–3 ข้อ สั้น กระชับ เขียนเป็น (1) (2) (3)',
  'erm2.planB': 'Plan B ถ้าความเสี่ยงเกิดขึ้น 2–3 ข้อ',
  'erm2.kri': 'KRI 1–2 ตัว พร้อมเกณฑ์เตือน (ตัวเลข)'
};
async function aiDraft(f) {
  if (!S.sample) { toast('ผู้ช่วย AI ใช้ไม่ได้ในมุมมองนี้', 'err'); return; }
  S.sugBusy[f] = true; rerenderEdit();
  try {
    const r = await S.sample(aiContext() + `\n\nช่วยร่าง “${DRAFT_HINT[f]}” สำหรับแผนนี้ ตอบเฉพาะเนื้อหาที่จะใส่ในช่อง ไม่มีคำนำหรือคำลงท้าย ไม่เกิน 6 บรรทัด`, { modelTier: 'default' });
    S.sug[f] = r.text.trim();
  } catch (e) { toast(e?.code === 'not_granted' ? 'ยังไม่ได้อนุญาตให้หน้านี้ใช้ AI' : 'AI ร่างไม่สำเร็จ ลองใหม่อีกครั้ง', 'err'); }
  S.sugBusy[f] = false; if (S.route === 'edit') rerenderEdit();
}
function openAi() {
  $('#shell').classList.remove('open');
  $('#ai').classList.add('open'); $('#ai').setAttribute('aria-hidden', 'false');
  if (window.matchMedia('(max-width: 900px)').matches) $('#scrim').hidden = false;
  renderAi(); setTimeout(() => $('#ai-input')?.focus(), 200);
}

function openContacts() {
  const cs = (cfg().contacts || []).filter((c) => c.name || c.phone);
  const units = cfg().units.filter((u) => cs.some((c) => c.unitId === u.id));
  $('#contacts-body').innerHTML = cs.length ? units.map((u) => `<div class="ct-unit"><h3>${esc(u.name)}</h3>${cs.filter((c) => c.unitId === u.id).map((c) => `<div class="ct-row"><b>${esc(c.name || '—')}</b>${c.phone ? `<a class="ct-tel" href="tel:${esc(String(c.phone).replace(/[^0-9+]/g, ''))}">${ic('phone', 'ic-sm')}${esc(c.phone)}</a>` : ''}</div>`).join('')}</div>`).join('')
    : `<p class="muted" style="padding:16px 0">ยังไม่มีรายชื่อผู้ติดต่อ${S.isSuper ? ' เพิ่มได้ที่ ตั้งค่าทั่วไป › ผู้ติดต่อ' : ''}</p>`;
  $('#contacts-dlg').hidden = false; $('#contacts-dlg .icon-btn')?.focus();
}
function closeContacts() { $('#contacts-dlg').hidden = true; $('.help-btn')?.focus(); }
function syncThemeBtn() { const b = $('#theme-btn'); if (!b) return; const dark = document.documentElement.getAttribute('data-theme') === 'dark'; b.innerHTML = ic(dark ? 'sun' : 'moon'); b.setAttribute('aria-label', dark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'); }

/* ---------- Events ---------- */
document.addEventListener('submit', (e) => { e.preventDefault(); onAuthSubmit(e.target); });
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const a = t.dataset.act, v = t.dataset.v, P = S.plan;
  switch (a) {
    case 'auth-mode': S.authMode = v; S.authErr = {}; if (v !== 'login') S.authMsg = ''; renderAuth(); break;
    case 'go': go(v); break;
    case 'open-nav': $('#shell').classList.add('open'); $('#scrim').hidden = false; break;
    case 'nav-trigger': if (window.matchMedia('(max-width: 900px)').matches) { $('#shell').classList.add('open'); $('#scrim').hidden = false; } else { const sh = $('#shell'); sh.classList.toggle('mini'); ls.set('bp_mini', sh.classList.contains('mini') ? '1' : '0'); syncMini(); } break;
    case 'theme': { const r = document.documentElement; const t = r.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; r.setAttribute('data-theme', t); ls.set('bp_theme', t); syncThemeBtn(); break; }
    case 'kpi-p': S.kpiP = v; renderView(); break;
    case 'close-overlays': closeOverlays(); break;
    case 'toggle-mini': { const sh = $('#shell'); sh.classList.toggle('mini'); ls.set('bp_mini', sh.classList.contains('mini') ? '1' : '0'); syncMini(); break; }
    case 'logout': if (S.plan) flushSave(); ss.del('bp_in'); S.inApp = false; S.authMode = 'login'; S.authErr = {}; S.authMsg = ''; closeOverlays(); location.hash = ''; renderAuth(); break;
    case 'ai-open': openAi(); break;
    case 'ai-close': stopSpeak(); closeOverlays(); break;
    case 'ai-clear': stopSpeak(); S.ai.ctrl?.abort(); S.ai.msgs = []; S.ai.busy = false; renderAi(); break;
    case 'tts': { const i = Number(v); if (TTS.speaking === i) { stopSpeak(); renderAi(); } else speak(i); break; }
    case 'tts-auto': {
      TTS.auto = !TTS.auto; ls.set('bp_tts', TTS.auto ? '1' : '0');
      if (!TTS.auto) stopSpeak();
      renderAi(); toast(TTS.auto ? 'เปิดอ่านออกเสียงอัตโนมัติแล้ว' : 'ปิดอ่านออกเสียงอัตโนมัติแล้ว');
      break;
    }
    case 'ai-send': { const i = $('#ai-input'); const tx = i.value; i.value = ''; aiSend(tx); break; }
    case 'ai-q': aiSend(v); break;
    case 'risk-p': S.riskP = v; renderView(); break;
    case 'kpi-nolink': toast(S.isSuper ? 'ยังไม่ได้ใส่ลิงก์หน้ารายละเอียด ใส่ได้ที่ KPI Setting' : 'ยังไม่มีหน้ารายละเอียดของตัวชี้วัดนี้'); break;
    case 'filt-reset': S.filt = { year: '', unit: '', pillar: '' }; renderView(); break;
    case 'scope': S.scope = v; renderView(); break;
    case 'create': {
      if (!S.profile) break;
      const p = newPlan(t.dataset.type, t.dataset.cat);
      S.plan = p; S.allPlans = (S.allPlans || []).concat([p]); scopePlans();
      S.db.doc('plans/' + p.id).set(clone(p)).catch(() => toast('สร้างแผนไม่สำเร็จ บัญชีนี้อาจไม่มีสิทธิ์แก้ไข', 'err'));
      go('edit-' + p.id); break;
    }
    case 'del': S.confirmDel = v; renderView(); break;
    case 'del-no': S.confirmDel = null; renderView(); break;
    case 'del-yes': S.confirmDel = null; S.db.doc('plans/' + v).delete().then(() => toast('ลบแผนแล้ว')).catch(() => toast('ลบไม่สำเร็จ', 'err')); break;
    case 'wstep': flushSave(); S.edStep = Number(v); renderView(); $('#view').scrollTop = 0; break;
    case 'toc': e.preventDefault(); document.getElementById(v)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); break;
    case 'p-dur': P.duration = Number(v); queueSave(); rerenderEdit(); break;
    case 'p-cat': P.category = v; queueSave(); rerenderEdit(); break;
    case 'p-pillar':
      if (P.pillar !== v) { P.pillar = v; if (stratOf(P.strategy)?.pillar !== v) P.strategy = ''; P.kpis = P.kpis.filter((k) => kpiOf(k)?.pillar === v); }
      queueSave(); rerenderEdit(); break;
    case 'p-rm': P.erm1.l = Number(t.dataset.l); P.erm1.i = Number(t.dataset.i); queueSave(); rerenderEdit(); break;
    case 'p-erm-m': { const m = Number(v); P.erm2.months = P.erm2.months.includes(m) ? P.erm2.months.filter((x) => x !== m) : P.erm2.months.concat([m]); queueSave(); rerenderEdit(); break; }
    case 'p-q': { const ms = v.split(',').map(Number); const all = ms.every((m) => P.erm2.months.includes(m)); P.erm2.months = all ? P.erm2.months.filter((m) => !ms.includes(m)) : Array.from(new Set(P.erm2.months.concat(ms))); queueSave(); rerenderEdit(); break; }
    case 'ai-draft': aiDraft(t.dataset.f); break;
    case 'ai-use': { const f = t.dataset.f; setPath(P, f, S.sug[f]); delete S.sug[f]; queueSave(); rerenderEdit(); break; }
    case 'ai-dismiss': delete S.sug[t.dataset.f]; rerenderEdit(); break;
    case 'p-preview': flushSave(); go('report-' + P.id); break;
    case 'p-save': {
      const miss = missing(P);
      if (miss.length) { S.showMiss = true; S.edStep = Math.max(0, wizSteps(P).findIndex((w) => w[0] === miss[0].sec)); renderView(); $('#view').scrollTop = 0; toast(`ยังขาดข้อมูล ${miss.length} รายการ`, 'err'); break; }
      P.status = 'done'; P.completedAt = Date.now(); flushSave().then(() => { toast('บันทึกแผนเรียบร้อย'); go('report-' + P.id); }); break;
    }
    case 'pdf': exportPdf(); break;
    case 'print-sheet': try { window.print(); } catch (e) { toast('พิมพ์จากหน้านี้ไม่ได้ ใช้ปุ่ม ดาวน์โหลด PDF (A4 แนวนอน) แทน', 'err'); } break;
    case 'stab': S.setupTab = v; renderView(); break;
    case 'cfg-revert': S.draft = clone(cfg()); S.dirty = false; draftRerender(); break;
    case 'cfg-save': {
      const d = clone(S.draft); delete d.sample;
      if (d.hubUrl && !/^https:\/\/[^\s]+\.[^\s]+/.test(d.hubUrl.trim())) { toast('ลิงก์ Knowledge Hub ต้องขึ้นต้นด้วย https://', 'err'); break; }
      const badL = (d.workLinks || []).find((l) => l.url && !/^https:\/\/\S+\.\S+/.test(String(l.url).trim()));
      if (badL) { toast(`ลิงก์ของเมนู “${badL.label}” ต้องขึ้นต้นด้วย https://`, 'err'); break; }
      (d.workLinks || []).forEach((l) => { l.url = String(l.url || '').trim(); });
      if (d.hubUrl) d.hubUrl = d.hubUrl.trim();
      const badK = (d.kpis || []).find((k) => k.detailUrl && !/^https:\/\/\S+\.\S+/.test(String(k.detailUrl).trim()));
      if (badK) { toast(`ลิงก์รายละเอียด KPI ${badK.id} ต้องขึ้นต้นด้วย https://`, 'err'); break; }
      if (JSON.stringify(d.risks) !== JSON.stringify(cfg().risks)) d.riskSample = false;
      S.db.doc('config/org').set(Object.assign(d, { sample: S.cfg?.sample || false, updatedAt: Date.now() }))
        .then(() => { S.dirty = false; toast('บันทึกการตั้งค่าแล้ว'); draftRerender(); })
        .catch(() => toast('บันทึกไม่สำเร็จ เฉพาะผู้ดูแลระบบแก้ไขได้', 'err'));
      break;
    }
    case 'd-del': { const ks = v.split('.'); const idx = Number(ks.pop()); const arr = getPath(S.draft, ks.join('.')); arr.splice(idx, 1); markDirty(); draftRerender(); break; }
    case 'd-tog': { const arr = getPath(S.draft, v) || []; const id = t.dataset.id; setPath(S.draft, v, arr.includes(id) ? arr.filter((x) => x !== id) : arr.concat([id])); markDirty(); draftRerender(); break; }
    case 'd-add-link': if (!Array.isArray(S.draft.workLinks)) S.draft.workLinks = workLinks().map((l) => Object.assign({}, l)); S.draft.workLinks.push({ label: '', url: '' }); markDirty(); draftRerender(); break;
    case 'link-empty': toast(S.isSuper ? 'ยังไม่ได้ใส่ลิงก์ ใส่ได้ที่ ตั้งค่าทั่วไป › ลิงก์เมนูงาน' : 'ยังไม่มีลิงก์ของเมนูนี้'); break;
    case 'ops-metric': S.opsMetric = v; renderView(); break;
    case 'ops-region': S.opsRegion = v; S.opsProv = ''; renderView(); break;
    case 'ops-prov': S.opsProv = S.opsProv === v ? '' : v; renderView(); break;
    case 'ops-prod': S.opsProd = S.opsProd === v ? '' : v; renderView(); break;
    case 'dash-risk': S.dashRisk = Number(v); renderView(); break;
    case 'fold': { COLL[v] = !COLL[v]; try { localStorage.setItem('bp_coll', JSON.stringify(COLL)); } catch (er) {} renderView(); break; }
    case 'd-add-contact': S.draft.contacts = (S.draft.contacts || []).concat([{ unitId: S.draft.units[0]?.id || '', name: '', phone: '' }]); markDirty(); draftRerender(); break;
    case 'contacts': openContacts(); break;
    case 'test-login': testLogin(); break;
    case 'contacts-close': if (e.target === t || t.tagName === 'BUTTON') closeContacts(); break;
    case 'd-add-unit': S.draft.units.push({ id: rid('u'), name: '', director: '' }); markDirty(); draftRerender(); break;
    case 'd-add-level': S.draft.planLevels.push({ id: rid('L'), name: '', items: [] }); markDirty(); draftRerender(); break;
    case 'd-add-item': { const L = S.draft.planLevels[Number(v)]; L.items = (L.items || []).concat([{ id: rid('i').slice(0, 9), name: '' }]); markDirty(); draftRerender(); break; }
    case 'd-add-strat': S.draft.strategies.push({ code: '', pillar: S.draft.pillars[0]?.code || 'BA', name: '', desc: '', challenges: [], links: [] }); markDirty(); draftRerender(); break;
    case 'd-add-chal': S.draft.challenges.push({ id: 'C' + String(S.draft.challenges.length + 1).padStart(2, '0') + Math.random().toString(36).slice(2, 4), name: '' }); markDirty(); draftRerender(); break;
    case 'd-add-risk': S.draft.risks.push({ id: 'R' + String(S.draft.risks.length + 1).padStart(2, '0'), name: '', pillar: 'BA' }); markDirty(); draftRerender(); break;
    case 'd-add-kpi': { const n = S.draft.kpis.filter((k) => k.pillar === v).length + 1; const num = S.draft.pillars.find((p) => p.code === v)?.num || 0; S.draft.kpis.push({ id: `${num}.${n}`, pillar: v, name: '', name_en: '', target: '', baseline: '', owner: '' }); markDirty(); draftRerender(); break; }
  }
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.dataset.filt) { S.filt[t.dataset.filt] = t.value; renderView(); return; }
  const a = t.dataset.actChange, P = S.plan;
  if (a === 'p-start') { P.startYear = Number(t.value); queueSave(); return; }
  if (a === 'p-strat') { P.strategy = t.value; queueSave(); rerenderEdit(); return; }
  if (a === 'p-kpi') { P.kpis = t.checked ? Array.from(new Set(P.kpis.concat([t.value]))) : P.kpis.filter((k) => k !== t.value); queueSave(); refreshToc(); return; }
  if (a === 'p-risk') { P.risks = t.checked ? Array.from(new Set(P.risks.concat([t.value]))) : P.risks.filter((k) => k !== t.value); queueSave(); refreshToc(); return; }
  if (t.dataset.d && t.tagName === 'SELECT') { setPath(S.draft, t.dataset.d, t.value); markDirty(); if (/strategies\.\d+\.pillar|risks\.\d+\.[li]$/.test(t.dataset.d)) draftRerender(); }
});
document.addEventListener('toggle', (e) => { if (e.target?.dataset?.actToggle === 'tips') S.tipsClosed = !e.target.open; }, true);
document.addEventListener('change', (e) => { const t = e.target; if (t.dataset?.dBool) { setPath(S.draft, t.dataset.dBool, t.checked); markDirty(); } });
document.addEventListener('input', (e) => { const t = e.target; if (t.dataset.d && t.tagName !== 'SELECT') { setPath(S.draft, t.dataset.d, t.value); markDirty(); } });
document.addEventListener('keydown', (e) => {
  if (e.target.id === 'ai-input' && e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); const tx = e.target.value; e.target.value = ''; aiSend(tx); }
  if (e.key === 'Escape') { closeOverlays(); if (!$('#contacts-dlg').hidden) closeContacts(); }
});
window.addEventListener('hashchange', () => { if (S.inApp) route(); });
window.addEventListener('pagehide', () => { if (S.plan) flushSave(); });
