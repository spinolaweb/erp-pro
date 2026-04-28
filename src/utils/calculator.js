import { formatCurrency, formatNumber } from '../utils/calculator';
import { Badge } from './ui/Badge';

export function LivePreview({ metrics, exchangeRate }) {
  const isProfitable = metrics.profit_net_dzd >= 0;
  const roasGood = metrics.roas >= metrics.break_even_roas;

  return (
    <div className="card bg-slate-50 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-900">Aperçu en Direct</h3>
        <Badge variant={isProfitable ? 'success' : 'danger'}>
          {isProfitable ? 'Rentable' : 'Non Rentable'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded-lg">
          <p className="text-xs text-gray-500">Commandes → Confirmées → Livrées</p>
          <p className="text-lg font-bold tabular-nums">
            {metrics.commandes} → {formatNumber(metrics.confirmees, 1)} → {formatNumber(metrics.livrees, 2)}
          </p>
        </div>
        <div className="bg-white p-3 rounded-lg">
          <p className="text-xs text-gray-500">Taux Effectif</p>
          <p className="text-lg font-bold tabular-nums">{formatNumber(metrics.taux_livraison_effectif, 1)}%</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-sm text-gray-600">Revenus (Livrés uniquement)</span>
          <div className="text-right">
            <p className="font-bold tabular-nums">{formatCurrency(metrics.revenu_dzd, 'DZD')}</p>
            <p className="text-xs text-gray-500">{formatCurrency(metrics.revenu_usd, 'USD')}</p>
          </div>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-sm text-gray-600">Coût Produit (Livrés)</span>
          <div className="text-right">
            <p className="font-bold tabular-nums text-red-600">{formatCurrency(metrics.cout_produit_dzd, 'DZD')}</p>
            <p className="text-xs text-gray-500">{formatCurrency(metrics.cout_produit_usd, 'USD')}</p>
          </div>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-sm text-gray-600">Dépenses Pub</span>
          <div className="text-right">
            <p className="font-bold tabular-nums text-red-600">{formatCurrency(metrics.depenses_pub_usd, 'USD')}</p>
            <p className="text-xs text-gray-500">{formatCurrency(metrics.depenses_pub_dzd, 'DZD')}</p>
          </div>
        </div>

        <div className="flex justify-between items-center py-3 bg-white rounded-lg px-3">
          <span className="font-bold text-gray-900">Profit Net</span>
          <div className="text-right">
            <p className={`text-xl font-bold tabular-nums ${isProfitable ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(metrics.profit_net_dzd, 'DZD')}
            </p>
            <p className={`text-sm font-medium tabular-nums ${isProfitable ? 'text-emerald-500' : 'text-red-500'}`}>
              {formatCurrency(metrics.profit_net_usd, 'USD')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white p-3 rounded-lg">
            <p className="text-xs text-gray-500">Profit / Unité</p>
            <p className={`font-bold tabular-nums ${isProfitable ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(metrics.profit_unite_dzd, 'DZD')}
            </p>
            <p className="text-xs text-gray-500">{formatCurrency(metrics.profit_unite_usd, 'USD')}</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="text-xs text-gray-500">ROAS</p>
            <p className={`font-bold tabular-nums ${roasGood ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatNumber(metrics.roas, 2)}x
            </p>
            <p className="text-xs text-gray-500">Seuil: {formatNumber(metrics.break_even_roas, 2)}x</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="bg-white p-2 rounded text-center">
            <p className="text-xs text-gray-500">CPR</p>
            <p className="font-bold text-sm tabular-nums">${formatNumber(metrics.cpr_usd, 2)}</p>
          </div>
          <div className="bg-white p-2 rounded text-center">
            <p className="text-xs text-gray-500">CPR CAP</p>
            <p className="font-bold text-sm tabular-nums text-blue-600">${formatNumber(metrics.cpr_cap_usd, 2)}</p>
            <p className="text-xs text-gray-400">{formatNumber(metrics.cpr_cap_dzd, 0)} DZD</p>
          </div>
          <div className="bg-white p-2 rounded text-center">
            <p className="text-xs text-gray-500">CPC</p>
            <p className="font-bold text-sm tabular-nums">${formatNumber(metrics.cpc, 2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}