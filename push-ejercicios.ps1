param(
    [string]$Branch = "ejercicios",
    [string]$Message = "Actualización de ejercicios"
)

$currentBranch = git rev-parse --abbrev-ref HEAD
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if ($currentBranch -ne $Branch) {
    Write-Host "ERROR: El nombre de rama especificado '$Branch' no coincide con la rama actual '$currentBranch'." -ForegroundColor Red
    Write-Host "Usa el script desde la rama que quieres pushear, o no pases parámetro para usar la rama actual." -ForegroundColor Yellow
    exit 1
}

Write-Host "==> Preparando commit en la rama '$Branch'..."

git add .
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

git commit -m "$Message"
if ($LASTEXITCODE -ne 0) {
    if ($LASTEXITCODE -eq 1) {
        Write-Host "No hay cambios para commitear." -ForegroundColor Yellow
    }
    else {
        exit $LASTEXITCODE
    }
}

$hasUpstream = git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Enviando cambios de '$Branch' a origin..."
    git push
}
else {
    Write-Host "Configurando seguimiento (upstream) y pusheando '$Branch' a origin..."
    git push -u origin $Branch
}

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Push completo."
