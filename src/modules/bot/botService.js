import { loadScenario, findStep } from '../scenario/scenarioService.js';
import { sendMessage } from './maxClient.js';

const sessions = new Map();

function extractChatId(update) {
  return (
    update?.chat_id ||
    update?.message?.recipient?.chat_id ||
    update?.message?.chat?.id ||
    update?.callback?.message?.recipient?.chat_id ||
    update?.callback_query?.message?.chat?.id ||
    update?.chatId ||
    null
  );
}

function extractText(update) {
  return (
    update?.message?.body?.text ||
    update?.message?.text ||
    update?.text ||
    ''
  );
}

function extractCallbackPayload(update) {
  return (
    update?.callback?.payload ||
    update?.callback?.button?.payload ||
    update?.callback_query?.data ||
    update?.payload ||
    ''
  );
}

function toButtons(step) {
  return (step.buttons || []).map((button) => {
    if (button.type === 'url') {
      return {
        type: 'url',
        text: button.text,
        url: button.url || ''
      };
    }

    return {
      type: 'callback',
      text: button.text,
      payload: `step:${button.target}`
    };
  });
}

async function sendStart(chatId) {
  const scenario = loadScenario();
  const startStep = scenario.steps.find((step) => step.id === scenario.startStepId);

  if (startStep) {
    await sendMessage(chatId, startStep.text || '', toButtons(startStep));
  }
}

export async function handleWebhook(update) {
  console.log('[webhook] update received:', JSON.stringify({
    update_type: update?.update_type,
    chat_id: extractChatId(update),
    text: extractText(update),
    callback: extractCallbackPayload(update)
  }));

  const chatId = extractChatId(update);
  if (!chatId) {
    console.warn('[webhook] chat_id was not found in update');
    return;
  }

  const text = extractText(update).trim();
  const callbackPayload = extractCallbackPayload(update);

  if (callbackPayload.startsWith('step:')) {
    const nextId = callbackPayload.replace('step:', '');
    const step = findStep(nextId);
    if (!step) {
      console.warn(`[webhook] step was not found: ${nextId}`);
      return;
    }

    sessions.set(chatId, nextId);
    await sendMessage(chatId, step.text || '', toButtons(step));
    return;
  }

  if (!sessions.has(chatId) || text === '/start' || update?.update_type === 'bot_started') {
    const scenario = loadScenario();
    sessions.set(chatId, scenario.startStepId);
    await sendStart(chatId);
  }
}
