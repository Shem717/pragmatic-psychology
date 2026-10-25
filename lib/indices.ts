export function safeIndex(
  value: string | undefined,
  length: number,
  fallback = 0,
) {
  const n = Number(value ?? fallback);
  return Number.isInteger(n) && n >= 0 && n < length ? n : fallback;
}
export const disciplineSlugs = [
  "legitimate-authority",
  "awareness",
  "understanding",
  "discernment",
  "integration",
  "self-command",
  "competence",
  "stewardship",
];
