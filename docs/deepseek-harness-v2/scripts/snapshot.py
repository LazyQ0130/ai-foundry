"""Read-only scope snapshot. Never stages, restores or removes existing files."""
from pathlib import Path
import hashlib, json, subprocess, sys

ROOT = Path(__file__).resolve().parents[3]
DEST = Path(__file__).resolve().parents[1] / 'evidence'
DEST.mkdir(exist_ok=True)
def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)
def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

if sys.argv[1:] == ['before']:
    tracked = git('ls-files', '-z').decode('utf-8').split('\0')
    paths = [p for p in tracked if p and not p.startswith('docs/deepseek-harness-v2/')]
    paths += [p.relative_to(ROOT).as_posix() for p in (ROOT/'output').rglob('*') if p.is_file()]
    paths += ['.env'] if (ROOT/'.env').exists() else []
    data = {'head':git('rev-parse','HEAD').decode().strip(),
            'status':git('status','--porcelain=v1').decode('utf-8'),
            'sha256':{p:digest(ROOT/p) for p in sorted(set(paths)) if (ROOT/p).is_file()}}
    (DEST/'workspace-before.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    legacy = [p for p in paths if any(x in p for x in ['ai-browser-copilot','browser-copilot'])]
    (DEST/'legacy-cleanup-manifest.json').write_text(json.dumps({'status':'MANUAL_DELETION_REQUIRED', 'reason':'User AGENTS.md prohibits bulk deletion', 'trackedFiles':legacy},ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'protected':len(data['sha256']), 'legacyFiles':len(legacy), 'head':data['head']}))
else:
    before = json.loads((DEST/'workspace-before.json').read_text('utf-8'))
    retirement = ROOT/'docs/legacy-retirement-20261028/manifest.json'
    moved = json.loads(retirement.read_text('utf-8'))['files'] if retirement.exists() else {}
    changed = [p for p,h in before['sha256'].items() if not (Path(moved[p]['destination']) if p in moved else ROOT/p).is_file() or digest(Path(moved[p]['destination']) if p in moved else ROOT/p)!=h]
    result = {'protectedFiles':len(before['sha256']), 'authorizedMovedFiles':len(moved), 'changedOrMissing':changed,
              'status':'PASS' if not changed else 'FAIL'}
    (DEST/'workspace-after.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False))
    sys.exit(bool(changed))
