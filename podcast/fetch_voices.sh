#!/usr/bin/env bash
# Baixa os modelos de voz Piper (VITS ONNX) usados pelo build_podcast.py.
# Os modelos rodam localmente; nada é enviado para fora depois do download.
#
#   ./fetch_voices.sh                 # baixa a voz padrão (faber)
#   ./fetch_voices.sh all             # baixa as quatro vozes pt-BR
#   ./fetch_voices.sh cadu jeff       # baixa vozes específicas
set -euo pipefail

cd "$(dirname "$0")"
mkdir -p voices

# Espelho no GitHub Releases do sherpa-onnx (empacota as vozes oficiais do Piper).
# Fonte primária: huggingface.co/rhasspy/piper-voices — use-a se preferir.
MIRROR="https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models"

declare -A VOICES=(
  [faber]="vits-piper-pt_BR-faber-medium"
  [cadu]="vits-piper-pt_BR-cadu-medium"
  [jeff]="vits-piper-pt_BR-jeff-medium"
  [edresson]="vits-piper-pt_BR-edresson-low"
)

targets=("${@:-faber}")
[[ "${targets[0]}" == "all" ]] && targets=(faber cadu jeff edresson)

for key in "${targets[@]}"; do
  pkg="${VOICES[$key]:-}"
  if [[ -z "$pkg" ]]; then
    echo "voz desconhecida: $key (use: ${!VOICES[*]})" >&2
    exit 1
  fi
  name="${pkg#vits-piper-}"
  if [[ -f "voices/$name.onnx" ]]; then
    echo "já existe: $name"
    continue
  fi
  echo "baixando $name…"
  tmp="$(mktemp -d)"
  curl -fsSL "$MIRROR/$pkg.tar.bz2" -o "$tmp/$pkg.tar.bz2"
  tar xf "$tmp/$pkg.tar.bz2" -C "$tmp"
  mv "$tmp/$pkg/$name.onnx" "$tmp/$pkg/$name.onnx.json" voices/
  rm -rf "$tmp"
  echo "  -> voices/$name.onnx"
done

ls -1 voices/*.onnx
