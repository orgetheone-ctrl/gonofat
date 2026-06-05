import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { goals, trackGoal } from '../utils/metrika';

type SalesPageProps = {
  onPay: (email: string) => Promise<void> | void;
};

const products = [
  {
    title: 'План питания на 30 дней',
    text: 'Что есть, как держать калории и как собирать простые приемы пищи без жестких запретов.',
  },
  {
    title: 'Ежедневные напоминания',
    text: 'Бот помогает не забывать про воду, приемы пищи, шаги и маленькие действия, которые держат режим.',
  },
  {
    title: 'Чек-лист прогресса',
    text: 'Отмечаете выполненные шаги и видите, что реально двигаетесь к результату каждый день.',
  },
];

const proofPoints = [
  'Доступ открывается сразу после оплаты',
  'Email нужен только для чека и восстановления доступа',
  'Можно начать сегодня: без закупок, марафонов и сложных рецептов',
];

const deliveryItems = [
  'PDF-инструкция с планом питания и правилами на каждый день',
  'Telegram-бот с чек-листом: вода, питание, шаги, день без самокритики',
  'Напоминания в выбранное время и прогресс за 7 дней',
  'Чек на email и поддержка, если что-то не открылось',
];

const steps = [
  'Оплачиваете один раз',
  'Получаете инструкцию и ссылки на ботов',
  'Следуете подсказкам каждый день',
];

const faqItems = [
  {
    question: 'Это подписка?',
    answer: 'Нет. Сейчас это разовая оплата 77 руб. за доступ к инструкции и боту.',
  },
  {
    question: 'Когда я получу доступ?',
    answer: 'Сразу после успешной оплаты вы вернетесь на страницу доступа с инструкцией и ссылкой на бота.',
  },
  {
    question: 'Нужно ли сидеть на жесткой диете?',
    answer: 'Нет. Фокус на понятной системе: калории, простые продукты, вода, шаги и ежедневная отметка прогресса.',
  },
  {
    question: 'Что если доступ не открылся?',
    answer: 'Напишите в поддержку на orgetheone@gmail.com. Поможем восстановить доступ или вернем оплату.',
  },
];

const offerDurationSeconds = 30 * 60;

function formatTimer(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const restSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(restSeconds).padStart(2, '0')}`;
}

export function SalesPage({ onPay }: SalesPageProps) {
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(offerDurationSeconds);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const handlePay = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError('');

      if (!email.trim()) {
        setError('Введите email для чека и доступа');
        return;
      }

      setIsPaying(true);
      await onPay(email.trim());
    } catch (payError) {
      setError(payError instanceof Error ? payError.message : 'Не удалось перейти к оплате');
      setIsPaying(false);
    }
  };

  return (
    <section className="screen">
      <div className="sales-hero">
        <span className="bundle-badge">Ваш план после расчета</span>
        <h1>30-дневный план снижения веса без жесткой диеты</h1>
        <p className="lead">
          Получите понятный маршрут: что есть, сколько держать по калориям и как не сорваться в первые недели.
        </p>
      </div>

      <Card className="sale-card sale-card--accent">
        <p className="card-label">Что будет внутри доступа:</p>
        <div className="product-list">
          {products.map((product, index) => (
            <article className="product-item" key={product.title}>
              <span>{index + 1}</span>
              <div>
                <h2>{product.title}</h2>
                <p>{product.text}</p>
              </div>
            </article>
          ))}
        </div>
      </Card>

      <Card className="trust-card">
        <p className="card-label">Перед оплатой важно знать:</p>
        <div className="trust-list">
          {proofPoints.map((point) => (
            <p key={point}>{point}</p>
          ))}
        </div>
      </Card>

      <Card className="delivery-card">
        <h2>Что получите сразу после оплаты</h2>
        <div className="delivery-list">
          {deliveryItems.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </Card>

      <Card className="bot-preview-card">
        <div>
          <p className="card-label">Как выглядит бот</p>
          <h2>Не просто файл, а ежедневное сопровождение</h2>
          <p>
            Бот помогает вернуться к плану без давления: отметили пункты, увидели прогресс и пошли дальше.
          </p>
        </div>
        <div className="bot-preview" aria-label="Пример чек-листа в Telegram-боте">
          <div className="bot-message">
            <strong>Чек-лист на сегодня</strong>
            <span>✅ Вода</span>
            <span>✅ Питание по плану</span>
            <span>⬜ Шаги или прогулка</span>
            <span>✅ Без самокритики</span>
          </div>
          <div className="bot-buttons">
            <span>✅ Вода</span>
            <span>✅ Питание</span>
            <span>⬜ Шаги</span>
            <span>Прогресс за 7 дней</span>
          </div>
        </div>
      </Card>

      <Card className="how-card">
        <p className="card-label">Как это работает:</p>
        <div className="how-list">
          {steps.map((step, index) => (
            <div className="how-item" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="honest-card">
        <h2>Без обещаний “минус 10 кг за неделю”</h2>
        <p>
          Мы не продаем чудо-таблетку и не обещаем одинаковый результат всем. Продукт дает простую систему, которая
          помогает держать питание, движение и ежедневный контроль без жестких запретов.
        </p>
      </Card>

      <Card className="delivery-card">
        <h2>Без риска</h2>
        <p>
          Если после оплаты поймете, что формат вам не подходит, напишите в поддержку в течение 24 часов, и мы вернем
          оплату.
        </p>
      </Card>

      <Card className="seller-card">
        <p className="card-label">Оплата и продавец</p>
        <div className="seller-grid">
          <p>
            <strong>Продавец</strong>
            ИП Погребняк Сергей Викторович
          </p>
          <p>
            <strong>ИНН</strong>
            165715246098
          </p>
          <p>
            <strong>Оплата</strong>
            Защищенная страница ЮKassa, чек придет на email
          </p>
          <p>
            <strong>Поддержка</strong>
            orgetheone@gmail.com
          </p>
        </div>
      </Card>

      <div className="offer-row">
        <div className="price">
          <span className="old-price">345 руб.</span>
          <span className="new-price">77 руб.</span>
        </div>
        <div className="countdown" aria-label="До конца предложения">
          <span>Цена действует еще</span>
          <strong>{formatTimer(secondsLeft)}</strong>
        </div>
      </div>

      <form className="payment-form" onSubmit={handlePay}>
        <label className="email-field">
          <span>Email для чека и доступа</span>
          <input
            type="email"
            value={email}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isPaying}
            required
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <p className="small-muted">После нажатия вы перейдете на защищенную страницу оплаты ЮKassa.</p>
        {error && <p className="field-error">{error}</p>}
        <Button type="submit" disabled={isPaying}>
          {isPaying ? 'Открываем оплату...' : 'Получить доступ за 77 руб.'}
        </Button>
        <div className="faq-list">
          {faqItems.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
        <p className="legal-consent">
          Нажимая кнопку оплаты, вы принимаете <a href="/offer">публичную оферту</a>, соглашаетесь с{' '}
          <a href="/privacy">политикой конфиденциальности</a> и даете{' '}
          <a href="/personal-data">согласие на обработку персональных данных</a>.
        </p>
        <p className="support-link">
          Есть вопрос?{' '}
          <a href="mailto:orgetheone@gmail.com?subject=Поддержка%20Gonofat" onClick={() => trackGoal(goals.supportClick)}>
            Напишите в поддержку
          </a>
        </p>
      </form>
    </section>
  );
}
