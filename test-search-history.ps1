$guestId = "guest_search_tester_" + (Get-Random)
Write-Host "=========================================================="
Write-Host " 1. RECORD SEARCH QUERIES VIA JAVA SIGNALS API"
Write-Host "=========================================================="
$body1 = '{"itemType":"MOVIE","query":"Christopher Nolan Sci-Fi"}'
$res1 = Invoke-RestMethod -Uri "http://localhost:8088/api/signals/search" -Method POST -Headers @{"X-Guest-Id"=$guestId} -ContentType "application/json" -Body $body1
Write-Host ("  [+] Search Signal 1: " + $res1.query + " (" + $res1.itemType + ")")

$body2 = '{"itemType":"PRODUCT","query":"Sony WH-1000XM5 Noise Cancelling"}'
$res2 = Invoke-RestMethod -Uri "http://localhost:8088/api/signals/search" -Method POST -Headers @{"X-Guest-Id"=$guestId} -ContentType "application/json" -Body $body2
Write-Host ("  [+] Search Signal 2: " + $res2.query + " (" + $res2.itemType + ")")

Write-Host "`n=========================================================="
Write-Host " 2. FETCH ACTIVITY & SEARCH HISTORY FOR GUEST"
Write-Host "=========================================================="
$hist = Invoke-RestMethod -Uri "http://localhost:8088/api/signals/history" -Headers @{"X-Guest-Id"=$guestId}
Write-Host ("Total Recorded Signals: " + $hist.Count)
foreach ($sig in $hist) {
    Write-Host ("  - [" + $sig.signalType + " | " + $sig.itemType + "] Query: " + $sig.query + " (ID: " + $sig.id + ")")
}
