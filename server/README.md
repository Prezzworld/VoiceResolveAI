# VoiceResolve AI

An autonomous voice assistant for African fintechs that handles customer complaints about failed bank transfers over phone calls — transcribing speech, querying a MongoDB ledger, confirming failed transaction details, and triggering automated refunds while preventing duplicate payouts.

Built for the **Sahara CodeSwitch Africa Challenge (Phase 2)**.

## How it works

1. A customer's spoken complaint (audio) is transcribed using **Sahara's real-time speech-to-text API**, streamed over WebSocket in small, paced chunks.
2. The resulting transcript is parsed to extract the customer's **phone number** (regex) and the **sender/destination bank names** (keyword matching against a known bank list, ordered by where each name appears in the sentence).
3. These extracted details are used to look up a matching **failed transaction** in MongoDB.
4. If found, the transaction is **automatically refunded** using an atomic, race-condition-safe database update — preventing duplicate payouts even under concurrent requests.

## Architecture

- **Stack:** MERN (MongoDB Atlas, Express, Node.js) — backend only for this submission
- **Speech-to-text:** Sahara (`wss://infer.voice.intron.io/stt/v1/stream`) via a custom Promise-wrapped WebSocket client (`services/saharaService.js`)
- **Extraction:** Regex (phone number) + keyword matching (bank names), `services/extractionService.js`
- **Validation:** Zod, with trimmed, length-capped, and format-checked fields
- **Auth:** Shared API key (`x-api-key` header), fail-safe if unset
- **Refund safety:** Atomic `findOneAndUpdate` with status condition in the filter and `$inc` for balance updates, preventing double-refunds under concurrent requests

## Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/voiceResolveAI/api/v1/ledger/check-failed-transaction` | Look up a failed transaction by phone number + sender/destination bank |
| POST | `/voiceResolveAI/api/v1/ledger/process-refund` | Refund a transaction by ID |
| POST | `/voiceResolveAI/api/v1/ledger/voice-complaint` | Full pipeline: audio in → transcript → extraction → lookup → automatic refund |
| POST | `/voiceResolveAI/api/v1/webhook/sahara-callback` | Webhook receiver for Sahara's Voice Bots API call results |

All ledger routes require an `x-api-key` header matching the server's configured `API_KEY`.

## A note on the Voice Bots API

Sahara's Voice Bots API (`voicebot.intron.health`) — which would allow VoiceResolve AI to place live outbound calls to customers — was unreachable throughout development due to a **confirmed server-side issue on Intron's end** (verified with hackathon organizers). As a result, this submission demonstrates the complete complaint-to-refund pipeline using **pre-recorded audio** in place of a live call. The webhook route (`/webhook/sahara-callback`) and workflow-creation logic needed to support live calls are built and ready — the only missing piece is the currently-unavailable upstream service.

## Benchmark report

See [`BENCHMARK_REPORT.md`](./BENCHMARK_REPORT.md) for a comparison of Sahara vs. AssemblyAI on code-switched Igbo-English and Pidgin-English speech, using Word Error Rate (WER) as the evaluation metric.

## Setup

```bash
npm install
```

Create a `.env` file with:
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
API_KEY=your_generated_api_key
SAHARA_API_KEY=your_sahara_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
```

Run the server:
```bash
npm run dev
```

## Known limitations

- `accountBalance` is tracked per-transaction rather than via a separate `Account`/`Customer` model — a deliberate simplification given hackathon time constraints; see code comments in `models/transaction.js`.
- Bank extraction assumes the first-mentioned bank in a transcript is the sender and the second is the destination — reasonable for a demo, but a production system would have the AI explicitly confirm this back to the customer.
- Extraction (phone number, bank names) is regex/keyword-based rather than using fuzzy matching or an LLM step — sufficient for demo purposes, with room for improvement noted in the benchmark report.
