import { useState } from 'react';
import type { NumberQuestion } from '../data/questions';
import { Button } from './Button';
import { ProgressBar } from './ProgressBar';

type InputStepProps = {
  question: NumberQuestion;
  step: number;
  total: number;
  onSubmit: (value: number) => void;
};

export function InputStep({ question, step, total, onSubmit }: InputStepProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue) || numericValue < question.min || numericValue > question.max) {
      setError(question.error);
      return;
    }

    setError('');
    onSubmit(numericValue);
  };

  return (
    <section className="screen screen--quiz">
      <ProgressBar value={step} total={total} />
      <p className="step-count">
        {question.section || 'Профиль'} · Шаг {step} из {total}
      </p>
      <h1>{question.title}</h1>
      {question.subtitle && <p className="muted">{question.subtitle}</p>}
      {question.hint && <p className="muted">{question.hint}</p>}
      <label className="number-field">
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={question.unit ? `0 ${question.unit}` : '0'}
          type="number"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSubmit();
            }
          }}
        />
      </label>
      {error && <p className="field-error">{error}</p>}
      <Button onClick={handleSubmit}>Продолжить</Button>
    </section>
  );
}
