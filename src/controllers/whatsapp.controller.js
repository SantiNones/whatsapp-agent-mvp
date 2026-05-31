import { generateAgentReply } from "../services/openai.service.js";
import { getConversationHistory, saveMessage } from "../services/memory.service.js";
import { sendWhatsAppMessage } from "../services/twilio.service.js";

export async function handleIncomingWhatsAppMessage(req, res) {
  try {
    const incomingMessage = req.body.Body;
    const from = req.body.From;

    console.log("Incoming WhatsApp message:");
    console.log({
      from,
      incomingMessage
    });

    saveMessage(from, "user", incomingMessage);

    const conversationHistory = getConversationHistory(from);
    const previousHistory = conversationHistory.slice(0, -1);

    const reply = await generateAgentReply({
      phone: from,
      message: incomingMessage,
      history: previousHistory
    });

    console.log("Generated WhatsApp reply:", {
      to: from,
      reply
    });

    saveMessage(from, "assistant", reply);

    await sendWhatsAppMessage(from, reply);

    res.status(200).send("Message received");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Internal Server Error");
  }
}