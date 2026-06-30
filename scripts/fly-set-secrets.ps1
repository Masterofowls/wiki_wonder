#Requires -Version 5.1
<#
.SYNOPSIS
  Set Fly.io secrets for wikiwonder-wiki (Strapi + Next.js).

.PARAMETER DatabaseUrl
  Neon pooled Postgres URL (required for Strapi).

.PARAMETER AppName
  Fly app name (default: wikiwonder-wiki).
#>
param(
  [Parameter(Mandatory = $true)]
  [string]$DatabaseUrl,

  [string]$AppName = "wikiwonder-wiki"
)

function New-Secret {
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  return [Convert]::ToBase64String($bytes)
}

$appUrl = "https://$AppName.fly.dev"
$keys = @(1..4 | ForEach-Object { New-Secret }) -join ","
$apiSalt = New-Secret
$adminJwt = New-Secret
$transferSalt = New-Secret
$jwt = New-Secret
$authSecret = New-Secret
$revalidateSecret = New-Secret

Write-Host "Setting secrets on $AppName..."
fly secrets set -a $AppName `
  DATABASE_URL="$DatabaseUrl" `
  APP_KEYS="$keys" `
  API_TOKEN_SALT="$apiSalt" `
  ADMIN_JWT_SECRET="$adminJwt" `
  TRANSFER_TOKEN_SALT="$transferSalt" `
  JWT_SECRET="$jwt" `
  AUTH_SECRET="$authSecret" `
  REVALIDATE_SECRET="$revalidateSecret" `
  CORS_ORIGIN="$appUrl" `
  STRAPI_PUBLIC_URL="$appUrl" `
  NEXT_PUBLIC_APP_URL="$appUrl" `
  AUTH_URL="$appUrl" `
  STRAPI_GRAPHQL_URL="http://127.0.0.1:1337/graphql" `
  STRAPI_ADMIN_URL="$appUrl/admin" `
  REVALIDATE_URL="http://127.0.0.1:3000/api/revalidate"

Write-Host "Done. After deploy, create a Strapi API token and run:"
Write-Host "  fly secrets set -a $AppName STRAPI_API_TOKEN=<token>"
