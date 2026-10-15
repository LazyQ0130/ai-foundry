"""One-time explicit P1 source copy; refuses to overwrite any P2 project."""
from pathlib import Path
import json, shutil
repo = Path(__file__).resolve().parents[3]
source = repo / 'course-content/internal/ai-browser-copilot/p1/reference'
files = ['.nvmrc','.npmrc','.gitignore','README.md','package.json','package-lock.json','tsconfig.json',
 'extension/wxt.config.ts','extension/entrypoints/background.ts','extension/entrypoints/sidepanel/index.html',
 'extension/entrypoints/sidepanel/main.tsx','extension/entrypoints/sidepanel/App.tsx','extension/entrypoints/sidepanel/style.css']
spike_lock = json.loads((repo/'spikes/ai-browser-copilot-spike/package-lock.json').read_text('utf-8'))
for relative in ['course-content/internal/ai-browser-copilot/p2/reference','starter/ai-browser-copilot/p2']:
    target = repo / relative
    if target.exists(): raise SystemExit(f'Refusing overwrite: {target}')
    for name in files:
        text = (source/name).read_text('utf-8')
        dest = target/name
        dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_text(text,encoding='utf-8',newline='\n')
    pkg = json.loads((target/'package.json').read_text())
    pkg.update(name='aifoundry-ai-web-reader-p2',version='0.2.0')
    pkg['engines']['node']='>=22.12.0'
    pkg['dependencies']['zod']='4.6.5'
    pkg['scripts']['fixtures']='node scripts/fixtures.mjs'
    (target/'package.json').write_text(json.dumps(pkg,indent=2)+'\n',encoding='utf-8')
    lock = json.loads((target/'package-lock.json').read_text())
    lock.update(name=pkg['name'],version=pkg['version'])
    lock['packages'][''].update({k:pkg[k] for k in ['name','version','engines','dependencies','devDependencies']})
    lock['packages']['node_modules/zod']=spike_lock['packages']['node_modules/zod']
    (target/'package-lock.json').write_text(json.dumps(lock,indent=2)+'\n',encoding='utf-8')
    config=(target/'extension/wxt.config.ts').read_text('utf-8').replace('P1','P2').replace("version: '0.1.0'","version: '0.2.0'").replace("permissions: ['sidePanel']","permissions: ['sidePanel', 'activeTab', 'scripting', 'storage']")
    (target/'extension/wxt.config.ts').write_text(config,encoding='utf-8')
print('P1 source whitelist copied; exact Zod lock entry inherited from Phase 0.')
