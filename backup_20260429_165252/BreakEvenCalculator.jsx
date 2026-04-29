import { useState } from 'react';
import { Input } from '../components/ui/Input';
import { formatNumber } from '../utils/calculator';
import { Calculator } from 'lucide-react';

export function BreakEvenCalculator() {
  const [values, setValues] = useState({
    selling_price: 4900,
    product_cost: 3400,
    ad_spend: 100,
    confirmation_rate: 70,
    delivery_rate: 70,
    target_profit: 0
  });

  const cprCap = values.selling_price - values.product_cost;
  const breakEvenROAS = cprCap > 0 ? values.selling_price / cprCap : 0;

  const profitPerDelivered = cprCap;
  const deliveredNeeded = profitPerDelivered > 0 ? (values.target_profit + values.ad_spend * 250) / profitPerDelivered : 0;
  const confirmedNeeded = values.delivery_rate > 0 ? deliveredNeeded / (values.delivery_rate / 100) : 0;
  const ordersNeeded = values.confirmation_rate > 0 ? confirmedNeeded / (values.confirmation_rate / 100) : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Calculateur Seuil de Rentabilité</h2>
            <p className="text-sm text-gray-500">Combien de commandes pour être rentable ?</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Input label="Prix de Vente (DZD)" type="number" value={values.selling_price} onChange={e => setValues({...values, selling_price: Number(e.target.value)})} />
          <Input label="Coût Produit (DZD)" type="number" value={values.product_cost} onChange={e => setValues({...values, product_cost: Number(e.target.value)})} />
          <Input label="Dépenses Pub (USD)" type="number" value={values.ad_spend} onChange={e => setValues({...values, ad_spend: Number(e.target.value)})} />
          <Input label="Confirmation %" type="number" value={values.confirmation_rate} onChange={e => setValues({...values, confirmation_rate: Number(e.target.value)})} />
          <Input label="Livraison %" type="number" value={values.delivery_rate} onChange={e => setValues({...values, delivery_rate: Number(e.target.value)})} />
          <Input label="Profit Cible (DZD)" type="number" value={values.target_profit} onChange={e => setValues({...values, target_profit: Number(e.target.value)})} />
        </div>

        <div className="bg-slate-50 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-500">CPR CAP (Marge)</p>
              <p className="text-2xl font-bold text-blue-600 tabular-nums">{formatNumber(cprCap, 0)} DZD</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-500">Break Even ROAS</p>
              <p className="text-2xl font-bold text-amber-600 tabular-nums">{formatNumber(breakEvenROAS, 2)}x</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-emerald-200">
            <p className="text-sm text-gray-500 mb-2">Commandes nécessaires pour {values.target_profit > 0 ? `un profit de ${formatNumber(values.target_profit, 0)} DZD` : 'le seuil de rentabilité'}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-emerald-600 tabular-nums">{Math.ceil(ordersNeeded)}</span>
              <span className="text-gray-500">commandes</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              → {formatNumber(confirmedNeeded, 1)} confirmées → {formatNumber(deliveredNeeded, 1)} livrées
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
