import { Button } from '../components/Button';
import { ResultCard } from '../components/ResultCard';

type ResultPageProps = {
  caloriesMin: number;
  caloriesMax: number;
  onContinue: () => void;
};

export function ResultPage({ caloriesMin, caloriesMax, onContinue }: ResultPageProps) {
  return (
    <section className="screen">
      <h1>Ваш стартовый план готов</h1>
      <div className="result-list">
        <ResultCard title="Калораж" text={`Примерно ${caloriesMin}-${caloriesMax} ккал в день`} />
        <ResultCard title="Активность" text="Минимум 6000 шагов ежедневно" />
        <ResultCard title="Питание" text="Выбирать продукты до 4-5% жирности" />
      </div>
      <p className="body-text">
        Это база, с которой можно начать снижать вес без жёстких диет и изнурительных тренировок.
      </p>
      <Button onClick={onContinue}>Получить полную инструкцию</Button>
    </section>
  );
}
