import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

type SalesPageProps = {
  onPay: () => Promise<void> | void;
};

const items = [
  'как рассчитать свой калораж',
  'как читать этикетки',
  'какие продукты выбирать',
  'пример меню на день',
  'чек-лист на 7 дней',
  'трекер веса и шагов',
];

export function SalesPage({ onPay }: SalesPageProps) {
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    try {
      setError('');
      setIsPaying(true);
      await onPay();
    } catch (payError) {
      setError(payError instanceof Error ? payError.message : 'Не удалось перейти к оплате');
      setIsPaying(false);
    }
  };

  return (
    <section className="screen">
      <h1>Ваша инструкция готова</h1>
      <p className="lead">"Минус 7кг без диет за 1 месяц"</p>
      <Card className="sale-card">
        <p className="card-label">Внутри инструкции:</p>
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
      <div className="price">490 ₽</div>
      {error && <p className="field-error">{error}</p>}
      <Button onClick={handlePay} disabled={isPaying}>
        {isPaying ? 'Переходим к оплате...' : 'Оплатить и получить доступ'}
      </Button>
    </section>
  );
}
