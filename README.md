# PCA Visualization

An interactive **Principal Component Analysis (PCA)** visualization built with React + Vite.

🌐 **Live Demo**: [https://sumuko98.github.io/PCA](https://sumuko98.github.io/PCA)

## Features

- 📊 **Interactive scatter plot** of the original 2D data with eigenvector (PC) arrows
- 🔄 **Projected data** view in the PCA coordinate space (PC1 vs PC2)
- 📈 **Explained variance** bar chart showing how much variance each component captures
- 🎛️ **Live controls** — adjust sample size, correlation, and standard deviations in real time
- 🔢 **Stats table** — eigenvalues, eigenvectors, covariance matrix

## Getting Started

### Using GitHub Codespaces (recommended)

1. Click the green **Code** button on GitHub
2. Select **Open with Codespaces** → **New codespace**
3. The dev container starts automatically, installs dependencies, and launches the Vite dev server
4. The browser preview opens at `http://localhost:5173`

### Local Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to GitHub Pages

The app is automatically deployed to GitHub Pages on every push to `main` via GitHub Actions.

To deploy manually:

```bash
npm run deploy
```

> **Note**: Before deploying, make sure GitHub Pages is configured to use **GitHub Actions** as the source:
> Go to *Settings → Pages → Source → GitHub Actions*.

## Project Structure

```
src/
├── components/
│   ├── DataControls.jsx        # Sliders and regenerate button
│   ├── ExplainedVarianceChart.jsx  # Bar chart for variance
│   ├── ProjectedScatterPlot.jsx    # Scatter plot in PCA space
│   └── ScatterPlot.jsx             # Original data + PC arrows
├── utils/
│   └── pca.js                  # PCA math (covariance, eigendecomposition, projection)
├── App.jsx                     # Main app
├── App.css                     # Styles
└── main.jsx                    # Entry point
```

## How PCA Works

1. **Center the data** — subtract the mean from each feature
2. **Compute covariance matrix** — measure how features vary together
3. **Find eigenvectors & eigenvalues** — eigenvectors are the principal components; eigenvalues indicate variance explained
4. **Project data** — transform original data into the new PCA coordinate system

## Tech Stack

- [React 19](https://react.dev/)
- [Vite 8](https://vite.dev/)
- [Recharts](https://recharts.org/) — explained variance bar chart
- GitHub Actions — CI/CD for GitHub Pages deployment
