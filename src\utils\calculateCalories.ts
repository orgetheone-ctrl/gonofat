export type CalorieInput = {
  gender: 'female' | 'male';
  age: number;
  height: number;
  weight: number;
  activity: 'low' | 'medium' | 'high';
};

export type CalorieResult = {
  bmr: number;
  maintenance: number;
  targetCalories: number;
  caloriesMin: number;
  caloriesMax: number;
};

const activityFactors: Record<CalorieInput['activity'], number> = {
  low: 1.2,
  medium: 1.35,
  high: 1.55,
};

const roundToNearestTen = (value: number) => Math.round(value / 10) * 10;

export function calculateCalories(input: CalorieInput): CalorieResult {
  const base =
    10 * input.weight +
    6.25 * input.height -
    5 * input.age +
    (input.gender === 'male' ? 5 : -161);

  const maintenance = base * activityFactors[input.activity];
  const targetCalories = maintenance * 0.85;

  return {
    bmr: Math.round(base),
    maintenance: Math.round(maintenance),
    targetCalories: Math.round(targetCalories),
    caloriesMin: roundToNearestTen(targetCalories - 100),
    caloriesMax: roundToNearestTen(targetCalories + 100),
  };
}
