# VoiceResolve AI — Speech-to-Text Model Benchmark Report

## 1. Purpose

VoiceResolve AI is an autonomous voice assistant for African fintechs that handles customer complaints about failed bank transfers over phone calls. Its core pipeline depends on accurate speech-to-text (STT) transcription of code-switched speech (e.g., English mixed with Igbo, Hausa, Yoruba, or Nigerian Pidgin), since extracted phone numbers and bank names feed directly into an automated ledger lookup and refund process.

This report evaluates **Sahara** (Intron's voice API, used in production by VoiceResolve AI) against **AssemblyAI**, a general-purpose commercial STT provider, to assess Sahara's suitability for this use case and to satisfy the Sahara CodeSwitch Africa Challenge's benchmarking requirement.

## 2. Methodology

- **Dataset:** 4 code-switched audio clips (2 Igbo-English, 2 Nigerian Pidgin-English) sampled from Intron's [AfriSwitch](https://huggingface.co/datasets/intronhealth/AfriSwitch) benchmark dataset — a 54.41-hour, human-transcribed, in-the-wild code-switching benchmark spanning 14 African languages.
- **Models compared:**
  - **Sahara** — Intron's voice API (`wss://infer.voice.intron.io/stt/v1/stream`), integrated via a custom WebSocket streaming client built for this project.
  - **AssemblyAI** — a commercial, general-purpose STT API, integrated via its standard upload-and-poll REST endpoints.
- **Scoring metric:** Word Error Rate (WER) — the proportion of words in a model's transcript that would need to be inserted, deleted, or substituted to match the dataset's human-verified ground truth transcription. Lower WER indicates higher accuracy; 0 represents a perfect transcript.
- **Ground truth:** Verbatim human transcriptions provided directly by the AfriSwitch dataset for each sampled clip.

## 3. Results

| Clip | Language | Sahara WER | AssemblyAI WER |
|---|---|---|---|
| igbo1 | Igbo-English | 1.000 | 1.000 |
| igbo2 | Igbo-English | 0.458 | 0.542 |
| pidgin1 | Pidgin-English | 0.348 | 0.261 |
| pidgin2 | Pidgin-English | 0.438 | 0.375 |

## 4. Interpretation

Sahara outperformed AssemblyAI on Igbo-English code-switching, scoring a lower (better) WER on `igbo2` and tying on the worst-case result for `igbo1`. AssemblyAI, conversely, performed somewhat better on the Nigerian Pidgin-English clips (`pidgin1`, `pidgin2`).

Both models failed completely on `igbo1` — a short, densely code-switched clip — suggesting that dense intra-sentence language switching remains a genuinely hard case for general-purpose ASR systems regardless of provider, not a weakness unique to either model tested.

Given VoiceResolve AI's target users are Nigerian bank customers who commonly code-switch between English and Igbo, Hausa, Yoruba, or Pidgin during phone conversations, these results support Sahara as a reasonable transcription backbone for the product's core use case. They also validate a key design decision made during development: VoiceResolve AI's extraction logic (regex-based phone number detection, keyword-based bank name matching) is built to tolerate imperfect or partial transcripts and fail gracefully — prompting a repeat request rather than proceeding on bad data — rather than assuming STT output will always be clean.

## 5. Limitations

- **Sample size:** 4 clips is a small sample given time constraints on this project; a production-grade evaluation would test across many more clips per language, ideally the full AfriSwitch test split.
- **Model coverage:** OpenAI Whisper was initially planned as a third comparison model but was excluded due to account billing constraints encountered during testing; a more complete future benchmark would include it alongside other options such as Azure Speech or Google Speech-to-Text.
- **Real-world conditions:** These clips are relatively clean recordings; live phone-call audio (variable phone-line compression, background noise) may produce different results than this benchmark suggests.

## 6. Reproducibility

Scripts used to generate these results are included in this repository under `benchmark/runBenchmark.js` (runs both models against the test clips) and `services/wer.js` (WER scoring implementation). Ground truth transcriptions are stored in `benchmark/audio/groundTruth.json`.
