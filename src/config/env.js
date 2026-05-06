import fs from 'node:fs';

function loadEnvFile() {
  if (!fs.existsSync('.env')) return;
  const raw = fs.readFileSync('.env', 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile();

export const env = {
  port: Number(process.env.PORT || 8080),
  baseUrl: process.env.BASE_URL || 'http://localhost:8080',
  maxToken: process.env.MAX_BOT_TOKEN || '',
  maxApiBase: process.env.MAX_API_BASE || 'https://platform-api.max.ru',
  adminKey: process.env.ADMIN_KEY || 'change_me',
  dataDir: process.env.DATA_DIR || './data',
  uploadDir: process.env.UPLOAD_DIR || './src/public/uploads'
};
