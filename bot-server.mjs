import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const port = Number(process.env.PORT || 3000);
const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET || '';
const isPollingEnabled = process.env.TELEGRAM_POLLING === 'true';
const dataDir = resolve(process.cwd(), 'data');
const botUsersPath = join(dataDir, 'bot-users.json');

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host}`);

    if (request.method === 'GET' && url.pathname === '/health') {
      return sendJson(response, 200, { ok: true });
    }

    if (request.method === 'POST' && url.pathname === `/telegram/webhook/${webhookSecret}`) {
      const update = await readJson(request);
      const telegramResponse = handleTelegramUpdate(update);
      return sendJson(response, 200, telegramResponse || { ok: true });
    }

    return sendJson(response, 404, { message: 'Not found' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return sendJson(response, 500, { message });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Bot server is running on http://localhost:${port}`);
});

setInterval(sendDueTelegramReminders, 60 * 1000).unref();

if (isPollingEnabled) {
  startPolling();
}

function handleTelegramUpdate(update) {
  if (update.callback_query) {
    const callback = update.callback_query;
    const chatId = callback.message?.chat?.id;
    const messageId = callback.message?.message_id;
    const data = callback.data;

    if (!chatId || !data) {
      return null;
    }

    if (data.startsWith('done:')) {
      markChecklistItem(chatId, data.slice(5));
      return todayMessage(chatId, messageId);
    }

    if (data.startsWith('remind:')) {
      return setReminder(chatId, data.slice(7));
    }

    if (data === 'today') {
      return todayMessage(chatId, messageId);
    }

    if (data === 'progress') {
      return progressMessage(chatId, messageId);
    }
  }

  const message = update.message;
  const chatId = message?.chat?.id;
  const text = typeof message?.text === 'string' ? message.text.trim() : '';

  if (!chatId) {
    return null;
  }

  ensureBotUser(chatId, message.from);

  if (text === '/start') {
    return sendMessage(chatId, [
      'Добро пожаловать в Gonofat.',
      '',
      'Я буду напоминать о простых действиях и помогать вести ежедневный чек-лист.',
      'Начните с кнопки "Сегодня".',
    ].join('\n'), mainKeyboard());
  }

  if (text === '/today' || text === 'Сегодня') {
    return todayMessage(chatId);
  }

  if (text === '/progress' || text === 'Прогресс') {
    return progressMessage(chatId);
  }

  if (text === '/reminders' || text === 'Напоминания') {
    return reminderSettingsMessage(chatId);
  }

  if (text === '/help') {
    return sendMessage(chatId, [
      'Что я умею:',
      '',
      '/today - чек-лист на сегодня',
      '/progress - прогресс за 7 дней',
      '/reminders - настройка напоминаний',
    ].join('\n'), mainKeyboard());
  }

  return sendMessage(chatId, 'Выберите действие ниже или отправьте /today.', mainKeyboard());
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

function todayMessage(chatId, messageId) {
  const users = readBotUsers();
  const user = users[String(chatId)] || ensureBotUser(chatId);
  const today = getMoscowDateKey();
  const checklist = getChecklistForDate(user, today);

  return upsertMessage(chatId, messageId, [
    `Чек-лист на сегодня (${today}):`,
    '',
    `${checklist.water ? '✅' : '⬜'} Вода`,
    `${checklist.food ? '✅' : '⬜'} Питание по плану`,
    `${checklist.steps ? '✅' : '⬜'} Шаги или прогулка`,
    `${checklist.plan ? '✅' : '⬜'} День без самокритики`,
  ].join('\n'), checklistKeyboard(checklist));
}

function markChecklistItem(chatId, item) {
  const allowedItems = new Set(['water', 'food', 'steps', 'plan']);

  if (!allowedItems.has(item)) {
    return;
  }

  const users = readBotUsers();
  const user = users[String(chatId)] || ensureBotUser(chatId);
  const checklist = getChecklistForDate(user, getMoscowDateKey());
  checklist[item] = !checklist[item];
  users[String(chatId)] = user;
  writeBotUsers(users);
}

function progressMessage(chatId, messageId) {
  const users = readBotUsers();
  const user = users[String(chatId)] || ensureBotUser(chatId);
  const rows = getLastMoscowDates(7).map((date) => {
    const checklist = getChecklistForDate(user, date);
    const count = ['water', 'food', 'steps', 'plan'].filter((item) => checklist[item]).length;
    return `${date}: ${count}/4`;
  });

  return upsertMessage(chatId, messageId, ['Прогресс за 7 дней:', '', ...rows].join('\n'), {
    inline_keyboard: [[{ text: 'Вернуться к чек-листу', callback_data: 'today' }]],
  });
}

function reminderSettingsMessage(chatId) {
  return sendMessage(chatId, 'Выберите время ежедневного напоминания. Время указано по Москве.', {
    inline_keyboard: [
      [
        { text: '09:00', callback_data: 'remind:9' },
        { text: '12:00', callback_data: 'remind:12' },
        { text: '18:00', callback_data: 'remind:18' },
      ],
      [{ text: 'Выключить', callback_data: 'remind:off' }],
    ],
  });
}

function setReminder(chatId, value) {
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
  if (!botToken) {
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

    const isSent = await sendTelegramApi('sendMessage', {
      chat_id: user.chatId,
      text: 'Мягкое напоминание: отметьте сегодняшний чек-лист. Даже 1 пункт лучше, чем ноль.',
      reply_markup: checklistKeyboard(getChecklistForDate(user, today)),
      disable_web_page_preview: true,
    });

    if (isSent) {
      user.lastReminderDate = today;
      changed = true;
    }
  }

  if (changed) {
    writeBotUsers(users);
  }
}

async function sendTelegramApi(method, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    // Ignore reminder delivery errors; interactive webhook replies continue.
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function startPolling() {
  if (!botToken) {
    console.log('TELEGRAM_BOT_TOKEN is not configured');
    return;
  }

  await sendTelegramApi('deleteWebhook', { drop_pending_updates: true });

  let offset = 0;

  while (true) {
    try {
      const updatesResponse = await fetch(
        `https://api.telegram.org/bot${botToken}/getUpdates?timeout=25&offset=${offset}`,
      );
      const updates = await updatesResponse.json();

      if (Array.isArray(updates.result)) {
        for (const update of updates.result) {
          offset = update.update_id + 1;
          const telegramResponse = handleTelegramUpdate(update);

          if (telegramResponse?.method) {
            const { method, ...payload } = telegramResponse;
            await sendTelegramApi(method, payload);
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Polling error';
      console.log(message);
      await wait(3000);
    }
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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

function upsertMessage(chatId, messageId, text, replyMarkup) {
  if (!messageId) {
    return sendMessage(chatId, text, replyMarkup);
  }

  return {
    method: 'editMessageText',
    chat_id: chatId,
    message_id: messageId,
    text,
    reply_markup: replyMarkup,
    disable_web_page_preview: true,
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
