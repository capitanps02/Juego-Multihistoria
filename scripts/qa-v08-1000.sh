#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
OUT="qa/shards-v08-final"
BASE="${1:-3200000}"
rm -rf "$OUT"
mkdir -p "$OUT"
for pair in 0 200 400 600 800; do
  pids=()
  for add in 0 100; do
    seed=$((BASE + pair + add))
    node scripts/qa-v08-shard.mjs "$seed" 100 "$OUT/s${seed}.json" > "$OUT/s${seed}.log" 2>&1 &
    pids+=("$!")
  done
  for pid in "${pids[@]}"; do wait "$pid"; done
  cat "$OUT/s$((BASE + pair)).log"
  cat "$OUT/s$((BASE + pair + 100)).log"
done
node scripts/qa-v08-aggregate.mjs "$OUT"
