import type { ChoiceQuestion } from '../data/questions';
import { ProgressBar } from './ProgressBar';

type QuizStepProps = {
  question: ChoiceQuestion;
  step: number;
  total: number;
  onSelect: (value: string) => void;
};

export function QuizStep({ question, step, total, onSelect }: QuizStepProps) {
  return (
    <section className="screen screen--quiz">
      <ProgressBar value={step} total={total} />
      <p className="step-count">
        {question.section || 'Профиль'} · Шаг {step} из {total}
      </p>
      <h1>{question.title}</h1>
      {question.subtitle && <p className="muted">{question.subtitle}</p>}
      <div className="option-list">
        {question.options.map((option) => (
          <button className="quiz-option" key={option.value} type="button" onClick={() => onSelect(option.value)}>
            <strong>{option.label}</strong>
            {option.description && <span>{option.description}</span>}
          </button>
        ))}
      </div>
    </section>
  );
}
