# AutoSlot Frontend

Frontend AutoSlot на Next.js 16. Для production-развёртывания требуется Node.js 24 и доступный по HTTPS AutoSlot API.

## Локальный запуск

1. Скопируйте `.env.example` в `.env.local`.
2. Укажите адрес локального backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5108/api/
```

3. Установите зависимости и запустите приложение:

```bash
npm ci
npm run dev
```

## Production build

```bash
npm ci
npm run lint
npm run build
npm run start
```

## Развёртывание на Vercel

Репозиторий содержит frontend в подпапке `autoslot`, поэтому при импорте Git-репозитория установите:

```text
Root Directory: autoslot
Framework Preset: Next.js
Node.js Version: 24.x
```

В Vercel → Project Settings → Environment Variables добавьте для Production и Preview:

```env
API_PROXY_TARGET=https://your-api-domain.example/api
```

Не добавляйте `NEXT_PUBLIC_API_URL` в Vercel при использовании proxy. Браузер будет обращаться к `/api`, а Vercel перенаправит запрос к `API_PROXY_TARGET`. Это сохраняет HttpOnly auth-cookie first-party для frontend-домена и не раскрывает адрес backend в клиентской конфигурации.

`API_PROXY_TARGET` должен:

- использовать HTTPS;
- заканчиваться базовым API path (`/api`);
- быть доступен из интернета;
- не указывать на `localhost`.

После изменения environment variables создайте новый deployment: публичные переменные Next.js фиксируются во время сборки.

### Альтернативный прямой режим

Можно не задавать `API_PROXY_TARGET`, а указать:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.example/api/
```

В этом режиме backend обязан разрешать точный frontend origin с credentials, а auth-cookie должны корректно работать между выбранными доменами. Для текущих cookie с `SameSite=Lax` надёжнее использовать рекомендуемый same-origin proxy либо frontend/backend на поддоменах одного site.

## Проверка перед deployment

```bash
npm ci
npm run lint
npm run build
git diff --check
```

Production-сборка на Vercel намеренно завершается ошибкой, если не задан ни `API_PROXY_TARGET`, ни HTTPS `NEXT_PUBLIC_API_URL`, либо если production API указывает на localhost/HTTP.
