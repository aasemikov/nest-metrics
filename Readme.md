Это моя библиотека nest-monitor

## Конфигурация

Создайте файл `.nestmonitor` в корне проекта:

```js
// .nestmonitor
module.exports = {
  enabled: true,
  host: '127.0.0.1',
  port: 3000,
  timeoutMs: 5000,
  logSuccess: true,
  logErrors: true
};

## Соглашение об именах файлов
Для эндпоинта с путём /api/users/:id -> файл:
```
api-users-id.test.ts
```