import type { ChoiceQuestion } from '../data/questions';
import { Button } from './Button';
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
      <p className="step-count">Вопрос {step} из {total}</p>
      <h1>{question.title}</h1>
      <div className="option-list">
        {question.options.map((option) => (
          <Button key={option.value} variant="secondary" onClick={() => onSelect(option.value)}>
            {option.label}
          </Button>
        ))}
      </div>
    </section>
  );
}
