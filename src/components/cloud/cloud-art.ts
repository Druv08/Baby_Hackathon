/**
 * Shared vector shapes for Cloud Maria's world. Plain SVG path data, so the
 * same shapes draw in SVG previews and on a canvas (via Path2D) when a
 * postcard is saved.
 */

/** Fluffy cloud in a 100 × 62 box. */
export const PUFF_PATH =
  "M22 54 C9 54 5 41 14 35 C10 22 26 15 35 22 C39 9 60 7 66 20 C76 13 91 22 86 35 C96 39 93 54 80 54 Z";

/** Shapes centred on (0, 0), roughly 100 units wide. */
export const CENTRED_PUFF = "M-28 20 C-41 20 -45 7 -36 1 C-40 -12 -24 -19 -15 -12 C-11 -25 10 -27 16 -14 C26 -21 41 -12 36 1 C46 5 43 20 30 20 Z";
export const CENTRED_HEART = "M0 30 C-38 6 -46 -22 -24 -30 C-12 -34 -3 -26 0 -18 C3 -26 12 -34 24 -30 C46 -22 38 6 0 30 Z";
export const CENTRED_PLATFORM =
  "M-48 12 C-57 12 -56 0 -46 -1 C-46 -12 -31 -16 -23 -8 C-17 -19 3 -21 9 -10 C17 -18 35 -16 37 -5 C49 -7 56 10 45 12 Z";

/** A five-point star centred on (0, 0). */
export function starPath(outer = 40, inner = 19): string {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r + 4).toFixed(1)}`;
  });
  return `M${pts.join(" L")} Z`;
}

export const CENTRED_STAR = starPath();

/** Little face (eyes and smile) centred on (0, 0) for ~100-unit shapes. */
export const FACE = {
  eyes: [
    [-10, 0],
    [10, 0],
  ] as const,
  eyeRadius: 3.4,
  smile: "M-5 8 Q0 12 5 8",
  cheeks: [
    [-17, 7],
    [17, 7],
  ] as const,
};

/** Rainbow arcs (outer → inner) over a 100 × 70 sticker box. */
export const RAINBOW_ARCS = [
  { d: "M8 52 A42 42 0 0 1 92 52", color: "#ff9fb3" },
  { d: "M16 52 A34 34 0 0 1 84 52", color: "#ffd27a" },
  { d: "M24 52 A26 26 0 0 1 76 52", color: "#9cd6a8" },
  { d: "M32 52 A18 18 0 0 1 68 52", color: "#9cc8ef" },
];
