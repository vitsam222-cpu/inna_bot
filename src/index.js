import { env } from './config/env.js';
import { createServer } from './core/http/server.js';
import { initStorage } from './modules/storage/fileStore.js';

initStorage();

createServer().listen(env.port, () => {
  console.log(`MAX bot admin running on http://localhost:${env.port}`);
});
