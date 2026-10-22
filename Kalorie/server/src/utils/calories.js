// Target-calorie calculation using the Mifflin–St Jeor BMR equation,
// scaled by an activity factor to get TDEE (Total Daily Energy Expenditure).
//
// Inputs:
//   gender:        'male' | 'female'
//   heightCm:      height in centimetres
//   weightKg:      current weight in kilograms
//   age:           years
//   activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

const ACTIVITY_FACTORS = {
  sedentary: 1.2, // little or no exercise
  light: 1.375, // 1-3 days/week
  moderate: 1.55, // 3-5 days/week
  active: 1.725, // 6-7 days/week
  very_active: 1.9, // hard daily exercise / physical job
};

export function calculateTargetCalories({ gender, heightCm, weightKg, age, activityLevel }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === 'male' ? base + 5 : base - 161;
  const factor = ACTIVITY_FACTORS[activityLevel] ?? ACTIVITY_FACTORS.sedentary;
  return Math.round(bmr * factor);
}

// Suggested daily macro targets derived from the calorie goal.
// Protein is set a touch higher for non-veg eaters (easier to hit from diet),
// carbs fill the remainder. Values are grams.
export function calculateMacroTargets(targetCalories, dietType) {
  // Share of total daily calories that should come from protein.
  const proteinCalorieShare = dietType === 'non-veg' ? 0.3 : 0.25;
  const proteinCalories = targetCalories * proteinCalorieShare;
  const carbCalories = targetCalories * 0.5;
  return {
    proteinTarget: Math.round(proteinCalories / 4), // 4 kcal per gram
    carbsTarget: Math.round(carbCalories / 4), // 4 kcal per gram
  };
}
