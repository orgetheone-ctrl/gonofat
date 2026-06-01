import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { goals, trackGoal } from '../utils/metrika';

type SalesPageProps = {
  onPay: (email: string) => Promise<void> | void;
};

const products = [
  {
    title: 'Инструкция',
    text: 'Пошаговый план питания без жестких диет: калораж, продукты, меню и правила на каждый день.',
  },
  {
    title: 'Бот-уведомлятор',
    text: 'Напоминает о воде, приемах пищи, шагах и маленьких действиях, которые держат вас в процессе.',
  },
  {
    title: 'Бот чек-лист',
    text: 'Помогает отмечать ежедневные задания и видеть, что вы реально двигаетесь к результату.',
  },
];

const steps = [
  'Оплачиваете один раз',
  'Получаете доступ к 3 инструментам',
  'Следуете подсказкам каждый день',
];

export function SalesPage({ onPay }: SalesPageProps) {
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  const handlePay = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError('');

      if (!email.trim()) {
        setError('Введите email для чека');
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
      <h1>3 инструмента для снижения веса</h1>
      <p className="lead">По одной цене вы получаете инструкцию и двух ботов, которые помогают не сорваться после покупки.</p>
      <div className="bundle-badge">Инструкция + бот-уведомлятор + бот чек-лист</div>
      <Card className="sale-card">
        <p className="card-label">Что входит в доступ:</p>
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
      <Card className="delivery-card">
        <h2>После оплаты</h2>
        <p>Вы вернетесь на страницу доступа, где будут инструкция и ссылки на ботов. Чек придет на email, который вы укажете ниже.</p>
      </Card>
      <div className="price">345 ₽</div>
      <p className="small-muted">Одна оплата открывает все 3 инструмента сразу.</p>
      <form className="payment-form" onSubmit={handlePay}>
        <label className="email-field">
          <span>Email для чека</span>
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
        {error && <p className="field-error">{error}</p>}
        <Button type="submit" disabled={isPaying}>
          {isPaying ? 'Переходим к оплате...' : 'Оплатить и получить доступ'}
        </Button>
        <p className="legal-consent">
          Нажимая кнопку оплаты, вы принимаете <a href="/offer">публичную оферту</a>, соглашаетесь с{' '}
          <a href="/privacy">политикой конфиденциальности</a> и даете{' '}
          <a href="/personal-data">согласие на обработку персональных данных</a>.
        </p>
        <p className="support-link">
          Возник вопрос?{' '}
          <a href="mailto:orgetheone@gmail.com?subject=Поддержка%20Gonofat" onClick={() => trackGoal(goals.supportClick)}>
            Напишите в поддержку
          </a>
        </p>
      </form>
    </section>
  );
}
