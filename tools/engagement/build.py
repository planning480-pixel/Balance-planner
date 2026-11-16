"""Build engagement.json from the Excise engagement survey reports (rounds 1/2567 – 2/2569)."""
import re, json, sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/e9bd58d3-e678-5336-a4a9-1cc063bd68e6/scratchpad/eng')
import parse
D = '/tmp/claude-0/-home-claude/e9bd58d3-e678-5336-a4a9-1cc063bd68e6/scratchpad/eng/'
PROV = json.load(open(D + 'prov.json'))
PUA = dict.fromkeys(range(0xF700, 0xF720))
def sk(s): return parse.skel(s.translate(PUA))
PSK = {sk(p): p for p in PROV}

CENTRAL = ['สำนักกฎหมาย', 'สำนักงานเลขานุการกรม', 'สำนักตรวจสอบ ป้องกันและปราบปราม', 'สำนักบริหารการคลังและรายได้',
           'สำนักบริหารทรัพยากรบุคคล', 'สำนักมาตรฐานและพัฒนาการจัดเก็บภาษี 1', 'สำนักมาตรฐานและพัฒนาการจัดเก็บภาษี 2', 'สำนักแผนภาษี',
           'ศูนย์เทคโนโลยีสารสนเทศ', 'กองกำกับและตรวจสอบภาษีสรรพสามิต', 'กองกำกับและพัฒนามาตรฐานราคาภาษีสรรพสามิต',
           'กลุ่มตรวจสอบภายใน', 'กลุ่มพัฒนาระบบบริหาร', 'กลุ่มพัฒนาและตรวจสอบทางเทคนิค', 'กลุ่มวิเคราะห์สินค้าและของกลาง']
CSK = {sk(c): c for c in CENTRAL}
AREA_P = sk('สำนักงานสรรพสามิตพื้นที่'); REG_P = sk('สำนักงานสรรพสามิตภาคที่')

def canon(name):
    """→ (display name, type, region) or None"""
    k = sk(name)
    if k in CSK: return CSK[k], 'ส่วนกลาง', 'ส่วนกลาง'
    if 'บรหารระดบสง' in k or k in ('คบส.', 'คบส'): return 'คบส. (ผู้บริหารระดับสูง)', 'คบส.', 'คบส.'
    if k.startswith(REG_P):
        n = re.sub(r'\D', '', k[len(REG_P):]); return f'สสภ.{n}', 'ภาค', f'ภาค {n}'
    if k.startswith(AREA_P):
        rest = k[len(AREA_P):]; m = re.match(r'(.*?)(\d*)$', rest); p = PSK.get(m.group(1))
        if not p: return None
        return f'สสพ.{p}{(" " + m.group(2)) if m.group(2) else ""}', 'พื้นที่', PROV[p]
    if k in ('สวนกลาง',): return 'ส่วนกลาง', 'agg', 'ส่วนกลาง'
    return None

def regkey(name):
    k = sk(name)
    if k.startswith(REG_P) or k.startswith('ภาคท') or k.startswith('ภาค'):
        n = re.sub(r'\D', '', k); return f'ภาค {n}' if n else None
    if k == 'สวนกลาง': return 'ส่วนกลาง'
    if k.startswith('คบส'): return 'คบส.'
    return None

NUM4 = r'(\d{2,3}\.\s?\d{2})'
def rows4(lines):
    out = []
    for i, l in enumerate(lines):
        l = l.translate(PUA)
        m = re.match(r'^\s*(\D.*?)\s+' + NUM4 + r'\s+' + NUM4 + r'\s+' + NUM4 + r'\s+' + NUM4 + r'\s*$', l)
        if m: out.append((i, m.group(1).strip(), [float(m.group(j).replace(' ', '')) for j in range(2, 6)]))
    return out

