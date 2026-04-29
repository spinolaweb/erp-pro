import { useState, useEffect } from 'react';
import { Calculator, Package, Target } from 'lucide-react';
import { API_URL } from '../utils/constants';
import { formatNumber, formatCurrency } from '../utils/formatter';
import { calculateAccountingBreakEven, calculateInvestmentBreakEven, calculateBreakEvenProgress } from '../utils/calculator';

export default function BreakEvenCalculator() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [values, setValues] = useState({
    selling_price: 4900,
    product_cost: 3400,
    ad_spend: 50,
    confirmation_rate: 70,
    delivery_rate: 70,
    target_profit: 0
  });

  useEffect(() => {
    fetch(`${API_URL}/api/products`).then(r => r.json()).then(data => setProducts(data));
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      const p = products.find(x => x.id == selectedProductId);
      if (p) {
        setValues(v => ({
          ...v,
          selling_price: p.selling_price_dzd,
          product_cost: p.cost_price_dzd
        }));
      }
    }
  }, [selectedProductId, products]);

  const exchangeRate = 250;
  const marginPerUnit = values.selling_price - values.product_cost;
  const cprCap = marginPerUnit * (values.delivery_rate / 100);
  const breakEvenROAS = values.product_cost / values.selling_price;
  
  const selectedProduct = products.find(p => p.id == selectedProductId);
  const totalInventoryCost = selectedProduct?.total_inventory_investment || 0;
  const totalDelivered = selectedProduct?.total_delivered || 0;
  
  const accountingBE = calculateAccountingBreakEven(values.ad_spend, values.selling_price, values.product_cost, exchangeRate);
  const investmentBE = calculateInvestmentBreakEven(totalInventoryCost, values.ad_spend, values.selling_price, values.product_cost, exchangeRate);
  
  const progressAccounting = calculateBreakEvenProgress(totalDelivered, accountingBE);
  const progressInvestment = calculateBreakEvenProgress(totalDelivered, investmentBE);

  const targetMargin = marginPerUnit * (values.confirmation_rate / 100) * (values.delivery_rate / 100);
  const ordersNeeded = targetMargin > 0 && values.target_profit >= 0
    ? (values.ad_spend * exchangeRate + values.target_profit) / targetMargin
    : 0;
  const confirmedNeeded = ordersNeeded * (values.confirmation_rate / 100);
  const deliveredNeeded = ordersNeeded * (values.confirmation_rate / 100) * (values.delivery_rate / 100);

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Calculator className="w-6 h-6" /> Calculateur Seuil de Rentabilité
      </h1>

      <div className="card">
        <label className="block text-sm text-gray-400 mb-2">Sélectionner un produit (optionnel)</label>
        <select className="input w-full" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
          <option value="">-- Produit manuel --</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} (Stock: {p.remaining_stock} | Investi: {formatCurrency(p.total_inventory_investment, 'DZD')})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-300">Paramètres</h3>
          {[
            { label: 'Prix de Vente (DZD)', key: 'selling_price' },
            { label: 'Coût Produit (DZD)', key: 'product_cost' },
            { label: 'Dépenses Pub (USD)', key: 'ad_spend' },
            { label: 'Taux Confirmation (%)', key: 'confirmation_rate' },
            { label: 'Taux Livraison (%)', key: 'delivery_rate' },
            { label: 'Profit Cible (DZD)', key: 'target_profit' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs text-gray-400 mb-1">{field.label}</label>
              <input type="number" className="input w-full" value={values[field.key]} onChange={e => setValues({...values, [field.key]: Number(e.target.value)})} />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="card border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-2 text-green-400">
              <Target className="w-5 h-5" />
              <h3 className="font-semibold">Seuil Comptable (Rentable)</h3>
            </div>
            <p className="text-xs text-gray-400 mb-3">Unités à livrer pour couvrir la pub. L'invendu reste un actif.</p>
            <div className="text-3xl font-bold text-white mb-1">
              {formatNumber(accountingBE, 1)} <span className="text-lg font-normal text-gray-400">livrées</span>
            </div>
            {selectedProductId && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progression: {formatNumber(totalDelivered, 1)} / {formatNumber(accountingBE, 1)}</span>
                  <span>{formatNumber(progressAccounting, 0)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, progressAccounting)}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="card border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-2 text-blue-400">
              <Package className="w-5 h-5" />
              <h3 className="font-semibold">Récupération Investissement</h3>
            </div>
            <p className="text-xs text-gray-400 mb-3">Unités à livrer pour récupérer l'inventaire total + la pub (cash-flow).</p>
            <div className="text-3xl font-bold text-white mb-1">
              {formatNumber(investmentBE, 1)} <span className="text-lg font-normal text-gray-400">livrées</span>
            </div>
            <div className="text-sm text-gray-400">Inventaire: {formatCurrency(totalInventoryCost, 'DZD')}</div>
            {selectedProductId && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progression: {formatNumber(totalDelivered, 1)} / {formatNumber(investmentBE, 1)}</span>
                  <span>{formatNumber(progressInvestment, 0)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, progressInvestment)}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="card grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400">Marge / Unité</div>
              <div className="text-xl font-semibold">{formatCurrency(marginPerUnit, 'DZD')}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">CPR CAP</div>
              <div className="text-xl font-semibold">{formatNumber(cprCap, 0)} DZD</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Break Even ROAS</div>
              <div className="text-xl font-semibold">{formatNumber(breakEvenROAS, 2)}x</div>
            </div>
          </div>

          {values.target_profit > 0 && (
            <div className="card border-l-4 border-purple-500">
              <h3 className="font-semibold text-purple-400 mb-2">Pour un profit de {formatCurrency(values.target_profit, 'DZD')}</h3>
              <div className="text-2xl font-bold">{Math.ceil(ordersNeeded)} commandes</div>
              <div className="text-sm text-gray-400">→ {formatNumber(confirmedNeeded, 1)} confirmées → {formatNumber(deliveredNeeded, 1)} livrées</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}