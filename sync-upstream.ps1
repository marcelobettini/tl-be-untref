param(
    [switch]$Rebase,
    [switch]$DryRun,
    [switch]$NoReturn
)

$targetLocalBranch = "ejercicios"
$upstreamSourceBranch = "main"

function ExitIfDirty {
    $status = git status --porcelain
    if ($status) {
        Write-Host "ERROR: Working tree is dirty. Commit or stash changes before syncing." -ForegroundColor Red
        exit 1
    }
}

Write-Host "==> Syncing fork with upstream..."

# Verificar si existe el remoto upstream
$remotes = git remote
if ($remotes -notcontains "upstream") {
    Write-Host "ERROR: El remoto 'upstream' no está configurado." -ForegroundColor Red
    Write-Host "Usa: git remote add upstream <URL_DEL_REPO_ORIGINAL>" -ForegroundColor Yellow
    exit 1
}

ExitIfDirty

$originalBranch = git rev-parse --abbrev-ref HEAD
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Rama actual: $originalBranch"

git checkout $targetLocalBranch
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Fetching upstream..."
git fetch upstream
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if ($Rebase) {
    Write-Host "Rebasing $targetLocalBranch on upstream/$upstreamSourceBranch..."
    if ($DryRun) {
        git rebase --dry-run upstream/$upstreamSourceBranch
    }
    else {
        git rebase upstream/$upstreamSourceBranch
    }
}
else {
    Write-Host "Merging upstream/$upstreamSourceBranch into $targetLocalBranch..."
    if ($DryRun) {
        git merge --no-commit --no-ff upstream/$upstreamSourceBranch
    }
    else {
        git merge upstream/$upstreamSourceBranch
    }
}
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (-not $DryRun -and -not $NoReturn -and $originalBranch -ne $targetLocalBranch) {
    Write-Host "Volviendo a la rama original '$originalBranch'..."
    git checkout $originalBranch
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "Sync complete."
