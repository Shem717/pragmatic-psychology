/** Validate before changing the draft, including entries created by earlier versions. */
export function observationError(count: number, fields: string[]): string | null {
  if (!fields[1]?.trim()) return "Describe the observed outcome before adding an observation. A draft can still be saved.";
  if (count >= 200) return "A plan can contain at most 200 observations. Remove an observation to add another; your entry is retained.";
  if (fields.some((value) => value.length > 10000)) return "Each observation field is limited to 10,000 characters. Shorten the affected entry; your text is retained.";
  return null;
}
