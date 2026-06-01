import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const rootDir = process.cwd();
const distDir = resolve(rootDir, 'dist');
const dataDir = resolve(rootDir, 'data');
const botUsersPath = join(dataDir, 'bot-users.json');

loadEnv();

const port = Number(process.env.PORT || 8790);
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || '';
const telegramWebhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET || '';
const telegramBotUrl = process.env.TELEGRAM_BOT_URL || '';
const appOrigin = process.env.APP_ORIGIN || process.env.YOOKASSA_RETURN_URL?.replace(/\?.*$/, '') || '';

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host}`);

    if (request.method === 'GET' && url.pathname === '/api/health') {
      return sendJson(response, 200, { ok: true });
    }

    if (request.method === 'POST' && url.pathname === '/api/create-payment') {
      return createPayment(request, response);
    }

    if (request.method === 'GET' && url.pathname === '/api/payment-status') {
      return getPaymentStatus(url, response);
    }

    if (request.method === 'GET' && url.pathname === '/api/product-links') {
      return sendJson(response, 200, {
        botUrl: telegramBotUrl,
      });
    }

    if (request.method === 'POST' && url.pathname === `/api/telegram/webhook/${telegramWebhookSecret}`) {
      return telegramWebhook(request, response);
    }

    if (url.pathname.startsWith('/api/')) {
      return sendJson(response, 404, { message: 'API route not found' });
    }

    return serveStatic(url.pathname, response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return sendJson(response, 500, { message });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});

setInterval(sendDueTelegramReminders, 60 * 1000).unref();

async function createPayment(request, response) {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  if (!shopId || !secretKey) {
    return sendJson(response, 500, {
      message: 'Не заданы YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY',
    });
  }

  const body = await readJson(request);
  const email = typeof body.email === 'string' ? body.email.trim() : '';

  if (!isValidEmail(email)) {
    return sendJson(response, 400, {
      message: 'Введите корректный email для чека',
    });
  }

  const fallbackOrigin = request.headers.origin || `http://localhost:${port}`;
  const returnUrl = process.env.YOOKASSA_RETURN_URL || body.returnUrl || `${fallbackOrigin}/?payment=success`;
  const productDescription = 'Инструкция "Минус 7кг без диет за 1 месяц"';

  const paymentResponse = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
      'Content-Type': 'application/json',
      'Idempotence-Key': randomUUID(),
    },
    body: JSON.stringify({
      amount: {
        value: '10.00',
        currency: 'RUB',
      },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: returnUrl,
      },
      description: productDescription,
      receipt: {
        customer: {
          email,
        },
        items: [
          {
            description: productDescription,
            quantity: '1.00',
            amount: {
              value: '10.00',
              currency: 'RUB',
            },
            vat_code: 1,
            payment_subject: 'service',
            payment_mode: 'full_payment',
          },
        ],
      },
      metadata: {
        product: 'minus-7kg-guide',
      },
    }),
  });

  const payment = await paymentResponse.json();

  if (!paymentResponse.ok) {
    return sendJson(response, paymentResponse.status, {
      message: payment.description || payment.message || 'ЮKassa отклонила создание платежа',
    });
  }

  return sendJson(response, 200, {
    paymentId: payment.id,
    status: payment.status,
    confirmationUrl: payment.confirmation?.confirmation_url,
  });
}

