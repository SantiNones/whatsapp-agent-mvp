import OpenAI from "openai";

const LEAD_SCHEMA = {
  phone: "string",
  name: "string|null",
  tattooIdea: "string|null",
  bodyPlacement: "string|null",
  approximateSize: "string|null",
  desiredStyle: "string|null",
  hasReferenceImage: "boolean",
  referenceImageSummary: "string|null",
  availability: "string|null",
  isFirstTattoo: "boolean|null",
  leadStatus: "new|incomplete|qualified|needs_human",
  missingFields: "string[]",
  summary: "string",
  nextAction: "string",
  updatedAt: "string"
};

export async function extractTattooLead({ phone, history, latestMessage, mediaItems = [] }) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const hasImageMedia = mediaItems.some((mediaItem) =>
    mediaItem.contentType?.startsWith("image/")
  );

  const conversationText = history
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Extract a structured tattoo lead from the conversation. Return only valid JSON matching this schema: ${JSON.stringify(LEAD_SCHEMA)}. Do not invent missing information. Use null for unknown fields. hasReferenceImage must be true if mediaItems contains image media or the conversation says a reference was sent. missingFields must check: name, tattooIdea, bodyPlacement, approximateSize, desiredStyle, availability, isFirstTattoo. leadStatus rules: new = very little info (greeting or single vague message); incomplete = useful info exists but one or more key fields are missing; qualified = ALL of the following are present: tattooIdea is not null, bodyPlacement is not null, (approximateSize is not null OR hasReferenceImage is true), (desiredStyle is not null OR hasReferenceImage is true), availability is not null, isFirstTattoo is not null (explicitly confirmed as true or false by the user), phone is present; needs_human = medical advice, complex pricing, complaints, urgent or sensitive topics. IMPORTANT: Never set isFirstTattoo to true or false unless the user explicitly stated it. If the user says things like "tengo un par", "ya tengo tatuajes", "tengo varios" set isFirstTattoo to false. If the user says "es mi primero", "nunca me he hecho uno" set isFirstTattoo to true. If isFirstTattoo is null, include "isFirstTattoo" in missingFields and keep leadStatus as "incomplete" even if all other fields are present.`
      },
      {
        role: "user",
        content: JSON.stringify({
          phone,
          latestMessage,
          hasImageMedia,
          mediaContentTypes: mediaItems.map((mediaItem) => mediaItem.contentType),
          conversationText,
          updatedAt: new Date().toISOString()
        })
      }
    ]
  });

  return JSON.parse(completion.choices[0]?.message?.content || "{}");
}
