import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function CostChart({ data, exchangeRate }) {
  const chartData = data.map(row => {
    const delivered = row.orders * (row.confirmation_rate / 100) * (row.delivery_rate / 100);
    return {
      date: row.date,
      pub: row.ad_spend_usd * exchangeRate,
      produit: delivered * row.product_cost_dzd
    };
  });

  return (
    <div className="card h-96">
      <h3 className="font-bold text-lg mb-4">Pub vs Coût Produit (DZD)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="pub" name="Dépenses Pub" fill="#ef4444" />
          <Bar dataKey="produit" name="Coût Produit" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
