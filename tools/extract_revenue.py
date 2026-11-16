"""Build ops-real.json (real excise revenue: national by product, by region) from the FY69 xlsx and FY70 Oct PDF."""
import json, re, sys, glob, subprocess
import openpyxl

ATT = '/mnt/user-data/attachments/e9bd58d3-e678-5336-a4a9-1cc063bd68e6/'
XLSX = glob.glob(ATT + 'c8328dca-*.xlsx')[0]
PDF70 = glob.glob(ATT + '96634ad6-*.pdf')[0]
OUT = sys.argv[1]

APP = ['น้ำมัน', 'รถยนต์', 'เบียร์', 'สุรา', 'ยาสูบ', 'เครื่องดื่ม']
def prod_of(label):
    m = re.match(r'\s*(\d+)\.', label or '')
    if not m: return None
    n = int(m.group(1))
    return APP[n - 1] if 1 <= n <= 6 else ('อื่นๆ' if n <= 22 else None)
def num_line(label):
    m = re.match(r'\s*(\d+)\.\s*(.+)', label or ''); return (int(m.group(1)), m.group(2).strip()) if m else (None, None)
def reg_of(label):
    m = re.search(r'ภาคที่\s*(\d+)', label or '')
    if m: return 'ภาค ' + m.group(1)
    if label and 'ส่วนกลาง' in label: return 'ภาค 10'   # HQ / unspecified -> Bangkok region (tiny)
    return None
def f(v):
    try: return float(v)
    except Exception: return 0.0

wb = openpyxl.load_workbook(XLSX, data_only=True)
def rows(ws): return [r for r in ws.iter_rows(values_only=True) if any(v is not None for v in r)]
def month_cols(ws):
    """header row containing 'ต.ค.' → index of Oct column."""
    for r in rows(ws):
        r = list(r)
        if 'ต.ค.' in [str(x).strip() if x is not None else '' for x in r]:
            return [str(x).strip() if x is not None else '' for x in r].index('ต.ค.')
    raise ValueError(ws.title)

def by_prod_month(ws):
    """sum 12 months per app product (lines 1–22 only, sub-lines ignored)."""
    c = month_cols(ws); out = {}
    for r in rows(ws):
        n, _ = num_line(str(r[0]) if r[0] is not None else '')
        if not n or n > 22: continue
        p = prod_of(str(r[0]))
        vals = [f(r[c + i]) for i in range(12)]
        out.setdefault(p, [0.0] * 12)
        out[p] = [a + b for a, b in zip(out[p], vals)]
    return out
def by_reg_month(ws):
    c = month_cols(ws); out = {}
    for r in rows(ws):
        g = reg_of(str(r[0]) if r[0] is not None else '')
        if not g: continue
        vals = [f(r[c + i]) for i in range(12)]
        out.setdefault(g, [0.0] * 12); out[g] = [a + b for a, b in zip(out[g], vals)]
    return out
def lines_full(ws_cum):
    """sheet 2 cumulative: per tax line actual, prev, deptT, mofT."""
    out = []
    for r in rows(ws_cum):
        n, name = num_line(str(r[0]) if r[0] is not None else '')
        if not n or n > 22: continue
        out.append({'n': n, 'name': name, 'prev': f(r[1]), 'a': f(r[2]), 'tDept': f(r[5]), 'tMof': f(r[8])})
    return out
def seed_matrix(ws):
    """sheet 11: product × region annual target."""
    hdr = None; out = {}
    for r in rows(ws):
        cells = [str(x) if x is not None else '' for x in r]
        if any('ภาคที่ 1' in x for x in cells): hdr = [reg_of(x) for x in cells]; continue
        if not hdr: continue
        n, _ = num_line(cells[0]); p = prod_of(cells[0])
        if not n or n > 22: continue
        for i, g in enumerate(hdr):
            if g and i < len(r): out.setdefault(g, {}); out[g][p] = out[g].get(p, 0) + f(r[i])
    return out

S = {ws.title: ws for ws in wb.worksheets}
fy69 = {
    'actProd': by_prod_month(S['3']), 'actReg': by_reg_month(S['7']),
    'tMofProd': by_prod_month(S['8']), 'tDeptProd': by_prod_month(S['9']),
    'tDeptReg': by_reg_month(S['10']), 'seed': seed_matrix(S['11']), 'lines': lines_full(S['2']),
}
fy68 = {'actProd': by_prod_month(S['12']), 'actReg': by_reg_month(S['13'])}

