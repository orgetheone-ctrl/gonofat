export type QuestionOption = {
  label: string;
  value: string;
  description?: string;
};

export type ChoiceQuestion = {
  id:
    | 'gender'
    | 'goal'
    | 'bodyType'
    | 'desiredBody'
    | 'activity'
    | 'steps'
    | 'nutrition'
    | 'barrier'
    | 'cravings'
    | 'schedule'
    | 'sleep'
    | 'stress'
    | 'resultSpeed'
    | 'motivation'
    | 'support';
  type: 'choice';
  title: string;
  subtitle?: string;
  section?: string;
  options: QuestionOption[];
};

export type NumberQuestion = {
  id: 'age' | 'height' | 'weight' | 'desiredWeight';
  type: 'number';
  title: string;
  subtitle?: string;
  hint?: string;
  section?: string;
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
    section: 'Профиль',
    title: 'Для кого собираем план?',
    subtitle: 'Так расчет калорий и рекомендации будут точнее.',
    options: [
      { label: 'Женщина', value: 'female', description: 'С учетом женской нормы калорий и темпа снижения веса' },
      { label: 'Мужчина', value: 'male', description: 'С учетом мужской нормы калорий и активности' },
    ],
  },
  {
    id: 'age',
    type: 'number',
    section: 'Профиль',
    title: 'Ваш возраст?',
    subtitle: 'Возраст влияет на расчет калорий и комфортный темп.',
    min: 14,
    max: 80,
    error: 'Введите возраст от 14 до 80 лет',
  },
  {
    id: 'height',
    type: 'number',
    section: 'Профиль',
    title: 'Ваш рост?',
    subtitle: 'Нужен для расчета базовой нормы.',
    hint: 'в сантиметрах',
    min: 120,
    max: 220,
    unit: 'см',
    error: 'Введите рост от 120 до 220 см',
  },
  {
    id: 'weight',
    type: 'number',
    section: 'Профиль',
    title: 'Ваш вес сейчас?',
    subtitle: 'Это стартовая точка, от которой строится план.',
    hint: 'в килограммах',
    min: 35,
    max: 250,
    unit: 'кг',
    error: 'Введите вес от 35 до 250 кг',
  },
  {
    id: 'desiredWeight',
    type: 'number',
    section: 'Профиль',
    title: 'Желаемый вес?',
    subtitle: 'Поможет задать реалистичную цель на ближайшие недели.',
    hint: 'в килограммах',
    min: 35,
    max: 250,
    unit: 'кг',
    error: 'Введите желаемый вес от 35 до 250 кг',
  },
  {
    id: 'goal',
    type: 'choice',
    section: 'Цель',
    title: 'Чего хотите достичь?',
    options: [
      { label: 'Снизить вес', value: 'lose', description: 'Убрать лишнее без жесткой диеты' },
      { label: 'Подтянуть тело', value: 'tone', description: 'Меньше отеков, больше легкости и формы' },
      { label: 'Удерживать вес', value: 'maintain', description: 'Навести порядок в питании без качелей' },
    ],
  },
  {
    id: 'bodyType',
    type: 'choice',
    section: 'Цель',
    title: 'Как вы описали бы себя сейчас?',
    options: [
      { label: 'Есть небольшой лишний вес', value: 'soft', description: 'Хочется подтянуть живот и бока' },
      { label: 'Вес заметно мешает', value: 'overweight', description: 'Нужна понятная система без перегруза' },
      { label: 'Вес нормальный, но нет формы', value: 'normal', description: 'Хочется больше тонуса и контроля' },
      { label: 'Вес часто скачет', value: 'unstable', description: 'Срывы и откаты мешают закрепить результат' },
    ],
  },
  {
    id: 'desiredBody',
    type: 'choice',
    section: 'Цель',
    title: 'К какому состоянию идете?',
    options: [
      { label: 'Легкость в теле', value: 'light', description: 'Меньше тяжести, проще двигаться' },
      { label: 'Минус объемы', value: 'volume', description: 'Одежда сидит свободнее' },
      { label: 'Больше контроля', value: 'control', description: 'Понимать, что есть и как не сорваться' },
      { label: 'Стабильный режим', value: 'routine', description: 'Без вечного старта с понедельника' },
    ],
  },
  {
    id: 'activity',
    type: 'choice',
    section: 'Режим',
    title: 'Какой у вас уровень активности?',
    options: [
      { label: 'Почти не двигаюсь', value: 'low', description: 'Сидячая работа, прогулок мало' },
      { label: 'Иногда гуляю', value: 'medium', description: 'Есть движение, но нерегулярно' },
      { label: 'Активный образ жизни', value: 'high', description: 'Много хожу или тренируюсь' },
    ],
  },
  {
    id: 'steps',
    type: 'choice',
    section: 'Режим',
    title: 'Сколько шагов в день сейчас примерно?',
    options: [
      { label: 'Меньше 3000', value: 'under3000', description: 'Начнем с мягкого минимума' },
      { label: '3000-6000', value: '3000to6000', description: 'Есть база, можно постепенно усилить' },
      { label: '6000+', value: '6000plus', description: 'Хороший уровень для старта' },
      { label: 'Не знаю', value: 'unknown', description: 'План покажет простой ориентир' },
    ],
  },
  {
    id: 'nutrition',
    type: 'choice',
    section: 'Питание',
    title: 'Как сейчас питаетесь?',
    options: [
      { label: 'Более-менее стабильно', value: 'stable', description: 'Есть режим, но хочется результата' },
      { label: 'Хаотично', value: 'chaotic', description: 'Ем когда получится' },
      { label: 'Часто пропускаю приемы пищи', value: 'skip', description: 'Потом догоняю вечером' },
      { label: 'Считаю калории', value: 'count', description: 'Нужна более удобная система' },
    ],
  },
  {
    id: 'barrier',
    type: 'choice',
    section: 'Питание',
    title: 'Что мешает похудению больше всего?',
    options: [
      { label: 'Нет системы', value: 'noSystem', description: 'Не понимаю, что делать каждый день' },
      { label: 'Переедаю вечером', value: 'overeating', description: 'Днем держусь, вечером срыв' },
      { label: 'Люблю сладкое', value: 'sweet', description: 'Трудно остановиться на одной порции' },
      { label: 'Не понимаю, что есть', value: 'foodChoice', description: 'Сложно собирать нормальные приемы пищи' },
      { label: 'Часто срываюсь', value: 'breakdowns', description: 'Начинаю, бросаю, виню себя' },
    ],
  },
  {
    id: 'cravings',
    type: 'choice',
    section: 'Питание',
    title: 'Когда чаще всего тянет переесть?',
    options: [
      { label: 'Вечером', value: 'evening', description: 'Самый частый сценарий' },
      { label: 'На стрессе', value: 'stress', description: 'Еда как быстрый способ выдохнуть' },
      { label: 'По выходным', value: 'weekend', description: 'Будни держусь, потом отпускаю' },
      { label: 'Постоянно по чуть-чуть', value: 'snacking', description: 'Перекусы незаметно набегают' },
    ],
  },
  {
    id: 'schedule',
    type: 'choice',
    section: 'Режим',
    title: 'Сколько времени готовы уделять в день?',
    options: [
      { label: '5 минут', value: '5', description: 'Только чек-лист и минимум действий' },
      { label: '10-15 минут', value: '15', description: 'Оптимально для старта' },
      { label: '20-30 минут', value: '30', description: 'Можно добавить прогулки и подготовку еды' },
      { label: 'Как получится', value: 'flex', description: 'План должен быть гибким' },
    ],
  },
  {
    id: 'sleep',
    type: 'choice',
    section: 'Режим',
    title: 'Сколько обычно спите?',
    options: [
      { label: 'Меньше 5 часов', value: 'under5', description: 'Будем учитывать усталость и голод' },
      { label: '5-6 часов', value: '5to6', description: 'Нужен мягкий режим без перегруза' },
      { label: '7-8 часов', value: '7to8', description: 'Хорошая база для снижения веса' },
      { label: 'Больше 8 часов', value: 'over8', description: 'Можно держать стабильный темп' },
    ],
  },
  {
    id: 'stress',
    type: 'choice',
    section: 'Режим',
    title: 'Уровень стресса сейчас?',
    options: [
      { label: 'Все спокойно', value: 'calm', description: 'Можно идти ровно по плану' },
      { label: 'Иногда напрягает', value: 'medium', description: 'Добавим защиту от срывов' },
      { label: 'Постоянно на взводе', value: 'high', description: 'Нужна максимально простая система' },
      { label: 'Выгораю', value: 'burnout', description: 'Начнем с малого, без давления' },
    ],
  },
  {
    id: 'resultSpeed',
    type: 'choice',
    section: 'Финал',
    title: 'Когда хотите увидеть первые изменения?',
    options: [
      { label: 'Через 2 недели', value: '2weeks', description: 'Первые изменения в режиме и объемах' },
      { label: 'Через месяц', value: 'month', description: 'Реалистичный срок для заметного старта' },
      { label: 'Чем раньше, тем лучше', value: 'fast', description: 'Но без голодовок и жестких запретов' },
    ],
  },
  {
    id: 'motivation',
    type: 'choice',
    section: 'Финал',
    title: 'Ради чего это нужно?',
    options: [
      { label: 'Выглядеть лучше', value: 'look', description: 'Фото, одежда, отражение' },
      { label: 'Чувствовать легкость', value: 'health', description: 'Меньше тяжести и усталости' },
      { label: 'Вернуть контроль', value: 'control', description: 'Перестать срываться и начинать заново' },
      { label: 'Доказать себе, что могу', value: 'self', description: 'Спокойно довести дело до результата' },
    ],
  },
  {
    id: 'support',
    type: 'choice',
    section: 'Финал',
    title: 'Что поможет не бросить?',
    options: [
      { label: 'Готовый план питания', value: 'guide', description: 'Чтобы не думать каждый день с нуля' },
      { label: 'Напоминания', value: 'reminders', description: 'Мягко возвращают к действиям' },
      { label: 'Чек-лист', value: 'checklist', description: 'Вижу прогресс и не теряю фокус' },
      { label: 'Все вместе', value: 'all', description: 'План, бот и ежедневная система' },
    ],
  },
];
