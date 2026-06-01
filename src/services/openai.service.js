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

    if (mediaItems.length > 0) {
      console.log("Media items received by OpenAI service", {
        mediaCount: mediaItems.length,
        contentTypes: mediaItems.map((mediaItem) => mediaItem.contentType)
      });
    }

    const previousMessages = history.map((historyMessage) => ({
      role: historyMessage.role,
      content: historyMessage.content
    }));

    const imageItems = mediaItems.filter((mediaItem) =>
      mediaItem.contentType?.startsWith("image/")
    );
    const hasImage = imageItems.length > 0;
    let imageIncludedInOpenAIRequest = false;
    let imageProcessingFallbackUsed = false;
    let currentUserContent = message || "";
    let imageDataUrl = null;

    if (hasImage && !currentUserContent) {
      currentUserContent = "El usuario envió una imagen de referencia para el tatuaje.";
    }

    if (hasImage) {
      try {
        imageDataUrl = await downloadTwilioMediaAsDataUrl(
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
        imageIncludedInOpenAIRequest = true;

        console.log("Image converted to data URL for OpenAI", {
          contentType: imageItems[0].contentType
        });
        console.log("Image included in OpenAI request");
      } catch (error) {
        imageProcessingFallbackUsed = true;

        console.error("Image processing fallback used", {
          phone,
          message: error.message
        });

        currentUserContent = `${currentUserContent || "El usuario envió una imagen de referencia para el tatuaje."}\n\nEl usuario envió una imagen de referencia, pero no se pudo analizar automáticamente. Aun así, confirma que la imagen fue recibida y que el estudio la revisará.`;
      }
    }

    const imageInstruction = imageIncludedInOpenAIRequest
      ? "La imagen de referencia fue incluida en esta solicitud. Debes reconocer que recibiste la referencia y puedes mencionar un detalle visible si es relevante, sin sobre-describir ni fingir certeza. No digas que no puedes ver imágenes."
      : hasImage || imageProcessingFallbackUsed
        ? "Se detectó una imagen de referencia, pero no fue incluida en esta solicitud para análisis visual. Debes decir exactamente esta idea en español natural: \"Recibí la imagen de referencia. El estudio la revisará junto con la información del tatuaje.\" No afirmes ver detalles visuales."
        : null;

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
        ...(imageInstruction
          ? [
              {
                role: "system",
                content: imageInstruction
              }
            ]
          : []),
        ...previousMessages,
        {
          role: "user",
          content: currentUserContent
        }
      ]
    });

    const reply = completion.choices[0]?.message?.content?.trim() || FALLBACK_REPLY;

    let imageReferenceSummary = null;

    if (imageIncludedInOpenAIRequest && imageDataUrl) {
      try {
        const summaryCompletion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0,
          max_tokens: 80,
          messages: [
            {
              role: "system",
              content: "Describe this tattoo reference image in one concise sentence (max 20 words). Include: subject, style, colors, and detail level. Plain text only, no punctuation at start."
            },
            {
              role: "user",
              content: [{ type: "image_url", image_url: { url: imageDataUrl } }]
            }
          ]
        });

        imageReferenceSummary = summaryCompletion.choices[0]?.message?.content?.trim() || null;

        console.log("Image reference summary generated", { summary: imageReferenceSummary });
      } catch (summaryError) {
        console.error("Image summary generation failed:", { message: summaryError.message });
      }
    }

    return { reply, imageReferenceSummary };
  } catch (error) {
    console.error("OpenAI reply generation failed:", {
      phone,
      message: error.message
    });

    return { reply: FALLBACK_REPLY, imageReferenceSummary: null };
  }
}
