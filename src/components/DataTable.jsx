import { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2, Download } from 'lucide-react';
import { formatCurrency, formatNumber, calculateCOD } from '../utils/calculator';
import { Button } from './ui/Button';

export function DataTable({ data, exchangeRate, onDelete, onBulkDelete, loading }) {
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState(new Set());

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (sortDir === 'asc') return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === data.length) setSelected(new Set());
    else setSelected(new Set(data.map(d => d.id)));
  };

  const handleBulkDelete = () => {
    if (confirm(`Supprimer ${selected.size} entrées ?`)) {
      onBulkDelete(Array.from(selected));
      setSelected(new Set());
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Campagne', 'Commandes', 'Confirmées', 'Livrées', 'Revenu DZD', 'Revenu USD', 'Profit DZD', 'Profit USD', 'ROAS'];
    const rows = data.map(row => {
      const m = calculateCOD(row, exchangeRate);
      return [
        row.date, row.campaign, row.orders, 
        formatNumber(m.confirmees, 1), formatNumber(m.livrees, 2),
        formatNumber(m.revenu_dzd, 2), formatNumber(m.revenu_usd, 2),
        formatNumber(m.profit_net_dzd, 2), formatNumber(m.profit_net_usd, 2),
        formatNumber(m.roas, 2)
      ];
    });

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'erp-export.csv';
    a.click();
  };

  if (loading) return <div className="card text-center py-12">Chargement...</div>;
  if (!data.length) return <div className="card text-center py-12 text-gray-500">Aucune donnée disponible</div>;

  return (
    <div className="card overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <Button variant="danger" onClick={handleBulkDelete} className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Supprimer ({selected.size})
            </Button>
          )}
        </div>
        <Button variant="outline" onClick={exportCSV} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="p-3">
                <input 
                  type="checkbox" 
                  checked={selected.size === data.length && data.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              {[
                { key: 'date', label: 'Date' },
                { key: 'campaign', label: 'Campagne' },
                { key: 'orders', label: 'Cmd' },
                { key: 'confirmation_rate', label: 'Conf%' },
                { key: 'delivery_rate', label: 'Livr%' },
                { key: 'ad_spend_usd', label: 'Pub $' },
                { key: 'selling_price_dzd', label: 'Prix DZD' },
              ].map(col => (
                <th 
                  key={col.key} 
                  className="p-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortField === col.key && (
                      sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
              <th className="p-3 text-left font-semibold text-gray-700">Profit DZD</th>
              <th className="p-3 text-left font-semibold text-gray-700">ROAS</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map(row => {
              const m = calculateCOD(row, exchangeRate);
              const isProfit = m.profit_net_dzd >= 0;
              return (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    <input 
                      type="checkbox" 
                      checked={selected.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="p-3 tabular-nums">{row.date}</td>
                  <td className="p-3 font-medium">{row.campaign || '-'}</td>
                  <td className="p-3 tabular-nums">{row.orders}</td>
                  <td className="p-3 tabular-nums">{row.confirmation_rate}%</td>
                  <td className="p-3 tabular-nums">{row.delivery_rate}%</td>
                  <td className="p-3 tabular-nums">${formatNumber(row.ad_spend_usd, 2)}</td>
                  <td className="p-3 tabular-nums">{formatNumber(row.selling_price_dzd, 0)}</td>
                  <td className={`p-3 tabular-nums font-semibold ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatNumber(m.profit_net_dzd, 0)}
                  </td>
                  <td className={`p-3 tabular-nums font-semibold ${m.roas >= m.break_even_roas ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatNumber(m.roas, 2)}x
                  </td>
                  <td className="p-3">
                    <button onClick={() => onDelete(row.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