def parse_round(n):
    L = [l.translate(PUA) for l in parse.load(n)]
    T = re.sub(r'\s+', ' ', '\n'.join(L))
    idx26 = next((i for i, l in enumerate(L) if re.match(r'\s*2\.6', l)), len(L))
    idx3 = next((i for i, l in enumerate(L) if i > idx26 and re.search(r'ส่วนที่ 3|3\.1 ความคิดเห็น', l)), len(L))
    R = rows4(L)
    regions = {}
    for i, nm, v in R:
        if i < idx26:
            g = regkey(nm)
            if g and g not in regions: regions[g] = v
    units = []
    if idx26 < len(L):
        for i, nm, v in R:
            if idx26 < i < idx3:
                c = canon(nm)
                if c and c[1] != 'agg': units.append({'n': c[0], 't': c[1], 'g': c[2], 'v': v})
    m = re.search(r'รวมทั้งหมด\s*จ\s*[าำ]?\s*นวน\s*([\d,]+)\s*คน\s*คิดเป็นร้อยละ\s*([\d.]+)', T)
    pop = re.search(r'ประชากร\s*ทั้งหมด\s*([\d,]+)', T)
    meta = {'n': int(m.group(1).replace(',', '')) if m else None, 'rr': float(m.group(2)) if m else None, 'pop': int(pop.group(1).replace(',', '')) if pop else None}
    # tenure / age (3 numbers each)
    tl = {}
    for l in L:
        mm = re.match(r'^\s*(น้อยกว่[าำ] 1 ปี|1 ปี - 5 ปี|ม[าำ]กกว่[าำ] 5 ปี - 10 ปี|ม[าำ]กกว่[าำ] 10 ปี - 15 ปี|ม[าำ]กกว่[าำ] 15 ปี - 20 ปี|ม[าำ]กกว่[าำ] 20 ปี|น้อยกว่[าำ] 25 ปี|25 ปี - 34 ปี|35 ปี - 44 ปี|45 ปี - 54 ปี|55 ปี ขึ้นไป)\s+([\d.\s]+)$', l.strip())
        if mm:
            lab = mm.group(1).replace('ำ', 'า'); nums = [float(x) for x in mm.group(2).split()]
            tl.setdefault(lab, nums)
    # response rate by region
    rr = {}
    for l in L:
        mm = re.match(r'^\s*(.+?)\s+([\d,]+)\s+([\d,]+)\s+([\d.]+)%?\s*$', l.strip())
        if mm:
            g = regkey(mm.group(1))
            if g and g not in rr:
                a, b = int(mm.group(2).replace(',', '')), int(mm.group(3).replace(',', ''))
                rr[g] = [min(a, b), max(a, b), float(mm.group(4))]
    return {'regions': regions, 'units': units, 'meta': meta, 'demo': tl, 'rrReg': rr}

ROUNDS = [('67-1', 2567, 1), ('67-2', 2567, 2), ('67-3', 2567, 3), ('68-1', 2568, 1), ('68-2', 2568, 2), ('69-1', 2569, 1), ('69-2', 2569, 2)]
FILES = {'67-2': '67_2', '67-3': '67_3', '68-1': '681', '68-2': '682', '69-1': '691', '69-2': '692'}
# headline values stated in section 2.1 of each report: [overall, เก่ง, ดี, มีสุข]
HEAD = {'67-1': [78.23, 75.37, 81.24, 78.07], '67-2': [86.23, 84.55, 88.85, 85.28], '67-3': [90.85, 90.13, 92.19, 90.23],
        '68-1': [91.64, 90.72, 93.06, 91.14], '68-2': [92.27, 91.62, 93.15, 92.04], '69-1': [92.58, 91.92, 93.98, 91.76], '69-2': [93.53, 93.10, 94.77, 92.72]}
