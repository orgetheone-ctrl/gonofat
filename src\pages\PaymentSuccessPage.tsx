import { Button } from '../components/Button';

type PaymentSuccessPageProps = {
  onRead: () => void;
};

export function PaymentSuccessPage({ onRead }: PaymentSuccessPageProps) {
  const handlePdfClick = () => {
    window.alert('PDF будет подключён позже');
  };

  return (
    <section className="screen screen--center">
      <div className="success-mark">✓</div>
      <h1>Оплата прошла успешно ✅</h1>
      <p className="lead">Доступ к инструкции открыт.</p>
      <div className="button-stack">
        <Button onClick={onRead}>Читать инструкцию</Button>
        <Button variant="secondary" onClick={handlePdfClick}>
          Скачать PDF
        </Button>
      </div>
    </section>
  );
}
