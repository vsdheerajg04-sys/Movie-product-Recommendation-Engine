$destZip = "c:\movie rec\movie-product-recommendation-engine.zip"
if (Test-Path $destZip) {
    Remove-Item $destZip -Force
}

$tempDir = Join-Path $env:TEMP ("cinetech-export-" + (Get-Random))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

Write-Host "Copying backend..."
$backendDest = Join-Path $tempDir "backend"
New-Item -ItemType Directory -Path $backendDest -Force | Out-Null
Copy-Item "c:\movie rec\backend\pom.xml" -Destination $backendDest
Copy-Item "c:\movie rec\backend\src" -Destination $backendDest -Recurse

Write-Host "Copying frontend..."
$frontendDest = Join-Path $tempDir "frontend"
New-Item -ItemType Directory -Path $frontendDest -Force | Out-Null
Copy-Item "c:\movie rec\frontend\package.json" -Destination $frontendDest
Copy-Item "c:\movie rec\frontend\package-lock.json" -Destination $frontendDest -ErrorAction SilentlyContinue
Copy-Item "c:\movie rec\frontend\tsconfig.json" -Destination $frontendDest
Copy-Item "c:\movie rec\frontend\tsconfig.app.json" -Destination $frontendDest -ErrorAction SilentlyContinue
Copy-Item "c:\movie rec\frontend\tsconfig.node.json" -Destination $frontendDest -ErrorAction SilentlyContinue
Copy-Item "c:\movie rec\frontend\vite.config.ts" -Destination $frontendDest
Copy-Item "c:\movie rec\frontend\index.html" -Destination $frontendDest
Copy-Item "c:\movie rec\frontend\src" -Destination $frontendDest -Recurse
if (Test-Path "c:\movie rec\frontend\public") {
    Copy-Item "c:\movie rec\frontend\public" -Destination $frontendDest -Recurse
}

Write-Host "Copying root docs..."
Copy-Item "c:\movie rec\README.md" -Destination $tempDir
Copy-Item "c:\movie rec\test-rating-live.ps1" -Destination $tempDir -ErrorAction SilentlyContinue
Copy-Item "c:\movie rec\test-search-history.ps1" -Destination $tempDir -ErrorAction SilentlyContinue

Write-Host "Creating zip package..."
Compress-Archive -Path "$tempDir\*" -DestinationPath $destZip -CompressionLevel Optimal

Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue

$zipItem = Get-Item $destZip
$sizeKb = [math]::Round($zipItem.Length / 1KB, 2)
Write-Host "SUCCESS! Archive created at: $($zipItem.FullName)"
Write-Host "File Size: $sizeKb KB"
