/**
 * Hero artwork: a dusk waterfront drawn in SVG. Deliberately generic towers —
 * no developer's landmark or logo — so nothing on the page borrows someone
 * else's brand.
 */
export function Skyline({ className }: { className?: string }) {
  const towers: [number, number, number][] = [
    // x, width, height
    [40, 46, 150],
    [92, 34, 210],
    [132, 52, 175],
    [190, 30, 250],
    [226, 44, 195],
    [276, 38, 290],
    [320, 56, 220],
    [382, 32, 170],
    [420, 48, 240],
    [474, 36, 185],
    [516, 60, 205],
    [582, 30, 150],
    [618, 44, 230],
    [668, 38, 175],
    [712, 52, 140],
  ];
  const horizon = 330;
  return (
    <svg viewBox="0 0 800 460" preserveAspectRatio="xMidYMax slice" className={className} role="img" aria-label="Illustration of a waterfront skyline at dusk">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1733" />
          <stop offset="0.65" stopColor="#1d3560" />
          <stop offset="1" stopColor="#b8924a" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#13294d" />
          <stop offset="1" stopColor="#0b1733" />
        </linearGradient>
      </defs>
      <rect width="800" height={horizon} fill="url(#sky)" />
      <circle cx="610" cy="250" r="46" fill="#e8c98a" opacity="0.85" />
      {towers.map(([x, w, h], i) => (
        <g key={i}>
          <rect x={x} y={horizon - h} width={w} height={h} fill={i % 3 === 0 ? "#0e1e3f" : "#122650"} />
          {Array.from({ length: Math.floor(h / 26) }).map((_, r) => (
            <rect
              key={r}
              x={x + w * 0.2}
              y={horizon - h + 14 + r * 26}
              width={w * 0.6}
              height="3"
              fill="#e8c98a"
              opacity={(i + r) % 4 === 0 ? 0.55 : 0.12}
            />
          ))}
        </g>
      ))}
      <rect y={horizon} width="800" height={460 - horizon} fill="url(#water)" />
      {towers.map(([x, w, h], i) => (
        <rect key={i} x={x} y={horizon + 2} width={w} height={h * 0.35} fill="#1d3560" opacity="0.35" />
      ))}
      <rect x="560" y={horizon + 6} width="100" height="3" rx="1.5" fill="#e8c98a" opacity="0.5" />
      <rect x="580" y={horizon + 18} width="60" height="2" rx="1" fill="#e8c98a" opacity="0.35" />
      <rect x="595" y={horizon + 28} width="30" height="2" rx="1" fill="#e8c98a" opacity="0.25" />
      {[360, 384, 402, 428].map((y, i) => (
        <rect key={y} x={60 + i * 90} y={y} width={180 - i * 20} height="1.5" fill="#ffffff" opacity="0.08" />
      ))}
    </svg>
  );
}
