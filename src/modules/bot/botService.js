import { loadScenario, findStep } from '../scenario/scenarioService.js';
import { sendMessage } from './maxClient.js';

const sessions = new Map();

function extractChatId(update) {
  return (
    update?.message?.chat?.id ||
    update?.callback_query?.message?.chat?.id ||
    update?.chat_id ||
    update?.chatId ||
    null
  );
}

function extractText(update) {
  return (
    update?.message?.text ||
    update?.message?.body?.text ||
    update?.text ||
    ''
  );
}

function toButtons(step) {
  return (step.buttons || []).map((b) => ({
    text: b.text,
    value: b.type === 'step' ? `step:${b.target}` : `url:${b.url || ''}`
  }));
}

async function sendWelcome(chatId) {
  const scenario = loadScenario();
  const welcomeText = scenario?.welcome?.text || 'Привет!';
  await sendMessage(chatId, welcomeText, []);
}

export async function handleWebhook(update) {
  const chatId = extractChatId(update);
  if (!chatId) return;

  const text = extractText(update).trim();

  // Базовый MVP: первое сообщение пользователя -> приветствие.
  if (!sessions.has(chatId)) {
    sessions.set(chatId, 'start');
    await sendWelcome(chatId);
    return;
  }

  // Явный перезапуск диалога.
  if (text === '/start') {
    sessions.set(chatId, 'start');
    await sendWelcome(chatId);
    return;
  }

  const cb = update?.callback_query?.data;
  if (!cb) return;

  if (cb.startsWith('step:')) {
    const nextId = cb.replace('step:', '');
    const step = findStep(nextId);
    if (!step) return;
    sessions.set(chatId, nextId);
    await sendMessage(chatId, step.text || '', toButtons(step));
  }
}
