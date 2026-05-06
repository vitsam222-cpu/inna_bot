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


## Обновление на VDS одной командой

1. На VDS в папке проекта сделайте скрипт исполняемым:

```bash
chmod +x deploy.sh
```

2. Запускайте обновление так:

```bash
./deploy.sh
```

Можно переопределить параметры:

```bash
APP_DIR=/opt/inna_bot BRANCH=main PM2_NAME=max-bot ./deploy.sh
```



## Самый простой режим без домена: Long Polling

Для старта используйте **Long Polling**. В этом режиме MAX не должен заходить на ваш сервер по webhook. Бот сам спрашивает MAX о новых сообщениях. Поэтому не нужен домен, HTTPS и Nginx.

В `.env` поставьте:

```env
BOT_MODE=polling
MAX_API_BASE=https://platform-api.max.ru
MAX_BOT_TOKEN=your_real_token
```

Запуск:

```bash
pm2 restart max-bot
pm2 logs max-bot --lines 100
```

В логах должно появиться:

```text
[polling] started
```

Админка при этом открывается по IP:

```text
http://YOUR_SERVER_IP:8080/admin?key=YOUR_ADMIN_KEY
```

Webhook можно не настраивать. Он оставлен в коде на будущее, если позже появится домен или HTTPS.

## Если бот не отвечает

Чаще всего причина одна из этих:

1. В `.env` должен быть API MAX:

```env
MAX_API_BASE=https://platform-api.max.ru
```

2. Вебхук MAX работает только по HTTPS на 443 порту. URL должен быть вида:

```text
https://your-domain.com/webhook/max
```

3. Нужно создать подписку на события MAX:

```bash
curl -X POST "https://platform-api.max.ru/subscriptions" \
  -H "Authorization: $MAX_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-domain.com/webhook/max","update_types":["message_created","message_callback","bot_started"]}'
```

4. Проверить, что подписка есть:

```bash
curl -X GET "https://platform-api.max.ru/subscriptions" \
  -H "Authorization: $MAX_BOT_TOKEN"
```

5. Проверить локально, что webhook-ручка отвечает:

```bash
curl -X POST "http://127.0.0.1:8080/webhook/max" \
  -H "Content-Type: application/json" \
  -d '{"update_type":"message_created","message":{"recipient":{"chat_id":123},"body":{"text":"/start"}}}'
```

Если в `.env` нет токена, сервер напишет в логах `MAX_BOT_TOKEN is empty, message was not sent`. Это нормально для локальной проверки без реального токена.

## Можно ли оставить IP вместо домена

Коротко: **да, можно попробовать через IP, но webhook MAX всё равно должен быть HTTPS**.

Не сработает:

```text
http://YOUR_SERVER_IP:8080/webhook/max
```

Можно попробовать:

```text
https://YOUR_SERVER_IP/webhook/max
```

Для этого на VDS нужно поставить Nginx на 443 порт и самоподписанный SSL-сертификат.

### Вариант через IP и самоподписанный HTTPS

1. Установить Nginx:

```bash
apt update
apt install -y nginx openssl
```

2. Создать папку для сертификата:

```bash
mkdir -p /etc/nginx/ssl
```

3. Создать самоподписанный сертификат для IP:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/inna_bot.key \
  -out /etc/nginx/ssl/inna_bot.crt \
  -subj "/CN=YOUR_SERVER_IP"
```

4. Создать конфиг Nginx:

```bash
nano /etc/nginx/sites-available/inna_bot
```

Вставить, заменив `YOUR_SERVER_IP` на IP сервера:

```nginx
server {
    listen 443 ssl;
    server_name YOUR_SERVER_IP;

    ssl_certificate /etc/nginx/ssl/inna_bot.crt;
    ssl_certificate_key /etc/nginx/ssl/inna_bot.key;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

5. Включить конфиг:

```bash
ln -sf /etc/nginx/sites-available/inna_bot /etc/nginx/sites-enabled/inna_bot
nginx -t
systemctl reload nginx
```

6. В `.env` поставить:

```env
BASE_URL=https://YOUR_SERVER_IP
MAX_API_BASE=https://platform-api.max.ru
```

7. Перезапустить бота:

```bash
pm2 restart max-bot
```

8. Webhook URL для MAX будет:

```text
https://YOUR_SERVER_IP/webhook/max
```

9. Проверить снаружи:

```bash
curl -k -X POST "https://YOUR_SERVER_IP/webhook/max" \
  -H "Content-Type: application/json" \
  -d '{"update_type":"message_created","message":{"recipient":{"chat_id":123},"body":{"text":"/start"}}}'
```

Если ответ `ok`, значит сервер принимает webhook по HTTPS.

Важно: самоподписанный сертификат может работать для webhook по документации MAX, но браузер будет показывать предупреждение безопасности. Для нормальной админки без предупреждений лучше потом подключить домен и бесплатный Let's Encrypt SSL.


## Почему `https://IP:8080/webhook/max` не открывается

Адрес вида `https://IP:8080/webhook/max` обычно не откроется, потому что Node.js приложение слушает на 8080 **обычный HTTP**, а не HTTPS.

Для проверки самого приложения используйте:

```text
http://YOUR_SERVER_IP:8080/health
```

Или webhook-ручку в браузере:

```text
http://YOUR_SERVER_IP:8080/webhook/max
```

Для MAX webhook нужен HTTPS. Без отдельного домена самый простой вариант — поставить Nginx на 443 порт и проксировать на приложение:

```text
https://YOUR_SERVER_IP/webhook/max -> http://127.0.0.1:8080/webhook/max
```

Обратите внимание: в HTTPS варианте порт `8080` в адресе не нужен. Правильно:

```text
https://YOUR_SERVER_IP/webhook/max
```

Неправильно:

```text
https://YOUR_SERVER_IP:8080/webhook/max
```
