import { useEffect, useMemo, useState } from 'react';

const messages = [
  'Анализируем профиль',
  'Считаем калораж',
  'Определяем слабые места',
  'Собираем чек-лист',
  'Активируем промокод',
];

type LoaderScreenProps = {
  onComplete: () => void;
};

export function LoaderScreen({ onComplete }: LoaderScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressTimer = window.setInterval(() => {
      setProgress((current) => Math.min(100, current + 4));
    }, 120);

    const completeTimer = window.setTimeout(onComplete, 3300);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const activeIndex = useMemo(() => Math.min(messages.length - 1, Math.floor(progress / 22)), [progress]);

  return (
    <section className="screen screen--center analysis-screen">
      <div className="loader" aria-hidden="true" />
      <h1>Составляем ваш план...</h1>
      <p className="muted">Сверяем ответы и подбираем стартовый сценарий без жесткой диеты.</p>
      <div className="analysis-progress">
        <div>
          <span style={{ width: `${progress}%` }} />
        </div>
        <strong>{progress}%</strong>
      </div>
      <div className="analysis-list">
        {messages.map((message, index) => (
          <p className={index <= activeIndex ? 'is-active' : ''} key={message}>
            {message}
          </p>
        ))}
      </div>
    </section>
  );
}
