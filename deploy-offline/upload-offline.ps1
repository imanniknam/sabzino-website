param(
  [Parameter(Mandatory = $true)]
  [string]$Server,
  [string]$User = "root"
)

$ErrorActionPreference = "Stop"
$packageDir = Split-Path -Parent $PSScriptRoot
$partsDir = Join-Path $packageDir "sabzino-offline-parts"

if (-not (Test-Path $partsDir)) {
  throw "The sabzino-offline-parts folder was not found next to the project."
}

ssh "$User@$Server" "mkdir -p /opt/sabzino-upload-parts"

$parts = Get-ChildItem $partsDir -File | Sort-Object Name
$remoteListing = ssh "$User@$Server" "find /opt/sabzino-upload-parts -maxdepth 1 -type f -printf '%f %s\n'"
$remoteSizes = @{}
foreach ($line in $remoteListing) {
  if ($line -match '^(.+)\s+(\d+)$') {
    $remoteSizes[$Matches[1]] = [int64]$Matches[2]
  }
}

$missing = @($parts | Where-Object {
  (-not $remoteSizes.ContainsKey($_.Name)) -or ($remoteSizes[$_.Name] -ne $_.Length)
})

if ($missing.Count -gt 0) {
  Write-Host "Uploading $($missing.Count) remaining part(s)..."
  $paths = @($missing | ForEach-Object FullName)
  & scp @paths "${User}@${Server}:/opt/sabzino-upload-parts/"
  if ($LASTEXITCODE -ne 0) {
    throw "Upload was interrupted. Run this script again; completed parts will be skipped."
  }
} else {
  Write-Host "All package parts are already uploaded."
}

ssh -t "$User@$Server" "cat /opt/sabzino-upload-parts/sabzino-offline.tar.gz.part-* > /opt/sabzino-offline.tar.gz && echo '66D395061E4BE76EF9C5F9AB06DDF49BA25416DE3DCA1C63522626C541188CC8  /opt/sabzino-offline.tar.gz' | sha256sum -c - && mkdir -p /opt/sabzino-installer && tar -xzf /opt/sabzino-offline.tar.gz -C /opt/sabzino-installer && cd /opt/sabzino-installer && bash install-offline.sh"
