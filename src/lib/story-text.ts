export interface NarrationParagraph {
  text: string;
  /** Lines that open with a quote mark are a character speaking. */
  spoken: boolean;
}

/** Splits scene narration (blank-line separated) into paragraphs. */
export function narrationParagraphs(narration: string): NarrationParagraph[] {
  return narration
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((text) => ({ text, spoken: /^[“"]/.test(text) }));
}
