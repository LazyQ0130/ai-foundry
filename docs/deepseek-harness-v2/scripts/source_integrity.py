"""Verify archive bytes against the requested Git tree without checking out blobs."""
from pathlib import Path
import hashlib,json,subprocess,sys
COMMIT='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
src=Path(sys.argv[1]); gitdir=Path(sys.argv[2]); archive=Path(sys.argv[3])
raw=subprocess.check_output(['git','-C',str(gitdir),'ls-tree','-rz','--full-tree',COMMIT])
verified=0;bad=[];skipped=[];normalized=[]
for record in raw.split(b'\0'):
    if not record:continue
    meta,path=record.split(b'\t',1); mode,kind,oid=meta.decode().split(); name=path.decode('utf-8')
    if kind!='blob':skipped.append(name);continue
    p=src/name
    if not p.is_file():bad.append(name);continue
    data=p.read_bytes();actual=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
    if actual!=oid:
        lf=data.replace(b'\r\n',b'\n')
        if name.endswith('.cmd') and '*.cmd text eol=crlf' in (src/'.gitattributes').read_text('utf-8') and hashlib.sha1(b'blob '+str(len(lf)).encode()+b'\0'+lf).hexdigest()==oid:
            normalized.append({'path':name,'transform':'declared CRLF worktree to canonical LF','gitBlob':oid})
        else:bad.append(name)
    else:verified+=1
result={'commit':COMMIT,'method':'Git blob SHA-1 over archive bytes matched against git ls-tree',
 'archiveSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'matchedBlobs':verified,
 'declaredLineEndingMatches':normalized,'mismatches':bad,'nonBlobEntries':skipped,'status':'PASS' if not bad and not skipped else 'INCOMPLETE'}
out=Path(__file__).resolve().parents[1]/'evidence/source-integrity.json'
out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,ensure_ascii=False))
sys.exit(bool(bad or skipped))
