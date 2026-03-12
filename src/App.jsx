import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Info, Layers, Move, RefreshCw, Trash2, ArrowRight } from 'lucide-react';

/**
 * Math Helper: Principal Component Analysis (2D)
 * Computes the mean, covariance matrix, eigenvalues, and eigenvectors.
 */
const computePCA = (data) => {
  if (!data || data.length < 2) return null;

  // 1. Center the data
  const meanX = data.reduce((sum, p) => sum + p.x, 0) / data.length;
  const meanY = data.reduce((sum, p) => sum + p.y, 0) / data.length;
  const centered = data.map(p => ({ x: p.x - meanX, y: p.y - meanY }));

  // 2. Covariance Matrix elements
  let m11 = 0, m12 = 0, m22 = 0;
  centered.forEach(p => {
    m11 += p.x * p.x;
    m12 += p.x * p.y;
    m22 += p.y * p.y;
  });

  m11 /= (data.length - 1);
  m12 /= (data.length - 1);
  m22 /= (data.length - 1);

  // 3. Eigenvalues (λ) using characteristic equation for 2x2 matrix
  const trace = m11 + m22;
  const det = m11 * m22 - m12 * m12;
  const gap = Math.sqrt(Math.max(0, (trace * trace) / 4 - det));
  const lambda1 = trace / 2 + gap;
  const lambda2 = trace / 2 - gap;

  // 4. Eigenvectors (v)
  let v1 = { x: 1, y: 0 };
  if (Math.abs(m12) > 1e-9) {
    v1 = { x: lambda1 - m22, y: m12 };
  } else {
    v1 = m11 > m22 ? { x: 1, y: 0 } : { x: 0, y: 1 };
  }

  // Normalize v1
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  if (mag1 > 0) {
    v1.x /= mag1;
    v1.y /= mag1;
  }

  // v2 is orthogonal to v1
  const v2 = { x: -v1.y, y: v1.x };

  return {
    v1, v2,
    lambda1,
    lambda2,
    mean: { x: meanX, y: meanY }
  };
};

const STEPS = [
  {
    id: 0,
    title: "The Raw Data",
    desc: "Drag the dots to change the distribution. Notice how the shape of the 'cloud' changes.",
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    id: 1,
    title: "Finding the Center",
    desc: "The green dot is the mean of your data. PCA starts by shifting the origin here.",
    icon: Move,
    color: "text-emerald-500",
    bg: "bg-emerald-50"
  },
  {
    id: 2,
    title: "Principal Component 1",
    desc: "The red line is PC1—the axis of maximum variance. It represents the data's strongest trend.",
    icon: ArrowRight,
    color: "text-red-500",
    bg: "bg-red-50"
  },
  {
    id: 3,
    title: "Projection",
    desc: "Projecting points onto PC1 reduces 2D data to 1D while keeping the most information possible.",
    icon: Layers,
    color: "text-purple-500",
    bg: "bg-purple-50"
  },
  {
    id: 4,
    title: "Principal Component 2",
    desc: "PC2 is perpendicular to PC1. It captures the remaining information in the data.",
    icon: ArrowRight,
    color: "text-blue-500",
    bg: "bg-blue-50"
  }
];