async function getPaymentStatus(url, response) {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  const paymentId = url.searchParams.get('id');

  if (!shopId || !secretKey) {
    return sendJson(response, 500, {
      message: 'Не заданы YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY',
    });
  }

  if (!paymentId) {
    return sendJson(response, 400, {
      message: 'Не передан номер платежа',
    });
  }

  const paymentResponse = await fetch(`https://api.yookassa.ru/v3/payments/${encodeURIComponent(paymentId)}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
  });

  const payment = await paymentResponse.json();

  if (!paymentResponse.ok) {
    return sendJson(response, paymentResponse.status, {
      message: payment.description || payment.message || 'Не удалось проверить платеж',
    });
  }

  return sendJson(response, 200, {
    paymentId: payment.id,
    status: payment.status,
    paid: payment.paid === true || payment.status === 'succeeded',
  });
}

async function telegramWebhook(request, response) {
  if (!telegramBotToken || !telegramWebhookSecret) {
    return sendJson(response, 500, { ok: false, message: 'Telegram bot is not configured' });
  }

  const update = await readJson(request);
  const telegramResponse = await handleTelegramUpdate(update);

  if (telegramResponse) {
    return sendJson(response, 200, telegramResponse);
  }

  return sendJson(response, 200, { ok: true });
}

async function handleTelegramUpdate(update) {
  if (update.callback_query) {
    const callback = update.callback_query;
    const chatId = callback.message?.chat?.id;
    const data = callback.data;

    if (!chatId || !data) {
      return;
    }

    await answerCallbackQuery(callback.id);

    if (data.startsWith('done:')) {
      await markChecklistItem(chatId, data.slice(5));
      return sendToday(chatId);
    }

    if (data.startsWith('remind:')) {
      return setReminder(chatId, data.slice(7));
    }

    if (data === 'today') {
      return sendToday(chatId);
    }

    if (data === 'progress') {
      return sendProgress(chatId);
    }
  }

  const message = update.message;
  const chatId = message?.chat?.id;
  const text = typeof message?.text === 'string' ? message.text.trim() : '';

  if (!chatId) {
    return;
  }

  ensureBotUser(chatId, message.from);

  if (text === '/start') {
    return sendWelcome(chatId);
  }

  if (text === '/today' || text === 'Сегодня') {
    return sendToday(chatId);
  }

  if (text === '/progress' || text === 'Прогресс') {
    return sendProgress(chatId);
  }

  if (text === '/reminders' || text === 'Напоминания') {
    return sendReminderSettings(chatId);
  }

  if (text === '/help') {
    return sendHelp(chatId);
  }

  return sendMessage(chatId, 'Выберите действие ниже или отправьте /today, чтобы открыть чек-лист на сегодня.', mainKeyboard());
}

function ensureBotUser(chatId, from = {}) {
  const users = readBotUsers();
  const id = String(chatId);

  if (!users[id]) {
    users[id] = {
      chatId,
      firstName: from.first_name || '',
      startedAt: new Date().toISOString(),
      reminderHour: 9,
      checklist: {},
      lastReminderDate: '',
    };
  } else if (from.first_name && users[id].firstName !== from.first_name) {
    users[id].firstName = from.first_name;
  }

  writeBotUsers(users);
  return users[id];
}

async function sendWelcome(chatId) {
  ensureBotUser(chatId);
  return sendMessage(
    chatId,
    [
      'Добро пожаловать в Gonofat.',
      '',
      'Я буду напоминать о простых действиях и помогать вести ежедневный чек-лист.',
      'Начните с кнопки "Сегодня".',
    ].join('\n'),
    mainKeyboard(),
  );
}

async function sendHelp(chatId) {
  return sendMessage(
    chatId,
    [
      'Что я умею:',
      '',
      '/today - чек-лист на сегодня',
      '/progress - прогресс за 7 дней',
      '/reminders - настройка напоминаний',
      '',
      'Цель не в идеальности, а в том, чтобы каждый день сделать минимум.',
    ].join('\n'),
    mainKeyboard(),
  );
}

async function sendToday(chatId) {
  const users = readBotUsers();
  const user = users[String(chatId)] || ensureBotUser(chatId);
  const today = getMoscowDateKey();
  const checklist = getChecklistForDate(user, today);
  const lines = [
    `Чек-лист на сегодня (${today}):`,
    '',
    `${checklist.water ? '✅' : '⬜'} Вода`,
    `${checklist.food ? '✅' : '⬜'} Питание по плану`,
    `${checklist.steps ? '✅' : '⬜'} Шаги или прогулка`,
    `${checklist.plan ? '✅' : '⬜'} Отметить день без самокритики`,
  ];

  return sendMessage(chatId, lines.join('\n'), checklistKeyboard(checklist));
}

async function markChecklistItem(chatId, item) {
  const allowedItems = new Set(['water', 'food', 'steps', 'plan']);

  if (!allowedItems.has(item)) {
    return;
  }

  const users = readBotUsers();
  const user = users[String(chatId)] || ensureBotUser(chatId);
  const today = getMoscowDateKey();
  const checklist = getChecklistForDate(user, today);
  checklist[item] = !checklist[item];
  users[String(chatId)] = user;
  writeBotUsers(users);
}

async function sendProgress(chatId) {
  const users = readBotUsers();
  const user = users[String(chatId)] || ensureBotUser(chatId);
  const dates = getLastMoscowDates(7);
  const rows = dates.map((date) => {
    const checklist = getChecklistForDate(user, date);
    const count = ['water', 'food', 'steps', 'plan'].filter((item) => checklist[item]).length;
    return `${date}: ${count}/4`;
  });

  return sendMessage(chatId, ['Прогресс за 7 дней:', '', ...rows].join('\n'), mainKeyboard());
}

async function sendReminderSettings(chatId) {
  return sendMessage(
    chatId,
    'Выберите время ежедневного напоминания. Время указано по Москве.',
    {
      inline_keyboard: [
        [
          { text: '09:00', callback_data: 'remind:9' },
          { text: '12:00', callback_data: 'remind:12' },
          { text: '18:00', callback_data: 'remind:18' },
        ],
        [{ text: 'Выключить', callback_data: 'remind:off' }],
      ],
    },
  );
}

async function setReminder(chatId, value) {
  const users = readBotUsers();
  const user = users[String(chatId)] || ensureBotUser(chatId);

  if (value === 'off') {
    user.reminderHour = null;
    writeBotUsers(users);
    return sendMessage(chatId, 'Напоминания выключены.', mainKeyboard());
  }

  const hour = Number(value);

  if (![9, 12, 18].includes(hour)) {
    return sendMessage(chatId, 'Не удалось выбрать это время.', mainKeyboard());
  }

  user.reminderHour = hour;
  user.lastReminderDate = '';
  writeBotUsers(users);
  return sendMessage(chatId, `Готово. Буду напоминать каждый день в ${String(hour).padStart(2, '0')}:00 по Москве.`, mainKeyboard());
}

async function sendDueTelegramReminders() {
  if (!telegramBotToken) {
    return;
  }

  const now = new Date();
  const moscowHour = (now.getUTCHours() + 3) % 24;
  const today = getMoscowDateKey(now);
  const users = readBotUsers();
  let changed = false;

  for (const user of Object.values(users)) {
    if (user.reminderHour === null || user.reminderHour === undefined) {
      continue;
    }

    if (user.reminderHour !== moscowHour || user.lastReminderDate === today) {
      continue;
    }

    user.lastReminderDate = today;
    changed = true;
    await sendTelegramApi('sendMessage', {
      chat_id: user.chatId,
      text: 'Мягкое напоминание: отметьте сегодняшний чек-лист. Даже 1 пункт лучше, чем ноль.',
      reply_markup: checklistKeyboard(getChecklistForDate(user, today)),
      disable_web_page_preview: true,
    });
  }

  if (changed) {
    writeBotUsers(users);
  }
}

async function sendTelegramApi(method, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    await fetch(`https://api.telegram.org/bot${telegramBotToken}/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch {
    // Some VPS networks block outgoing Telegram API calls. Interactive bot
    // replies still work through webhook responses.
  } finally {
    clearTimeout(timeout);
  }
}

