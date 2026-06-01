import { useEffect, useState } from 'react';

const messages = [
  'Анализируем ответы...',
  'Рассчитываем калораж...',
  'Подбираем рекомендации...',
  'Формируем ваш стартовый план...',
];

type LoaderScreenProps = {
  onComplete: () => void;
};

export function LoaderScreen({ onComplete }: LoaderScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const messageTimer = window.setInterval(() => {
      setMessageIndex((current) => Math.min(current + 1, messages.length - 1));
    }, 850);

    const completeTimer = window.setTimeout(onComplete, 3600);

    return () => {
      window.clearInterval(messageTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <section className="screen screen--center">
      <div className="loader" aria-hidden="true" />
      <h1>{messages[messageIndex]}</h1>
      <p className="muted">Готовим персональные ориентиры без строгих диет.</p>
    </section>
  );
}
