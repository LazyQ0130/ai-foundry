"""Copy only P1 deliverable source into a new validation directory. Never clean."""
from pathlib import Path
import sys, shutil, json

repo = Path(__file__).resolve().parents[2]
target = repo / '.runtime' / sys.argv[1]
if target.exists():
    raise SystemExit(f'Refusing to reuse {target}')
files = ['.nvmrc', '.npmrc', '.gitignore', 'README.md', 'package.json',
         'package-lock.json', 'tsconfig.json', 'extension/wxt.config.ts',
         'extension/entrypoints/background.ts', 'extension/entrypoints/sidepanel/index.html',
         'extension/entrypoints/sidepanel/main.tsx', 'extension/entrypoints/sidepanel/App.tsx',
         'extension/entrypoints/sidepanel/style.css']
roots = {'starter': repo / 'starter/ai-browser-copilot/p1',
         'reference': repo / 'course-content/internal/ai-browser-copilot/p1/reference'}
for role, source in roots.items():
    for name in files:
        src = source / name
        if src.is_symlink() or not src.is_file():
            raise SystemExit(f'Invalid source {src}')
        dst = target / role / name
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
print(json.dumps({'validation': str(target), 'source_files_per_project': len(files)}))
