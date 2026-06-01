import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const rootDir = process.cwd();
const distDir = resolve(rootDir, 'dist');

loadEnv();

const port = Number(process.env.PORT || 8790);

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
        value: '490.00',
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
              value: '490.00',
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