SUGG = {
 '67-2': {'top3': {'k': 'ความรู้ภาษาอังกฤษ · Data Analytics · กฎระเบียบในการทำงาน', 'd': 'การสร้างความสามัคคี · รางวัลองค์กรคุณธรรมดีเด่น · การทำงานเป็นทีม', 's': 'สวัสดิการที่มีมาตรฐาน · กีฬาภายใน · คอมพิวเตอร์ที่รวดเร็วทันสมัย'}},
 '68-1': {'k': [['การพัฒนา Digital Skill และ AI', 31.72], ['การพัฒนาสมรรถนะตามสายงาน', 30.63], ['การอบรมด้านกฎหมายที่ใช้ในการปฏิบัติงาน', 22.84], ['การอบรมด้านภาษา', 8.70], ['การบริหารทรัพยากรบุคคล', 6.09]],
          'd': [['การสร้างวัฒนธรรมแห่งการเรียนรู้', 35.38], ['การสร้างวัฒนธรรม Service Mind', 20.38], ['รางวัลองค์กรคุณธรรม', 18.41], ['โครงการปฏิบัติธรรม', 13.64], ['รางวัลยกย่องที่มีมาตรฐาน', 12.16]],
          's': [['ความทันสมัยอุปกรณ์ที่ใช้ในการปฏิบัติงาน', 61.87], ['ระเบียบสวัสดิการที่มีมาตรฐาน', 23.66], ['กิจกรรม ESG', 14.45]]},
 '68-2': {'k': [['การพัฒนาสมรรถนะตามสายงาน', 30.30], ['การพัฒนา Digital Skill และ AI', 26.74], ['การอบรมด้านกฎหมาย', 26.61], ['การอบรมด้านภาษา', 8.33], ['การบริหารทรัพยากรบุคคล', 8.02]],
          'd': [['การสร้างวัฒนธรรมแห่งการเรียนรู้', 37.36], ['การสร้างวัฒนธรรม Service Mind', 21.78], ['รางวัลองค์กรคุณธรรมดีเด่น', 17.80], ['โครงการปฏิบัติธรรม', 12.05], ['รางวัลยกย่องที่มีมาตรฐาน', 11.01]],
          's': [['ความทันสมัยอุปกรณ์ที่ใช้ในการปฏิบัติงาน', 33.49], ['ระเบียบสวัสดิการที่มีมาตรฐาน', 29.76], ['กิจกรรม ESG', 25.89], ['การจัดแข่งขันกีฬาภายใน', 10.86]]},
 '69-1': {'k': [['การพัฒนาสมรรถนะตามสายงาน', 30.05], ['การพัฒนา Digital Skill และ AI', 27.24], ['การอบรมด้านกฎหมาย', 26.61], ['การบริหารทรัพยากรบุคคล', 8.22], ['การอบรมด้านภาษา', 7.89]],
          'd': [['การสร้างวัฒนธรรมแห่งการเรียนรู้', 43.83], ['การสร้างวัฒนธรรม Service Mind', 21.37], ['รางวัลองค์กรคุณธรรมดีเด่น', 13.68], ['รางวัลยกย่องที่มีมาตรฐาน', 10.72], ['โครงการปฏิบัติธรรม', 10.41]],
          's': [['ความทันสมัยของอุปกรณ์สำนักงาน', 32.64], ['กิจกรรม ESG', 32.13], ['ระเบียบสวัสดิการที่มีมาตรฐาน', 24.36], ['การจัดแข่งขันกีฬาภายใน', 10.87]]},
 '69-2': {'k': [['การพัฒนา Digital Skill และ AI', 30.22], ['การพัฒนาสมรรถนะตามสายงาน', 28.81], ['การอบรมด้านกฎหมาย', 26.97], ['การบริหารทรัพยากรบุคคล', 7.16], ['การอบรมด้านภาษา', 6.84]],
          'd': [['การสร้างวัฒนธรรมแห่งการเรียนรู้', 41.81], ['การสร้างวัฒนธรรม Service Mind', 20.78], ['รางวัลองค์กรคุณธรรมดีเด่น', 13.40], ['รางวัลยกย่องที่มีมาตรฐาน', 12.01], ['โครงการปฏิบัติธรรม', 11.99]],
          's': [['กิจกรรม ESG', 34.16], ['ความทันสมัยของอุปกรณ์สำนักงาน', 31.96], ['ระเบียบสวัสดิการที่มีมาตรฐาน', 23.42], ['การจัดแข่งขันกีฬาภายใน', 10.46]]},
}
DRIVERS_67_2 = {'k': ['การได้รับโอกาสเรียนรู้/พัฒนาตนเองอยู่เสมอ', 'ผู้บังคับบัญชาและเพื่อนร่วมงานสนับสนุนด้วยความเต็มใจ', 'คำชมจากผู้บังคับบัญชาเมื่อแก้ปัญหาในงาน'],
                'd': ['หน่วยงานมีมาตรการกำกับให้ปฏิบัติตามกฎหมายอย่างเคร่งครัด', 'กิจกรรมกระตุ้นความซื่อสัตย์สุจริตและความรับผิดชอบ', 'ให้บริการอย่างเสมอภาค ไม่เลือกปฏิบัติ'],
                's': ['พอใจบรรยากาศการทำงาน', 'กระบวนการทำงานทำให้ทำงานได้สะดวก', 'คำชมจากผู้บังคับบัญชาเมื่องานสำเร็จ', 'มองเห็นโอกาสก้าวหน้า', 'พอใจสวัสดิการ']}