function mainKeyboard() {
  return {
    keyboard: [['Сегодня', 'Прогресс'], ['Напоминания']],
    resize_keyboard: true,
  };
}

function checklistKeyboard(checklist) {
  return {
    inline_keyboard: [
      [{ text: `${checklist.water ? '✅' : '⬜'} Вода`, callback_data: 'done:water' }],
      [{ text: `${checklist.food ? '✅' : '⬜'} Питание по плану`, callback_data: 'done:food' }],
      [{ text: `${checklist.steps ? '✅' : '⬜'} Шаги`, callback_data: 'done:steps' }],
      [{ text: `${checklist.plan ? '✅' : '⬜'} Без самокритики`, callback_data: 'done:plan' }],
      [{ text: 'Прогресс за 7 дней', callback_data: 'progress' }],
    ],
  };
}

function getChecklistForDate(user, date) {
  if (!user.checklist) {
    user.checklist = {};
  }

  if (!user.checklist[date]) {
    user.checklist[date] = {
      water: false,
      food: false,
      steps: false,
      plan: false,
    };
  }

  return user.checklist[date];
}

function sendMessage(chatId, text, replyMarkup) {
  return {
    method: 'sendMessage',
    chat_id: chatId,
    text,
    reply_markup: replyMarkup,
    disable_web_page_preview: true,
  };
}

function answerCallbackQuery(callbackQueryId) {
  if (!callbackQueryId) {
    return null;
  }

  return {
    method: 'answerCallbackQuery',
    callback_query_id: callbackQueryId,
  };
}

function readBotUsers() {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  if (!existsSync(botUsersPath)) {
    return {};
  }

  try {
    return JSON.parse(readFileSync(botUsersPath, 'utf8'));
  } catch {
    return {};
  }
}

function writeBotUsers(users) {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  writeFileSync(botUsersPath, JSON.stringify(users, null, 2));
}

function getMoscowDateKey(date = new Date()) {
  const moscow = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  return moscow.toISOString().slice(0, 10);
}

function getLastMoscowDates(days) {
  const dates = [];
  const now = new Date();

  for (let index = days - 1; index >= 0; index -= 1) {
    dates.push(getMoscowDateKey(new Date(now.getTime() - index * 24 * 60 * 60 * 1000)));
  }

  return dates;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function serveStatic(pathname, response) {
  const normalizedPath = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
  const filePath = resolve(join(distDir, normalizedPath));
  const safeDistDir = `${distDir}${process.platform === 'win32' ? '\\' : '/'}`;
  const targetPath = existsSync(filePath) && filePath.startsWith(safeDistDir) ? filePath : join(distDir, 'index.html');
  const contentType = mimeTypes[extname(targetPath)] || 'application/octet-stream';

  if (!existsSync(targetPath)) {
    return sendJson(response, 404, { message: 'Сначала выполните npm run build' });
  }

  response.writeHead(200, { 'Content-Type': contentType });
  response.end(readFileSync(targetPath));
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolveJson, reject) => {
    let rawBody = '';

    request.on('data', (chunk) => {
      rawBody += chunk;
    });

    request.on('end', () => {
      try {
        resolveJson(rawBody ? JSON.parse(rawBody) : {});
      } catch {
        reject(new Error('Некорректный JSON в запросе'));
      }
    });

    request.on('error', reject);
  });
}

function loadEnv() {
  const envPath = join(rootDir, '.env');

  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
