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
        <p className="home__eyebrow">Персональный план</p>
        <h1>Минус 7кг без диет за 1 месяц</h1>
        <p className="lead">Инструкция из 3 шагов без жестких ограничений</p>
        <Card className="benefits">
          <p>Расчитаем необходимый калораж</p>
          <p>Научимся выбирать продукты</p>
          <p>Подберем активность без похода в зал</p>
        </Card>
      </div>
      <div className="home__actions">
        <Button onClick={onStart}>ПОЛУЧИТЬ ПЛАН</Button>
        <p className="small-muted">Займет около 1 минуты</p>
      </div>
    </section>
  );
}
