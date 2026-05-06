import fs from 'node:fs';
import path from 'node:path';
import { readJson, writeJson } from '../../core/utils/json.js';
import { env } from '../../config/env.js';

const scenarioPath = path.join(env.dataDir, 'scenario.json');

const defaultScenario = {
  startStepId: 'start',
  welcome: { text: 'Привет! Добро пожаловать.', image: '' },
  steps: [
    { id: 'start', text: 'Это первый шаг', image: '', buttons: [] }
  ]
};

export function initStorage() {
  fs.mkdirSync(env.dataDir, { recursive: true });
  fs.mkdirSync(env.uploadDir, { recursive: true });
  if (!fs.existsSync(scenarioPath)) writeJson(scenarioPath, defaultScenario);
}

export function getScenario() {
  return readJson(scenarioPath, defaultScenario);
}

export function saveScenario(data) {
  writeJson(scenarioPath, data);
}
