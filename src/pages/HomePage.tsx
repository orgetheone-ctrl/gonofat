import { Button } from '../components/Button';
import { Card } from '../components/Card';

type HomePageProps = {
  onStart: () => void;
};

export function HomePage({ onStart }: HomePageProps) {
  return (
    <section className="screen home">
      <div className="home__content">
        <div className="brand-mark">GO</div>
        <p className="home__eyebrow">Диагностика питания</p>
        <h1>Персональный план снижения веса без жесткой диеты</h1>
        <p className="lead">Пройдите тест и получите расчет калорий, сценарий на 30 дней и доступ к системе поддержки.</p>
        <Card className="benefits">
          <p>Расчет калоража под ваш вес и активность</p>
          <p>План питания без сложных рецептов</p>
          <p>Telegram-бот с чек-листом и напоминаниями</p>
        </Card>
        <div className="home-proof">
          <span>3 инструмента</span>
          <span>Разовая оплата</span>
          <span>Чек на email</span>
        </div>
      </div>
      <div className="home__actions">
        <Button onClick={onStart}>Пройти тест</Button>
        <p className="small-muted">Займет 3-4 минуты</p>
      </div>
    </section>
  );
}
