$guestId = "guest_tester_" + (Get-Random)
Write-Host "================================================================================"
Write-Host " 1. FETCH INITIAL RECOMMENDATIONS FOR NEW USER (GUEST: $guestId)"
Write-Host "================================================================================"
$initial = Invoke-RestMethod -Uri "http://localhost:8088/api/movies/recommended" -Headers @{"X-Guest-Id"=$guestId}
Write-Host ("Execution Time: " + $initial.metrics.totalExecutionTimeMicros + " microseconds across " + $initial.metrics.parallelWorkerThreads + " threads")
Write-Host "Top Initial Recommendations:"
foreach ($item in ($initial.recommendations | Select-Object -First 4)) {
    Write-Host ("  [Rank #" + $item.rank + "] " + $item.titleOrName + " | Score: " + $item.score + "% | Reason: " + $item.matchReason)
}

Write-Host "`n================================================================================"
Write-Host " 2. SUBMIT RATING: 5.0 STARS FOR 'Interstellar' (m-2)"
Write-Host "================================================================================"
$body = '{"itemId":"m-2","itemType":"MOVIE","ratingValue":5.0,"comment":"Exceptional sci-fi adventure"}'
$rateRes = Invoke-RestMethod -Uri "http://localhost:8088/api/ratings" -Method POST -Headers @{"X-Guest-Id"=$guestId} -ContentType "application/json" -Body $body
Write-Host ("  -> Rating Stored: item=" + $rateRes.itemId + ", stars=" + $rateRes.ratingValue + ", user=" + $rateRes.userId)

Write-Host "`n================================================================================"
Write-Host " 3. FETCH RECALCULATED RECOMMENDATIONS (NO RESTART / IMMEDIATE IN-MEMORY ENGINE)"
Write-Host "================================================================================"
$recalc = Invoke-RestMethod -Uri "http://localhost:8088/api/movies/recommended" -Headers @{"X-Guest-Id"=$guestId}
Write-Host ("Execution Time: " + $recalc.metrics.totalExecutionTimeMicros + " microseconds")
Write-Host "New Recalibrated Recommendations:"
foreach ($item in ($recalc.recommendations | Select-Object -First 4)) {
    Write-Host ("  [Rank #" + $item.rank + "] " + $item.titleOrName + " | Score: " + $item.score + "% | Reason: " + $item.matchReason)
}

Write-Host "`n================================================================================"
Write-Host " 4. SUBMIT SECOND RATING: 5.0 STARS FOR 'Spider-Man: Across the Spider-Verse' (m-8)"
Write-Host "================================================================================"
$body2 = '{"itemId":"m-8","itemType":"MOVIE","ratingValue":5.0,"comment":"Best animated film"}'
$rateRes2 = Invoke-RestMethod -Uri "http://localhost:8088/api/ratings" -Method POST -Headers @{"X-Guest-Id"=$guestId} -ContentType "application/json" -Body $body2
Write-Host ("  -> Rating Stored: item=" + $rateRes2.itemId + ", stars=" + $rateRes2.ratingValue)

Write-Host "`n================================================================================"
Write-Host " 5. FETCH RECALCULATED RECOMMENDATIONS AFTER DIVERSE RATINGS"
Write-Host "================================================================================"
$recalc2 = Invoke-RestMethod -Uri "http://localhost:8088/api/movies/recommended" -Headers @{"X-Guest-Id"=$guestId}
Write-Host "Updated Recommendations:"
foreach ($item in ($recalc2.recommendations | Select-Object -First 4)) {
    Write-Host ("  [Rank #" + $item.rank + "] " + $item.titleOrName + " | Score: " + $item.score + "% | Reason: " + $item.matchReason)
}
