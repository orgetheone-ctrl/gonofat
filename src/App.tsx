import { useCallback, useMemo, useState } from 'react';
import { InputStep } from './components/InputStep';
import { LoaderScreen } from './components/LoaderScreen';
import { QuizStep } from './components/QuizStep';
import { questions } from './data/questions';
import { HomePage } from './pages/HomePage';
import { InstructionPage } from './pages/InstructionPage';
import { LegalPage } from './pages/LegalPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { ResultPage } from './pages/ResultPage';
import { SalesPage } from './pages/SalesPage';
import { calculateCalories } from './utils/calculateCalories';

type Screen = 'home' | 'quiz' | 'analysis' | 'result' | 'sales' | 'success' | 'instruction';
type LegalRoute = 'offer' | 'privacy' | 'personal-data';

type QuizAnswers = {
  gender?: 'female' | 'male';
  age?: number;
  height?: number;
  weight?: number;
  goal?: string;
  activity?: 'low' | 'medium' | 'high';
  steps?: string;
  barrier?: string;
};

const totalQuestions = questions.length;

function App() {
  const legalRoute = getLegalRoute();

  const [screen, setScreen] = useState<Screen>(() => {
    const paymentStatus = new URLSearchParams(window.location.search).get('payment');
    return paymentStatus === 'success' ? 'success' : 'home';
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  const calorieResult = useMemo(() => {
    if (!answers.gender || !answers.age || !answers.height || !answers.weight || !answers.activity) {
      return null;
    }

    return calculateCalories({
      gender: answers.gender,
      age: answers.age,
      height: answers.height,
      weight: answers.weight,
      activity: answers.activity,
    });
  }, [answers]);

  const goNext = useCallback((nextAnswers: QuizAnswers) => {
    setAnswers((current) => ({ ...current, ...nextAnswers }));

    setCurrentQuestionIndex((current) => {
      const nextIndex = current + 1;

      if (nextIndex >= totalQuestions) {
        setScreen('analysis');
        return current;
      }

      return nextIndex;
    });
  }, []);

  const handlePay = useCallback(async (email: string) => {
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        returnUrl: `${window.location.origin}/?payment=success`,
      }),
    });

    const responseText = await response.text();
    let data: { confirmationUrl?: string; message?: string; paymentId?: string } = {};

    try {
      data = responseText ? (JSON.parse(responseText) as { confirmationUrl?: string; message?: string; paymentId?: string }) : {};
    } catch {
      data = {
        message: 'Сервер оплаты вернул некорректный ответ. Перезапустите сайт командой npm.cmd run dev:full',
      };
    }

    if (!response.ok || !data.confirmationUrl) {
      throw new Error(data.message || 'Сервер оплаты не отвечает. Запустите npm.cmd run dev:full');
    }

    if (data.paymentId) {
      window.localStorage.setItem('gonofatPaymentId', data.paymentId);
    }

    window.location.href = data.confirmationUrl;
  }, []);

  if (legalRoute) {
    return (
      <main className="app-shell">
        <LegalPage type={legalRoute} />
      </main>
    );
  }

  if (screen === 'home') {
    return (
      <main className="app-shell">
        <HomePage onStart={() => setScreen('quiz')} />
      </main>
    );
  }

  if (screen === 'analysis') {
    return (
      <main className="app-shell">
        <LoaderScreen onComplete={() => setScreen('result')} />
      </main>
    );
  }

  if (screen === 'result' && calorieResult) {
    return (
      <main className="app-shell">
        <ResultPage
          caloriesMin={calorieResult.caloriesMin}
          caloriesMax={calorieResult.caloriesMax}
          onContinue={() => setScreen('sales')}
        />
      </main>
    );
  }

  if (screen === 'sales') {
    return (
      <main className="app-shell">
        <SalesPage onPay={handlePay} />
      </main>
    );
  }

  if (screen === 'success') {
    return (
      <main className="app-shell">
        <PaymentSuccessPage onRead={() => setScreen('instruction')} />
      </main>
    );
  }

  if (screen === 'instruction') {
    return (
      <main className="app-shell">
        <InstructionPage />
      </main>
    );
  }

  const question = questions[currentQuestionIndex];
  const step = currentQuestionIndex + 1;

  return (
    <main className="app-shell">
      {question.type === 'choice' ? (
        <QuizStep
          question={question}
          step={step}
          total={totalQuestions}
          onSelect={(value) => goNext({ [question.id]: value })}
        />
      ) : (
        <InputStep
          key={question.id}
          question={question}
          step={step}
          total={totalQuestions}
          onSubmit={(value) => goNext({ [question.id]: value })}
        />
      )}
    </main>
  );
}

function getLegalRoute(): LegalRoute | null {
  const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');

  if (pathname === 'offer' || pathname === 'privacy' || pathname === 'personal-data') {
    return pathname;
  }

  return null;
}

export default App;
