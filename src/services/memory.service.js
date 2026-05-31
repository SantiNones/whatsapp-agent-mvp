const conversations = new Map();
const MAX_HISTORY_MESSAGES = 12;

export function saveMessage(phone, role, content) {
  if (!conversations.has(phone)) {
    conversations.set(phone, []);
  }

  const message = {
    role,
    content,
    timestamp: new Date().toISOString()
  };

  conversations.get(phone).push(message);
}

export function getConversationHistory(phone) {
  const conversation = conversations.get(phone) || [];

  return conversation.slice(-MAX_HISTORY_MESSAGES);
}
