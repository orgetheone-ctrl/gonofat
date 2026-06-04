import { Button } from '../components/Button';
import { Card } from '../components/Card';

type ResultPageProps = {
  caloriesMin: number;
  caloriesMax: number;
  answers: {
    age?: number;
    weight?: number;
    desiredWeight?: number;
    goal?: string;
    activity?: string;
    barrier?: string;
    support?: string;
  };
  onContinue: () => void;
};

const goalLabels: Record<string, string> = {
  lose: 'снизить вес',
  tone: 'подтянуть тело',
  maintain: 'удерживать вес',
};

const barrierLabels: Record<string, string> = {
  noSystem: 'нет понятной системы',
  overeating: 'вечернее переедание',
  sweet: 'тяга к сладкому',
  foodChoice: 'сложно выбирать еду',
  breakdowns: 'частые срывы',
};

const supportLabels: Record<string, string> = {
  guide: 'готовый план питания',
  reminders: 'напоминания',
  checklist: 'чек-лист',
  all: 'план, бот и чек-лист',
};

export function ResultPage({ caloriesMin, caloriesMax, answers, onContinue }: ResultPageProps) {
  const targetDelta =
    answers.weight && answers.desiredWeight ? Math.max(0, Math.round(answers.weight - answers.desiredWeight)) : null;
  const targetText = targetDelta && targetDelta > 0 ? `-${targetDelta} кг` : 'стабильный режим';

  return (
    <section className="screen result-screen">
      <div className="result-hero">
        <span className="bundle-badge">Программа составлена</span>
        <h1>Ваш 30-дневный план готов</h1>
        <p className="lead">
          Мы учли ваши ответы и собрали стартовую систему: питание, ежедневные действия и поддержку через Telegram.
        </p>
      </div>

      <Card className="personal-card">
        <div className="personal-before-after">
          <div>
            <span>Сейчас</span>
            <strong>{answers.weight ? `${answers.weight} кг` : 'старт'}</strong>
          </div>
          <div>
            <span>Цель</span>
            <strong>{answers.desiredWeight ? `${answers.desiredWeight} кг` : targetText}</strong>
          </div>
        </div>
        <div className="result-metrics">
          <p>
            <strong>{caloriesMin}-{caloriesMax}</strong>
            ккал в день
          </p>
          <p>
            <strong>{targetText}</strong>
            ориентир
          </p>
          <p>
            <strong>30 дней</strong>
            первый цикл
          </p>
        </div>
      </Card>

      <Card className="profile-card">
        <p className="card-label">Ваш профиль</p>
        <div className="profile-grid">
          <p>
            <strong>Возраст</strong>
            {answers.age ? `${answers.age} лет` : 'учтен'}
          </p>
          <p>
            <strong>Цель</strong>
            {answers.goal ? goalLabels[answers.goal] || 'снижение веса' : 'снижение веса'}
          </p>
          <p>
            <strong>Главное препятствие</strong>
            {answers.barrier ? barrierLabels[answers.barrier] || 'нет системы' : 'нет системы'}
          </p>
          <p>
            <strong>Что поможет</strong>
            {answers.support ? supportLabels[answers.support] || 'план и чек-лист' : 'план и чек-лист'}
          </p>
        </div>
      </Card>

      <Card className="scenario-card">
        <h2>Ваш сценарий на первые 30 дней</h2>
        <div className="scenario-list">
          <p>
            <strong>Неделя 1</strong>
            Разобраться с калоражем, водой и простыми приемами пищи.
          </p>
          <p>
            <strong>Неделя 2</strong>
            Убрать хаос в питании и закрепить ежедневный чек-лист.
          </p>
          <p>
            <strong>Неделя 3</strong>
            Подключить шаги и мягко снизить риск срывов.
          </p>
          <p>
            <strong>Неделя 4</strong>
            Стабилизировать режим и увидеть прогресс за 7 дней.
          </p>
        </div>
      </Card>

      <Card className="promo-card">
        <p className="card-label">Персональный доступ активирован</p>
        <h2>Инструкция + Telegram-бот + чек-лист</h2>
        <p>Один комплект, который помогает не просто прочитать план, а выполнять его каждый день.</p>
        <Button onClick={onContinue}>Открыть доступ со скидкой</Button>
      </Card>
    </section>
  );
}
