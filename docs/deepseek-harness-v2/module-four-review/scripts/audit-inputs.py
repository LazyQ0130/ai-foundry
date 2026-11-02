from pathlib import Path
import re,json,hashlib,subprocess,sys,xml.etree.ElementTree as ET
sys.stdout.reconfigure(encoding='utf-8')
R=Path(__file__).resolve().parents[1];P=R.parents[2];E=R/'evidence';V=P/'docs/deepseek-harness-v2'
sha=lambda b:hashlib.sha256(b).hexdigest()
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
write=lambda n,v:(E/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
lock=read(V/'h16/evidence/source-lock.json');S=Path(lock['sourceCache']);G=Path(lock['gitCache'])
tree=subprocess.check_output(['git','-C',str(G),'ls-tree','-r',lock['commit']],text=True)
blobs={l.split('\t',1)[1]:l.split()[2] for l in tree.splitlines() if '\t'in l}
for f in lock['files']:
    d=(S/f['path']).read_bytes();assert sha(d)==f['sha256'];assert hashlib.sha1(b'blob '+str(len(d)).encode()+b'\0'+d).hexdigest()==blobs[f['path']]
assertions=[];refs=[];figs=[];hist=[];inputs=[];metrics=[]
paths=[V/'A-blueprint-v2.md',V/'E-production-standard.md']
for mod in ['module-one-review','module-two-review','module-three-review']:
    paths.extend(p for p in (V/mod).glob('*.md'))
for h in ['h13','h14','h15','h16']:
    D=V/h;L=P/f'course-content/internal/deepseek-harness/{h}'
    paths.extend(p for p in D.rglob('*') if p.is_file() and p.suffix in ['.md','.json','.txt','.ts','.tsx','.py','.mjs','.svg'])
    paths.extend(p for p in L.rglob('*') if p.is_file())
    for a in read(D/'evidence/source-assertions.json'):
        data=(S/a['path']).read_bytes();lines=data.decode('utf-8').splitlines();assert 1<=a['start']<=a['end']<=len(lines),a
        if a.get('sourceSha256'):assert sha(data)==a['sourceSha256'],a
        fragment='\n'.join(lines[a['start']-1:a['end']])
        for anchor in a.get('anchors',[]):assert anchor in fragment,(h,a['id'],anchor)
        assertions.append({'lesson':h,**a,'freshCheck':'PASS byte/range/anchors only; semantic review separate'})
    s=(L/'lesson.md').read_text(encoding='utf-8')
    for m in re.finditer(r'/blob/([0-9a-f]{40})/([^\s)#]+)#L(\d+)-L(\d+)',s):
        commit,path,a,b=m.groups();assert commit==lock['commit'];lines=(S/path).read_text(encoding='utf-8').splitlines();assert 1<=int(a)<=int(b)<=len(lines)
        refs.append({'lesson':h,'path':path,'start':int(a),'end':int(b)})
    for f in read(D/'evidence/figures.json'):
        xml=ET.fromstring((D/f['source']).read_text(encoding='utf-8'));texts=[''.join(n.itertext()) for n in xml.iter() if n.tag.endswith('text')]
        figs.append({'lesson':h,**f,'sourceSha256':sha((D/f['source']).read_bytes()),'imageSha256':sha((D/f['image']).read_bytes()),'texts':texts})
    for p in (D/'evidence').glob('run-*.json'):
        r=read(p);stdout=r.get('stdout','');hist.append({'lesson':h,'path':p.relative_to(P).as_posix(),'sha256':sha(p.read_bytes()),'args':r.get('args'),'exit':r.get('exit'),'tests':re.search(r'# tests (\d+)',stdout).group(1) if re.search(r'# tests (\d+)',stdout) else None,'fail':re.search(r'# fail (\d+)',stdout).group(1) if re.search(r'# fail (\d+)',stdout) else None,'scratch':r.get('scratch'),'programs':r.get('programs',[])})
    c=read(D/'evidence/content-check.json');metrics.append({'lesson':h,'originalContentCheck':c})
for p in sorted(set(paths)):
    inputs.append({'path':p.relative_to(P).as_posix(),'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size})
write('input-inventory.json',{'meaning':'Identity and machine-ingestion inventory; not by itself proof of semantic reading or image inspection','inputs':inputs})
write('source-review.json',{'commit':lock['commit'],'status':'PASS','filesChecked':len(lock['files']),'assertions':assertions,'references':refs,'meaning':'Fresh Git blob/SHA256 plus 218 fragment checks; semantic judgments in source-review.md/unified-tool-model.md'})
write('figures-index.json',figs);write('historical-runs-index.json',hist);write('workload-input.json',metrics)
lines=['# 源码断言逐项索引','','机器检查仅证明固定字节/范围/片段；语义裁决见统一模型、安全审查与跨课一致性。','', '| 课/编号 | 原断言 | 固定源码 | 验证/边界 |','|---|---|---|---|']
for a in assertions:lines.append(f"| {a['lesson']}/{a['id']} | {a.get('fact',a.get('claim',''))} | `{a['path']}:{a['start']}–{a['end']}` | {a.get('level','STATIC')}；{a.get('evidence','')} |")
(R/'source-assertion-index.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(json.dumps({'sourceFiles':len(lock['files']),'assertions':len(assertions),'refs':len(refs),'figures':len(figs),'historicalRuns':len(hist),'inputFiles':len(inputs)}))