const App = () => {
  const [points, setPoints] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [draggedId, setDraggedId] = useState(null);
  const svgRef = useRef(null);

  // SVG Configuration
  const viewBoxSize = 600;
  const center = viewBoxSize / 2;
  const scale = 25;

  const toSvg = (x, y) => ({
    x: center + x * scale,
    y: center - y * scale
  });

  const fromSvg = (svgX, svgY) => ({
    x: (svgX - center) / scale,
    y: -(svgY - center) / scale
  });

  const generateInitialData = () => {
    const newPoints = Array.from({ length: 25 }, () => {
      const base = (Math.random() - 0.5) * 12;
      return {
        id: crypto.randomUUID(),
        x: base + (Math.random() - 0.5) * 3,
        y: base * 0.5 + (Math.random() - 0.5) * 4
      };
    });
    setPoints(newPoints);
    setCurrentStep(0);
  };

  useEffect(() => {
    generateInitialData();
  }, []);

  const pca = useMemo(() => computePCA(points), [points]);

  // Interaction Handlers
  const handlePointerMove = (e) => {
    if (!draggedId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * viewBoxSize;
    const y = ((e.clientY - rect.top) / rect.height) * viewBoxSize;
    const mathPos = fromSvg(x, y);

    setPoints(prev => prev.map(p => p.id === draggedId ? { ...p, ...mathPos } : p));
  };

  const handleSvgClick = (e) => {
    if (draggedId) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * viewBoxSize;
    const y = ((e.clientY - rect.top) / rect.height) * viewBoxSize;
    const mathPos = fromSvg(x, y);

    setPoints(prev => [...prev, { id: crypto.randomUUID(), ...mathPos }]);
  };

  const renderLine = (mean, vector, color, isInfinite = true, length = 1) => {
    if (!mean || !vector) return null;
    const p1 = toSvg(
      mean.x + vector.x * (isInfinite ? 30 : length),
      mean.y + vector.y * (isInfinite ? 30 : length)
    );
    const p2 = toSvg(
      mean.x - vector.x * (isInfinite ? 30 : 0),
      mean.y - vector.y * (isInfinite ? 30 : 0)
    );
    return (
      <line
        x1={p2.x} y1={p2.y}
        x2={p1.x} y2={p1.y}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    );
  };

  // Project a point onto a vector (from mean)
  const projectPoint = (point, mean, vector) => {
    const dx = point.x - mean.x;
    const dy = point.y - mean.y;
    const t = dx * vector.x + dy * vector.y;
    return {
      x: mean.x + t * vector.x,
      y: mean.y + t * vector.y
    };
  };

  const totalVariance = pca ? pca.lambda1 + pca.lambda2 : 0;
  const pc1Pct = totalVariance > 0 ? ((pca.lambda1 / totalVariance) * 100).toFixed(1) : 0;
  const pc2Pct = totalVariance > 0 ? ((pca.lambda2 / totalVariance) * 100).toFixed(1) : 0;

  const step = STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Principal Component Analysis
        </h1>
        <p style={{ color: '#64748b', marginTop: '8px', fontSize: '1rem' }}>
          An interactive step-by-step visualization
        </p>
      </div>

      <div style={{ display: 'flex', gap: '24px', width: '100%', maxWidth: '1000px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* SVG Canvas */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '16px', flex: '1 1 500px' }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            style={{ width: '100%', height: 'auto', cursor: draggedId ? 'grabbing' : 'crosshair', userSelect: 'none', display: 'block' }}
            onClick={handleSvgClick}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDraggedId(null)}
            onPointerLeave={() => setDraggedId(null)}
          >
            {/* Grid lines */}
            {[-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10].map(i => {
              const pos = toSvg(i, 0);
              const posY = toSvg(0, i);
              return (
                <g key={i}>
                  <line x1={pos.x} y1={0} x2={pos.x} y2={viewBoxSize} stroke={i === 0 ? '#94a3b8' : '#e2e8f0'} strokeWidth={i === 0 ? 1.5 : 1} />
                  <line x1={0} y1={posY.y} x2={viewBoxSize} y2={posY.y} stroke={i === 0 ? '#94a3b8' : '#e2e8f0'} strokeWidth={i === 0 ? 1.5 : 1} />
                </g>
              );
            })}

            {/* Step 3: Projection lines onto PC1 */}
            {currentStep >= 3 && pca && points.map(p => {
              const proj = projectPoint(p, pca.mean, pca.v1);
              const svgP = toSvg(p.x, p.y);
              const svgProj = toSvg(proj.x, proj.y);
              return (
                <line
                  key={`proj-${p.id}`}
                  x1={svgP.x} y1={svgP.y}
                  x2={svgProj.x} y2={svgProj.y}
                  stroke="#a855f7"
                  strokeWidth="1"
                  strokeDasharray="4,3"
                  opacity="0.5"
                />
              );
            })}

            {/* Step 3: Projected points on PC1 */}
            {currentStep >= 3 && pca && points.map(p => {
              const proj = projectPoint(p, pca.mean, pca.v1);
              const svgProj = toSvg(proj.x, proj.y);
              return (
                <circle
                  key={`projpt-${p.id}`}
                  cx={svgProj.x} cy={svgProj.y}
                  r={4}
                  fill="#a855f7"
                  opacity={0.7}
                />
              );
            })}

            {/* PC2 line (step 4) */}
            {currentStep >= 4 && pca && renderLine(pca.mean, pca.v2, '#3b82f6')}

            {/* PC1 line (step 2+) */}
            {currentStep >= 2 && pca && renderLine(pca.mean, pca.v1, '#ef4444')}

            {/* Mean point (step 1+) */}
            {currentStep >= 1 && pca && (() => {
              const meanSvg = toSvg(pca.mean.x, pca.mean.y);
              return (
                <g>
                  <circle cx={meanSvg.x} cy={meanSvg.y} r={8} fill="#22c55e" opacity={0.3} />
                  <circle cx={meanSvg.x} cy={meanSvg.y} r={5} fill="#22c55e" />
                </g>
              );
            })()}

            {/* Data Points */}
            {points.map(p => {
              const svgPos = toSvg(p.x, p.y);
              return (
                <circle
                  key={p.id}
                  cx={svgPos.x} cy={svgPos.y}
                  r={7}
                  fill={currentStep >= 3 ? 'rgba(99,102,241,0.4)' : '#6366f1'}
                  stroke="white"
                  strokeWidth="1.5"
                  style={{ cursor: 'grab' }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setDraggedId(p.id);
                  }}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    setDraggedId(null);
                  }}
                />
              );
            })}
          </svg>
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', marginTop: '8px' }}>
            Click to add points · Drag to move them
          </p>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: '0 1 280px', minWidth: '240px' }}>
          {/* Step Card */}
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                <StepIcon size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                  Step {currentStep + 1} of {STEPS.length}
                </div>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>
                  {step.title}
                </div>
              </div>
            </div>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>{step.desc}</p>

            {/* Step progress dots */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(i)}
                  style={{
                    width: i === currentStep ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: i === currentStep ? '#6366f1' : '#e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    padding: 0
                  }}
                />
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
              disabled={currentStep === 0}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: currentStep === 0 ? '#f8fafc' : 'white',
                color: currentStep === 0 ? '#cbd5e1' : '#1e293b',
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              ← Back
            </button>
            <button
              onClick={() => setCurrentStep(s => Math.min(STEPS.length - 1, s + 1))}
              disabled={currentStep === STEPS.length - 1}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: currentStep === STEPS.length - 1 ? '#e2e8f0' : '#6366f1',
                color: currentStep === STEPS.length - 1 ? '#94a3b8' : 'white',
                cursor: currentStep === STEPS.length - 1 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              Next →
            </button>
          </div>

          {/* PCA Stats (shown from step 2 onwards) */}
          {currentStep >= 2 && pca && (
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '20px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
                Variance Explained
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>PC1</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{pc1Pct}%</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${pc1Pct}%`, height: '100%', background: '#ef4444', borderRadius: '4px', transition: 'width 0.5s' }} />
                  </div>
                </div>
                {currentStep >= 4 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600 }}>PC2</span>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{pc2Pct}%</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${pc2Pct}%`, height: '100%', background: '#3b82f6', borderRadius: '4px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '12px' }}>
                λ₁ = {pca.lambda1.toFixed(2)}{currentStep >= 4 ? `, λ₂ = ${pca.lambda2.toFixed(2)}` : ''}
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={generateInitialData}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px',
                border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                color: '#475569', fontSize: '0.85rem', fontWeight: 500
              }}
            >
              <RefreshCw size={14} /> Regenerate
            </button>
            <button
              onClick={() => { setPoints([]); setCurrentStep(0); }}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px',
                border: '1px solid #fee2e2', background: '#fff5f5', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                color: '#ef4444', fontSize: '0.85rem', fontWeight: 500
              }}
            >
              <Trash2 size={14} /> Clear
            </button>
          </div>

          {/* Legend */}
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '16px' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Legend</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Data points</span>
              </div>
              {currentStep >= 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Mean (μ)</span>
                </div>
              )}
              {currentStep >= 2 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 20, height: 3, background: '#ef4444', borderRadius: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>PC1 (max variance)</span>
                </div>
              )}
              {currentStep >= 3 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#a855f7', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Projected points</span>
                </div>
              )}
              {currentStep >= 4 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 20, height: 3, background: '#3b82f6', borderRadius: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>PC2 (residual variance)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
