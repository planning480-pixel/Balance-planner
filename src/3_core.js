/* ===================== Core: state, data, auth, shell ===================== */
(function () { let t = 'light'; try { t = localStorage.getItem('bp_theme') || 'light'; } catch (e) {} document.documentElement.setAttribute('data-theme', t); })();
const MONTHS = ['ต.ค. 69','พ.ย. 69','ธ.ค. 69','ม.ค. 70','ก.พ. 70','มี.ค. 70','เม.ย. 70','พ.ค. 70','มิ.ย. 70','ก.ค. 70','ส.ค. 70','ก.ย. 70'];
const PCOL = { BA: '#1D9152', LA: '#2360E0', N: '#0B7088', C: '#7238E0', E: '#D02A55' };
const CAT = {
  kpi: { flagship: 'Flagship ยุทธศาสตร์ (งานใหม่)', routine: 'ปฏิบัติการ (งานประจำ)' },
  free: { flagship: 'Flagship', nonflagship: 'ไม่ใช่ Flagship' }
};
const TYPE_LABEL = { kpi: 'ผูกกับตัวชี้วัดหน่วยงาน', free: 'ไม่ผูกตัวชี้วัด' };

const S = {
  db: null, user: null, sample: null, dl: null,
  uid: null, canAdmin: false, viewerName: '',
  cfg: null, cfgLoaded: false,
  profile: null, profileLoaded: false, profiles: {},
  account: null, accounts: {}, isSuper: false,
  reports: {}, reportsLoaded: false, mon: null, repTab: 'mine', repScope: 'mine', repOpen: null, repDraft: {}, ovFilt: { unit: '', pillar: '' }, confirmAcct: null,
  plans: [], allPlans: [], plansLoaded: false,
  route: 'dashboard', param: null,
  filt: { year: '', unit: '', pillar: '', month: '' }, ops: null, opsMetric: 'revenue', opsRegion: '',
  scope: 'mine', confirmDel: null,
  plan: null, saveT: null, writing: false, pending: false, saveMsg: '', saveErr: false,
  sug: {}, sugBusy: {}, showMiss: false,
  setupTab: 'units', draft: null, dirty: false,
  authMode: 'login', authMsg: '', authErr: {}, resetOk: false,
  ai: { msgs: [], busy: false, ctrl: null },
  inApp: false, readOnly: false
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = (n, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const money = (n) => Number(n || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 });
const mb = (n) => (Number(n || 0) / 1e6).toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const clone = (o) => JSON.parse(JSON.stringify(o));
const rid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const ss = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }, del(k) { try { sessionStorage.removeItem(k); } catch (e) {} } };
const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

function getPath(o, p) { return p.split('.').reduce((a, k) => (a == null ? a : a[k]), o); }
function setPath(o, p, v) { const ks = p.split('.'); let a = o; ks.slice(0, -1).forEach((k) => { if (a[k] == null) a[k] = {}; a = a[k]; }); a[ks[ks.length - 1]] = v; }

function toast(msg, kind) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = (kind === 'err' ? ic('alert') : ic('check')) + `<span>${esc(msg)}</span>`;
  $('#toasts').append(t);
  setTimeout(() => t.remove(), 3800);
}

/* ---- config helpers ---- */
const cfg = () => S.cfg || { pillars: [], strategies: [], kpis: [], units: [], planLevels: [], challenges: [], risks: [], vision: '' };
const pillarOf = (code) => cfg().pillars.find((p) => p.code === code);
const stratOf = (code) => cfg().strategies.find((s) => s.code === code);
const kpiOf = (id) => cfg().kpis.find((k) => k.id === id);
const unitOf = (id) => cfg().units.find((u) => u.id === id);
const riskOf = (id) => cfg().risks.find((r) => r.id === id);
const chalOf = (id) => cfg().challenges.find((c) => c.id === id);
const levelItem = (id) => { for (const L of cfg().planLevels) { const it = (L.items || []).find((i) => i.id === id); if (it) return { level: L, item: it }; } return null; };
const ownerName = (p) => (S.profiles[p.ownerId]?.name) || p.ownerName || 'ไม่ระบุ';
const unitName = (id) => unitOf(id)?.name || 'ไม่ระบุหน่วยงาน';
const directorOf = (id) => unitOf(id)?.director || '';
const yearsRange = () => { const a = Number(cfg().planStart || 2569), b = Number(cfg().planEnd || 2573); const out = []; for (let y = a; y <= b; y++) out.push(y); return out; };
const riskScore = (l, i) => (l && i ? l * i : 0);
const riskLevel = (s) => (s >= 17 ? { t: 'สูงมาก', c: 'l4', k: 'bad' } : s >= 10 ? { t: 'สูง', c: 'l3', k: 'warn' } : s >= 5 ? { t: 'ปานกลาง', c: 'l2', k: 'warn' } : s > 0 ? { t: 'ต่ำ', c: 'l1', k: 'ok' } : null);
const periodText = (p) => { const s = Number(p.startYear), d = Number(p.duration || 1); return d > 1 ? `${s}–${s + d - 1} (${d} ปี)` : `${s} (1 ปี)`; };

