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
        <p className="home__eyebrow">Персональный план от GONOFAT</p>
        <h1>-7 кг за 14-30 дней</h1>
        <p className="lead">Пройдите тест и получите персональный план снижения веса без жесткой диеты.</p>
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
        <Button onClick={onStart}>Получить персональный план</Button>
        <p className="small-muted">Займет 3-4 минуты</p>
      </div>
    </section>
  );
}
