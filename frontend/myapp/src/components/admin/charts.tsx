import { useId } from 'react';

/** Zentro chart palette (brand teal / mint with amber + red for warnings). */
export const chartColors = {
  teal: '#428475',
  mint: '#89D7B7',
  ink: '#1A312C',
  amber: '#D99A2B',
  red: '#C0392B',
  grid: '#E5E7EB',
  muted: '#4B5563',
};

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

export const formatCompact = (n: number): string => compact.format(n);

/* ------------------------------------------------------------------ bars */

export interface BarPoint {
  label: string;
  a: number;
  b: number;
  title?: string;
}

/** Grouped vertical bars (two series) with a y-axis and light grid. */
export function GroupedBars({
  data,
  colorA = chartColors.teal,
  colorB = chartColors.mint,
  ariaLabel,
  height = 190,
}: {
  data: BarPoint[];
  colorA?: string;
  colorB?: string;
  ariaLabel: string;
  height?: number;
}) {
  const max = Math.max(1, ...data.flatMap(d => [d.a, d.b]));
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const step = Math.max(1, Math.ceil(data.length / 6));

  return (
    <div role="img" aria-label={ariaLabel}>
      <div className="flex">
        <div
          className="flex flex-col-reverse justify-between pr-2 text-[10px] text-gray-600"
          style={{ height }}
        >
          {ticks.map(t => <span key={t}>{formatCompact(max * t)}</span>)}
        </div>
        <div
          className="relative flex-1"
          style={{ height }}
        >
          {ticks.map(t => (
            <div
              key={t}
              className="absolute inset-x-0 border-t border-gray-200"
              style={{ bottom: `${t * 100}%` }}
            />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {data.map(d => (
              <div
                key={d.label}
                className="flex h-full flex-1 items-end gap-px"
                title={d.title ?? d.label}
              >
                <div
                  className="w-1/2 rounded-t-sm"
                  style={{
                    background: colorA,
                    height: `${(d.a / max) * 100}%`,
                    minHeight: d.a > 0 ? 2 : 0,
                  }}
                />
                <div
                  className="w-1/2 rounded-t-sm"
                  style={{
                    background: colorB,
                    height: `${(d.b / max) * 100}%`,
                    minHeight: d.b > 0 ? 2 : 0,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ml-9 mt-1 flex justify-between text-[10px] text-gray-600">
        {data.filter((_, i) => i % step === 0).map(d => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- area line */

export interface LinePoint {
  label: string;
  value: number;
}

/** Smooth-ish area/line graph for a single series. */
export function AreaLine({
  data,
  color = chartColors.teal,
  ariaLabel,
  height = 190,
  format = formatCompact,
}: {
  data: LinePoint[];
  color?: string;
  ariaLabel: string;
  height?: number;
  format?: (n: number) => string;
}) {
  const gid = useId();
  const w = 360;
  const h = height;
  const pad = { l: 48, r: 8, t: 10, b: 20 };
  const max = Math.max(1, ...data.map(d => d.value));
  const min = Math.min(0, ...data.map(d => d.value));
  const span = max - min || 1;
  const x = (i: number) => pad.l + (data.length <= 1 ? 0 : (i / (data.length - 1)) * (w - pad.l - pad.r));
  const y = (v: number) => pad.t + (1 - (v - min) / span) * (h - pad.t - pad.b);
  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  const area = data.length
    ? `${line} L${x(data.length - 1).toFixed(1)},${y(min)} L${x(0).toFixed(1)},${y(min)} Z`
    : '';
  const ticks = [0, 0.5, 1].map(t => min + span * t);
  const step = Math.max(1, Math.ceil(data.length / 6));

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full"
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient
          id={gid}
          x1="0"
          x2="0"
          y1="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={color}
            stopOpacity="0.35"
          />
          <stop
            offset="100%"
            stopColor={color}
            stopOpacity="0.02"
          />
        </linearGradient>
      </defs>
      {ticks.map(t => (
        <g key={t}>
          <line
            x1={pad.l}
            x2={w - pad.r}
            y1={y(t)}
            y2={y(t)}
            stroke={chartColors.grid}
          />
          <text
            x={pad.l - 6}
            y={y(t) + 3}
            textAnchor="end"
            fontSize="10"
            fill={chartColors.muted}
          >
            {format(t)}
          </text>
        </g>
      ))}
      {area ? <path
        d={area}
        fill={`url(#${gid})`}
      /> : null}
      {line ? <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      /> : null}
      {data.map((d, i) => (
        <circle
          key={d.label}
          cx={x(i)}
          cy={y(d.value)}
          r="6"
          fill="transparent"
        >
          <title>{`${d.label}: ${format(d.value)}`}</title>
        </circle>
      ))}
      {data.filter((_, i) => i % step === 0).map(d => (
        <text
          key={d.label}
          x={x(data.indexOf(d))}
          y={h - 5}
          textAnchor="middle"
          fontSize="10"
          fill={chartColors.muted}
        >
          {d.label}
        </text>
      ))}
    </svg>
  );
}

/* ----------------------------------------------------------------- donut */

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

/**
 * Donut or full pie. `stacked` puts a larger chart on top and the legend below
 * as stat tiles (with percentages), which fills tall cards without dead space.
 */
export function Donut({
  slices,
  centerValue,
  centerLabel,
  ariaLabel,
  variant = 'donut',
  stacked = false,
}: {
  slices: DonutSlice[];
  centerValue: string;
  centerLabel: string;
  ariaLabel: string;
  variant?: 'donut' | 'pie' | 'rings';
  stacked?: boolean;
}) {
  const gid = useId().replace(/:/g, '');
  const total = slices.reduce((s, d) => s + d.value, 0);
  const pie = variant === 'pie';
  const active = slices.filter(s => s.value > 0);
  const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);
  const point = (r: number, deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;

    return [60 + r * Math.cos(rad), 60 + r * Math.sin(rad)];
  };
  const arc = (r: number, from: number, to: number) => {
    const [x0, y0] = point(r, from);
    const [x1, y1] = point(r, to);

    return `A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x1} ${y1}`.replace(/^/, `M ${x0} ${y0} `);
  };
  const wedge = (r: number, from: number, to: number) => `${arc(r, from, to)} L 60 60 Z`;

  let angle = 0;
  const segs = active.map((s) => {
    const sweep = (s.value / total) * 360;
    const seg = { s, from: angle, to: angle + sweep, mid: angle + sweep / 2 };

    angle += sweep;

    return seg;
  });
  const single = active.length === 1;
  // Round-capped donut segments need a small gap so the caps do not overlap.
  const gap = single ? 0 : 7;

  const chart = (
    <svg
      viewBox="0 0 120 120"
      className={stacked ? 'size-48 shrink-0 overflow-visible' : 'size-32 shrink-0 overflow-visible'}
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        {slices.map((s, i) => (
          <linearGradient
            key={s.label}
            id={`${gid}-g${i}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0" stopColor={s.color} stopOpacity="0.72" />
            <stop offset="1" stopColor={s.color} />
          </linearGradient>
        ))}
        <filter id={`${gid}-shadow`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor={chartColors.ink} floodOpacity="0.22" />
        </filter>
      </defs>

      {variant === 'rings'
        ? (
            <>
              {slices.map((s, i) => {
                const r = 52 - i * 12;
                const share = total > 0 ? s.value / total : 0;
                const sweep = Math.min(359.9, share * 360);

                return (
                  <g key={s.label}>
                    <circle
                      cx="60"
                      cy="60"
                      r={r}
                      fill="none"
                      stroke={s.color}
                      strokeOpacity="0.14"
                      strokeWidth="8"
                    />
                    {sweep > 0 && (
                      <path
                        d={arc(r, 0, sweep)}
                        fill="none"
                        stroke={`url(#${gid}-g${i})`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        className="cursor-pointer transition-[stroke-width] duration-200 hover:[stroke-width:10]"
                      >
                        <title>{`${s.label}: ${s.value} (${pct(s.value)}%)`}</title>
                      </path>
                    )}
                  </g>
                );
              })}
              <text
                x="60"
                y="62"
                textAnchor="middle"
                fontSize="18"
                fontWeight="700"
                fill={chartColors.ink}
              >
                {centerValue}
              </text>
              <text
                x="60"
                y="72"
                textAnchor="middle"
                fontSize="6.5"
                letterSpacing="1"
                fill={chartColors.muted}
              >
                {centerLabel.toUpperCase()}
              </text>
            </>
          )
        : pie
        ? (
            <>
              <circle cx="60" cy="60" r="62" fill="none" stroke={chartColors.grid} strokeDasharray="1.5 3.5" strokeLinecap="round" />
              <g filter={`url(#${gid}-shadow)`}>
                {total === 0 && <circle cx="60" cy="60" r="54" fill={chartColors.grid} />}
                {single && (
                  <circle cx="60" cy="60" r="54" fill={`url(#${gid}-g${slices.indexOf(segs[0].s)})`} />
                )}
                {!single && segs.map(({ s, from, to, mid }) => {
                  const [dx, dy] = point(2.5, mid).map(v => v - 60);

                  return (
                    <path
                      key={s.label}
                      d={wedge(54, from, to)}
                      fill={`url(#${gid}-g${slices.indexOf(s)})`}
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      className="cursor-pointer transition-transform duration-200 hover:scale-[1.04]"
                      style={{ transformOrigin: '60px 60px', transform: `translate(${dx}px, ${dy}px)` }}
                    >
                      <title>{`${s.label}: ${s.value} (${pct(s.value)}%)`}</title>
                    </path>
                  );
                })}
              </g>
              {segs.map(({ s, mid }) => {
                if (pct(s.value) < 8) return null;
                const [x, y] = point(single ? 0 : 34, mid);

                return (
                  <text
                    key={s.label}
                    x={x}
                    y={y + 3.5}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="#fff"
                    pointerEvents="none"
                  >
                    {`${pct(s.value)}%`}
                  </text>
                );
              })}
            </>
          )
        : (
            <>
              <circle cx="60" cy="60" r="52" fill="none" stroke={chartColors.grid} strokeOpacity="0.7" strokeDasharray="1 3" strokeLinecap="round" />
              <circle cx="60" cy="60" r="34" fill="#fff" fillOpacity="0.7" />
              <circle cx="60" cy="60" r="42" fill="none" stroke={chartColors.grid} strokeWidth="12" strokeOpacity="0.55" />
              <g filter={`url(#${gid}-shadow)`}>
                {single && (
                  <circle
                    cx="60"
                    cy="60"
                    r="42"
                    fill="none"
                    stroke={`url(#${gid}-g${slices.indexOf(segs[0].s)})`}
                    strokeWidth="12"
                  />
                )}
                {!single && segs.map(({ s, from, to }) => (
                  <path
                    key={s.label}
                    d={arc(42, from + gap / 2, Math.max(from + gap / 2 + 0.1, to - gap / 2))}
                    fill="none"
                    stroke={`url(#${gid}-g${slices.indexOf(s)})`}
                    strokeWidth="12"
                    strokeLinecap="round"
                    className="cursor-pointer transition-[stroke-width] duration-200 hover:[stroke-width:15]"
                  >
                    <title>{`${s.label}: ${s.value} (${pct(s.value)}%)`}</title>
                  </path>
                ))}
              </g>
              <text
                x="60"
                y="60"
                textAnchor="middle"
                fontSize="24"
                fontWeight="700"
                fill={chartColors.ink}
              >
                {centerValue}
              </text>
              <text
                x="60"
                y="75"
                textAnchor="middle"
                fontSize="8.5"
                letterSpacing="1.2"
                fill={chartColors.muted}
              >
                {centerLabel.toUpperCase()}
              </text>
            </>
          )}
    </svg>
  );

  if (!stacked) {
    return (
      <div className="flex items-center gap-4">
        {chart}
        <ul className="space-y-1.5 text-sm">
          {slices.map(s => (
            <li
              key={s.label}
              className="flex items-center gap-2"
            >
              <i
                className="inline-block size-2.5 rounded-sm"
                style={{ background: s.color }}
              />
              <span className="text-gray-700">{s.label}</span>
              <span className="ml-auto pl-3 font-semibold text-gray-900">{s.value}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {chart}
      {pie
        ? (
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-[#1A312C]">{centerValue}</span>
              {' '}
              {centerLabel}
            </p>
          )
        : null}
      <ul className="grid w-full grid-cols-3 gap-2">
        {slices.map(s => (
          <li
            key={s.label}
            className="rounded-lg bg-white/75 px-2 py-2 text-center ring-1 ring-black/5"
          >
            <span className="flex items-center justify-center gap-1.5 text-xs text-gray-700">
              <i
                className="inline-block size-2.5 rounded-sm"
                style={{ background: s.color }}
              />
              {s.label}
            </span>
            <span className="block text-xl font-semibold text-[#1A312C]">{s.value}</span>
            <span className="block text-[11px] text-gray-600">{`${pct(s.value)}%`}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----------------------------------------------------- horizontal bars */

export interface HBarItem {
  label: string;
  value: number;
  hint?: string;
}

/** Ranked horizontal bars, e.g. stock value by category. */
export function HBars({
  items,
  color = chartColors.teal,
  format = formatCompact,
}: {
  items: HBarItem[];
  color?: string;
  format?: (n: number) => string;
}) {
  const max = Math.max(1, ...items.map(i => i.value));

  return (
    <ul className="space-y-3">
      {items.map(i => (
        <li key={i.label}>
          <div className="flex items-baseline justify-between text-sm">
            <span className="truncate text-gray-800">{i.label}</span>
            <span className="ml-2 shrink-0 font-semibold text-gray-900">{format(i.value)}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full"
              style={{ width: `${(i.value / max) * 100}%`, background: color }}
            />
          </div>
          {i.hint ? <p className="mt-0.5 text-[11px] text-gray-600">{i.hint}</p> : null}
        </li>
      ))}
    </ul>
  );
}
