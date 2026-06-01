import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIRECTORY = path.resolve(__dirname, "../../data");
const HANDOFFS_FILE = path.join(DATA_DIRECTORY, "handoffs.json");

function loadHandoffs() {
  try {
    if (!fs.existsSync(HANDOFFS_FILE)) {
      return {};
    }

    return JSON.parse(fs.readFileSync(HANDOFFS_FILE, "utf8"));
  } catch (error) {
    console.warn("Could not load handoff store.", {
      message: error.message
    });

    return {};
  }
}

function persistHandoffs(handoffs) {
  try {
    fs.mkdirSync(DATA_DIRECTORY, { recursive: true });
    fs.writeFileSync(HANDOFFS_FILE, JSON.stringify(handoffs, null, 2));
  } catch (error) {
    console.error("Could not persist handoff store:", {
      message: error.message
    });
  }
}

export function createTattooHandoffSummary(lead) {
  const now = new Date().toISOString();
  const titleName = lead.name || lead.phone;
  const titleIdea = lead.tattooIdea || "tattoo idea";

  return {
    phone: lead.phone,
    leadStatus: lead.leadStatus,
    title: `${titleName} - ${titleIdea}`,
    summary: lead.summary,
    clientInfo: {
      name: lead.name,
      phone: lead.phone
    },
    tattooDetails: {
      idea: lead.tattooIdea,
      placement: lead.bodyPlacement,
      size: lead.approximateSize,
      style: lead.desiredStyle,
      hasReferenceImage: lead.hasReferenceImage,
      referenceImageSummary: lead.referenceImageSummary,
      availability: lead.availability,
      isFirstTattoo: lead.isFirstTattoo
    },
    recommendedNextAction: lead.nextAction,
    createdAt: now,
    updatedAt: now
  };
}

export function saveHandoff(handoff) {
  try {
    const handoffs = loadHandoffs();
    handoffs[handoff.phone] = {
      ...handoffs[handoff.phone],
      ...handoff,
      createdAt: handoffs[handoff.phone]?.createdAt || handoff.createdAt,
      updatedAt: new Date().toISOString()
    };
    persistHandoffs(handoffs);
  } catch (error) {
    console.error("Could not save handoff:", {
      message: error.message
    });
  }
}

export function getHandoffByPhone(phone) {
  const handoffs = loadHandoffs();

  return handoffs[phone] || null;
}
