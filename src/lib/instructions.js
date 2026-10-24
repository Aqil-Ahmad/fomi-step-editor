const ADJUSTMENTS = [
  { pattern: /\b(lighter|brighter)\b/i, filter: "brightness(1.08)" },
  { pattern: /\b(darker|deeper)\b/i, filter: "brightness(0.92)" },
  { pattern: /\bwarm(er)?\b/i, filter: "sepia(0.12) saturate(1.06)" },
  { pattern: /\bcool(er)?\b/i, filter: "hue-rotate(-8deg) saturate(0.94)" },
  { pattern: /\b(fewer pits|smoother|softer)\b/i, filter: "blur(0.6px)" },
  { pattern: /\bmatch photo\b/i, filter: "saturate(0.94) contrast(1.03)" },
  { pattern: /\b(more contrast|punchier)\b/i, filter: "contrast(1.08)" },
];

const FALLBACK_ADJUSTMENT = "saturate(1.05) contrast(1.02)";

function filtersIn(text) {
  return ADJUSTMENTS.filter(({ pattern }) => pattern.test(text)).map(({ filter }) => filter);
}

export function adjustmentFor(instruction, baseline = "") {
  const existing = new Set(filtersIn(baseline));
  const added = filtersIn(instruction).filter((filter) => !existing.has(filter));
  return added.length > 0 ? added.join(" ") : null;
}

export function adjustmentForNewStep(instruction) {
  return adjustmentFor(instruction) ?? FALLBACK_ADJUSTMENT;
}

export function applySuggestion(text, suggestion) {
  const trimmed = text.trim();
  if (!trimmed) return suggestion;
  if (trimmed.toLowerCase().includes(suggestion.toLowerCase())) return trimmed;
  return `${trimmed.replace(/[.,]$/, "")}, ${suggestion.toLowerCase()}`;
}

export function titleFromInstruction(instruction) {
  const text = instruction.trim().replace(/[.,]$/, "");
  const sentence = text.charAt(0).toUpperCase() + text.slice(1);
  return sentence.length > 44 ? `${sentence.slice(0, 43).trimEnd()}…` : sentence;
}
