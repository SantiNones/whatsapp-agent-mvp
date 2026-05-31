import OpenAI from "openai";
import { baseWhatsappAgentPrompt } from "../agents/baseWhatsappAgent.js";
import { downloadTwilioMediaAsDataUrl } from "./media.service.js";
import { tattooIntakeSkillPrompt } from "../skills/tattooIntake.skill.js";

const FALLBACK_REPLY = "Perdona, ahora mismo estoy teniendo un problema técnico. El equipo revisará tu mensaje y te responderá en cuanto pueda.";

export async function generateAgentReply({ phone, message, history, mediaItems = [] }) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const previousMessages = history.map((historyMessage) => ({
      role: historyMessage.role,
      content: historyMessage.content
    }));

    const imageItems = mediaItems.filter((mediaItem) =>
      mediaItem.contentType?.startsWith("image/")
    );
    const hasImage = imageItems.length > 0;
    let currentUserContent = message || "";

    if (hasImage && !currentUserContent) {
      currentUserContent = "El usuario envió una imagen de referencia para el tatuaje.";
    }

    if (hasImage) {
      try {
        const imageDataUrl = await downloadTwilioMediaAsDataUrl(
          imageItems[0].url,
          imageItems[0].contentType
        );

        currentUserContent = [
          {
            type: "text",
            text: currentUserContent || "El usuario envió una imagen de referencia para el tatuaje."
          },
          {
            type: "image_url",
            image_url: {
              url: imageDataUrl
            }
          }
        ];
      } catch (error) {
        console.error("Twilio media image processing failed:", {
          phone,
          message: error.message
        });

        currentUserContent = `${currentUserContent || "El usuario envió una imagen de referencia para el tatuaje."}\n\nEl usuario envió una imagen de referencia, pero no se pudo analizar automáticamente. Aun así, confirma que la imagen fue recibida y que el estudio la revisará.`;
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: baseWhatsappAgentPrompt
        },
        {
          role: "system",
          content: tattooIntakeSkillPrompt
        },
        ...previousMessages,
        {
          role: "user",
          content: currentUserContent
        }
      ]
    });

    return completion.choices[0]?.message?.content?.trim() || FALLBACK_REPLY;
  } catch (error) {
    console.error("OpenAI reply generation failed:", {
      phone,
      message: error.message
    });

    return FALLBACK_REPLY;
  }
}
