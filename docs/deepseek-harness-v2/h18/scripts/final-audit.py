"""仅在 H18/evidence 写最终报告；核对保护文件，不删除任何文件。"""
from pathlib import Path
import datetime
import hashlib
import json
import re
import subprocess

R = Path(__file__).resolve().parents[1]
P = R.parents[2]
E = R / 'evidence'
ALLOW = ('docs/deepseek-harness-v2/h18/', 'course-content/internal/deepseek-harness/h18/')
COMMIT = 'f3803c96974ad4a94195fb97e5c637e9c2a3afe3'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def load(name):
    return json.loads((E / name).read_text(encoding='utf-8'))

def git(*args):
    return subprocess.check_output(['git', *args], cwd=P).decode('utf-8')

before = load('workspace-before.json')
subprocess.check_call(['python','-X','utf8',str(R/'scripts/inventory-temporary.py')],cwd=P)
known = {f['path'] for f in before['files']}
changed = [f['path'] for f in before['files']
           if not (P / f['path']).is_file() or sha(P / f['path']) != f['sha256']]
assert not changed, changed
allpaths = set(git('ls-files', '-z').split('\0')) | set(git('ls-files', '--others', '--exclude-standard', '-z').split('\0'))
allpaths.update(p.relative_to(P).as_posix() for p in (P / 'output').rglob('*') if p.is_file())
unexpected = sorted(p for p in allpaths if p and p not in known and not p.startswith(ALLOW))
assert not unexpected, unexpected
staged = [p for p in git('diff', '--cached', '--name-only', '-z').split('\0') if p]
assert all(p.startswith(ALLOW) for p in staged), staged
status = git('status', '--short')
def outside(value):
    return [line for line in value.splitlines() if not line[3:].replace('\\', '/').startswith(ALLOW)]
assert outside(status) == outside(before['status']), (outside(status), outside(before['status']))

body = P / 'course-content/internal/deepseek-harness/h18/lesson.md'
content, visual, labs, manual = (load(n) for n in ('content-check.json', 'visual-qa.json', 'lab-results.json', 'manual-review.json'))
assert content['status'] == 'PASS'
assert content['lessonSha256'] == visual['lessonSha256'] == sha(body)
assert visual['rendererSha256'] == sha(P / 'src/components/LessonMarkdown.tsx')
assert content['previewExactSsr'] and content['noNewDeprecatedReads'] and content['uniqueCheckKeys']
assert len(content['programs']) == 13 and len(content['astMembers']) == 24
assert content['metrics']['figures'] == 4 and content['metrics']['thoughts'] >= 10
assert content['metrics']['sequenceOrCodeThoughts'] >= 4
assert len(visual['figures']) == 4
for f in visual['figures']:
    item = next(i for i in load('figures.json') if i['id'] == f['id'])
    assert f['sourceSha256'] == sha(R / item['source']) and f['imageSha256'] == sha(R / item['image'])
    assert f['status'] == 'PASS' and f['font'] and f['out'] == [] and f['overlap'] == []
assert [v['width'] for v in visual['viewports']] == [1440, 390, 320]
for v in visual['viewports']:
    assert v['status'] == 'PASS' and not v['errors'] and not v['failed']
for f in manual['samples']:
    assert sha(R / f['path']) == f['sha256'], f['path']
assert manual['status'] == 'PASS_AUTHOR_VISUAL_REVIEW' and len(manual['samples']) >= 12

assert labs['status'] == 'PASS' and labs['tests'] == 24 and labs['levels'] == {'C': 22, 'D': 2}
assert labs['negativeExpectedFailure'] and labs['commit'] == COMMIT
for f in labs['programs']:
    assert sha(body.parent / 'lab' / f['name']) == f['sha256'], f['name']
tap = (E / 'lab-tests.txt').read_text(encoding='utf-8')
assert '# tests 24' in tap and '# fail 0' in tap
assert len(re.findall(r'^# Subtest: C', tap, re.M)) == 22
assert len(re.findall(r'^# Subtest: D', tap, re.M)) == 2
reg = (E / 'renderer-regression.txt').read_text(encoding='utf-8')
assert '# tests 12' in reg and '# fail 0' in reg
checks = load('checks.json')
assert checks['status'] == 'PASS' and len(checks['checks']) == 11
assert all(c['exit'] == 0 and c['error'] is None for c in checks['checks'])
deps = load('dependencies.json')
assert deps['status'] == 'PASS' and len(deps['packages']) == 46