/* ---- plan model ---- */
function newPlan(type, category) {
  return {
    id: rid('p'), ownerId: S.uid, ownerName: S.profile?.name || '', unitId: S.profile?.unitId || '',
    type, category, name: '', objective: '', startYear: 2570, duration: 1, pillar: '', strategy: '', kpis: [], risks: [], budget: null,
    steps: Array.from({ length: 5 }, () => ({ name: '', from: -1, to: -1 })),
    output6: '', output12: '', outcome12: '',
    erm1: { risk: '', current: '', l: 0, i: 0 }, erm2: { planB: '', kri: '', months: [] },
    status: 'draft', createdAt: Date.now(), updatedAt: Date.now()
  };
}
function missing(p) {
  const m = [];
  const add = (sec, f, t) => m.push({ sec, f, t });
  if (!p.name.trim()) add('w-info', 'name', 'ชื่อแผน');
  if (!String(p.objective || '').trim()) add('w-info', 'objective', 'วัตถุประสงค์โครงการ');
  if (!p.pillar) add('w-link', 'pillar', 'เสายุทธศาสตร์');
  if (!p.strategy) add('w-link', 'strategy', 'กลยุทธ์');
  if (p.type === 'kpi' && !p.kpis.length) add('w-link', 'kpis', 'ตัวชี้วัด (อย่างน้อย 1 ตัว)');
  if (!p.risks.length) add('w-risk', 'risks', 'ความเสี่ยงระดับกรม (อย่างน้อย 1 เรื่อง)');
  if (p.budget === null || p.budget === '' || isNaN(Number(p.budget))) add('w-risk', 'budget', 'งบประมาณ');
  if (p.type === 'kpi') {
    p.steps.forEach((s, i) => { if (!s.name.trim() || s.from < 0) add('w-steps', 'steps', `ขั้นตอนที่ ${i + 1} (ชื่อและเดือน)`); });
    if (!p.output6.trim()) add('w-out', 'output6', 'Output 6 เดือน');
    if (!p.output12.trim()) add('w-out', 'output12', 'Output 12 เดือน');
    if (!p.outcome12.trim()) add('w-out', 'outcome12', 'Outcome 12 เดือน');
    if (!p.erm1.risk.trim()) add('w-erm', 'erm1.risk', 'ERM1 ความเสี่ยงโครงการ');
    if (!p.erm1.current.trim()) add('w-erm', 'erm1.current', 'ERM1 การจัดการในปัจจุบัน');
    if (!p.erm1.l || !p.erm1.i) add('w-erm', 'erm1.map', 'ERM1 ประเมินบน risk map');
    if (!p.erm2.planB.trim()) add('w-erm', 'erm2.planB', 'ERM2 Plan B');
    if (!p.erm2.kri.trim()) add('w-erm', 'erm2.kri', 'ERM2 KRI');
    if (!p.erm2.months.length) add('w-erm', 'erm2.months', 'ERM2 timeline การติดตาม');
  }
  return m;
}

