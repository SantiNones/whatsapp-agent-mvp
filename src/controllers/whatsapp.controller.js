import { sendWhatsAppMessage } from "../services/twilio.service.js";

export async function handleIncomingWhatsAppMessage(req, res) {
  try {
    const incomingMessage = req.body.Body;
    const from = req.body.From;
    const replyMessage = "Hola 👋 Recibí tu mensaje. Te haré unas preguntas para entender mejor tu idea de tattoo.";

    console.log("Incoming WhatsApp message:");
    console.log({
      from,
      incomingMessage
    });

    await sendWhatsAppMessage(from, replyMessage);

    res.status(200).send("Message received");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Internal Server Error");
  }
}