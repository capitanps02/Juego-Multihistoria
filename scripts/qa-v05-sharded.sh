#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
npm run build >/dev/null
mkdir -p qa/shards
for i in $(seq 0 9); do
  seed=$((900000 + i*100))
  node --input-type=module -e "import {runBatch} from './dist/simulation/batch.js'; console.log(JSON.stringify(runBatch({runs:100,days:2922,startSeed:${seed},includeHashes:true})))" > "qa/shards/qa-shard-${i}.json"
done
echo "Shards generated. Aggregate reference report: qa/batch-1000-v05.json"
