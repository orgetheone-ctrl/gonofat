type ProgressBarProps = {
  value: number;
  total: number;
};

export function ProgressBar({ value, total }: ProgressBarProps) {
  const progress = Math.min(100, Math.max(0, (value / total) * 100));

  return (
    <div className="progress" aria-label={`Шаг ${value} из ${total}`}>
      <div className="progress__fill" style={{ width: `${progress}%` }} />
    </div>
  );
}
