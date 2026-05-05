import { env } from '../../config/env.js';

export async function sendMessage(chatId, text, buttons = []) {
  if (!env.maxToken) return { skipped: true };
  const payload = {
    chat_id: chatId,
    text,
    inline_keyboard: buttons.map((b) => [{ text: b.text, callback_data: b.value }])
  };

  const res = await fetch(`${env.maxApiBase}/messages/send?access_token=${env.maxToken}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MAX API error: ${res.status} ${err}`);
  }
  return res.json().catch(() => ({}));
}
