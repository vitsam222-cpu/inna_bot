import fs from 'node:fs';

export function readJson(path, fallback) {
  try {
    if (!fs.existsSync(path)) return fallback;
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

export function writeJson(path, payload) {
  fs.writeFileSync(path, JSON.stringify(payload, null, 2), 'utf8');
}
