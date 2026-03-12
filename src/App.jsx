import { useMemo } from 'react';
import ScatterPlot from './components/ScatterPlot';
import ProjectedScatterPlot from './components/ProjectedScatterPlot';
import ExplainedVarianceChart from './components/ExplainedVarianceChart';
import DataControls from './components/DataControls';
import { useDataGenerator } from './utils/useDataGenerator';
import { computePCA } from './utils/pca';
import './App.css';

const DEFAULT_PARAMS = {
  n: 100,
  meanX: 2,
  meanY: 3,
  stdX: 2,
  stdY: 1,
  correlation: 0.75,
};

function StatsTable({ pcaResult }) {
  const { eigenvalues, eigenvectors, explainedVariance, covarianceMatrix: cov } = pcaResult;
  return (
    <div className="stats-section">
      <h3>PCA Results</h3>
      <table className="stats-table">
        <thead>
          <tr>
            <th>Component</th>
            <th>Eigenvalue</th>
            <th>Direction (x, y)</th>
            <th>Explained Variance</th>
          </tr>
        </thead>
        <tbody>
          {eigenvalues.map((ev, i) => (
            <tr key={i}>
              <td>
                <strong>PC{i + 1}</strong>
              </td>
              <td>{ev.toFixed(4)}</td>
              <td>
                ({eigenvectors[i][0].toFixed(3)}, {eigenvectors[i][1].toFixed(3)})
              </td>
              <td>{explainedVariance[i].toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: '1rem' }}>Covariance Matrix</h3>
      <table className="stats-table">
        <tbody>
          <tr>
            <td>{cov[0][0].toFixed(4)}</td>
            <td>{cov[0][1].toFixed(4)}</td>
          </tr>
          <tr>
            <td>{cov[1][0].toFixed(4)}</td>
            <td>{cov[1][1].toFixed(4)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const { data, params, updateParam, regenerate } = useDataGenerator(DEFAULT_PARAMS);
  const pcaResult = useMemo(() => computePCA(data), [data]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔬 PCA Visualization</h1>
        <p>Interactive Principal Component Analysis — explore how PCA transforms your data</p>
      </header>

      <main className="app-main">
        <section className="section-intro">
          <h2>What is PCA?</h2>
          <p>
            <strong>Principal Component Analysis (PCA)</strong> is a dimensionality reduction
            technique that finds the directions of maximum variance in your data.
            The first principal component (PC1) captures the most variance,
            while PC2 is orthogonal to PC1 and captures the remaining variance.
          </p>
        </section>

        <div className="app-grid">
          <aside className="sidebar">
            <DataControls
              params={params}
              onUpdateParam={updateParam}
              onRegenerate={regenerate}
            />
            <StatsTable pcaResult={pcaResult} />
          </aside>

          <div className="charts-area">
            <div className="charts-row">
              <ScatterPlot
                data={data}
                pcaResult={pcaResult}
                title="Original Data with Principal Components"
              />
              <ProjectedScatterPlot projected={pcaResult.projected} />
            </div>
            <div className="charts-row single">
              <ExplainedVarianceChart explainedVariance={pcaResult.explainedVariance} />
            </div>
          </div>
        </div>

        <section className="section-steps">
          <h2>How PCA Works</h2>
          <ol>
            <li>
              <strong>Center the data</strong> — subtract the mean from each feature
            </li>
            <li>
              <strong>Compute covariance matrix</strong> — measure how features vary together
            </li>
            <li>
              <strong>Find eigenvectors &amp; eigenvalues</strong> — eigenvectors are the principal
              components; eigenvalues indicate how much variance each component explains
            </li>
            <li>
              <strong>Project data</strong> — transform original data into the new PCA coordinate
              system
            </li>
          </ol>
        </section>
      </main>

      <footer className="app-footer">
        <p>
          Built with React + Vite ·{' '}
          <a
            href="https://github.com/sumuko98/PCA"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
