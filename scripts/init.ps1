<#
.SYNOPSIS
    Interactive project initialiser for the fullstack template (Windows / PowerShell).

.DESCRIPTION
    Replaces all template placeholders with your project's values, removes unused
    app directories, and optionally re-initialises git with a clean history.

    Equivalent to scripts/init.sh for Unix systems.
    Requires PowerShell 5.1+ (Windows) or PowerShell 7+ (cross-platform).

.PARAMETER Config
    Read values from template.config.json instead of prompting interactively.

.PARAMETER DryRun
    Print what would be replaced without touching any files.

.EXAMPLE
    .\scripts\init.ps1
    .\scripts\init.ps1 -Config
    .\scripts\init.ps1 -DryRun

.NOTES
    Run from the repository root:
        Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
        .\scripts\init.ps1
#>

[CmdletBinding()]
param(
    [switch]$Config,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Resolve root directory ────────────────────────────────────────────────────
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root      = Split-Path -Parent $ScriptDir
Push-Location $Root

# ── Colour helpers ────────────────────────────────────────────────────────────
function Write-Ok($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Info($msg) { Write-Host "  -->  $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "  [!]  $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "  [X]  $msg" -ForegroundColor Red }
function Write-Hr()       { Write-Host ("─" * 60) -ForegroundColor DarkGray }
function Ask($prompt, $default) {
    $answer = Read-Host "  ? $prompt [$default]"
    if ([string]::IsNullOrWhiteSpace($answer)) { return $default }
    return $answer.Trim()
}

# ── Read template.config.json helper ─────────────────────────────────────────
function Read-Config([string]$keyPath, [string]$default = "") {
    $configFile = Join-Path $Root "template.config.json"
    if (-not (Test-Path $configFile)) { return $default }
    try {
        $cfg = Get-Content $configFile -Raw | ConvertFrom-Json
        $val = $cfg
        foreach ($key in $keyPath.Split(".")) {
            if ($null -eq $val) { return $default }
            $val = $val.$key
        }
        if ($null -eq $val) { return $default }
        return [string]$val
    } catch {
        return $default
    }
}

# ── Banner ────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Hr
Write-Host "  Fullstack Template — Project Initialiser (PowerShell)" -ForegroundColor White
Write-Hr
Write-Host ""

# ── Collect values ────────────────────────────────────────────────────────────
if ($Config) {
    Write-Info "Reading values from template.config.json..."
    $ProjectName    = Read-Config "project.name"        "my-app"
    $DisplayName    = Read-Config "project.displayName" "My App"
    $Description    = Read-Config "project.description" "A production-grade TypeScript React fullstack application"
    $Author         = Read-Config "project.author"      ""
    $Scope          = Read-Config "packages.scope"      "myapp"
    $WebPort        = Read-Config "ports.web"           "9000"
    $SpaPort        = Read-Config "ports.spa"           "9001"
    $IncludeWeb     = Read-Config "features.nextjs"     "true"
    $IncludeSpa     = Read-Config "features.vite"       "true"
    $IncludeDocker  = Read-Config "features.docker"     "true"
    $IncludePlay    = Read-Config "features.playwright" "true"
} else {
    $ProjectName = Ask "Project name (kebab-case, e.g. my-app)"  "my-app"
    # Sanitise to kebab-case
    $ProjectName = ($ProjectName.ToLower() -replace '[^a-z0-9-]', '-').Trim('-')

    $DisplayName = Ask "Display name (e.g. My App)"              "My App"
    $Description = Ask "Short description"                        "A production-grade TypeScript React fullstack application"
    $Author      = Ask "Author name"                              ""
    $Scope       = Ask "Package scope (e.g. myapp → @myapp/ui)"  $ProjectName
    $Scope       = ($Scope.ToLower() -replace '[^a-z0-9-]', '')

    $WebPort     = Ask "Port for Next.js web app"  "9000"
    $SpaPort     = Ask "Port for Vite SPA"         "9001"

    $yn = Ask "Include Next.js app (apps/web)? (y/n)"  "y"
    $IncludeWeb = if ($yn -match '^[Nn]') { "false" } else { "true" }

    $yn = Ask "Include Vite SPA (apps/spa)? (y/n)"  "y"
    $IncludeSpa = if ($yn -match '^[Nn]') { "false" } else { "true" }

    $yn = Ask "Include Docker infra? (y/n)"  "y"
    $IncludeDocker = if ($yn -match '^[Nn]') { "false" } else { "true" }

    $yn = Ask "Include Playwright E2E tests? (y/n)"  "y"
    $IncludePlay = if ($yn -match '^[Nn]') { "false" } else { "true" }
}

# ── Preview ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Hr
Write-Host "  Substitutions to apply:" -ForegroundColor White
Write-Hr
Write-Host "  Name         ts-react-fullstack-template  →  $ProjectName"
Write-Host "  Display      My App / TS React Template   →  $DisplayName"
Write-Host "  Scope        @template/                   →  @$Scope/"
Write-Host "  Web port     9000                         →  $WebPort"
Write-Host "  SPA port     9001                         →  $SpaPort"
if ($Author) { Write-Host "  Author       Template Author              →  $Author" }
Write-Host ""

if ($DryRun) {
    Write-Warn "Dry-run mode — no files will be changed."
    Pop-Location
    exit 0
}

# ── File replacement helper ───────────────────────────────────────────────────
$ExtensionsToProcess = @(
    "*.ts","*.tsx","*.js","*.jsx","*.json","*.toml",
    "*.yml","*.yaml","*.md","*.sh","*.ps1","*.env*",
    "*.html","*.css","Dockerfile"
)

$ExcludeDirs = @("node_modules",".git","bun.lock",".next","dist","build","coverage")

function Replace-InFiles([string]$old, [string]$new) {
    if ($old -eq $new) { return }

    Get-ChildItem -Path $Root -Recurse -File -Include $ExtensionsToProcess |
        Where-Object {
            $path = $_.FullName
            -not ($ExcludeDirs | Where-Object { $path -match [regex]::Escape($_) })
        } |
        Where-Object { (Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue) -like "*$old*" } |
        ForEach-Object {
            $content = Get-Content $_.FullName -Raw
            $updated = $content.Replace($old, $new)
            Set-Content -Path $_.FullName -Value $updated -NoNewline -Encoding UTF8
            Write-Info "Updated: $($_.FullName.Replace($Root + '\', ''))"
        }
}

# ── Apply substitutions ───────────────────────────────────────────────────────
Write-Ok "Replacing package names and scopes..."
Replace-InFiles "ts-react-fullstack-template"    $ProjectName
Replace-InFiles "@template/ui"                   "@$Scope/ui"
Replace-InFiles "@template/utils"                "@$Scope/utils"
Replace-InFiles "@template/config"               "@$Scope/config"
Replace-InFiles "@template/web"                  "@$Scope/web"
Replace-InFiles "@template/spa"                  "@$Scope/spa"
Replace-InFiles "@template/cve-lite"             "@$Scope/cve-lite"
Replace-InFiles "@template/index-check"          "@$Scope/index-check"

Write-Ok "Replacing display names..."
Replace-InFiles "TS React Template"              $DisplayName
Replace-InFiles "TS Template"                    $DisplayName
Replace-InFiles "TS React SPA Template"          "$DisplayName SPA"
Replace-InFiles "TypeScript React Fullstack Template" $DisplayName
Replace-InFiles "Advanced TypeScript React fullstack reusable monorepo template" $Description
Replace-InFiles "A production-grade TypeScript React fullstack application" $Description

Write-Ok "Replacing ports..."
if ($WebPort -ne "9000") { Replace-InFiles "9000" $WebPort }
if ($SpaPort -ne "9001") { Replace-InFiles "9001" $SpaPort }

if ($Author) {
    Write-Ok "Replacing author..."
    Replace-InFiles "Template Author" $Author
    Replace-InFiles "Your Name"       $Author
}

# ── Remove optional features ──────────────────────────────────────────────────
if ($IncludeWeb -eq "false") {
    Write-Warn "Removing apps/web (Next.js)..."
    Remove-Item -Recurse -Force (Join-Path $Root "apps\web") -ErrorAction SilentlyContinue
}
if ($IncludeSpa -eq "false") {
    Write-Warn "Removing apps/spa (Vite SPA)..."
    Remove-Item -Recurse -Force (Join-Path $Root "apps\spa") -ErrorAction SilentlyContinue
}
if ($IncludeDocker -eq "false") {
    Write-Warn "Removing infra/docker/..."
    Remove-Item -Recurse -Force (Join-Path $Root "infra\docker") -ErrorAction SilentlyContinue
}
if ($IncludePlay -eq "false") {
    Write-Warn "Removing Playwright config and E2E tests..."
    Remove-Item -Force (Join-Path $Root "playwright.config.ts") -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force (Join-Path $Root "tests\e2e")   -ErrorAction SilentlyContinue
}

# ── Remove template metadata ──────────────────────────────────────────────────
Write-Ok "Removing template metadata files..."
Remove-Item -Force (Join-Path $Root "template.config.json") -ErrorAction SilentlyContinue
Remove-Item -Force (Join-Path $Root "template.schema.json") -ErrorAction SilentlyContinue

# ── Re-initialise git ─────────────────────────────────────────────────────────
Write-Host ""
$yn = Ask "Re-initialise git with a clean history? (recommended) (y/n)" "y"
if ($yn -notmatch '^[Nn]') {
    Write-Ok "Re-initialising git..."
    Remove-Item -Recurse -Force (Join-Path $Root ".git") -ErrorAction SilentlyContinue
    & git init $Root -b main 2>&1 | Out-Null
    & git -C $Root add -A
    & git -C $Root commit -m "chore: initialise $ProjectName from fullstack template"
    Write-Ok "Fresh git history created."
}

# ── Done ──────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Hr
Write-Host "  Project initialised successfully!" -ForegroundColor Green
Write-Hr
Write-Host ""
Write-Host "  Next steps:"
Write-Host "  1. Copy-Item .env.example .env.local  # then edit .env.local"
Write-Host "  2. bun install"
if ($IncludeWeb -ne "false") { Write-Host "  3. bun run dev:web   # http://localhost:$WebPort" }
if ($IncludeSpa -ne "false") { Write-Host "  4. bun run dev:spa   # http://localhost:$SpaPort" }
Write-Host "  5. bun run test:unit"
Write-Host ""

Pop-Location
