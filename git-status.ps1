Write-Host "==> Estado Git del repositorio"

$currentBranch = git rev-parse --abbrev-ref HEAD 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "No es un repositorio Git válido o no se pudo leer la rama actual." -ForegroundColor Red
    exit 1
}

Write-Host "Rama actual: $currentBranch"

$trackingBranch = git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Rama upstream: $trackingBranch"
}
else {
    Write-Host "Rama upstream: no configurada" -ForegroundColor Yellow
}

Write-Host "Remotos configurados:"
git remote -v

Write-Host "`nResumen de estado:" 
git status --short --branch
