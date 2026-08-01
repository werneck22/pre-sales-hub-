#!/usr/bin/env bash
# Prepara o ambiente local do podcast: venv com Piper + checagem do ffmpeg.
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v ffmpeg >/dev/null; then
  echo "ffmpeg não encontrado."
  echo "  Ubuntu/Debian: sudo apt-get install -y ffmpeg"
  echo "  macOS:         brew install ffmpeg"
  exit 1
fi

python3 -m venv .venv
./.venv/bin/pip install --quiet --upgrade pip
./.venv/bin/pip install --quiet piper-tts

echo "ambiente pronto."
echo "  1) ./fetch_voices.sh"
echo "  2) ./.venv/bin/python build_podcast.py"