out = {'updatedAt': '2026-11-16', 'source': 'รายงานผลการสำรวจความผูกพันของบุคลากร กรมสรรพสามิต (สำนักบริหารทรัพยากรบุคคล) ครั้งที่ 1/2567 – 2/2569', 'rounds': []}
for rid, fy, r in ROUNDS:
    o = {'id': rid, 'fy': fy, 'r': r, 'label': f'ครั้งที่ {r}/{fy}', 'v': HEAD[rid], 'regions': {}, 'units': [], 'notes': []}
    if rid in FILES:
        P = parse_round(FILES[rid])
        o['regions'] = P['regions']; o['units'] = P['units']; o['meta'] = P['meta']; o['rrReg'] = P['rrReg']
        o['demo'] = {k: v[-3:] for k, v in P['demo'].items() if len(v) >= 3}
        if rid == '67-3':  # tenure/age table holds rounds 1–3 side by side: [k1 k2 k3 d1 d2 d3 s1 s2 s3]
            out.setdefault('_d67', P['demo'])
    if rid == '67-2':
        # regions from the narrative (sections 2.2–2.5)
        t = re.sub(r'\s+', ' ', open(D + '67_2.p.txt').read())
        regs = {}
        for si, sec in enumerate(['2.2', '2.3', '2.4', '2.5']):
            i = t.find(sec + ' คะแนนความผูกพัน'); s = t[i:i + 900]
            for a, b in re.findall(r'(ภาคที่\s*\d+|ส่วนกลาง)\s*ร้อยละ\s*(\d+\.\s?\d+)', s):
                g = regkey(a); regs.setdefault(g, [None] * 4)[si] = float(b.replace(' ', ''))
        o['regions'] = regs; o['meta'] = {'n': 6200, 'rr': 100.0, 'pop': 6200}; o['drivers'] = DRIVERS_67_2
        o['notes'].append('รายงานไม่มีตารางรายหน่วยงาน (อยู่ใน QR Code)')
    if rid == '67-3':
        o['meta'] = {'n': 6256, 'rr': 100.0, 'pop': 6256}; o['notes'].append('รายงานไม่มีตารางรายหน่วยงานและข้อเสนอแนะ (อยู่ใน QR Code)')
    if rid == '67-1':
        o['notes'].append('มีเฉพาะคะแนนภาพรวมและรายอายุ ที่อ้างถึงในรายงานครั้งที่ 2–3/2567')
    if rid in SUGG: o['sugg'] = SUGG[rid]
    out['rounds'].append(o)
# demographics for 2567 rounds from the 67-3 three-round table
d67 = out.pop('_d67', {})
for idx, rid in enumerate(['67-1', '67-2', '67-3']):
    R = next(x for x in out['rounds'] if x['id'] == rid)
    R['demo'] = {k: [v[idx], v[3 + idx], v[6 + idx]] for k, v in d67.items() if len(v) == 9}
# 2/2569: unit table in the report is identical to 1/2569 → withhold
r691 = next(x for x in out['rounds'] if x['id'] == '69-1'); r692 = next(x for x in out['rounds'] if x['id'] == '69-2')
same = sum(1 for a, b in zip(sorted(map(lambda u: (u['n'], tuple(u['v'])), r691['units'])), sorted(map(lambda u: (u['n'], tuple(u['v'])), r692['units']))) if a == b)
if same > 0.9 * len(r691['units']):
    r692['units'] = []; r692['notes'].append(f'ตารางรายหน่วยงานในรายงานครั้งที่ 2/2569 ซ้ำกับครั้งที่ 1/2569 ({same} จาก {len(r691["units"])} หน่วยงาน) จึงยังไม่แสดง รอไฟล์ที่ถูกต้องจาก สบค.')
r691['meta'] = {'n': 5907, 'rr': 93.87, 'pop': 6293}
r691['demo'] = {'น้อยกว่า 1 ปี': [89.57, 92.31, 90.39], '1 ปี - 5 ปี': [91.75, 93.71, 91.64], 'มากกว่า 5 ปี - 10 ปี': [91.86, 93.70, 91.21], 'มากกว่า 10 ปี - 15 ปี': [92.11, 94.01, 91.55], 'มากกว่า 15 ปี - 20 ปี': [91.93, 93.80, 91.40], 'มากกว่า 20 ปี': [92.12, 93.75, 91.38],
  'น้อยกว่า 25 ปี': [89.07, 93.02, 91.93], '25 ปี - 34 ปี': [91.05, 93.20, 90.92], '35 ปี - 44 ปี': [91.93, 93.76, 91.33], '45 ปี - 54 ปี': [92.54, 94.06, 91.86], '55 ปี ขึ้นไป': [91.20, 93.53, 91.10]}
r692['notes'].append('คะแนนภาพรวมในข้อ 2.1 (93.53) ต่างจากตารางรายภาค (93.78) ใช้ค่าตามข้อ 2.1')
r691['notes'].append('แถว "รวมทั้งหมด" ในตารางรายหน่วยงานเป็นตัวเลขของครั้งที่ 2/2568 (91.99) ใช้ค่าตามข้อ 2.1')
json.dump(out, open(sys.argv[1], 'w'), ensure_ascii=False)
for o in out['rounds']:
    print(o['id'], o['v'], 'regions', len(o['regions']), 'units', len(o['units']), 'meta', o.get('meta'), 'demo', len(o.get('demo', {})), 'rrReg', len(o.get('rrReg', {})))
    bad = [u for u in o['units'] if None in u['v']]
print('unmatched check:')
for f in ['681', '682', '691']:
    L = [l.translate(PUA) for l in parse.load(f)]
    i26 = next(i for i, l in enumerate(L) if re.match(r'\s*2\.6', l))
    for i, nm, v in rows4(L):
        if i > i26 and not canon(nm) and 'Grand' not in nm and 'รวม' not in nm: print(' ', f, nm, v)
