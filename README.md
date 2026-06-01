# WhatsApp Agent MVP

Reusable WhatsApp AI intake agent backend for local service businesses, currently implemented as a tattoo studio intake assistant.

## Current Capabilities

- Receives real WhatsApp messages through a Twilio Sandbox webhook
- Sends WhatsApp replies through the Twilio API
- Uses OpenAI to generate tattoo intake conversations in Spanish
- Persists conversation memory locally across server restarts
- Detects, downloads, and sends WhatsApp image references to OpenAI for visual analysis
- Collects tattoo information progressively without requiring a budget
- Extracts structured tattoo leads and saves them locally
- Generates owner handoff summaries for qualified leads

## Architecture Overview

```txt
WhatsApp user
  → Twilio Sandbox
    → ngrok
      → Express backend
        → OpenAI reply generation
        → Twilio WhatsApp response
        → local memory / lead / handoff storage
```

## Stack

- Node.js
- Express
- Twilio SDK
- OpenAI SDK
- dotenv
- ngrok
- Local JSON storage

## Folder Structure

- `src/controllers` — webhook entry point and flow orchestration
- `src/routes` — webhook route definitions
- `src/services` — Twilio messaging, OpenAI replies, media handling, memory, lead extraction, lead storage, and handoff generation
- `src/agents` — base WhatsApp assistant prompt
- `src/skills` — tattoo intake prompt and behavior rules
- `data/` — ignored local runtime files for conversations, leads, and handoffs

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` and fill in your credentials.

3. Add your Twilio credentials and OpenAI API key to `.env`.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Run ngrok to expose your local server:

   ```bash
   ngrok http 3000
   ```

   If ngrok is not installed globally, run it from its local path.

6. Configure your Twilio Sandbox webhook:

   ```txt
   https://YOUR_NGROK_URL/webhook/whatsapp
   ```

   Method:

   ```txt
   POST
   ```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp Sandbox number |
| `OPENAI_API_KEY` | OpenAI API key |

## Test Flow

1. Send a WhatsApp message to the Twilio Sandbox number.
2. Describe a tattoo idea.
3. Send an image reference.
4. Provide placement, size, style, availability, and first-tattoo status.
5. Check `data/leads.json` and `data/handoffs.json` locally.

## Local Runtime Data

The app stores local runtime data in ignored JSON files:

- `data/conversations.json`
- `data/leads.json`
- `data/handoffs.json`

These files are not committed to Git.

## Current Limitations

- Uses Twilio Sandbox, not production WhatsApp Business yet
- Uses local JSON files, not a production database
- No dashboard yet
- No scheduling or payments yet
- No pricing rules module yet
- No multi-client configuration yet
- Local runtime data is not committed to Git

## Next Milestones

- Owner notification by email or WhatsApp
- Google Sheets or database persistence
- Pricing rules module
- Scheduling module
- Second agent skill for moving companies