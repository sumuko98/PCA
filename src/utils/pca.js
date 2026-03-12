/**
 * Principal Component Analysis (PCA) utilities
 */

/**
 * Compute the mean of each column in a 2D array
 */
export function columnMeans(data) {
  const n = data.length;
  const d = data[0].length;
  const means = new Array(d).fill(0);
  for (const row of data) {
    for (let j = 0; j < d; j++) {
      means[j] += row[j];
    }
  }
  return means.map((s) => s / n);
}

/**
 * Center the data by subtracting column means
 */
export function centerData(data, means) {
  return data.map((row) => row.map((val, j) => val - means[j]));
}

/**
 * Compute covariance matrix of centered data
 */
export function covarianceMatrix(centered) {
  const n = centered.length;
  const d = centered[0].length;
  const cov = Array.from({ length: d }, () => new Array(d).fill(0));
  for (const row of centered) {
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        cov[i][j] += row[i] * row[j];
      }
    }
  }
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      cov[i][j] /= n - 1;
    }
  }
  return cov;
}

/**
 * Compute PCA for 2D data using analytical solution for 2x2 covariance matrix
 * Returns eigenvectors (principal components) and explained variance ratios
 */
export function computePCA(data) {
  const means = columnMeans(data);
  const centered = centerData(data, means);
  const cov = covarianceMatrix(centered);

  // Analytical eigendecomposition for 2x2 symmetric matrix
  const a = cov[0][0];
  const b = cov[0][1];
  const d = cov[1][1];

  const trace = a + d;
  const det = a * d - b * b;
  const discriminant = Math.max(0, (trace / 2) ** 2 - det);
  const sqrtDisc = Math.sqrt(discriminant);

  const lambda1 = trace / 2 + sqrtDisc;
  const lambda2 = trace / 2 - sqrtDisc;

  let pc1, pc2;
  if (Math.abs(b) > 1e-10) {
    const v1 = [lambda1 - d, b];
    const norm1 = Math.sqrt(v1[0] ** 2 + v1[1] ** 2);
    pc1 = [v1[0] / norm1, v1[1] / norm1];

    const v2 = [lambda2 - d, b];
    const norm2 = Math.sqrt(v2[0] ** 2 + v2[1] ** 2);
    pc2 = [v2[0] / norm2, v2[1] / norm2];
  } else {
    pc1 = a >= d ? [1, 0] : [0, 1];
    pc2 = a >= d ? [0, 1] : [1, 0];
  }

  const totalVariance = lambda1 + lambda2;
  const explainedVariance = [
    totalVariance > 0 ? (lambda1 / totalVariance) * 100 : 50,
    totalVariance > 0 ? (lambda2 / totalVariance) * 100 : 50,
  ];

  // Project data onto principal components
  const projected = centered.map((row) => ({
    pc1: row[0] * pc1[0] + row[1] * pc1[1],
    pc2: row[0] * pc2[0] + row[1] * pc2[1],
  }));

  return {
    means,
    centered,
    covarianceMatrix: cov,
    eigenvalues: [lambda1, lambda2],
    eigenvectors: [pc1, pc2],
    explainedVariance,
    projected,
  };
}
