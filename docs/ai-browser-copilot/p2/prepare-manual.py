"""Prepare exact delivered production bits in a stable fresh location; do not launch Chrome."""
from pathlib import Path
from zipfile import ZipFile
import json, hashlib
repo=Path(__file__).resolve().parents[3]
target=repo/'.runtime/p2-native-20261014-final/extension'
if target.exists(): raise SystemExit('Refusing to overwrite existing native acceptance directory')
archive=repo/'course-content/internal/ai-browser-copilot/p2/deliverables/ai-web-reader-p2-reference-chrome.zip'
with ZipFile(archive) as z:
    assert all(not n.startswith('/') and '..' not in Path(n).parts for n in z.namelist())
    z.extractall(target)
    hashes={n:hashlib.sha256((target/n).read_bytes()).hexdigest() for n in z.namelist()}
report={'status':'BLOCKED','reason':'Prepared; no native product toolbar grant test performed',
 'extension_directory':str(target),'profile_directory':str(target.parent/'profile'),
 'archive_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'file_sha256':hashes,
 'pending':['P2-22','P2-23','P2-24']}
(repo/'docs/ai-browser-copilot/p2/artifacts/manual-target.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
