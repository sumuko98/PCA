export default function DataControls({ params, onUpdateParam, onRegenerate }) {
  return (
    <div className="controls-panel">
      <h3>Data Settings</h3>

      <label>
        Samples (n): <strong>{params.n}</strong>
        <input
          type="range"
          min={20}
          max={300}
          step={10}
          value={params.n}
          onChange={(e) => onUpdateParam('n', Number(e.target.value))}
        />
      </label>

      <label>
        Correlation: <strong>{params.correlation.toFixed(2)}</strong>
        <input
          type="range"
          min={-0.99}
          max={0.99}
          step={0.01}
          value={params.correlation}
          onChange={(e) => onUpdateParam('correlation', Number(e.target.value))}
        />
      </label>

      <label>
        Std X: <strong>{params.stdX.toFixed(1)}</strong>
        <input
          type="range"
          min={0.5}
          max={5}
          step={0.1}
          value={params.stdX}
          onChange={(e) => onUpdateParam('stdX', Number(e.target.value))}
        />
      </label>

      <label>
        Std Y: <strong>{params.stdY.toFixed(1)}</strong>
        <input
          type="range"
          min={0.5}
          max={5}
          step={0.1}
          value={params.stdY}
          onChange={(e) => onUpdateParam('stdY', Number(e.target.value))}
        />
      </label>

      <button className="btn-regenerate" onClick={onRegenerate}>
        🔄 Regenerate Data
      </button>
    </div>
  );
}
