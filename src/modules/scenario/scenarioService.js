import { getScenario, saveScenario } from '../storage/fileStore.js';

export function loadScenario() {
  return getScenario();
}

export function updateScenario(next) {
  const stepIds = new Set(next.steps.map((s) => s.id));
  for (const step of next.steps) {
    for (const btn of step.buttons || []) {
      if (btn.type === 'step' && !stepIds.has(btn.target)) {
        throw new Error(`Кнопка ссылается на неизвестный шаг: ${btn.target}`);
      }
    }
  }
  saveScenario(next);
  return next;
}

export function findStep(id) {
  return loadScenario().steps.find((s) => s.id === id);
}
