import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useSettings } from '../hooks/useSettings';
import { RevenueChart } from '../components/Charts/RevenueChart';
import { ROASChart } from '../components/Charts/ROASChart';
import { CostChart } from '../components/Charts/CostChart';
import { Button } from '../components/ui/Button';
import { format, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatNumber } from '../utils/calculator';

export function Analytics() {
  const { data: entries, fetch } = useApi('/api/entries');
  const { settings } = useSettings();
  const [range, setRange] = useState('30d');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    if (!entries) return;
    const now = new Date();
    let start;
    switch (range) {
      case '7d': start = subDays(now, 7); break;
      case '30d': start = subDays(now, 30); break;
      case '90d': start = subDays(now, 90); break;
      default: start = subDays(now, 30);
    }
    const filtered = entries.filter(e => new Date(e.date) >= start);
    setFilteredData(filtered);
  }, [entries, range]);

  const exchangeRate = settings?.exchange_rate || 250;

  const profitPerUnitData = filteredData.map(row => {
    const delivered = row.orders * (row.confirmation_rate / 100) * (row.delivery_rate / 100);
    const revenue = delivered * row.selling_price_dzd;
    const cost = delivered * row.product_cost_dzd + row.ad_spend_usd * exchangeRate;
    const profitPerUnit = delivered > 0 ? (revenue - cost) / delivered : 0;
    return { date: row.date, profitPerUnit: Number(profitPerUnit.toFixed(2)) };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap gap-2">
        {['7d', '30d', '90d'].map(r => (
          <Button 
            key={r} 
            variant={range === r ? 'primary' : 'outline'}
            onClick={() => setRange(r)}
          >
            {r === '7d' ? '7 Jours' : r === '30d' ? '30 Jours' : '90 Jours'}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <RevenueChart data={filteredData} exchangeRate={exchangeRate} />
        <ROASChart data={filteredData} />
        <CostChart data={filteredData} exchangeRate={exchangeRate} />
        <div className="card h-96">
          <h3 className="font-bold text-lg mb-4">Profit par Unité</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profitPerUnitData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={v => formatNumber(v, 2)} />
              <Line type="monotone" dataKey="profitPerUnit" name="Profit/Unité DZD" stroke="#059669" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
