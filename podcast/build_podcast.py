#!/usr/bin/env python3
"""Gera o podcast do curso em áudio a partir de roteiro.md — offline, sem serviços externos.

Cadeia: roteiro.md -> lexicon.json -> Piper (VITS ONNX, local) -> WAV -> ffmpeg -> MP3 + feed.

Uso:
    python3 build_podcast.py                  # todos os episódios
    python3 build_podcast.py --episode 4      # só o episódio 4
    python3 build_podcast.py --voice pt_BR-cadu-medium --length-scale 1.15
    python3 build_podcast.py --sample         # 40s de amostra por voz instalada

Requisitos: ./fetch_voices.sh (baixa os modelos), ffmpeg, e o venv com piper-tts.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import wave
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
VOICES_DIR = HERE / "voices"
AUDIO_DIR = HERE / "audio"
WORK_DIR = HERE / ".work"

DEFAULT_VOICE = "pt_BR-faber-medium"

# Silêncios (segundos). O roteiro pede "respiro de 1-2s" em [pausa].
# Preferimos alongar as pausas a esticar os fonemas: o Piper fica robótico acima
# de length-scale ~1.2, mas respiros entre frases soam naturais e baixam o ritmo.
SIL_LEAD_IN = 0.5
SIL_AFTER_TITLE = 0.9
SIL_SENTENCE = 0.3
SIL_PARAGRAPH = 0.7
SIL_MARKED_PAUSE = 1.6
SIL_TAIL = 1.4

# Metadados do feed/ID3.
SHOW_TITLE = "ING Direct: o banco que disse não"
SHOW_SUBTITLE = "Curso em áudio para a discussão de caso"
SHOW_AUTHOR = "Curso em áudio"
SHOW_DESCRIPTION = (
    "Seis episódios para dominar o caso ING Bank of Canada — não para recontá-lo, "
    "mas para decidir sobre ele: o dilema de marketing, a escolha do Canadá, a "
    "estratégia do não, a aritmética que fecha o ROE, as cinco perguntas da semana "
    "e a tática de sala."
)
SHOW_LANGUAGE = "pt-BR"

# Sinopse de cada episódio (feed, tags ID3 e página). Sem isso, cai no primeiro
# parágrafo do roteiro — que a página já mostra logo abaixo.
SUMMARIES = {
    1: "O orçamento de marketing que não fecha com a própria meta — e o dilema maior "
       "embaixo dele: ninguém no mundo tinha provado que banco de desconto funciona.",
    2: "Os três critérios de peneira que elegeram o Canadá, o oligopólio dos cinco "
       "grandes e a razão de oito para um entre agência e internet.",
    3: "Posicionamento, dois produtos, juros dez vezes maiores e a lista de recusas: "
       "sem conta corrente, sem cheque, sem caixa eletrônico.",
    4: "A conta que decide a discussão: spread menor que o do incumbente, saldo médio "
       "por cliente e custos travados até quinhentas mil contas.",
    5: "Capital regulatório, a tensão com a matriz, foco e isolamento na TI, a "
       "disciplina de produtos e sete transposições para hoje.",
    6: "Tática de sala: quatro intervenções planejadas, como reformular o dilema de "
       "marketing e a resposta de trinta segundos para o cold call.",
}


# ---------------------------------------------------------------- roteiro

@dataclass
class Episode:
    number: int
    title: str
    blocks: list = field(default_factory=list)  # ("text", str) | ("pause", float)

    @property
    def slug(self) -> str:
        return f"ep{self.number}"

    @property
    def full_title(self) -> str:
        return f"Episódio {self.number} — {self.title}"

    @property
    def word_count(self) -> int:
        return sum(len(t.split()) for kind, t in self.blocks if kind == "text")

    def summary(self, limit: int = 320) -> str:
        if self.number in SUMMARIES:
            return SUMMARIES[self.number]
        for kind, text in self.blocks:
            if kind == "text" and not text.startswith("Episódio "):
                if len(text) <= limit:
                    return text
                cut = text[:limit].rsplit(" ", 1)[0]
                return cut + "…"
        return SHOW_SUBTITLE


HEADING_RE = re.compile(r"^##\s+(\d+)\s+—\s+(.+?)\s*$")
PAUSE_RE = re.compile(r"\[pausa\]")


def parse_script(path: Path) -> list[Episode]:
    """Lê roteiro.md em episódios; `[pausa]` (inline ou isolado) vira bloco de silêncio."""
    episodes: list[Episode] = []
    current: Episode | None = None

    raw_paragraphs = [p.strip() for p in path.read_text(encoding="utf-8").split("\n\n")]
    for para in raw_paragraphs:
        if not para:
            continue
        para = " ".join(line.strip() for line in para.splitlines())

        heading = HEADING_RE.match(para)
        if heading:
            current = Episode(int(heading.group(1)), heading.group(2))
            episodes.append(current)
            current.blocks.append(("text", current.full_title + "."))
            current.blocks.append(("pause", SIL_AFTER_TITLE))
            continue

        if current is None:  # preâmbulo do arquivo, não é narração
            continue

        for i, piece in enumerate(PAUSE_RE.split(para)):
            if i:
                current.blocks.append(("pause", SIL_MARKED_PAUSE))
            piece = piece.strip()
            if piece:
                current.blocks.append(("text", piece))
                current.blocks.append(("pause", SIL_PARAGRAPH))

        # o silêncio de parágrafo já foi anexado acima; pausas explícitas não duplicam
        while len(current.blocks) >= 2 and current.blocks[-1][0] == "pause" and current.blocks[-2][0] == "pause":
            current.blocks.pop()

    for ep in episodes:
        while ep.blocks and ep.blocks[-1][0] == "pause":
            ep.blocks.pop()
    return episodes


# ---------------------------------------------------------------- pronúncia

def load_lexicon(path: Path) -> list[tuple[re.Pattern, str]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    rules = []
    for pattern, replacement in data["rules"]:
        # limites de palavra só onde a borda é alfanumérica (permite "wrap-up", "1997")
        left = r"\b" if pattern[0].isalnum() else ""
        right = r"\b" if pattern[-1].isalnum() else ""
        rules.append((re.compile(left + re.escape(pattern) + right), replacement))
    return rules


TYPOGRAPHY = [
    (re.compile(r"[“”]"), '"'),
    (re.compile(r"[‘’]"), "'"),
    (re.compile(r"\s+—\s+"), ", "),   # travessão parentético vira vírgula falada
    (re.compile(r"—"), ", "),
    (re.compile(r"…"), "..."),
    (re.compile(r"\s+"), " "),
]


def for_tts(text: str, lexicon) -> str:
    for pattern, replacement in lexicon:
        text = pattern.sub(replacement, text)
    for pattern, replacement in TYPOGRAPHY:
        text = pattern.sub(replacement, text)
    return text.strip()


# ---------------------------------------------------------------- áudio

def silence(sample_rate: int, seconds: float) -> bytes:
    return b"\x00\x00" * int(sample_rate * seconds)


def write_wav(path: Path, sample_rate: int, pcm: bytes) -> None:
    with wave.open(str(path), "wb") as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(sample_rate)
        out.writeframes(pcm)


def synthesize(voice, ep: Episode, lexicon, syn_config) -> tuple[int, bytes]:
    sample_rate = voice.config.sample_rate
    chunks = [silence(sample_rate, SIL_LEAD_IN)]
    spoken = [b for b in ep.blocks if b[0] == "text"]
    done = 0
    for kind, value in ep.blocks:
        if kind == "pause":
            chunks.append(silence(sample_rate, value))
            continue
        text = for_tts(value, lexicon)
        for i, audio in enumerate(voice.synthesize(text, syn_config=syn_config)):
            if i:  # o Piper devolve um chunk por frase — respiro entre elas
                chunks.append(silence(sample_rate, SIL_SENTENCE))
            chunks.append(audio.audio_int16_bytes)
        done += 1
        print(f"    bloco {done}/{len(spoken)}", end="\r", flush=True)
    chunks.append(silence(sample_rate, SIL_TAIL))
    print(" " * 30, end="\r")
    return sample_rate, b"".join(chunks)


def encode_mp3(wav_path: Path, mp3_path: Path, cover: Path | None, tags: dict) -> None:
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path)]
    if cover and cover.exists():
        cmd += ["-i", str(cover), "-map", "0:a", "-map", "1:v", "-disposition:v", "attached_pic",
                "-c:v", "copy", "-metadata:s:v", "title=Album cover",
                "-metadata:s:v", "comment=Cover (front)"]
    cmd += ["-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-ac", "1",
            "-c:a", "libmp3lame", "-b:a", "64k", "-id3v2_version", "3"]
    for key, value in tags.items():
        cmd += ["-metadata", f"{key}={value}"]
    cmd.append(str(mp3_path))
    subprocess.run(cmd, check=True)


def duration_seconds(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        check=True, capture_output=True, text=True).stdout.strip()
    return float(out)


def hhmmss(seconds: float) -> str:
    seconds = int(round(seconds))
    return f"{seconds // 3600:02d}:{seconds % 3600 // 60:02d}:{seconds % 60:02d}"


# ---------------------------------------------------------------- feed / índice

def build_feed(episodes_meta: list[dict], base_url: str, built_at: datetime) -> str:
    def esc(text: str) -> str:
        return (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))

    items = []
    for meta in episodes_meta:
        # datas decrescentes para o app ordenar do episódio 1 ao 6
        pub = built_at.replace(microsecond=0)
        pub = pub.timestamp() - (len(episodes_meta) - meta["number"]) * 86400
        pub_str = datetime.fromtimestamp(pub, tz=timezone.utc).strftime("%a, %d %b %Y %H:%M:%S +0000")
        url = f"{base_url}/audio/{meta['file']}"
        items.append(f"""    <item>
      <title>{esc(meta['title'])}</title>
      <description>{esc(meta['summary'])}</description>
      <itunes:summary>{esc(meta['summary'])}</itunes:summary>
      <itunes:episode>{meta['number']}</itunes:episode>
      <itunes:duration>{meta['duration_hhmmss']}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
      <enclosure url="{esc(url)}" length="{meta['bytes']}" type="audio/mpeg"/>
      <guid isPermaLink="false">ing-direct-{meta['number']}</guid>
      <pubDate>{pub_str}</pubDate>
    </item>""")

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>{esc(SHOW_TITLE)}</title>
    <link>{esc(base_url)}/</link>
    <language>{SHOW_LANGUAGE}</language>
    <description>{esc(SHOW_DESCRIPTION)}</description>
    <itunes:author>{esc(SHOW_AUTHOR)}</itunes:author>
    <itunes:subtitle>{esc(SHOW_SUBTITLE)}</itunes:subtitle>
    <itunes:summary>{esc(SHOW_DESCRIPTION)}</itunes:summary>
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>serial</itunes:type>
    <itunes:category text="Business"><itunes:category text="Management"/></itunes:category>
    <itunes:image href="{esc(base_url)}/cover.png"/>
    <lastBuildDate>{built_at.strftime('%a, %d %b %Y %H:%M:%S +0000')}</lastBuildDate>
{chr(10).join(items)}
  </channel>
</rss>
"""


