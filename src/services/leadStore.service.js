import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIRECTORY = path.resolve(__dirname, "../../data");
const LEADS_FILE = path.join(DATA_DIRECTORY, "leads.json");

function loadLeads() {
  try {
    if (!fs.existsSync(LEADS_FILE)) {
      return {};
    }

    return JSON.parse(fs.readFileSync(LEADS_FILE, "utf8"));
  } catch (error) {
    console.warn("Could not load leads store.", {
      message: error.message
    });

    return {};
  }
}

function persistLeads(leads) {
  try {
    fs.mkdirSync(DATA_DIRECTORY, { recursive: true });
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  } catch (error) {
    console.error("Could not persist lead store:", {
      message: error.message
    });
  }
}

export function saveLead(lead) {
  try {
    const leads = loadLeads();
    leads[lead.phone] = lead;
    persistLeads(leads);
  } catch (error) {
    console.error("Could not save lead:", {
      message: error.message
    });
  }
}

export function getLeadByPhone(phone) {
  const leads = loadLeads();

  return leads[phone] || null;
}
