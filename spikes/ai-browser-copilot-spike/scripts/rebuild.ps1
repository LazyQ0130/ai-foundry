$ErrorActionPreference = 'Stop'
$spikeRoot = Split-Path -Parent $PSScriptRoot
$runName = 'rebuild-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
$rebuildRoot = Join-Path $spikeRoot ('.runtime/' + $runName)
if (Test-Path -LiteralPath $rebuildRoot) { throw 'Fresh directory required; no files will be deleted.' }
New-Item -ItemType Directory -Path $rebuildRoot | Out-Null
# Copy an explicit source allowlist into a directory with no dependencies/build outputs.
foreach ($entry in @('package.json', 'package-lock.json', 'tsconfig.json', 'vitest.config.ts', 'extension', 'shared', 'api', 'tests', 'scripts')) {
  $source = Join-Path $spikeRoot $entry
  if ((Get-Item -LiteralPath $source).PSIsContainer) {
    $files = Get-ChildItem -LiteralPath $source -File -Recurse | Where-Object { $_.FullName -notmatch '[\\/]\.wxt[\\/]|[\\/]node_modules[\\/]|[\\/]\.env$' }
    foreach ($file in $files) {
      $relative = $file.FullName.Substring($spikeRoot.Length + 1)
      $destination = Join-Path $rebuildRoot $relative
      New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
      Copy-Item -LiteralPath $file.FullName -Destination $destination
    }
  } else { Copy-Item -LiteralPath $source -Destination (Join-Path $rebuildRoot $entry) }
}
$artifacts = if ($env:EVIDENCE_DIR) { Join-Path $spikeRoot $env:EVIDENCE_DIR } else { Join-Path $spikeRoot ('docs/artifacts/' + $runName) }
New-Item -ItemType Directory -Path $artifacts -Force | Out-Null
Push-Location $rebuildRoot
try {
  "Fresh directory: $rebuildRoot`nNode: $(node --version)`nNpm: $(npm --version)" | Set-Content -Encoding utf8 (Join-Path $artifacts 'rebuild-environment.txt')
  foreach ($script in @('ci', 'typecheck', 'test', 'build', 'zip')) {
    if ($script -eq 'ci') { & npm.cmd ci 2>&1 | Tee-Object -FilePath (Join-Path $artifacts 'rebuild-ci.txt') }
    else { & npm.cmd run $script 2>&1 | Tee-Object -FilePath (Join-Path $artifacts ('rebuild-' + $script + '.txt')) }
    if ($LASTEXITCODE -ne 0) { throw "Failed: $script (exit $LASTEXITCODE)" }
  }
  $extensionMeta = Get-Content -LiteralPath (Join-Path $rebuildRoot 'extension/package.json') -Raw | ConvertFrom-Json
  $zipName = 'ai-browser-copilot-phase0-' + $extensionMeta.version + '-chrome.zip'
  Copy-Item -LiteralPath (Join-Path $rebuildRoot ('.output/' + $zipName)) -Destination (Join-Path $artifacts $zipName)
  $rebuildRoot | Set-Content -Encoding utf8 (Join-Path $artifacts 'rebuild-path.txt')
} finally { Pop-Location }
