/** Small decorative SVGs shared by Blossom's creations. */

export function FlowerHead({ petal, center, size = 64 }: { petal: string; center: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx={0} cy={-26} rx={16} ry={24} fill={petal} stroke="rgba(0,0,0,0.08)" transform={`rotate(${a})`} />
      ))}
      <circle r={15} fill={center} />
      <circle r={15} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2} />
    </svg>
  );
}

export function Butterfly({ wing, accent, size = 72 }: { wing: string; accent: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
      <g>
        <path d="M -3 -4 C -40 -48, -52 -6, -6 4 Z" fill={wing} stroke={accent} strokeWidth={2} />
        <path d="M 3 -4 C 40 -48, 52 -6, 6 4 Z" fill={wing} stroke={accent} strokeWidth={2} />
        <path d="M -4 4 C -34 12, -30 40, -4 14 Z" fill={wing} stroke={accent} strokeWidth={2} opacity={0.9} />
        <path d="M 4 4 C 34 12, 30 40, 4 14 Z" fill={wing} stroke={accent} strokeWidth={2} opacity={0.9} />
        <circle cx={-22} cy={-18} r={5} fill="#fff" opacity={0.7} />
        <circle cx={22} cy={-18} r={5} fill="#fff" opacity={0.7} />
      </g>
      <rect x={-3} y={-18} width={6} height={36} rx={3} fill="#5a3b4a" />
      <path d="M -2 -18 Q -10 -32 -14 -34 M 2 -18 Q 10 -32 14 -34" stroke="#5a3b4a" strokeWidth={2} fill="none" />
    </svg>
  );
}