# ---------- FY70 from PDF text ----------
def page(pg):
    return subprocess.run(['pdftotext', '-layout', '-f', str(pg), '-l', str(pg), PDF70, '-'], capture_output=True, text=True).stdout
NUM = r'-?[\d,]+\.\d+|-(?=\s|$)'
def nums(s):
    return [0.0 if t == '-' else float(t.replace(',', '')) for t in re.findall(NUM, s)]
def pdf_rows(txt, key):
    out = []
    for line in txt.splitlines():
        lab = line.strip()
        if key == 'prod':
            m = re.match(r'(\d+)\.\s*(\S.*?)\s{2,}(.*)$', lab)
            if m and int(m.group(1)) <= 22: out.append((m.group(1) + '. ' + m.group(2), nums(m.group(3))))
        else:
            m = re.match(r'(ภาคที่\s*\d+|ส่วนกลาง\S*)\s{2,}(.*)$', lab)
            if m: out.append((m.group(1), nums(m.group(2))))
    return out
p1 = pdf_rows(page(3), 'prod')     # page "1": Oct actual by line
p5 = pdf_rows(page(7), 'reg')      # page "5": Oct actual by region
p8 = pdf_rows(page(10), 'prod')    # page "8": MOF (budget doc) monthly
p9 = pdf_rows(page(11), 'prod')    # page "9": dept monthly
p10 = pdf_rows(page(12), 'reg')    # page "10": dept monthly by region
p11txt = page(13)
def agg_prod(rs, idx):
    o = {}
    for lab, v in rs:
        p = prod_of(lab)
        if p and len(v) > idx: o[p] = o.get(p, 0) + v[idx]
    return o
def agg_prod12(rs):
    o = {}
    for lab, v in rs:
        p = prod_of(lab)
        if not p: continue
        v = (v + [0.0] * 13)[:12]
        o.setdefault(p, [0.0] * 12); o[p] = [a + b for a, b in zip(o[p], v)]
    return o
def agg_reg12(rs):
    o = {}
    for lab, v in rs:
        g = reg_of(lab)
        if not g: continue
        v = (v + [0.0] * 13)[:12]
        o.setdefault(g, [0.0] * 12); o[g] = [a + b for a, b in zip(o[g], v)]
    return o
# page 1 columns: prev, act, diff, pct, dept, diff, pct, mof, diff, pct
lines70 = []
for lab, v in p1:
    n, name = num_line(lab)
    if len(v) >= 8: lines70.append({'n': n, 'name': name, 'prev': v[0], 'a': v[1], 'tDept': v[4], 'tMof': v[7]})
act70 = {}; prev70 = {}
for L in lines70:
    p = prod_of(f"{L['n']}. x"); act70[p] = act70.get(p, 0) + L['a']; prev70[p] = prev70.get(p, 0) + L['prev']
reg70 = {}
for lab, v in p5:
    g = reg_of(lab)
    if g and len(v) >= 2: reg70[g] = reg70.get(g, 0) + v[1]
# seed FY70 product × region
seed70 = {}; hdr = None
for line in p11txt.splitlines():
    if 'ภาคที่ 1' in line: hdr = ['ภาค ' + x for x in re.findall(r'ภาคที่\s*(\d+)', line)]; continue
    m = re.match(r'\s*(\d+)\.\s*(\S.*?)\s{2,}(.*)$', line)
    if not (m and hdr) or int(m.group(1)) > 22: continue
    p = prod_of(m.group(1) + '. x'); v = nums(m.group(3))
    for i, g in enumerate(hdr):
        if i < len(v): seed70.setdefault(g, {}); seed70[g][p] = seed70[g].get(p, 0) + v[i]
fy70 = {'actProd0': act70, 'prevProd0': prev70, 'actReg0': reg70,
        'tMofProd': agg_prod12(p8), 'tDeptProd': agg_prod12(p9), 'tDeptReg': agg_reg12(p10), 'seed': seed70, 'lines': lines70}