/* ---- boot ---- */
/* โหมดแสดงผลสาธารณะ (เช่น Vercel): ไม่มีระบบ Claude → อ่านข้อมูลจาก public-data.json ดูได้อย่างเดียว */
const PUBLIC_ROUTES = ['dashboard', 'kpis', 'risks', 'pillar', 'report', 'library'];
async function publicBoot() {
  let P = null;
  try { const r = await fetch('public-data.json', { cache: 'no-store' }); if (r.ok) P = await r.json(); } catch (e) {}
  if (!P || !P.org) return false;
  Object.assign(S, { publicMode: true, uid: 'public', isSuper: false, canAdmin: false, readOnly: true, cfg: P.org, ops: P.ops || null, hr: P.hr || null,
    cfgLoaded: true, profileLoaded: true, privLoaded: true, plansLoaded: true, reportsLoaded: true, allPlans: Array.isArray(P.plans) ? P.plans : [], plans: [], reports: {}, profiles: {},
    profile: { name: 'ผู้เยี่ยมชม', unitId: '' }, account: { name: 'ผู้เยี่ยมชม' }, publicAsOf: P.exportedAt || 0 });
  scopePlans();
  fetch('news.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((j) => { if (j?.items) { S.news = j; if (S.inApp && S.route === 'dashboard') renderView(); } }).catch(() => {});
  document.body.classList.add('public');
  enterApp();
  return true;
}
async function boot() {
  renderAuth();
  const cl = window.claude;
  if (!cl || !cl.use) { if (await publicBoot()) return; S.noRuntime = true; renderAuth(); return; }
  const [db, user, sample, dl, assets] = await Promise.all(['db', 'user', 'sample', 'downloads', 'assets'].map((n) => cl.use(n).catch(() => null)));
  Object.assign(S, { db, user, sample, dl, assets });
  if (user) {
    S.uid = await user.id().catch(() => null);
    S.isSuper = await user.isOwner().catch(() => false);
    S.canAdmin = S.isSuper;
    const me = await user.me().catch(() => null);
    S.viewerName = me?.name || '';
    const w = await user.can('data.write').catch(() => null);
    S.readOnly = w === false;
  }
  if (!db || !S.uid) { S.noRuntime = true; renderAuth(); return; }

  db.doc('config/org').onSnapshot((snap) => { S.cfg = snap.exists ? snap.data() : null; S.cfgLoaded = true; onData('cfg'); }, () => { S.cfgLoaded = true; onData('cfg'); });
  db.doc('profiles/' + S.uid).onSnapshot((snap) => { S.profile = snap.exists ? snap.data() : null; S.profileLoaded = true; scopePlans(); onData('profile'); }, () => { S.profileLoaded = true; onData('profile'); });
  db.collection('profiles').onSnapshot((q) => { const m = {}; q.docs.forEach((d) => { m[d.id] = d.data(); }); S.profiles = m; onData('profiles'); }, () => {});
  db.collection('plans').onSnapshot((q) => { S.allPlans = q.docs.map((d) => d.data()).filter((p) => p && p.id); scopePlans(); S.plansLoaded = true; onData('plans'); }, () => { S.plansLoaded = true; onData('plans'); });
  fetch('news.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((j) => { if (j?.items) { S.news = j; if (S.inApp && S.route === 'dashboard') renderView(); } }).catch(() => {});
  db.doc('config/hr').onSnapshot((snap) => { S.hr = snap.exists ? snap.data() : null; if (S.inApp && S.route === 'pillar' && S.param === 'LA') renderView(); }, () => {});
  db.doc('config/ops').onSnapshot((snap) => { S.ops = snap.exists ? snap.data() : null; if (S.inApp && S.route === 'dashboard') renderView(); }, () => {});
  db.collection('reports').onSnapshot((q) => { const m = {}; q.docs.forEach((d) => { m[d.id] = d.data(); }); S.reports = m; S.reportsLoaded = true; onData('reports'); }, () => { S.reportsLoaded = true; });
  db.doc('accounts/' + S.uid).onSnapshot(async (snap) => {
    S.account = snap.exists ? snap.data() : null;
    if (!S.account && !S.migrated) {
      S.migrated = true;
      try {
        const [c, a, p] = await Promise.all([db.doc(`data/users/${S.uid}/contact`).get(), db.doc(`data/users/${S.uid}/auth`).get(), db.doc('profiles/' + S.uid).get()]);
        if (a.exists && p.exists) { await db.doc('accounts/' + S.uid).set(Object.assign({}, p.data(), c.exists ? c.data() : {}, a.data())); return; }
      } catch (e) {}
    }
    S.privLoaded = true; onData('account');
  }, () => { S.privLoaded = true; onData('account'); });
  if (S.isSuper) db.collection('accounts').onSnapshot((q) => { const m = {}; q.docs.forEach((d) => { m[d.id] = d.data(); }); S.accounts = m; onData('accounts'); }, () => {});
}

function onData(kind) {
  if (!S.inApp) {
    if (S.cfgLoaded && S.profileLoaded && S.privLoaded) {
      if (S.account && ss.get('bp_in') === S.uid) { enterApp(); return; }
      if (!S.authDecided) { S.authDecided = true; S.authMode = S.account ? 'login' : 'signup'; }
    }
    renderAuth();
    return;
  }
  if (kind === 'account' && !S.account) { ss.del('bp_in'); S.inApp = false; S.authMode = 'signup'; S.authMsg = 'บัญชีนี้ถูกยกเลิกแล้ว สมัครใช้งานใหม่ได้เลย'; closeOverlays(); renderAuth(); return; }
  if (kind === 'profiles' || kind === 'profile' || kind === 'cfg') renderWho();
  if (S.route === 'edit') { if (kind === 'cfg') renderView(); return; }
  if ((S.route === 'setup' || S.route === 'kpi') && S.dirty) return;
  if ((S.route === 'setup' || S.route === 'kpi') && kind === 'cfg') S.draft = clone(cfg());
  if (S.route === 'monthly' && S.repOpen && document.activeElement?.closest?.('.rep-form')) { renderNav(); return; }
  renderNav();
  renderView();
}

/* ---- auth ---- */
async function hashPw(pw, salt) {
  const data = new TextEncoder().encode(salt + '::' + pw);
  try {
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    let h = 2166136261; for (const b of data) { h ^= b; h = Math.imul(h, 16777619); } return 'f' + (h >>> 0).toString(16);
  }
}

function authField(id, label, type, opts = {}) {
  const err = S.authErr[id];
  return `<div class="field ${err ? 'invalid' : ''}">
    <label for="a-${id}" class="${opts.req === false ? '' : 'req'}">${label}</label>
    ${opts.select ? `<select id="a-${id}" class="select">${opts.select}</select>` : `<input id="a-${id}" class="input" type="${type}" autocomplete="${opts.ac || 'off'}" ${opts.ph ? `placeholder="${esc(opts.ph)}"` : ''} value="${esc(opts.val || '')}" ${opts.im ? `inputmode="${opts.im}"` : ''}>`}
    ${err ? `<span class="err">${esc(err)}</span>` : opts.help ? `<span class="help">${opts.help}</span>` : ''}
  </div>`;
}

function renderAuth() {
  $('#auth').hidden = false; $('#shell').hidden = true;
  const card = $('#auth-card');
  if (S.noRuntime) {
    card.innerHTML = `<h2>เปิดใช้งานผ่าน claude.ai</h2><p class="muted">ระบบนี้เก็บข้อมูลร่วมกันทั้งองค์กร กรุณาเปิดลิงก์นี้ขณะลงชื่อเข้าใช้บัญชี Claude ของกรมฯ</p>`;
    return;
  }
  if (!(S.cfgLoaded && S.profileLoaded && S.privLoaded)) {
    card.innerHTML = `<div class="skel" style="height:34px;width:60%"></div><div class="skel" style="height:44px"></div><div class="skel" style="height:44px"></div><div class="skel" style="height:44px"></div>`;
    return;
  }
  const m = S.authMode, A = S.account;
  const tabs = (m === 'login' || m === 'signup') ? `<div class="tabs" role="tablist">
      <button role="tab" aria-selected="${m === 'login'}" data-act="auth-mode" data-v="login">เข้าสู่ระบบ</button>
      <button role="tab" aria-selected="${m === 'signup'}" data-act="auth-mode" data-v="signup">สมัครใช้งาน</button></div>` : '';
  let body = '';
  if (m === 'login') {
    body = !A
      ? `<div class="proto-note">ยังไม่มีบัญชีสำหรับผู้ใช้นี้ กรุณาสมัครใช้งานก่อน</div><button class="btn btn-primary" data-act="auth-mode" data-v="signup">สมัครใช้งาน</button>`
      : `<form class="form" id="f-login" novalidate>
        ${authField('user', 'ชื่อผู้ใช้', 'text', { ac: 'username', val: A.username })}
        ${authField('pw', 'รหัสผ่าน', 'password', { ac: 'current-password' })}
        <div style="display:flex;justify-content:flex-end"><button type="button" class="linkish" data-act="auth-mode" data-v="forgot">ลืมรหัสผ่าน?</button></div>
        <button class="btn btn-primary" type="submit">${ic('lock')}เข้าสู่ระบบ</button>
      </form>`;
  } else if (m === 'signup') {
    if (A) {
      body = `<div class="proto-note">บัญชีนี้สมัครใช้งานแล้วในชื่อ <b>${esc(A.name)}</b> (${esc(unitName(A.unitId))})</div><button class="btn btn-primary" data-act="auth-mode" data-v="login">ไปหน้าเข้าสู่ระบบ</button>`;
    } else {
      const d = S.authDraft || {};
      const opts = `<option value="">เลือกหน่วยงาน</option>` + cfg().units.map((u) => `<option value="${esc(u.id)}" ${d.unit === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('');
      body = `<form class="form" id="f-signup" novalidate>
        ${authField('unit', 'หน่วยงาน', '', { select: opts })}
        <div class="row2">${authField('name', 'ชื่อ-นามสกุล', 'text', { ac: 'name', val: d.name || S.viewerName })}${authField('phone', 'เบอร์ติดต่อ', 'tel', { ac: 'tel', val: d.phone, im: 'tel', ph: '02 xxx xxxx' })}</div>
        ${authField('email', 'อีเมล (ใช้เมื่อลืมรหัสผ่าน)', 'email', { ac: 'email', val: d.email, ph: 'name@excise.go.th' })}
        <div class="row2">${authField('user', 'ชื่อผู้ใช้', 'text', { ac: 'username', val: d.user, ph: 'ภาษาอังกฤษ/ตัวเลข' })}${authField('pw', 'รหัสผ่าน', 'password', { ac: 'new-password', ph: 'อย่างน้อย 8 ตัว' })}</div>
        <button class="btn btn-primary" type="submit">${ic('user')}สมัครใช้งาน</button>
      </form>`;
    }
  } else if (m === 'forgot') {
    body = `<button class="linkish" data-act="auth-mode" data-v="login" style="justify-self:start">← กลับไปหน้าเข้าสู่ระบบ</button>
      <div><h2>ลืมรหัสผ่าน</h2><p class="muted">พิมพ์อีเมลที่ใช้สมัครเพื่อยืนยันตัวตน แล้วยกเลิกบัญชีเดิมเพื่อสมัครใหม่</p></div>
      <form class="form" id="f-forgot" novalidate>
        ${authField('email', 'อีเมลที่ใช้สมัคร', 'email', { ac: 'email' })}
        <button class="btn btn-primary" type="submit">${ic('mail')}ยืนยันอีเมล</button>
      </form>`;
  } else if (m === 'cancel') {
    const n = S.plans.filter((p) => p.ownerId === S.uid && p.name).length;
    body = `<div><h2>ยกเลิกบัญชีเพื่อสมัครใหม่</h2><p class="muted">บัญชี <b>${esc(A?.username)}</b> (${esc(A?.name)})</p></div>
      <div class="proto-note" style="border-style:solid">แผนที่คุณสร้างไว้ ${n} แผน จะยังอยู่ และกลับมาเป็นของคุณเมื่อสมัครใหม่ด้วยบัญชี Claude เดิม</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-primary" data-act="acct-cancel">${ic('trash', 'ic-sm')}ยกเลิกบัญชีและสมัครใหม่</button><button class="btn" data-act="auth-mode" data-v="login">ไม่ยกเลิก</button></div>`;
  }
  const head = (m === 'login' || m === 'signup') ? `<div><h2>${m === 'login' ? 'เข้าสู่ระบบ' : 'สมัครใช้งาน'}</h2></div>` : '';
  const test = `<div class="test-box"><span>ก่อนใช้งานจริง</span><button type="button" class="btn" data-act="test-login">${ic('user', 'ic-sm')}เข้าใช้ด้วยบัญชีทดสอบ</button></div>`;
  card.innerHTML = head + tabs + (S.authMsg ? `<div class="proto-note" style="border-style:solid;color:var(--ok)">${esc(S.authMsg)}</div>` : '') + body + ((m === 'login' || m === 'signup') ? test : '');
}

async function onAuthSubmit(form) {
  const v = (id) => ($('#a-' + id)?.value || '').trim();
  const E = {}; const A = S.account;
  if (form.id === 'f-login') {
    if (!v('user')) E.user = 'กรอกชื่อผู้ใช้';
    if (!v('pw')) E.pw = 'กรอกรหัสผ่าน';
    if (!E.user && v('user').toLowerCase() !== String(A.username || '').toLowerCase()) E.user = 'ชื่อผู้ใช้ไม่ถูกต้อง';
    if (!Object.keys(E).length) { const h = await hashPw(v('pw'), A.salt); if (h !== A.hash) E.pw = 'รหัสผ่านไม่ถูกต้อง'; }
    S.authErr = E; if (Object.keys(E).length) { const keep = v('user'); renderAuth(); $('#a-user').value = keep; return; }
    S.authMsg = ''; ss.set('bp_in', S.uid); enterApp();
  } else if (form.id === 'f-signup') {
    S.authDraft = { unit: v('unit'), name: v('name'), user: v('user'), phone: v('phone'), email: v('email') };
    if (!v('unit')) E.unit = 'เลือกหน่วยงาน';
    if (!v('name')) E.name = 'กรอกชื่อ-นามสกุล';
    if (!/^[A-Za-z0-9._-]{3,}$/.test(v('user'))) E.user = 'ใช้ภาษาอังกฤษหรือตัวเลข อย่างน้อย 3 ตัว';
    if (Object.entries(S.profiles).some(([id, p]) => id !== S.uid && String(p.username || '').toLowerCase() === v('user').toLowerCase())) E.user = 'ชื่อผู้ใช้นี้มีผู้ใช้แล้ว';
    if (!/^[0-9\s-]{9,12}$/.test(v('phone'))) E.phone = 'กรอกเบอร์ 9–10 หลัก';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) E.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (v('pw').length < 8) E.pw = 'อย่างน้อย 8 ตัวอักษร';
    S.authErr = E; if (Object.keys(E).length) { renderAuth(); return; }
    const salt = rid('s'); const hash = await hashPw(v('pw'), salt);
    const pub = { name: v('name'), username: v('user'), unitId: v('unit'), createdAt: Date.now() };
    try {
      await S.db.doc('accounts/' + S.uid).set(Object.assign({}, pub, { email: v('email').toLowerCase(), phone: v('phone'), salt, hash }));
      await S.db.doc('profiles/' + S.uid).set(pub);
      S.account = Object.assign({}, pub, { email: v('email').toLowerCase(), phone: v('phone'), salt, hash });
      S.profile = pub; S.authMsg = '';
      ss.set('bp_in', S.uid); S.authDraft = null; enterApp(); toast('สมัครใช้งานเรียบร้อย');
    } catch (e) { S.authErr = { name: 'บันทึกไม่สำเร็จ บัญชีนี้อาจมีสิทธิ์ดูอย่างเดียว ติดต่อผู้ดูแลระบบ' }; renderAuth(); }
  } else if (form.id === 'f-forgot') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) E.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    else if (!A || String(A.email || '').toLowerCase() !== v('email').toLowerCase()) E.email = 'อีเมลไม่ตรงกับบัญชีที่สมัครไว้';
    S.authErr = E; if (Object.keys(E).length) { renderAuth(); return; }
    S.authMode = 'cancel'; renderAuth();
  }
}
async function testLogin() {
  try {
    if (!S.account) {
      const pub = { name: 'บัญชีทดสอบ', username: 'test', unitId: cfg().units[0]?.id || '', createdAt: Date.now(), test: true };
      const salt = rid('s'); const hash = await hashPw(rid('x'), salt);
      await S.db.doc('accounts/' + S.uid).set(Object.assign({}, pub, { email: '', phone: '', salt, hash }));
      await S.db.doc('profiles/' + S.uid).set(pub);
      S.account = Object.assign({}, pub, { salt, hash }); S.profile = pub;
    }
    ss.set('bp_in', S.uid); S.authMsg = ''; enterApp(); toast('เข้าใช้ด้วยบัญชีทดสอบ');
  } catch (e) { toast('เข้าบัญชีทดสอบไม่สำเร็จ บัญชีนี้อาจมีสิทธิ์ดูอย่างเดียว', 'err'); }
}
async function cancelAccount(uid) {
  await S.db.doc('accounts/' + uid).delete();
  await S.db.doc('profiles/' + uid).delete();
}

/* ---- shell ---- */
function enterApp() {
  S.inApp = true;
  const lg = $('.auth-logo'), bl = $('#brand-logo'); if (lg && bl && !bl.src) bl.src = lg.src;
  $('#auth').hidden = true; $('#shell').hidden = false;
  if (ls.get('bp_mini') === '1') $('#shell').classList.add('mini');
  syncMini();
  renderWho(); renderNav(); route();
}
function syncMini() {
  const mini = $('#shell').classList.contains('mini');
  const b = $('#nav-trigger'); if (!b) return;
  b.setAttribute('aria-label', mini ? 'ขยายเมนู' : 'ย่อเมนู'); b.title = mini ? 'ขยายเมนู' : 'ย่อเมนู';
}
function renderWho() {
  const p = S.profile || S.account; if (!p || !$('#who')) return;
  const initials = (p.name || '?').trim().slice(0, 1);
  $('#who').innerHTML = `<span class="avatar" aria-hidden="true">${esc(initials)}</span><span class="who-t"><b>${esc(p.name)}</b><span>${S.publicMode ? `โหมดแสดงผล${S.publicAsOf ? ' · ข้อมูล ณ ' + new Date(S.publicAsOf).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : ''}` : S.isSuper ? 'Super admin' : esc(p.username || '')}</span></span>`;
  $('#scope').innerHTML = `${ic('building', 'ic-sm')}<span>${esc(unitName(p.unitId))}</span>`;
}
/* สิทธิ์: Super admin เห็นและจัดการได้ทุกอย่าง · ผู้ใช้ทั่วไปเห็นทุกหน้า ยกเว้นแผน/รายงานของหน่วยงานอื่น และเมนูตั้งค่าทั้งหมด */
function scopePlans() {
  const all = S.allPlans || [], u = S.profile?.unitId;
  S.plans = S.isSuper || S.publicMode ? all : all.filter((p) => p.ownerId === S.uid || (u && p.unitId === u));
}
function visUnits() { const us = cfg().units || []; if (S.isSuper) return us; const u = S.profile?.unitId; return us.filter((x) => x.id === u); }
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'kpis', label: 'KPI Scoreboard', icon: 'target' },
  { id: 'risks', label: 'TOP5 Risk', icon: 'shield' },
  { id: 'new', label: 'สร้างแผนงานใหม่', icon: 'fileplus' },
  { id: 'monthly', label: 'รายงานผลรายเดือน', icon: 'chart' },
  { sec: 'ยุทธศาสตร์', pillars: true },
  { sec: 'ข้อมูลและความช่วยเหลือ', links: true },
  { id: 'ai', label: 'ผู้ช่วย AI', icon: 'spark', ai: true },
  { id: 'contacts', label: 'ติดต่อเจ้าหน้าที่', icon: 'phone', act: 'contacts' },
  { sec: 'ตั้งค่า', superOnly: true },
  { id: 'kpi', label: 'KPI Setting', icon: 'sliders', superOnly: true },
  { id: 'setup', label: 'ตั้งค่าทั่วไป', icon: 'sliders', superOnly: true },
  { id: 'users', label: 'จัดการผู้ใช้', icon: 'user', superOnly: true }
];
const INSIGHT_URL = 'https://claude.ai/artifact/A6aFeSRLYqU44TJZ1k3X69';
const DEFAULT_LINKS = [{ label: 'Excise Knowledge Hub', url: '' }, { label: 'แผนระดับต่างๆ', url: '' }, { label: 'ผลการดำเนินงานสำคัญ กรมสรรพสามิต', url: '' }];
function workLinks() {
  const C = cfg();
  if (Array.isArray(C.workLinks)) return C.workLinks;
  return DEFAULT_LINKS.map((l, i) => (i === 0 ? Object.assign({}, l, { url: C.hubUrl || '' }) : l));
}
function renderNav() {
  const cur = S.route === 'edit' || S.route === 'report' ? 'new' : S.route === 'pillar' ? 'p-' + S.param : S.route;
  const drafts = S.plans.filter((p) => p.ownerId === S.uid && p.status !== 'done').length;
  const due = typeof pendingReports === 'function' ? pendingReports() : 0;
  const item = (n) => `<li><button class="nav-item" data-act="${n.ai ? 'ai-open' : n.act || 'go'}" data-v="${n.id}" ${!n.ai && !n.act && cur === n.id ? 'aria-current="page"' : ''} title="${esc(n.label)}">${ic(n.icon)}<span class="nav-label">${n.label}</span>${n.id === 'new' && drafts ? `<span class="badge" title="แผนที่ยังเป็นร่าง">ร่าง ${drafts}</span>` : ''}${n.id === 'monthly' && due ? `<span class="badge" title="แผนที่ยังไม่ส่งรายงานเดือนนี้">รอส่ง ${due}</span>` : ''}</button></li>`;
  const link = (l) => l.url ? `<li><a class="nav-item" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" title="${esc(l.label)} (เปิดแท็บใหม่)">${ic('book')}<span class="nav-label">${esc(l.label)}</span></a></li>`
    : `<li><button class="nav-item" data-act="link-empty" title="${esc(l.label)}">${ic('book')}<span class="nav-label">${esc(l.label)}</span></button></li>`;
  $('#nav-list').innerHTML = NAV.filter((n) => (!n.superOnly || S.isSuper) && !(S.publicMode && ['new', 'monthly', 'ai', 'contacts'].includes(n.id))).map((n) => {
    if (!n.sec) return item(n) + (n.id === 'dashboard' ? `<li><a class="nav-item" href="${esc(S.publicMode ? 'insight/' : (cfg().insightUrl || INSIGHT_URL))}" target="_blank" rel="noopener noreferrer" title="Excise Insight Update · สรุปข่าวและนโยบายรายสัปดาห์ (เปิดแท็บใหม่)">${ic('spark')}<span class="nav-label">Excise Insight Update</span></a></li>` : '');
    let h = `<li class="nav-sec"><span>${n.sec}</span></li>`;
    if (n.pillars) h += `<li><button class="nav-item" data-act="plan-view" title="ร่างแผนยุทธศาสตร์กรมสรรพสามิต 2570–2574 · เปิดดูหรือดาวน์โหลด PDF">${ic('book')}<span class="nav-label">แผนยุทธศาสตร์ 2570–2574</span></button></li>`;
    if (n.pillars) h += cfg().pillars.map((pl) => `<li><button class="nav-item nav-p" data-p="${esc(pl.code)}" data-act="go" data-v="p-${esc(pl.code)}" ${cur === 'p-' + pl.code ? 'aria-current="page"' : ''} title="${esc(pl.code)} : ${esc(pillarShort(pl))}"><span class="nav-code">${esc(pl.code)}</span><span class="nav-label">${esc(pillarShort(pl))}</span></button></li>`).join('');
    if (n.links) { h += `<li><button class="nav-item" data-act="go" data-v="library" ${cur === 'library' ? 'aria-current="page"' : ''} title="แผนระดับต่างๆ · คลังแผนและเอกสาร">${ic('book')}<span class="nav-label">แผนระดับต่างๆ</span></button></li>`; h += workLinks().filter((l) => l.label && l.label.trim() !== 'แผนระดับต่างๆ').map(link).join(''); }
    return h;
  }).join('');
}
function go(r) { if (location.hash === '#' + r) route(); else location.hash = r; }
function route() {
  const h = (location.hash || '').slice(1) || 'dashboard';
  if (S.route === 'edit' && S.plan) flushSave();
  const m = h.match(/^(edit|report)-(.+)$/), pm = h.match(/^p-([A-Za-z]+)$/);
  if (m) { S.route = m[1]; S.param = m[2]; }
  else if (pm) { S.route = 'pillar'; S.param = pm[1]; }
  else { S.route = ['dashboard', 'new', 'kpi', 'setup', 'monthly', 'hub', 'users', 'kpis', 'risks', 'library'].includes(h) ? h : 'dashboard'; S.param = null; }
  if (['users', 'kpi', 'setup'].includes(S.route) && !S.isSuper) S.route = 'dashboard';
  if (S.publicMode && !PUBLIC_ROUTES.includes(S.route)) { S.route = 'dashboard'; S.param = null; }
  if (S.route === 'edit') {
    const p = S.plans.find((x) => x.id === S.param);
    S.plan = p ? Object.assign(newPlan(p.type, p.category), clone(p)) : (S.plan && S.plan.id === S.param ? S.plan : null);
    S.sug = {}; S.showMiss = false; S.saveMsg = ''; S.edStep = 0;
  } else S.plan = null;
  if (S.route === 'setup' || S.route === 'kpi') { S.draft = clone(cfg()); S.dirty = false; }
  closeOverlays();
  renderNav(); renderView();
  $('#view').scrollTop = 0;
}
const TITLES = { dashboard: 'Dashboard', new: 'สร้างแผนใหม่', edit: 'กรอกข้อมูลแผน', report: 'รายงานแผน', kpi: 'KPI Setting', setup: 'ตั้งค่าทั่วไป', monthly: 'รายงานผลรายเดือน', hub: 'Knowledge Hub', users: 'จัดการผู้ใช้', kpis: 'KPI Scoreboard', risks: 'TOP5 Risk', pillar: 'ยุทธศาสตร์' };
function renderView() {
  if (!S.inApp) return;
  const v = $('#view');
  const fn = { dashboard: viewDashboard, new: viewNew, edit: viewEdit, report: viewReport, kpi: viewKpi, setup: viewSetup, monthly: viewMonthly, hub: viewHub, users: viewUsers, kpis: viewKpis, risks: viewRisks, pillar: viewPillar, library: viewLibrary }[S.route];
  v.innerHTML = `<div class="wrap">${fn()}</div>`;
  if (S.route === 'edit') wireEditor();
  if (typeof initMapZoom === 'function') initMapZoom(); if (typeof initSankey === 'function') initSankey(); if (typeof initCarousels === 'function') initCarousels();
  if (S.route === 'monthly' && S.repTab === 'ov' && typeof govPreview === 'function') { govPreview(); try { document.fonts.ready.then(() => { if (S.route === 'monthly' && S.repTab === 'ov') govPreview(); }); } catch (e) {} }
  if (S.route === 'report') { fitReport(); try { document.fonts.ready.then(() => { if (S.route === 'report') fitReport(); }); } catch (e) {} }
}
function closeOverlays() {
  $('#shell').classList.remove('open');
  $('#ai').classList.remove('open'); $('#ai').setAttribute('aria-hidden', 'true');
  $('#scrim').hidden = true;
}
