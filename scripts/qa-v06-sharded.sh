#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
npm run build >/dev/null
rm -rf qa/v06-shards; mkdir -p qa/v06-shards
for base in 0 4 8; do
  pids=()
  for j in 0 1 2 3; do
    i=$((base+j)); [ "$i" -gt 9 ] && break
    seed=$((1000000+i*100))
    node scripts/qa-v06-shard.mjs "$seed" 100 > "qa/v06-shards/shard-$i.json" & pids+=("$!")
  done
  for pid in "${pids[@]}"; do wait "$pid"; done
done
node scripts/aggregate-v06.mjs qa/v06-shards > qa/aggregate-v06.txt
cat qa/acceptance-v06.json
