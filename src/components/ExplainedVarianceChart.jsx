import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

const COLORS = ['#e74c3c', '#2ecc71'];

export default function ExplainedVarianceChart({ explainedVariance }) {
  const data = explainedVariance.map((v, i) => ({
    name: `PC${i + 1}`,
    variance: parseFloat(v.toFixed(2)),
  }));

  return (
    <div className="chart-container">
      <h3>Explained Variance (%)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(val) => [`${val}%`, 'Explained Variance']} />
          <Bar dataKey="variance" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
            <LabelList
              dataKey="variance"
              position="top"
              formatter={(v) => `${v}%`}
              style={{ fontWeight: 'bold', fontSize: 13 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
