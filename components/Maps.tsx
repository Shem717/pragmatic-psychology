import type { CSSProperties } from "react";
const contour = "M280 64 C380 64 461 145 461 244 C461 343 380 424 280 424 C180 424 99 343 99 244 C99 145 180 64 280 64 Z";
const points = Array.from({ length: 90 }, (_, i) => {
  const a = i * 2.399963,
    r = Math.sqrt((i + 0.5) / 90);
  return { x: 280 + Math.cos(a) * r * 245, y: 237 + Math.sin(a) * r * 190 };
});
const edges = points.flatMap((p, i) =>
  points
    .slice(i + 1)
    .map((q, j) => ({
      p,
      q,
      key: `${i}-${i + j + 1}`,
      d: Math.hypot(p.x - q.x, p.y - q.y),
    }))
    .filter((e) => e.d < 72),
);
const signalRoutes = Array.from({ length: 12 }, (_, route) => {
  let index = (route * 7 + 3) % points.length;
  const visited = new Set([index]);
  const track = [points[index]];
  for (let step = 0; step < 7; step++) {
    const neighbors = points
      .map((p, i) => ({
        p,
        i,
        distance: Math.hypot(p.x - points[index].x, p.y - points[index].y),
      }))
      .filter((n) => !visited.has(n.i) && n.distance > 12 && n.distance < 67);
    if (!neighbors.length) break;
    index = neighbors[(route * 11 + step * 7) % neighbors.length].i;
    visited.add(index);
    track.push(points[index]);
  }
  return track
    .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
});
const focusPoints = [
  { x: 165, y: 155 },
  { x: 380, y: 175 },
  { x: 160, y: 300 },
  { x: 390, y: 310 },
];
export function NeuralField({
  id = "neural",
  active,
  hovered,
  visible = true,
}: {
  id?: string;
  active?: number;
  hovered?: number | null;
  visible?: boolean;
}) {
  const focusIndex = hovered ?? active ?? 0;
  const focus = focusPoints[focusIndex] || focusPoints[0];
  const alive = active !== undefined;
  return (
    <svg
      className="neural-map"
      data-alive={alive}
      data-visible={visible}
      data-active={focusIndex}
      viewBox="0 0 560 490"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={id + "-glass"} cx="35%" cy="28%" r="75%">
          <stop offset="0" stopColor="var(--cyan)" stopOpacity=".18" />
          <stop offset=".55" stopColor="var(--cyan)" stopOpacity=".035" />
          <stop offset="1" stopColor="var(--violet)" stopOpacity=".12" />
        </radialGradient>
        <clipPath id={id + "-clip"}>
          <path d={contour} />
        </clipPath>
        <radialGradient id={id + "-aura"}>
          <stop className="aura-center" />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>
        <radialGradient
          id={id + "-focus"}
          gradientUnits="userSpaceOnUse"
          cx={focus.x}
          cy={focus.y}
          r="175"
        >
          <stop className="focus-center" />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>
      </defs>
      <ellipse cx="280" cy="242" rx="270" ry="230" fill={`url(#${id}-aura)`} />
      <g className="field-calibration">
        {Array.from({length: 60}, (_, i) => <line key={i} x1="280" y1="20" x2="280" y2={i % 5 === 0 ? 30 : 25} transform={`rotate(${i * 6} 280 244)`} />)}
      </g>
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse
          key={i}
          className="orbit"
          cx="280"
          cy="244"
          rx={220 + i * 15}
          ry={170 + i * 16}
          transform={`rotate(${-12 + i * 7} 280 244)`}
        />
      ))}
      <path className="brain-outline" d={contour} />
      <path d={contour} fill={`url(#${id}-glass)`} className="neural-glass" />
      {alive && (
        <path
          className="perspective-focus"
          d={contour}
          fill={`url(#${id}-focus)`}
        />
      )}
      <g clipPath={`url(#${id}-clip)`}>
        {edges.map((e) => (
          <line
            className="neural-line"
            key={e.key}
            x1={e.p.x}
            y1={e.p.y}
            x2={e.q.x}
            y2={e.q.y}
          />
        ))}
        {alive && (
          <g className="neural-activity">
            {signalRoutes.map((d, i) => (
              <g
                key={i}
                style={
                  {
                    "--signal-duration": `${5.5 + (i % 6) * 1.25}s`,
                    "--signal-delay": `${-i * 0.79}s`,
                  } as CSSProperties
                }
              >
                <path className="neural-trail-halo" d={d} pathLength="100" />
                <path
                  className={
                    i % 4 === 0
                      ? "neural-trail neural-trail-gold"
                      : "neural-trail"
                  }
                  d={d}
                  pathLength="100"
                />
              </g>
            ))}
            {points
              .filter((_, i) => i % 9 === 0)
              .map((p, i) => (
                <circle
                  key={i}
                  className="synapse-bloom"
                  cx={p.x}
                  cy={p.y}
                  r="8"
                  style={
                    {
                      "--signal-duration": `${6 + (i % 5) * 1.4}s`,
                      "--signal-delay": `${-i * 0.97}s`,
                    } as CSSProperties
                  }
                />
              ))}
            <circle
              key={`wave-${focusIndex}`}
              className="perspective-wave"
              cx={focus.x}
              cy={focus.y}
              r="20"
            />
          </g>
        )}
        {points.map((p, i) => (
          <circle
            className={i % 9 === 0 ? "neural-dot signal" : "neural-dot"}
            key={i}
            cx={p.x}
            cy={p.y}
            r={i % 9 === 0 ? 2.7 : 1.3}
          />
        ))}
      </g>
    </svg>
  );
}
export function OrbitField({ activePosition }: { activePosition?: number[] } = {}) {
  return (
    <svg className="orbit-field" viewBox="0 0 800 500" preserveAspectRatio="none" aria-hidden="true">
      <g className="observatory-grid">
        {[100, 200, 300, 400].map(y => <path key={y} d={`M20 ${y} H780`} />)}
        {[100, 200, 300, 400, 500, 600, 700].map(x => <path key={x} d={`M${x} 30 V470`} />)}
      </g>
      {[90, 170, 255, 325].map((r) => (
        <ellipse
          key={r}
          className="orbit"
          cx="400"
          cy="250"
          rx={r}
          ry={r * 0.66}
          transform="rotate(-14 400 250)"
        />
      ))}
      {activePosition && <g className="selected-orbit"><path d={`M400 250 Q${activePosition[0] * 8} 250 ${activePosition[0] * 8} ${activePosition[1] * 5}`} /><circle cx={activePosition[0] * 8} cy={activePosition[1] * 5} r="25" /></g>}
      {Array.from({ length: 100 }, (_, i) => {
        const a = i * 2.39996,
          r = 80 + Math.sqrt(i / 100) * 260;
        return (
          <circle
            key={i}
            className="neural-dot"
            cx={400 + Math.cos(a) * r}
            cy={250 + Math.sin(a) * r * 0.68}
            r={i % 7 === 0 ? 1.8 : 0.7}
          />
        );
      })}
    </svg>
  );
}
export const stagePositions = [
  [14, 49],
  [27, 20],
  [50, 23],
  [77, 22],
  [83, 70],
  [50, 83],
  [18, 81],
];
export function LoopField({ active }: { active?: number } = {}) {
  const paths = stagePositions
    .map((p, i) => {
      const q = stagePositions[(i + 1) % 7];
      return `M${p[0] * 8} ${p[1] * 5} Q${(p[0] + q[0]) * 4} ${(p[1] + q[1]) * 2.5 + (i < 3 ? -35 : 25)} ${q[0] * 8} ${q[1] * 5}`;
    });
  const path = paths.join(" ");
  return (
    <svg
      className="loop-field"
      viewBox="0 0 800 500"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <ellipse className="orbit" cx="400" cy="250" rx="300" ry="165" />
      <path className="flow-aura" d={path} />
      <path className="flow-line" d={path} />
      {active !== undefined && <path className="active-flow" d={paths[active]} pathLength="100" />}
    </svg>
  );
}
