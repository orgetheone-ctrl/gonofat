import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export function UnlinkCardPage() {
  const [confirmed, setConfirmed] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  return (
    <section className="screen unlink-screen">
      <div className="unlink-hero">
        <span className="bundle-badge">Управление автоплатежами GONOFAT</span>
        <h1>Отвязка карты</h1>
        <p className="lead">
          На этой странице пользователь может отключить сохраненную карту и остановить будущие автоплатежи.
        </p>
      </div>

      <Card className="subscription-card">
        <p className="card-label">Текущий статус</p>
        <div className="subscription-status">
          <div>
            <span>Подписка</span>
            <strong>{isRemoved ? 'Автоплатежи отключены' : 'Активна'}</strong>
          </div>
          <div>
            <span>Сохраненная карта</span>
            <strong>{isRemoved ? 'Удалена' : 'МИР •••• 4288'}</strong>
          </div>
          <div>
            <span>Следующее списание</span>
            <strong>{isRemoved ? 'Не запланировано' : '77 руб. · 04.07.2026'}</strong>
          </div>
        </div>
      </Card>

      <Card className="unlink-card">
        <h2>Удалить карту из автоплатежей</h2>
        <p>
          После удаления карты новые рекуррентные списания по подписке GONOFAT выполняться не будут. Уже оплаченный
          период доступа сохранится до окончания оплаченного срока.
        </p>

        <label className="unlink-confirm">
          <input type="checkbox" checked={confirmed} disabled={isRemoved} onChange={(event) => setConfirmed(event.target.checked)} />
          <span>Я подтверждаю удаление сохраненной карты и отключение будущих автоплатежей.</span>
        </label>

        <Button disabled={!confirmed || isRemoved} onClick={() => setIsRemoved(true)}>
          {isRemoved ? 'Карта удалена' : 'Удалить карту'}
        </Button>
      </Card>

      <Card className="unlink-note">
        <h2>Если возник вопрос</h2>
        <p>
          Напишите в поддержку: <a href="mailto:orgetheone@gmail.com">orgetheone@gmail.com</a>. Мы поможем проверить
          статус подписки и отвязки карты.
        </p>
      </Card>
    </section>
  );
}
