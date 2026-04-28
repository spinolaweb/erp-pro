import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatNumber } from '../../utils/calculator';

export function RevenueChart({ data, exchangeRate }) {
  const chartData = data.map(row => {
    const delivered = row.orders * (row.confirmation_rate / 100) * (row.delivery_rate / 100);
    return {
      date: row.date,
      revenu: delivered * row.selling_price_dzd,
      profit: (delivered * row.selling_price_dzd) - (delivered * row.product_cost_dzd) - (row.ad_spend_usd * exchangeRate)
    };
  });

  return (
    <div className="card h-96">
      <h3 className="font-bold text-lg mb-4">Revenus vs Profit (DZD)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={v => formatNumber(v, 0)} />
          <Tooltip formatter={v => formatNumber(v, 0)} />
          <Legend />
          <Line type="monotone" dataKey="revenu" name="Revenus" stroke="#2563eb" strokeWidth={2} />
          <Line type="monotone" dataKey="profit" name="Profit Net" stroke="#059669" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