lock = load('source-lock.json')
assert lock['commit'] == COMMIT and len(lock['files']) == 9616
source = Path(lock['sourceCache'])
for f in lock['files']:
    assert sha(source / f['path']) == f['sha256'], f['path']
assert len(load('source-assertions.json')) == 50
for c in load('source-assertions.json'):
    path = source / c['path']
    assert c['commit'] == COMMIT and sha(path) == c['sourceSha256'], c['id']
    assert 1 <= c['start'] <= c['end'] <= len(path.read_text(encoding='utf-8').splitlines()), c['id']
    assert c['symbol'] and c['claim'] and c['level'] and c['behaviorEvidence']

for name in ['README.md', 'reading-preview.html', 'source-checklist.md', 'quality-review.md',
             'test-evidence.md', 'renderer-regression.md', 'knowledge-bridge.md', 'h19-handoff.md', 'jsonl-platform-coverage.md',
             'review-log.md', 'acceptance.md', 'NOTICE.md', 'SOURCE-LICENSE.txt', 'CORDIS-LICENSE.txt', 'ZOD-LICENSE.txt']:
    assert (R / name).is_file(), name
for name in ['README.md', 'bootstrap.mjs', 'support.ts', 'handle.ts', 'disk.ts',
             'recovery.ts', 'fork.ts', 'agent.ts', 'ownership.ts', 'buffer.ts', 'format.ts', 'process.ts', 'worker.ts', 'demo.ts', 'persistence.test.ts', 'negative-answer.ts']:
    assert (body.parent / 'lab' / name).is_file(), name

# 本地交付导航检查；HTTP链接的网络可达性不在此处冒称已验证。
future = {'evidence/validation.json', 'evidence/artifact-inventory.json', 'evidence/workspace-after.json'}
for p in list(R.rglob('*.md')) + [body.parent / 'lab/README.md']:
    for target in re.findall(r'\]\(([^)]+)\)', p.read_text(encoding='utf-8')):
        if target.startswith(('http:', 'https:', '#')) or target in future:
            continue
        assert (p.parent / target.split('#')[0]).exists(), (p.name, target)

data = {
    'status': 'PASS', 'decision': 'CONDITIONAL GO', 'base': before['base'],
    'headAtAudit': git('rev-parse', 'HEAD').strip(),
    'protectedFiles': len(before['files']),
    'protectedOutputFiles': sum(f['path'].startswith('output/') for f in before['files']),
    'changedProtectedFiles': changed, 'unexpectedPaths': unexpected, 'stagedFiles': staged,
    'scope': list(ALLOW),
    'checks': {'C': 22, 'D': 2, 'renderer': 12, 'sourceAssertions': 50,
               'sourceFiles': len(lock['files']), 'dependencies': 46,
               'widths': [1440, 390, 320], 'manualSamples': len(manual['samples']),
               'artifactHashesCurrent': True},
    'unverified': ['power loss / POSIX / NFS / cross-logon / write migration Worker', 'complete Harness E integration',
                   'real learner trial', 'actual learning time', 'independent external review'],
    'completed': datetime.datetime.now(datetime.timezone.utc).isoformat(),
}
(E / 'validation.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(E / 'workspace-after.json').write_text(json.dumps({
    'status': status, 'head': data['headAtAudit'], 'protectedFilesUnchanged': len(before['files'])
}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
exclude = {'evidence/artifact-inventory.json', 'evidence/validation.json', 'evidence/workspace-after.json'}
files = [p for p in R.rglob('*') if p.is_file() and p.relative_to(R).as_posix() not in exclude]
files += [p for p in body.parent.rglob('*') if p.is_file()]
items = [{'path': p.relative_to(P).as_posix(), 'bytes': p.stat().st_size, 'sha256': sha(p)} for p in sorted(files)]
(E / 'artifact-inventory.json').write_text(json.dumps({
    'excludesSelfReferentialReports': sorted(exclude), 'files': items,
    'count': len(items), 'bytes': sum(i['bytes'] for i in items)
}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({k: data[k] for k in ['status', 'decision', 'protectedFiles', 'protectedOutputFiles', 'unexpectedPaths']}, ensure_ascii=False))
