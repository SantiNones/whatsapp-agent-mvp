import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const MAX_HISTORY_MESSAGES = 12;
const MAX_STORED_MESSAGES = 30;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIRECTORY = path.resolve(__dirname, "../../data");
const CONVERSATIONS_FILE = path.join(DATA_DIRECTORY, "conversations.json");

const conversations = loadConversations();

function loadConversations() {
  try {
    if (!fs.existsSync(CONVERSATIONS_FILE)) {
      return new Map();
    }

    const fileContent = fs.readFileSync(CONVERSATIONS_FILE, "utf8");
    const storedConversations = JSON.parse(fileContent);

    return new Map(Object.entries(storedConversations));
  } catch (error) {
    console.warn("Could not load conversation memory. Starting with empty memory.", {
      message: error.message
    });

    return new Map();
  }
}

function persistConversations() {
  try {
    fs.mkdirSync(DATA_DIRECTORY, { recursive: true });

    const storedConversations = Object.fromEntries(conversations);

    fs.writeFileSync(
      CONVERSATIONS_FILE,
      JSON.stringify(storedConversations, null, 2)
    );
  } catch (error) {
    console.error("Could not persist conversation memory:", {
      message: error.message
    });
  }
}

export function saveMessage(phone, role, content) {
  if (!conversations.has(phone)) {
    conversations.set(phone, []);
  }

  const message = {
    role,
    content,
    timestamp: new Date().toISOString()
  };

  const conversation = conversations.get(phone);

  conversation.push(message);
  conversations.set(phone, conversation.slice(-MAX_STORED_MESSAGES));

  persistConversations();
}

export function getConversationHistory(phone) {
  const conversation = conversations.get(phone) || [];

  return conversation.slice(-MAX_HISTORY_MESSAGES);
}
