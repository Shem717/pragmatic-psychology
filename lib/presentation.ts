/** Decorative chapter ordinals only. Never use for record IDs, measurements or timestamps. */
export function romanNumeral(value: number): string {
  if (!Number.isInteger(value) || value < 1 || value > 3999) return String(value);
  const parts: [number, string][] = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let remaining = value;
  let result = '';
  for (const [amount, symbol] of parts) {
    while (remaining >= amount) { result += symbol; remaining -= amount; }
  }
  return result;
}
