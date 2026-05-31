import OpenAI from "openai";
import { baseWhatsappAgentPrompt } from "../agents/baseWhatsappAgent.js";
import { tattooIntakeSkillPrompt } from "../skills/tattooIntake.skill.js";

const FALLBACK_REPLY = "Perdona, ahora mismo estoy teniendo un problema técnico. El equipo revisará tu mensaje y te responderá en cuanto pueda.";

export async function generateAgentReply({ phone, message, history }) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const previousMessages = history.map((historyMessage) => ({
      role: historyMessage.role,
      content: historyMessage.content
    }));

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
          content: message
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
