import { useMemo } from 'react';

const MARGIN = { top: 20, right: 30, bottom: 40, left: 50 };
const PC_COLORS = ['#e74c3c', '#2ecc71'];

function useScale(values, rangeMin, rangeMax) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.15 || 1;
  const domainMin = min - pad;
  const domainMax = max + pad;
  const scale = (v) =>
    rangeMin + ((v - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin);
  scale.domainMin = domainMin;
  scale.domainMax = domainMax;
  return scale;
}

export default function ScatterPlot({ data, pcaResult, title }) {
  const { eigenvectors, eigenvalues, means } = pcaResult;

  const width = 480;
  const height = 360;
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;

  const xScale = useScale(
    data.map((r) => r[0]),
    0,
    innerW,
  );
  const yScale = useScale(
    data.map((r) => r[1]),
    innerH,
    0,
  );

  const cx = xScale(means[0]);
  const cy = yScale(means[1]);

  // Scale eigenvector arrows proportional to explained variance
  const maxLen = Math.min(innerW, innerH) * 0.3;
  const totalVar = eigenvalues[0] + eigenvalues[1];

  const xTicks = useMemo(() => {
    const step = (xScale.domainMax - xScale.domainMin) / 5;
    return Array.from({ length: 6 }, (_, i) => xScale.domainMin + i * step);
  }, [xScale.domainMin, xScale.domainMax]);

  const yTicks = useMemo(() => {
    const step = (yScale.domainMax - yScale.domainMin) / 5;
    return Array.from({ length: 6 }, (_, i) => yScale.domainMin + i * step);
  }, [yScale.domainMin, yScale.domainMax]);

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', maxWidth: width, display: 'block', margin: '0 auto' }}
      >
        <defs>
          {eigenvectors.map((_, i) => (
            <marker
              key={i}
              id={`arrow-${i}`}
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill={PC_COLORS[i]} />
            </marker>
          ))}
        </defs>

        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {/* Grid lines */}
          {xTicks.map((t) => (
            <line
              key={t}
              x1={xScale(t)}
              y1={0}
              x2={xScale(t)}
              y2={innerH}
              stroke="#e0e0e0"
              strokeDasharray="3 3"
            />
          ))}
          {yTicks.map((t) => (
            <line
              key={t}
              x1={0}
              y1={yScale(t)}
              x2={innerW}
              y2={yScale(t)}
              stroke="#e0e0e0"
              strokeDasharray="3 3"
            />
          ))}

          {/* Axes */}
          <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#555" />
          <line x1={0} y1={0} x2={0} y2={innerH} stroke="#555" />

          {/* X axis ticks */}
          {xTicks.map((t) => (
            <g key={t} transform={`translate(${xScale(t)},${innerH})`}>
              <line y2={5} stroke="#555" />
              <text y={18} textAnchor="middle" fontSize={11} fill="#555">
                {t.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Y axis ticks */}
          {yTicks.map((t) => (
            <g key={t} transform={`translate(0,${yScale(t)})`}>
              <line x2={-5} stroke="#555" />
              <text x={-8} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="#555">
                {t.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Axis labels */}
          <text
            x={innerW / 2}
            y={innerH + 38}
            textAnchor="middle"
            fontSize={13}
            fill="#333"
            fontWeight="bold"
          >
            X₁
          </text>
          <text
            x={-innerH / 2}
            y={-38}
            textAnchor="middle"
            fontSize={13}
            fill="#333"
            fontWeight="bold"
            transform="rotate(-90)"
          >
            X₂
          </text>

          {/* Data points */}
          {data.map((row, i) => (
            <circle
              key={i}
              cx={xScale(row[0])}
              cy={yScale(row[1])}
              r={5}
              fill="#3498db"
              fillOpacity={0.7}
              stroke="#2980b9"
              strokeWidth={1}
            />
          ))}

          {/* Eigenvector arrows */}
          {eigenvectors.map((ev, i) => {
            const len = totalVar > 0
              ? (eigenvalues[i] / totalVar) * maxLen * 2
              : maxLen;
            const dx = ev[0] * len;
            const dy = -ev[1] * len;
            const labelX = cx + dx * 1.15;
            const labelY = cy + dy * 1.15;
            return (
              <g key={i}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx + dx}
                  y2={cy + dy}
                  stroke={PC_COLORS[i]}
                  strokeWidth={3}
                  markerEnd={`url(#arrow-${i})`}
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={13}
                  fontWeight="bold"
                  fill={PC_COLORS[i]}
                >
                  PC{i + 1}
                </text>
              </g>
            );
          })}

          {/* Mean point */}
          <circle cx={cx} cy={cy} r={6} fill="#f39c12" stroke="#e67e22" strokeWidth={2} />
        </g>
      </svg>

      {/* Legend */}
      <div className="chart-legend">
        <span style={{ color: '#3498db' }}>● Data Points</span>
        <span style={{ color: '#f39c12' }}>● Mean</span>
        {eigenvectors.map((_, i) => (
          <span key={i} style={{ color: PC_COLORS[i] }}>
            → PC{i + 1}
          </span>
        ))}
      </div>
    </div>
  );
}

