'use client';

interface DataPoint {
  label: string;
  value: number;
}

interface SimpleChartProps {
  data: DataPoint[];
  type: 'bar' | 'line';
  height?: number;
  color?: string;
}

export default function SimpleChart({
  data,
  type,
  height = 200,
  color = '#3b82f6',
}: SimpleChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-slate-400 dark:text-slate-500"
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const padding = { top: 10, right: 10, bottom: 30, left: 10 };
  const chartWidth = 100; // percentage-based
  const chartHeight = height - padding.top - padding.bottom;

  if (type === 'bar') {
    const barWidth = Math.max(8, Math.min(40, (chartWidth * 0.7) / data.length));
    const totalBarsWidth = data.length * barWidth;
    const gap = data.length > 1 ? (chartWidth - totalBarsWidth / data.length) / data.length : 0;

    return (
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${data.length * 60 + 20} ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {data.map((d, i) => {
          const barH = (d.value / maxValue) * chartHeight;
          const x = i * 60 + 10;
          const y = padding.top + chartHeight - barH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={40}
                height={barH}
                rx={3}
                fill={color}
                opacity={0.85}
              >
                <title>{`${d.label}: ${d.value}`}</title>
              </rect>
              <text
                x={x + 20}
                y={height - 8}
                textAnchor="middle"
                className="fill-slate-400 dark:fill-slate-500"
                fontSize={10}
              >
                {d.label.length > 6 ? d.label.slice(0, 5) + '..' : d.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  // Line chart
  const pointSpacing = data.length > 1 ? (data.length * 60) / (data.length - 1) : 0;
  const svgWidth = Math.max(data.length * 60 + 20, 200);

  const points = data.map((d, i) => {
    const x = data.length > 1 ? padding.left + (i / (data.length - 1)) * (svgWidth - padding.left - padding.right) : svgWidth / 2;
    const y = padding.top + chartHeight - (d.value / maxValue) * chartHeight;
    return { x, y, data: d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${svgWidth} ${height}`}
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      {/* Area fill */}
      <path d={areaPath} fill={color} opacity={0.1} />
      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} fill={color}>
            <title>{`${p.data.label}: ${p.data.value}`}</title>
          </circle>
          {data.length <= 12 && (
            <text
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-slate-400 dark:fill-slate-500"
              fontSize={10}
            >
              {p.data.label.length > 6 ? p.data.label.slice(0, 5) + '..' : p.data.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
