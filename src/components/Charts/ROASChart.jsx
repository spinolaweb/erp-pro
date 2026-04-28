import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

export function ROASChart({ data }) {
  const chartData = data.map(row => {
    const delivered = row.orders * (row.confirmation_rate / 100) * (row.delivery_rate / 100);
    const revenue = delivered * row.selling_price_dzd;
    const adSpendDZD = row.ad_spend_usd * 250;
    const roas = adSpendDZD > 0 ? revenue / adSpendDZD : 0;
    const breakEven = row.selling_price_dzd / (row.selling_price_dzd - row.product_cost_dzd);
    return { date: row.date, roas: Number(roas.toFixed(2)), breakEven: Number(breakEven.toFixed(2)) };
  });

  return (
    <div className="card h-96">
      <h3 className="font-bold text-lg mb-4">ROAS vs Seuil Rentabilité</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <ReferenceLine y={1} stroke="#dc2626" strokeDasharray="3 3" label="Seuil" />
          <Line type="monotone" dataKey="roas" name="ROAS Réel" stroke="#2563eb" strokeWidth={2} />
          <Line type="monotone" dataKey="breakEven" name="Break Even" stroke="#f59e0b" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
