#!/bin/bash
set -e

export DISPLAY=:1

# Start virtual display
Xvfb :1 -screen 0 ${WIDTH}x${HEIGHT}x24 -ac +extension GLX +render -noreset &
# Wait for the X11 socket to exist before starting x11vnc
until [ -e /tmp/.X11-unix/X1 ]; do sleep 0.2; done
sleep 1

# Start VNC server — no password for local-only use
x11vnc -display :1 -nopw -forever -quiet -bg || true
sleep 1

# Start Firefox with persistent profile
# --remote-debugging-port=9222 enables CDP for DOM access (Day 4)
firefox \
  --profile /firefox-profile \
  --no-remote \
  --remote-debugging-port=9222 \
  --remote-allow-origins=http://localhost:9222 \
  &

# Wait for Firefox to accept TCP connections on port 9222 (BiDi doesn't expose /json/version)
until bash -c '</dev/tcp/127.0.0.1/9222' 2>/dev/null; do sleep 1; done

# Firefox binds CDP to 127.0.0.1 only — socat bridges it to all interfaces on port 9223
# docker-compose maps host:9222 → container:9223 → Firefox:9222
socat TCP-LISTEN:9223,fork,reuseaddr TCP:127.0.0.1:9222 &

# Keep container alive
wait
