export type QuestionOption = {
  label: string;
  value: string;
};

export type ChoiceQuestion = {
  id: 'gender' | 'goal' | 'activity' | 'steps' | 'barrier';
  type: 'choice';
  title: string;
  options: QuestionOption[];
};

export type NumberQuestion = {
  id: 'age' | 'height' | 'weight';
  type: 'number';
  title: string;
  hint?: string;
  min: number;
  max: number;
  unit?: string;
  error: string;
};

export type QuizQuestion = ChoiceQuestion | NumberQuestion;

export const questions: QuizQuestion[] = [
  {
    id: 'gender',
    type: 'choice',
    title: 'Ваш пол?',
    options: [
      { label: 'Женщина', value: 'female' },
      { label: 'Мужчина', value: 'male' },
    ],
  },
  {
    id: 'age',
    type: 'number',
    title: 'Сколько вам лет?',
    min: 14,
    max: 80,
    error: 'Введите возраст от 14 до 80 лет',
  },
  {
    id: 'height',
    type: 'number',
    title: 'Ваш рост?',
    hint: 'в сантиметрах',
    min: 120,
    max: 220,
    unit: 'см',
    error: 'Введите рост от 120 до 220 см',
  },
  {
    id: 'weight',
    type: 'number',
    title: 'Ваш текущий вес?',
    hint: 'в килограммах',
    min: 35,
    max: 250,
    unit: 'кг',
    error: 'Введите вес от 35 до 250 кг',
  },
  {
    id: 'goal',
    type: 'choice',
    title: 'Какая у вас цель?',
    options: [
      { label: 'Похудеть', value: 'lose' },
      { label: 'Подтянуть тело', value: 'tone' },
      { label: 'Удерживать вес', value: 'maintain' },
    ],
  },
  {
    id: 'activity',
    type: 'choice',
    title: 'Какой у вас уровень активности?',
    options: [
      { label: 'Почти не двигаюсь', value: 'low' },
      { label: 'Иногда гуляю', value: 'medium' },
      { label: 'Активный образ жизни', value: 'high' },
    ],
  },
  {
    id: 'steps',
    type: 'choice',
    title: 'Сколько шагов в день у вас сейчас примерно?',
    options: [
      { label: 'Меньше 3000', value: 'under3000' },
      { label: '3000-6000', value: '3000to6000' },
      { label: '6000+', value: '6000plus' },
    ],
  },
  {
    id: 'barrier',
    type: 'choice',
    title: 'Что мешает похудению больше всего?',
    options: [
      { label: 'Нет системы', value: 'noSystem' },
      { label: 'Переедаю', value: 'overeating' },
      { label: 'Люблю сладкое', value: 'sweet' },
      { label: 'Не понимаю что есть', value: 'foodChoice' },
      { label: 'Часто срываюсь', value: 'breakdowns' },
    ],
  },
];