# ---------------------------------------------------------------- main

def resolve_voice(name: str) -> Path:
    candidate = VOICES_DIR / f"{name}.onnx"
    if candidate.exists():
        return candidate
    nested = VOICES_DIR / name / f"{name}.onnx"
    if nested.exists():
        return nested
    sys.exit(f"Voz '{name}' não encontrada em {VOICES_DIR}. Rode ./fetch_voices.sh primeiro.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--voice", default=DEFAULT_VOICE)
    parser.add_argument("--episode", type=int, action="append", help="renderiza só estes episódios")
    parser.add_argument("--length-scale", type=float, default=1.2, help="1.0 = ritmo natural; >1 = mais lento")
    parser.add_argument("--noise-scale", type=float, default=0.667)
    parser.add_argument("--noise-w", type=float, default=0.8)
    parser.add_argument("--base-url", default="https://werneck22.github.io/pre-sales-hub-/podcast",
                        help="URL pública usada no feed RSS")
    parser.add_argument("--sample", action="store_true", help="gera 40s de amostra de cada voz instalada")
    parser.add_argument("--keep-wav", action="store_true")
    args = parser.parse_args()

    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg não encontrado no PATH.")

    from piper import PiperVoice, SynthesisConfig  # import tardio: mensagem de erro melhor acima

    syn_config = SynthesisConfig(
        length_scale=args.length_scale,
        noise_scale=args.noise_scale,
        noise_w_scale=args.noise_w,
        normalize_audio=True,
    )
    lexicon = load_lexicon(HERE / "lexicon.json")
    episodes = parse_script(HERE / "roteiro.md")
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    WORK_DIR.mkdir(parents=True, exist_ok=True)

    if args.sample:
        text = for_tts(episodes[0].blocks[2][1], lexicon)[:420]
        for onnx in sorted(VOICES_DIR.glob("*.onnx")):
            name = onnx.stem
            print(f"amostra: {name}")
            voice = PiperVoice.load(onnx)
            pcm = b"".join(c.audio_int16_bytes for c in voice.synthesize(text, syn_config=syn_config))
            wav = WORK_DIR / f"sample-{name}.wav"
            write_wav(wav, voice.config.sample_rate, pcm)
            encode_mp3(wav, AUDIO_DIR / f"sample-{name}.mp3", None, {"title": f"Amostra {name}"})
        return

    print(f"voz: {args.voice}  |  length-scale: {args.length_scale}")
    voice = PiperVoice.load(resolve_voice(args.voice))
    cover = HERE / "cover.png"
    built_at = datetime.now(timezone.utc)
    wanted = set(args.episode or [])

    index_path = HERE / "episodes.json"
    previous = {}
    if index_path.exists():
        previous = {e["number"]: e for e in json.loads(index_path.read_text(encoding="utf-8"))["episodes"]}

    meta_list = []
    for ep in episodes:
        if wanted and ep.number not in wanted:
            if ep.number in previous:
                # reaproveita o áudio já renderizado, mas atualiza o texto (sinopse,
                # título, transcrição) a partir do roteiro atual
                kept = dict(previous[ep.number])
                kept.update(title=ep.full_title, short_title=ep.title, summary=ep.summary(),
                            words=ep.word_count,
                            transcript=[t for kind, t in ep.blocks[2:] if kind == "text"])
                meta_list.append(kept)
            continue
        print(f"  episódio {ep.number} — {ep.title} ({ep.word_count} palavras)")
        sample_rate, pcm = synthesize(voice, ep, lexicon, syn_config)
        wav_path = WORK_DIR / f"{ep.slug}.wav"
        write_wav(wav_path, sample_rate, pcm)
        mp3_path = AUDIO_DIR / f"{ep.slug}.mp3"
        encode_mp3(wav_path, mp3_path, cover, {
            "title": ep.full_title,
            "artist": SHOW_AUTHOR,
            "album": SHOW_TITLE,
            "track": f"{ep.number}/{len(episodes)}",
            "date": str(built_at.year),
            "genre": "Podcast",
            "comment": ep.summary(180),
        })
        if not args.keep_wav:
            wav_path.unlink()
        seconds = duration_seconds(mp3_path)
        meta_list.append({
            "number": ep.number,
            "title": ep.full_title,
            "short_title": ep.title,
            "file": mp3_path.name,
            "summary": ep.summary(),
            "words": ep.word_count,
            "duration_seconds": round(seconds, 1),
            "duration_hhmmss": hhmmss(seconds),
            "bytes": mp3_path.stat().st_size,
            "transcript": [t for kind, t in ep.blocks[2:] if kind == "text"],
        })
        print(f"    -> {mp3_path.name}  {hhmmss(seconds)}  {mp3_path.stat().st_size/1e6:.1f} MB")

    meta_list.sort(key=lambda m: m["number"])
    total = sum(m["duration_seconds"] for m in meta_list)
    payload = {
        "show": {
            "title": SHOW_TITLE,
            "subtitle": SHOW_SUBTITLE,
            "description": SHOW_DESCRIPTION,
            "voice": args.voice,
            "built_at": built_at.isoformat(timespec="seconds"),
            "total_duration_hhmmss": hhmmss(total),
        },
        "episodes": meta_list,
    }
    serialized = json.dumps(payload, ensure_ascii=False, indent=2)
    index_path.write_text(serialized + "\n", encoding="utf-8")
    # index.html abre direto do disco (file://), onde fetch() é bloqueado — por isso
    # os dados também saem como script.
    (HERE / "episodes.js").write_text(f"window.PODCAST = {serialized};\n", encoding="utf-8")

    (HERE / "feed.xml").write_text(build_feed(meta_list, args.base_url.rstrip("/"), built_at), encoding="utf-8")
    print(f"\ntotal: {hhmmss(total)} em {len(meta_list)} episódios")
    print("gerados: audio/*.mp3, episodes.json, episodes.js, feed.xml")


if __name__ == "__main__":
    main()
