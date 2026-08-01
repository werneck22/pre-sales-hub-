# Curso em áudio — “ING Direct: o banco que disse não”

Pipeline que transforma o roteiro escrito em um podcast de 6 episódios **sem
nenhum serviço de terceiros**: a síntese de voz roda na própria máquina, o
roteiro nunca sai do disco.

| | |
|---|---|
| Voz | Piper / VITS ONNX, `pt_BR-faber-medium` (modelo local, MIT) |
| Áudio | MP3 mono 64 kbps, normalizado a −16 LUFS (padrão de podcast) |
| Duração | ~20 min em 6 episódios |
| Saída | `audio/ep1..ep6.mp3`, `index.html` (player), `feed.xml` (RSS) |

## Rodar

```bash
cd podcast
./setup.sh            # cria .venv com piper-tts (exige ffmpeg instalado)
./fetch_voices.sh     # baixa o modelo de voz (~63 MB, uma vez só)
./.venv/bin/python build_podcast.py
```

Depois é só abrir `index.html` no navegador — funciona direto do disco, sem
servidor.

Opções úteis:

```bash
build_podcast.py --episode 4                  # regera só um episódio
build_podcast.py --voice pt_BR-cadu-medium    # troca a voz
build_podcast.py --length-scale 1.3           # narração mais lenta
build_podcast.py --sample                     # 40 s de amostra de cada voz instalada
```

Vozes disponíveis em `./fetch_voices.sh all`: `faber` (padrão, masculina,
locutor), `cadu`, `jeff`, `edresson`.

## Editar o conteúdo

- **`roteiro.md`** é a única fonte do texto narrado. `## N — Título` abre um
  episódio; `[pausa]` vira silêncio de 1,6 s. Editou, rode o build de novo.
- **`lexicon.json`** corrige a pronúncia antes da síntese — siglas lidas letra a
  letra (`ING` → “Í Êne Gê”) e termos em inglês grafados foneticamente
  (`cost-income` → “cóst íncam”). As reescritas valem **só** para o áudio; o
  roteiro exibido continua com a grafia original.
- **`cover.html`** é a capa. Para regerar o PNG:
  `node shot.js cover.html cover.png` com Playwright, ou simplesmente
  imprima a página em 1400×1400.

## Ouvir no celular

O jeito mais simples é copiar os MP3s para o telefone — qualquer app de música
lê as tags ID3 (título, número do episódio, capa).

Para assinar como podcast de verdade, é preciso que os MP3s estejam publicados
em uma URL. Por padrão `audio/` está no `.gitignore`, porque **este repositório
é público**. Se você quiser publicá-lo mesmo assim:

1. remova `podcast/audio/` do `.gitignore` da raiz;
2. `git add podcast/audio && git commit && git push` para `main`;
3. assine `https://werneck22.github.io/pre-sales-hub-/podcast/feed.xml` no app
   de podcast.

O `--base-url` do build define a URL usada dentro do `feed.xml`.

## Por que Piper

Era o único caminho que atendia às duas exigências ao mesmo tempo: qualidade
neural (não a voz robótica do `espeak`) e execução 100% local. O modelo é um
VITS de ~63 MB rodando em ONNX na CPU — sintetiza os 20 minutos em cerca de
2 minutos em 4 núcleos.

Ajustes de ritmo ficam em `build_podcast.py`: preferimos alongar as pausas
(`SIL_SENTENCE`, `SIL_PARAGRAPH`, `SIL_MARKED_PAUSE`) a esticar os fonemas — o
Piper fica robótico com `--length-scale` acima de ~1,2, mas respiros entre
frases soam naturais e derrubam o ritmo para uns 155 palavras por minuto.
