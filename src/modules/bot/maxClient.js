import { env } from '../../config/env.js';

function buildKeyboard(buttons) {
  if (!buttons.length) return [];

  return [
    {
      type: 'inline_keyboard',
      payload: {
        buttons: buttons.map((button) => [button])
      }
    }
  ];
}

function toMaxButton(button) {
  if (button.type === 'url') {
    return {
      type: 'link',
      text: button.text,
      url: button.url
    };
  }

  return {
    type: 'callback',
    text: button.text,
    payload: button.payload
  };
}

export async function sendMessage(chatId, text, buttons = []) {
  if (!env.maxToken) {
    console.warn('[max] MAX_BOT_TOKEN is empty, message was not sent');
    return { skipped: true };
  }

  const url = new URL('/messages', env.maxApiBase);
  url.searchParams.set('chat_id', String(chatId));

  const payload = {
    text,
    attachments: buildKeyboard(buttons.map(toMaxButton))
  };

  console.log(`[max] sending message to chat_id=${chatId}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: env.maxToken,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`MAX API error: ${res.status} ${body}`);
  }

  return body ? JSON.parse(body) : {};
}
