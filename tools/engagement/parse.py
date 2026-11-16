import re, json, sys, glob, unicodedata
D = '/tmp/claude-0/-home-claude/e9bd58d3-e678-5336-a4a9-1cc063bd68e6/scratchpad/eng/'
MARKS = set('ัิีึืุู็่้๊๋์ํฺ')
def skel(s):
    s = s.replace('ำ', 'า').replace('ํา', 'า')
    return ''.join(ch for ch in s if ch not in MARKS and not ch.isspace())
def fix(s):
    s = s.replace(' ำ', 'ำ').replace('ำ', 'ำ')
    s = re.sub(r'\s+', ' ', s).strip()
    return s
NUM = r'(\d{2,3}\.\d{2})'
def load(n):
    t = open(D + n + '.p.txt', encoding='utf-8', errors='ignore').read()
    return [l.rstrip() for l in t.splitlines()]
def unit_rows(lines):
    out = []
    for l in lines:
        m = re.match(r'^\s*(\D.*?)\s+' + NUM + r'\s+' + NUM + r'\s+' + NUM + r'\s+' + NUM + r'\s*$', l)
        if m:
            name = m.group(1).strip()
            if re.search(r'ครั้งที่|เพิ่มขึ้น|ภาพรวม|รวม', name): continue
            out.append([name] + [float(m.group(i)) for i in range(2, 6)])
    return out
if __name__ == '__main__':
    for n in ['67_3', '681', '682', '691', '692']:
        rs = unit_rows(load(n))
        print(n, len(rs), rs[:3], rs[-2:])
