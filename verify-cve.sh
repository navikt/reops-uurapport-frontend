#!/usr/bin/env bash
set -euo pipefail
IMAGE="uurapport-cve-check"
PORT=3000

echo "== docker build =="
if [ -z "${NODE_AUTH_TOKEN:-}" ]; then
  echo "NODE_AUTH_TOKEN not set — fetching a read-only token via gh"
  NODE_AUTH_TOKEN="$(gh auth token)"
fi
printf '%s' "$NODE_AUTH_TOKEN" > /tmp/.nat-token
trap 'rm -f /tmp/.nat-token' EXIT
docker build --secret id=NODE_AUTH_TOKEN,src=/tmp/.nat-token -t "$IMAGE" .

echo "== docker run =="
docker run --rm -d -p "$PORT:$PORT" --name "$IMAGE" "$IMAGE"
sleep 3

echo "== curl =="
curl -sI "localhost:$PORT/api/internal/isAlive" || true

echo "== container logs =="
docker logs "$IMAGE" || true

docker stop "$IMAGE" >/dev/null

echo "== grype scan =="
grype "$IMAGE" -o table
