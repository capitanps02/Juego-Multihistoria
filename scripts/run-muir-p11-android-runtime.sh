#!/usr/bin/env bash
set -euo pipefail

SCOPE="${1:-all}"
adb devices -l
SERIAL="${ANDROID_SERIAL:-}"
if [[ -z "$SERIAL" ]]; then
  SERIAL="$(adb -e get-serialno 2>/dev/null || true)"
fi
if [[ -z "$SERIAL" || "$SERIAL" == "unknown" ]]; then
  SERIAL="$(adb devices | awk '$1 ~ /^emulator-/ && $2 == "device" {print $1; exit}')"
fi
if [[ -z "$SERIAL" ]]; then
  echo "No usable emulator serial" >&2
  exit 1
fi
echo "Using emulator serial $SERIAL for scope $SCOPE"

case "$SCOPE" in
  basic)
    node scripts/test-android-device.mjs "$SERIAL" create resume
    ;;
  lifecycle)
    node scripts/test-android-device.mjs "$SERIAL" lifecycle
    ;;
  lifecycle-paused)
    node scripts/test-android-device.mjs "$SERIAL" lifecycle-paused
    ;;
  back)
    node scripts/test-muir-p9-android-back.mjs "$SERIAL"
    ;;
  all)
    node scripts/test-android-device.mjs "$SERIAL" create resume lifecycle lifecycle-paused
    node scripts/test-muir-p9-android-back.mjs "$SERIAL"
    ;;
  *)
    echo "Unknown P11 Android runtime scope: $SCOPE" >&2
    exit 2
    ;;
esac