# ---------- assemble ----------
R = lambda x: round(x, 2)
def month_block(i, actP=None, actR=None, tDP=None, tMP=None, tDR=None):
    o = {'nat': {}, 'reg': {}}
    prods = set((actP or {}).keys()) | set((tDP or {}).keys())
    for p in prods:
        a = actP[p][i] if actP and p in actP else None
        o['nat'][p] = [None if a is None else R(a), R(tDP[p][i]) if tDP and p in tDP else None, R(tMP[p][i]) if tMP and p in tMP else None]
    regs = set((actR or {}).keys()) | set((tDR or {}).keys())
    for g in regs:
        a = actR[g][i] if actR and g in actR else None
        o['reg'][g] = [None if a is None else R(a), R(tDR[g][i]) if tDR and g in tDR else None]
    return o
out = {'updatedAt': '2026-11-16', 'unit': 'ล้านบาท', 'products': APP + ['อื่นๆ'],
       'source': {'2569': 'สถิติรายได้ภาษีสรรพสามิต ก.ย. 69 (BI ณ 2 ต.ค. 69)', '2570': 'สถิติรายได้ภาษีสรรพสามิต ต.ค. 69 (BI ณ 3 พ.ย. 69)'},
       'fy': {}}
out['fy']['2568'] = {'m': {str(i): month_block(i, fy68['actProd'], fy68['actReg']) for i in range(12)}}
out['fy']['2569'] = {'annual': {'dept': 578200, 'mof': 578200}, 'seed': {g: {p: R(v) for p, v in d.items()} for g, d in fy69['seed'].items()},
                     'lines': [{k: (R(v) if isinstance(v, float) else v) for k, v in L.items()} for L in fy69['lines']],
                     'm': {str(i): month_block(i, fy69['actProd'], fy69['actReg'], fy69['tDeptProd'], fy69['tMofProd'], fy69['tDeptReg']) for i in range(12)}}
m70 = {}
for i in range(12):
    if i == 0:
        b = month_block(0, {p: [v] + [0] * 11 for p, v in act70.items()}, {g: [v] + [0] * 11 for g, v in reg70.items()}, fy70['tDeptProd'], fy70['tMofProd'], fy70['tDeptReg'])
    else:
        b = month_block(i, None, None, fy70['tDeptProd'], fy70['tMofProd'], fy70['tDeptReg'])
    m70[str(i)] = b
out['fy']['2570'] = {'annual': {'dept': R(sum(sum(v) for v in fy70['tDeptProd'].values())), 'mof': R(sum(sum(v) for v in fy70['tMofProd'].values()))},
                     'seed': {g: {p: R(v) for p, v in d.items()} for g, d in seed70.items()},
                     'lines': [{k: (R(v) if isinstance(v, float) else v) for k, v in L.items()} for L in lines70], 'm': m70, 'last': 0}
json.dump(out, open(OUT, 'w'), ensure_ascii=False)

# ---------- checks ----------
def tot(fy, i, k, j): return sum((v[j] or 0) for v in out['fy'][fy]['m'][str(i)][k].values())
print('FY69 act nat', R(sum(tot('2569', i, 'nat', 0) for i in range(12))), 'reg', R(sum(tot('2569', i, 'reg', 0) for i in range(12))), '(565,753.94)')
print('FY69 tDept nat', R(sum(tot('2569', i, 'nat', 1) for i in range(12))), 'reg', R(sum(tot('2569', i, 'reg', 1) for i in range(12))), 'mof', R(sum(tot('2569', i, 'nat', 2) for i in range(12))))
print('FY68 act nat', R(sum(tot('2568', i, 'nat', 0) for i in range(12))), 'reg', R(sum(tot('2568', i, 'reg', 0) for i in range(12))), '(537,527.25)')
print('FY70 Oct act nat', R(tot('2570', 0, 'nat', 0)), 'reg', R(tot('2570', 0, 'reg', 0)), '(42,817.44)', 'tDept', R(tot('2570', 0, 'nat', 1)), '(49,379.22)', 'reg', R(tot('2570', 0, 'reg', 1)), 'mof', R(tot('2570', 0, 'nat', 2)), '(41,516.74)')
print('FY70 annual', out['fy']['2570']['annual'], 'seed regions', sorted(seed70), 'tDeptReg sum', R(sum(sum(v) for v in fy70['tDeptReg'].values())))
print('FY69 by product', {p: R(sum(v)) for p, v in fy69['actProd'].items()})
print('FY70 Oct by product', {p: R(v) for p, v in act70.items()})
