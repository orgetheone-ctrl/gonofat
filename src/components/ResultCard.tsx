import { Card } from './Card';

type ResultCardProps = {
  title: string;
  text: string;
};

export function ResultCard({ title, text }: ResultCardProps) {
  return (
    <Card className="result-card">
      <h2>{title}</h2>
      <p>{text}</p>
    </Card>
  );
}
