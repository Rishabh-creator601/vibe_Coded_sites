// Uses the Gemini API to turn a free-text meal line (e.g. "2 roti + mango
// shake + tea") into structured food items with estimated nutrition. This is
// the background nutrition source (item 12) and is country-aware (item 13).

const MODEL = 'gemini-2.5-flash';

const RESPONSE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      name: { type: 'STRING' },
      servingSize: { type: 'STRING' },
      calories: { type: 'NUMBER' },
      protein: { type: 'NUMBER' },
      carbs: { type: 'NUMBER' },
    },
    required: ['name', 'servingSize', 'calories', 'protein', 'carbs'],
  },
};

export async function extractFoodItems({ line, country }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not configured');

  const prompt = [
    'You are a nutrition estimator for a calorie-tracking app.',
    `A user logged a meal as free text, with items separated by "+" or commas:`,
    `"${line}"`,
    '',
    `The user is from ${country || 'an unspecified country'}. Use the foods,`,
    'recipes and typical portion sizes common in that country.',
    '',
    'For each distinct food item:',
    '- Interpret the quantity (e.g. "2 roti" = 2 pieces; a drink like "mango',
    '  shake" = 1 glass; a dish like "sabzi"/curry/dal = 1 standard cup serving).',
    '- Estimate nutrition for the TOTAL quantity stated, not per 100 g.',
    '- Use standard reference values when exact data is unknown.',
    '',
    'Return one object per item. "name" should include the quantity (e.g.',
    '"2 Roti", "Mango shake"). servingSize is human-readable (e.g. "2 pieces",',
    '"1 glass", "1 cup"). calories in kcal, protein and carbs in grams.',
  ].join('\n');

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Gemini error ${resp.status}: ${t.slice(0, 200)}`);
  }

  const data = await resp.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '[]';

  let items;
  try {
    items = JSON.parse(text);
  } catch {
    throw new Error('Gemini returned an unparseable response');
  }
  if (!Array.isArray(items)) items = [];

  return items
    .map((it) => ({
      name: String(it.name || 'Item').slice(0, 80),
      servingSize: String(it.servingSize || '1 serving').slice(0, 40),
      calories: Math.max(0, Math.round(Number(it.calories) || 0)),
      protein: Math.max(0, Math.round((Number(it.protein) || 0) * 10) / 10),
      carbs: Math.max(0, Math.round((Number(it.carbs) || 0) * 10) / 10),
    }))
    .slice(0, 25);
}
