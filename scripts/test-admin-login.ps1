try {
    $r = Invoke-WebRequest -Uri 'http://localhost:3000/admin/login' -MaximumRedirection 0 -ErrorAction Stop
    Write-Output ("STATUS: " + $r.StatusCode)
    $r.Headers.GetEnumerator() | ForEach-Object { Write-Output ($_.Key + ": " + $_.Value) }
} catch {
    $resp = $_.Exception.Response
    Write-Output ("STATUS: " + [int]$resp.StatusCode)
    $resp.Headers.GetEnumerator() | ForEach-Object { Write-Output ($_.Key + ": " + $_.Value) }
}
