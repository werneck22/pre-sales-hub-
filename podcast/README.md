# Curso em áudio — “ING Direct: o banco que disse não”

Pipeline que transforma o roteiro escrito em um podcast de 6 episódios **sem
nenhum serviço de terceiros**: a síntese de voz roda na própria máquina, o
roteiro nunca sai do disco.

| | |
|---|---|
| Voz | Piper / VITS ONNX, `pt_BR-faber-medium` (modelo local, MIT) |
| Áudio | MP3 mono 80 kbps, normalizado a −16 LUFS (padrão de podcast) |
| Duração | ~25 min em 7 episódios |
| Saída | `audio/ep1..ep7.mp3`, `index.html` (player), `feed.xml` (RSS) |

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

## Fidelidade ao caso

O roteiro foi conferido linha a linha contra o dossiê de preparação (fonte
primária: Ivey 9A99A010). O dossiê **não** está neste repositório e não deve
ser commitado — é material de terceiros. Os números narrados vêm dele; onde a
narração reconstrói (a conta de ROE do episódio 4) ou cita casos externos ao
Ivey (Egg, ING Direct USA, INSEAD), o próprio texto avisa. Manter esse aviso é
parte do conteúdo: numa discussão de caso, apresentar inferência como fato é o
erro que custa caro.

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

## O que torna a narração menos sintética

O que denuncia um TTS não é o timbre — é a regularidade. Seis medidas, em ordem
de impacto:

1. **Prosódia por frase** (`prosody()`). Cada frase recebe seu próprio andamento:
   frase curta é frase de efeito e sai mais lenta e mais forte; período longo
   corre e recua; pergunta ganha suspensão. Por cima vai um jitter de ±4 % com
   semente fixa — varia entre frases, mas o build continua reproduzível.
2. **Sem normalização por frase.** O Piper nivela cada frase no pico máximo, o
   que faz toda a narração sair no mesmo volume. Com `normalize_audio=False` os
   picos voltam a variar sozinhos (0,45 a 0,73), como em alguém falando.
3. **Pausas guiadas pela pontuação.** `?` pede 0,46 s, `...` pede 0,60 s (no
   roteiro reticências são suspense, não fim de frase), `:` pede 0,20 s.
4. **Ruído de sala** (`ROOM_TONE`). Silêncio digital absoluto é a maior denúncia
   de gravação sintética — nenhuma sala é muda. Rosa filtrado a ~−60 dBFS:
   imperceptível como som, decisivo como textura. Desligue com `--no-room-tone`.
5. **Cadeia de locução** (`VOICE_CHAIN`): corta abaixo de 75 Hz, +1,4 dB de corpo
   em 200 Hz, +1,8 dB de presença em 3 kHz e compressão leve (1,8:1) para a voz
   soar próxima do microfone.
6. **Normalização linear em duas passagens.** Em passagem única o `loudnorm` age
   como compressor e achata justamente a variação criada nos itens 1 e 2 —
   `measure_loudness()` mede antes para a segunda passagem só deslocar o nível.

O teto, daqui em diante, é o modelo: a faixa dinâmica do WAV recém-sintetizado
já é de 3,4 LU, e a cadeia de tratamento preserva isso inteiro. Ganho adicional
vem de trocar a voz (`--sample` gera o mesmo trecho em todas as instaladas), não
de mais processamento.
