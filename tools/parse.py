import re,json,sys
ALIAS={'pan':'pane','pancetta':'bacon','vela':'candela','tavola da snowboard':'snowboard','electricista':'elettricista',
'lama (spada)':'lama','carbone verdura':'carbone vegetale','da galassia':'galassia','do chisciotte':'don chisciotte',
'gaiser':'geyser','moto daneve':'moto da neve','alghe':'alghe','camino (acceso) ':'camino (acceso)','pozzangera':'pozzanghera',
'carta de regalo':'carta regalo','isonda':'isola','nuvonda':'nuvola','lucertonda':'lucertola'}
def n(s):
    s=re.sub(r'\s+',' ',s.strip().rstrip('.')).strip().lower()
    return ALIAS.get(s,s)
rec={}  # result -> set of (a,b)
base=[]
src=open('combinations.txt',encoding='utf8').read().splitlines()
for l in src:
    if not l.strip(): continue
    name,rest=l.split(':',1)
    name=n(name)
    if 'elementi fondamentali' in rest or 'elementi fondamentali' in rest:
        base.append(name);continue
    rest=rest.replace('maialeo maiale','maiale + ceramica') if False else rest
    rest=rest.replace('denaro + maialeo maiale + ceramica','denaro + maiale o maiale + ceramica')
    for part in re.split(r',\s*|\s+o\s+',rest.strip().rstrip('.')):
        part=part.strip()
        if not part: continue
        m=re.match(r'2x\s*(.+)',part)
        if m: a=b=n(m.group(1))
        else:
            a,b=[n(x) for x in part.split('+')]
        rec.setdefault(name,set()).add(tuple(sorted((a,b))))
json.dump({'base':base,'rec':{k:sorted(v) for k,v in rec.items()}},open(sys.argv[1],'w'),ensure_ascii=False)
allk=set(rec)|set(base)
und=sorted({x for v in rec.values() for p in v for x in p}-allk)
print('base',base);print('undefined',und)
# reachability
have=set(base)|{'freddo','luce'}
ch=True
while ch:
    ch=False
    for k,v in rec.items():
        if k not in have and any(a in have and b in have for a,b in v): have.add(k);ch=True
print('unreachable',sorted(allk-have))
print(len(allk))
