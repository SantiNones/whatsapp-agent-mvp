export async function handleIncomingWhatsAppMessage(req, res) {
  try {
    const incomingMessage = req.body.Body;
    const from = req.body.From;

    console.log("Incoming WhatsApp message:");
    console.log({
      from,
      incomingMessage
    });

    res.status(200).send("Message received");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Internal Server Error");
  }
}