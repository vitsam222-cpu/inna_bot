# MAX Bot MVP

MVP-бот для мессенджера MAX с веб-админкой:
- приветственное сообщение;
- сценарии из шагов (текст + картинка + кнопки);
- переходы по шагам по ID;
- URL-кнопки;
- визуальный редактор графа.

## Запуск

1. Скопируйте `.env.example` в `.env`.
2. Запустите:

```bash
npm run start
```

3. Откройте:
- Админка: `http://localhost:8080/admin?key=ADMIN_KEY`
- Webhook: `POST /webhook/max`

## Деплой на VDS (самый простой для новичка)

1. Установить `nodejs` 22+ и `git`.
2. Склонировать репозиторий, заполнить `.env`.
3. Запустить `node src/index.js` для проверки.
4. Установить `pm2` и запустить в фоне:

```bash
npm i -g pm2
pm2 start src/index.js --name max-bot
pm2 save
pm2 startup
```

5. (Опционально) поставить Nginx как reverse proxy на порт 8080.

## Структура

- `src/modules/bot` — входящие апдейты и отправка в MAX API.
- `src/modules/scenario` — бизнес-логика шагов/переходов.
- `src/modules/admin` — HTML админка.
- `src/modules/storage` — файловое хранилище JSON.
- `src/public` — статика и загруженные файлы.
