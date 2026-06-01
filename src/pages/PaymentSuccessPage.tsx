import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

type PaymentSuccessPageProps = {
  onRead: () => void;
};

type PaymentCheck = 'checking' | 'paid' | 'pending' | 'error';

const notifierBotUrl = '';
const checklistBotUrl = '';

export function PaymentSuccessPage({ onRead }: PaymentSuccessPageProps) {
  const [paymentCheck, setPaymentCheck] = useState<PaymentCheck>('checking');
  const [message, setMessage] = useState('Проверяем оплату...');

  useEffect(() => {
    const paymentId = window.localStorage.getItem('gonofatPaymentId');

    if (!paymentId) {
      setPaymentCheck('error');
      setMessage('Не нашли номер платежа. Если оплата прошла, напишите в поддержку.');
      return;
    }

    let isMounted = true;
    const checkedPaymentId = paymentId;

    async function checkPayment() {
      try {
        const response = await fetch(`/api/payment-status?id=${encodeURIComponent(checkedPaymentId)}`);
        const data = (await response.json()) as { paid?: boolean; status?: string; message?: string };

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setPaymentCheck('error');
          setMessage(data.message || 'Не удалось проверить оплату.');
          return;
        }

        if (data.paid) {
          setPaymentCheck('paid');
          setMessage('Оплата подтверждена. Доступ открыт.');
          return;
        }

        setPaymentCheck('pending');
        setMessage(`Платеж пока в статусе: ${data.status || 'ожидает подтверждения'}. Обновите страницу через минуту.`);
      } catch {
        if (isMounted) {
          setPaymentCheck('error');
          setMessage('Не удалось связаться с сервером проверки оплаты.');
        }
      }
    }

    checkPayment();

    return () => {
      isMounted = false;
    };
  }, []);

  const isPaid = paymentCheck === 'paid';

  return (
    <section className="screen access-screen">
      <div className="success-mark">✓</div>
      <h1>{isPaid ? 'Доступ открыт' : 'Проверяем оплату'}</h1>
      <p className="lead">{message}</p>

      <div className="access-list">
        <Card className="access-card">
          <span className="section-number">1</span>
          <h2>Инструкция</h2>
          <p>Пошаговый план питания, меню, правила выбора продуктов и чек-лист на старт.</p>
          <Button onClick={onRead} disabled={!isPaid}>
            Читать инструкцию
          </Button>
        </Card>

        <Card className="access-card">
          <span className="section-number">2</span>
          <h2>Бот-уведомлятор</h2>
          <p>Напоминания, которые помогают держать режим и не выпадать из процесса.</p>
          <Button
            disabled={!isPaid || !notifierBotUrl}
            onClick={() => {
              if (notifierBotUrl) {
                window.location.href = notifierBotUrl;
              }
            }}
          >
            Открыть бота
          </Button>
        </Card>

        <Card className="access-card">
          <span className="section-number">3</span>
          <h2>Бот чек-лист</h2>
          <p>Ежедневные задания и отметки прогресса, чтобы видеть движение к результату.</p>
          <Button
            disabled={!isPaid || !checklistBotUrl}
            onClick={() => {
              if (checklistBotUrl) {
                window.location.href = checklistBotUrl;
              }
            }}
          >
            Открыть чек-лист
          </Button>
        </Card>
      </div>

      {isPaid && (!notifierBotUrl || !checklistBotUrl) && (
        <p className="small-muted">Ссылки на ботов будут добавлены после подключения Telegram-ботов.</p>
      )}
    </section>
  );
}
