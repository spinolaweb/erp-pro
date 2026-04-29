import { useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useSettings } from '../hooks/useSettings';
import { KPICard } from '../components/KPICard';
import { DataTable } from '../components/DataTable';
import { RevenueChart } from '../components/Charts/RevenueChart';
import { calculateCOD, formatNumber } from '../utils/calculator';
import { ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';

export function Dashboard() {
  const { data: entries, fetch: fetchEntries, loading } = useApi('/api/entries');
  const { settings } = useSettings();
  const exchangeRate = settings?.exchange_rate || 250;

  useEffect(() => { fetchEntries(); }, []);

  const totals = entries?.reduce((acc, entry) => {
    const m = calculateCOD(entry, exchangeRate);
    acc.orders += entry.orders;
    acc.delivered += m.livrees;
    acc.revenue += m.revenu_dzd;
    acc.profit += m.profit_net_dzd;
    acc.adSpend += m.depenses_pub_usd;
    return acc;
  }, { orders: 0, delivered: 0, revenue: 0, profit: 0, adSpend: 0 }) || { orders: 0, delivered: 0, revenue: 0, profit: 0, adSpend: 0 };

  const recentEntries = entries?.slice(0, 5) || [];

  useEffect(() => {
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Commandes Totales" 
          value={totals.orders} 
          subtitle={`${formatNumber(totals.delivered, 0)} livrées`}
        />
        <KPICard 
          title="Revenus (DZD)" 
          value={totals.revenue} 
          isCurrency 
          currency="DZD"
          type="info"
        />
        <KPICard 
          title="Profit Net (DZD)" 
          value={totals.profit} 
          isCurrency 
          currency="DZD"
          type={totals.profit >= 0 ? 'profit' : 'loss'}
        />
        <KPICard 
          title="ROAS Moyen" 
          value={totals.adSpend > 0 ? (totals.revenue / exchangeRate) / totals.adSpend : 0} 
          suffix="x"
          type={totals.adSpend > 0 && (totals.revenue / exchangeRate) / totals.adSpend >= 3 ? 'profit' : 'warning'}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={entries || []} exchangeRate={exchangeRate} />
        </div>
        <div className="card">
          <h3 className="font-bold text-lg mb-4">Répartition des Coûts</h3>
          {entries?.length > 0 && (
            <div className="space-y-4">
              {(() => {
                const totalCost = totals.delivered * (entries[0]?.product_cost_dzd || 3400) + totals.adSpend * exchangeRate;
                const productCost = totals.delivered * (entries[0]?.product_cost_dzd || 3400);
                const adCost = totals.adSpend * exchangeRate;
                return (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Coût Produit</span>
                        <span className="font-medium">{formatNumber((productCost/totalCost)*100, 1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${(productCost/totalCost)*100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Publicité</span>
                        <span className="font-medium">{formatNumber((adCost/totalCost)*100, 1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${(adCost/totalCost)*100}%` }} />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-lg mb-4">Entrées Récentes</h3>
        <DataTable 
          data={recentEntries} 
          exchangeRate={exchangeRate} 
          loading={loading}
          onDelete={() => {}}
          onBulkDelete={() => {}}
        />
      </div>
    </div>
  );
}
