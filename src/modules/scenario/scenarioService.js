import { getScenario, saveScenario } from '../storage/fileStore.js';

function normalizeScenario(scenario) {
  const steps = Array.isArray(scenario.steps) ? scenario.steps : [];
  return {
    startStepId: scenario.startStepId || steps[0]?.id || 'start',
    welcome: scenario.welcome || { text: '', image: '' },
    steps
  };
}

export function loadScenario() {
  return normalizeScenario(getScenario());
}

export function updateScenario(next) {
  const scenario = normalizeScenario(next);
  const stepIds = new Set(scenario.steps.map((s) => s.id));

  if (!stepIds.has(scenario.startStepId)) {
    throw new Error(`Стартовый шаг не найден: ${scenario.startStepId}`);
  }

  for (const step of scenario.steps) {
    for (const btn of step.buttons || []) {
      if (btn.type === 'step' && !stepIds.has(btn.target)) {
        throw new Error(`Кнопка ссылается на неизвестный шаг: ${btn.target}`);
      }
    }
  }

  saveScenario(scenario);
  return scenario;
}

export function findStep(id) {
  return loadScenario().steps.find((s) => s.id === id);
}
