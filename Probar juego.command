#!/bin/zsh
cd "$(dirname "$0")" || exit 1
GAME_NODE_BIN="$(command -v node)"
if [[ -z "$GAME_NODE_BIN" ]]; then
  GAME_NODE_BIN="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi
if [[ ! -x "$GAME_NODE_BIN" ]]; then
  echo 'No se encuentra Node.js. Instala Node.js y ejecuta npm ci.'
  read -r '?Pulsa Intro para cerrar.'
  exit 1
fi
"$GAME_NODE_BIN" scripts/build.mjs || exit 1
"$GAME_NODE_BIN" scripts/build-playcanvas.mjs || exit 1
echo 'Abre http://127.0.0.1:4173 en el navegador. Mantén esta ventana abierta mientras juegas.'
"$GAME_NODE_BIN" scripts/serve-preview.mjs
