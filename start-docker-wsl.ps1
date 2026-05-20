# Starts dockerd in WSL2 Ubuntu (if not already running)
# Run this once after each Windows reboot before using docker/npm commands

$PROJECT = "/mnt/c/Copilot/proyectos/r-d/pomelli-wrapper"
$COMPOSE  = "docker -H unix:///var/run/docker.sock compose -f $PROJECT/docker-compose.yml"

Write-Host "Checking Docker daemon in WSL2..."
$running = wsl -d Ubuntu -- bash -c "pgrep dockerd > /dev/null && echo yes || echo no"
if ($running.Trim() -eq "no") {
    Write-Host "Starting dockerd..."
    wsl -d Ubuntu -- bash -c "echo '2303' | sudo -S nohup dockerd > /tmp/dockerd.log 2>&1 &"
    Write-Host "Waiting 15s for daemon + TLS delay..."
    Start-Sleep -Seconds 15
}

Write-Host "Docker daemon is running."
Write-Host ""
Write-Host "--- Useful commands (run from WSL2 Ubuntu terminal) ---"
Write-Host ""
Write-Host "  # Start container:"
Write-Host "  $COMPOSE up -d"
Write-Host ""
Write-Host "  # Stop container:"
Write-Host "  $COMPOSE down"
Write-Host ""
Write-Host "  # View logs:"
Write-Host "  docker -H unix:///var/run/docker.sock logs -f pomelli-computer"
Write-Host ""
Write-Host "  # Run the wrapper (from /mnt/c/Copilot/proyectos/r-d/pomelli-wrapper):"
Write-Host "  npm run wrap -- --url https://client.com"
Write-Host ""
Write-Host "VNC: connect to localhost:5902"
