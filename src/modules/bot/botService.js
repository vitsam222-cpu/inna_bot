import { loadScenario, findStep } from '../scenario/scenarioService.js';
import { sendMessage } from './maxClient.js';

const sessions = new Map();

function toButtons(step) {
  return (step.buttons || []).map((b) => ({
    text: b.text,
    value: b.type === 'step' ? `step:${b.target}` : `url:${b.url || ''}`
  }));
}

export async function handleWebhook(update) {
  const chatId = update?.message?.chat?.id || update?.callback_query?.message?.chat?.id;
  if (!chatId) return;

  if (update?.message?.text === '/start') {
    const scenario = loadScenario();
    sessions.set(chatId, 'start');
    await sendMessage(chatId, scenario.welcome.text || 'Привет!', []);
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
