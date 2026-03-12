import { useMemo } from 'react';

const MARGIN = { top: 20, right: 30, bottom: 40, left: 50 };

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

export default function ProjectedScatterPlot({ projected }) {
  const width = 480;
  const height = 360;
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;

  const xScale = useScale(
    projected.map((p) => p.pc1),
    0,
    innerW,
  );
  const yScale = useScale(
    projected.map((p) => p.pc2),
    innerH,
    0,
  );

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
      <h3>Projected Data (PCA Space)</h3>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', maxWidth: width, display: 'block', margin: '0 auto' }}
      >
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {/* Grid */}
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

          {/* Zero lines */}
          {xScale.domainMin <= 0 && xScale.domainMax >= 0 && (
            <line
              x1={xScale(0)}
              y1={0}
              x2={xScale(0)}
              y2={innerH}
              stroke="#aaa"
              strokeDasharray="4 2"
            />
          )}
          {yScale.domainMin <= 0 && yScale.domainMax >= 0 && (
            <line
              x1={0}
              y1={yScale(0)}
              x2={innerW}
              y2={yScale(0)}
              stroke="#aaa"
              strokeDasharray="4 2"
            />
          )}

          {/* Axes */}
          <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#555" />
          <line x1={0} y1={0} x2={0} y2={innerH} stroke="#555" />

          {/* Ticks */}
          {xTicks.map((t) => (
            <g key={t} transform={`translate(${xScale(t)},${innerH})`}>
              <line y2={5} stroke="#555" />
              <text y={18} textAnchor="middle" fontSize={11} fill="#555">
                {t.toFixed(1)}
              </text>
            </g>
          ))}
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
            PC1
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
            PC2
          </text>

          {/* Data points */}
          {projected.map((p, i) => (
            <circle
              key={i}
              cx={xScale(p.pc1)}
              cy={yScale(p.pc2)}
              r={5}
              fill="#9b59b6"
              fillOpacity={0.7}
              stroke="#8e44ad"
              strokeWidth={1}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
