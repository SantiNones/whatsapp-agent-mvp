# WhatsApp Agent MVP

Reusable WhatsApp AI agent backend for Nones Atelier.

## Current milestone

The project currently receives real WhatsApp messages through:

WhatsApp → Twilio Sandbox → ngrok → Express backend

Incoming WhatsApp messages are received through:

POST /webhook/whatsapp

## Stack

- Node.js
- Express
- Twilio WhatsApp Sandbox
- ngrok
- dotenv
- nodemon

## Next steps

- Send automatic WhatsApp replies from the backend
- Add OpenAI integration
- Add base WhatsApp agent
- Add tattoo intake skill
- Add conversation memory
- Add structured lead extraction
- Add persistence layer
