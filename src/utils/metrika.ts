const metrikaId = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_YANDEX_METRIKA_ID;

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

export const goals = {
  quizStart: 'quiz_start',
  quizComplete: 'quiz_complete',
  resultView: 'result_view',
  salesOpen: 'sales_open',
  paymentClick: 'payment_click',
  paymentCreated: 'payment_created',
  paymentSuccess: 'payment_success',
  instructionOpen: 'instruction_open',
  supportClick: 'support_click',
} as const;

export function initMetrika() {
  if (!metrikaId || window.ym) {
    return;
  }

  const id = Number(metrikaId);

  if (!Number.isFinite(id)) {
    return;
  }

  const queuedYm = function ymQueue(...args: unknown[]) {
    queuedYm.a.push(args);
  } as ((...args: unknown[]) => void) & { a: unknown[]; l: number };

  queuedYm.a = [];
  queuedYm.l = Date.now();
  window.ym = queuedYm;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://mc.yandex.ru/metrika/tag.js';
  document.head.appendChild(script);

  window.ym(id, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
  });
}

export function trackGoal(goal: string) {
  const id = Number(metrikaId);

  if (!Number.isFinite(id) || !window.ym) {
    return;
  }

  window.ym(id, 'reachGoal', goal);
}
