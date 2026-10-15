"""Inspect the actual ZIP. Heuristic secret scan is not a proof of absence."""
import hashlib
import json
import pathlib
import re
import sys
import zipfile

root = pathlib.Path(__file__).resolve().parents[1]
evidence_dir = root / (sys.argv[1] if len(sys.argv) > 1 else 'docs/artifacts/round2/rebuild')
artifacts = list(evidence_dir.glob('ai-browser-copilot-phase0-*-chrome.zip'))
if len(artifacts) != 1:
    raise ValueError('Expected one versioned extension ZIP in the specified evidence directory')
artifact = artifacts[0]
with zipfile.ZipFile(artifact) as bundle:
    names = bundle.namelist()
    manifest = json.loads(bundle.read('manifest.json'))
    assert manifest['manifest_version'] == 3
    assert manifest['minimum_chrome_version'] == '116'
    assert set(manifest['permissions']) == {'activeTab', 'scripting', 'sidePanel', 'contextMenus', 'storage'}
    assert not manifest.get('host_permissions')
    assert not manifest.get('optional_host_permissions')
    assert not manifest.get('content_scripts')
    assert 'default_popup' not in manifest['action']
    assert manifest['side_panel']['default_path'] in names
    assert manifest['background']['service_worker'] in names
    assert all(not n.startswith(('api/', 'tests/')) and '.env' not in n and not n.endswith('.map') for n in names)
    flags = []
    for name in names:
        if name.endswith(('.js', '.json', '.html', '.css')):
            data = bundle.read(name).decode('utf-8')
            for pattern in [r'sk-[A-Za-z0-9_-]{20,}', r'LLM_API_KEY', r'BEGIN (?:RSA |EC )?PRIVATE KEY', r'<all_urls>', r'https://\*/\*']:
                if re.search(pattern, data):
                    flags.append({'file': name, 'pattern': pattern})
    assert not flags, flags
    result = {'status': 'PASS', 'sha256': hashlib.sha256(artifact.read_bytes()).hexdigest(), 'bytes': artifact.stat().st_size, 'files': names, 'manifest': manifest, 'heuristic_secret_scan_flags': flags, 'limitation': 'Static package audit only; browser permission behavior and model security require separate runtime evidence.'}
(evidence_dir / 'package-audit.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(result, ensure_ascii=False, indent=2))
