import { useState, useCallback } from 'react';

/**
 * Generate correlated 2D Gaussian data using Box-Muller transform
 */
function generateData({ n, meanX, meanY, stdX, stdY, correlation }) {
  const data = [];
  for (let i = 0; i < n; i++) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

    const x = meanX + stdX * z0;
    const y = meanY + stdY * (correlation * z0 + Math.sqrt(1 - correlation ** 2) * z1);
    data.push([x, y]);
  }
  return data;
}

export function useDataGenerator(initialParams) {
  const [params, setParams] = useState(initialParams);
  const [data, setData] = useState(() => generateData(initialParams));

  const regenerate = useCallback(
    (newParams) => {
      const p = newParams || params;
      setData(generateData(p));
    },
    [params],
  );

  const updateParam = useCallback(
    (key, value) => {
      const newParams = { ...params, [key]: value };
      setParams(newParams);
      setData(generateData(newParams));
    },
    [params],
  );

  return { data, params, updateParam, regenerate };
}
