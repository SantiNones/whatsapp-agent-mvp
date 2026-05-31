import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendWhatsAppMessage(to, body) {
  console.log("Sending WhatsApp message:", {
    to,
    body
  });

  const message = await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to,
    body
  });

  console.log("WhatsApp message sent:", {
    sid: message.sid,
    to: message.to,
    status: message.status
  });

  return message;
}