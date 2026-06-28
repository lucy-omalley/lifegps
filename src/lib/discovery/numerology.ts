function reduceToSingleDigit(num: number): number {
  if (num === 11 || num === 22 || num === 33) return num;
  while (num > 9) {
    num = String(num)
      .split("")
      .reduce((sum, d) => sum + parseInt(d, 10), 0);
    if (num === 11 || num === 22 || num === 33) return num;
  }
  return num;
}

function sumDigits(str: string): number {
  return str
    .split("")
    .filter((c) => /\d/.test(c))
    .reduce((sum, d) => sum + parseInt(d, 10), 0);
}

const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

export function calculateLifePathNumber(birthDate: string): number {
  const digits = birthDate.replace(/\D/g, "");
  return reduceToSingleDigit(sumDigits(digits));
}

export function calculatePersonalYearNumber(
  birthDate: string,
  year: number = new Date().getFullYear()
): number {
  const [, month, day] = birthDate.split("-").map(Number);
  const total = day + month + year;
  return reduceToSingleDigit(total);
}

export function calculateExpressionNumber(fullName: string): number | undefined {
  const cleaned = fullName
    .toUpperCase()
    .replace(/[^A-Z\s]/g, "")
    .replace(/\s+/g, "");
  if (!cleaned) return undefined;

  const total = cleaned
    .split("")
    .reduce((sum, char) => sum + (LETTER_VALUES[char] ?? 0), 0);
  return reduceToSingleDigit(total);
}

export function calculateSoulNumber(fullName: string): number | undefined {
  const cleaned = fullName
    .toUpperCase()
    .replace(/[^A-Z\s]/g, "");
  if (!cleaned.trim()) return undefined;

  const vowels = cleaned
    .split("")
    .filter((char) => VOWELS.has(char))
    .join("");
  if (!vowels) return undefined;

  const total = vowels
    .split("")
    .reduce((sum, char) => sum + (LETTER_VALUES[char] ?? 0), 0);
  return reduceToSingleDigit(total);
}

export const LIFE_PATH_THEMES: Record<number, string> = {
  1: "Independence, initiative, and pioneering leadership",
  2: "Cooperation, diplomacy, and emotional sensitivity",
  3: "Creativity, expression, and joyful communication",
  4: "Structure, discipline, and building solid foundations",
  5: "Freedom, adaptability, and adventurous change",
  6: "Responsibility, nurturing, and harmonious service",
  7: "Introspection, wisdom, and spiritual seeking",
  8: "Ambition, material mastery, and empowered leadership",
  9: "Compassion, completion, and humanitarian vision",
  11: "Intuitive inspiration and visionary guidance",
  22: "Master builder energy and large-scale practical vision",
  33: "Healing, teaching, and compassionate service at scale",
};
