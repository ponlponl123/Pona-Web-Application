if (Test-Path ./.next/) {
    $rm_next_dir = Read-Host "You would like to remove .next directory? [y/n]:"
    if ($rm_next_dir -eq "y") {
        Remove-Item -Recurse -Force ./.next/
        Write-Host "`n.next directory has been removed!"
    }
}

$use_bun = Read-Host "You would like to use bun instead of node? [y/n]:"
if ($use_bun -eq "y") {
    npm run build
} else {
    npm run build
}

Copy-Item -Recurse ./.next/static/ ./.next/standalone/.next/
Copy-Item -Recurse ./docs/ ./.next/standalone/
Copy-Item -Recurse ./public/ ./.next/standalone/

Write-Host "Next.JS has been built successfully!"
$run_next = Read-Host "You would like to start standalone server now? [y/n]:"

if ($run_next -eq "y") {
    if ($use_bun -eq "y") {
        bun ./.next/standalone/server.js -H localhost
    } else {
        node ./.next/standalone/server.js -H localhost
    }
}