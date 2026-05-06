import { env } from '../../config/env.js';
import { handleWebhook } from './botService.js';
import { getUpdates } from './maxClient.js';

const RETRY_DELAY_MS = 5000;
let isRunning = false;
let marker = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function startPolling() {
  if (isRunning) return;

  isRunning = true;
  console.log('[polling] started');
  pollLoop();
}

async function pollLoop() {
  while (isRunning) {
    if (!env.maxToken) {
      console.warn('[polling] MAX_BOT_TOKEN is empty, waiting before retry');
      await sleep(RETRY_DELAY_MS);
      continue;
    }

    try {
      const page = await getUpdates({
        marker,
        limit: env.pollingLimit,
        timeout: env.pollingTimeoutSeconds,
        types: ['message_created', 'message_callback', 'bot_started']
      });

      marker = page.marker ?? marker;

      for (const update of page.updates || []) {
        await handleWebhook(update);
      }
    } catch (error) {
      console.error('[polling] error:', error.message);
      await sleep(RETRY_DELAY_MS);
    }
  }
}
