#!/usr/bin/env python3
import os
import shutil
from datetime import datetime

BASE = os.getcwd()
BACKUP = os.path.join(BASE, f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
os.makedirs(BACKUP, exist_ok=True)

def backup(path):
    src = os.path.join(BASE, path)
    if os.path.exists(src):
        shutil.copy2(src, BACKUP)

def read(path):
    with open(os.path.join(BASE, path), 'r', encoding='utf-8') as f:
        return f.read()

def write(path, content):
    with open(os.path.join(BASE, path), 'w', encoding='utf-8') as f:
        f.write(content)

def append(path, content):
    with open(os.path.join(BASE, path), 'a', encoding='utf-8') as f:
        f.write(content)

ok = 0
skip = 0

print("=" * 50)
print("  ERP-Pro Auto-Setup (Python)")
print("=" * 50)
print()

# =============================================================================
# 1. CREATE api/inventory.js
# =============================================================================
backup("api/inventory.js")
inventory_js = r'''import { Router } from 'express';
import { getDb } from './db.js';
const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query(`
      SELECT ip.*, p.name as product_name, s.name as supplier_name 
      FROM inventory_purchases ip
      LEFT JOIN products p ON ip.product_id = p.id
      LEFT JOIN suppliers s ON ip.supplier_id = s.id
      ORDER BY ip.purchase_date DESC, ip.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/product/:productId', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query(`
      SELECT ip.*, s.name as supplier_name 
      FROM inventory_purchases ip
      LEFT JOIN suppliers s ON ip.supplier_id = s.id
      WHERE ip.product_id = $1
      ORDER BY ip.purchase_date DESC
    `, [req.params.productId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { product_id, quantity, cost_price_dzd, purchase_date, supplier_id, notes } = req.body;
    const total_cost_dzd = quantity * cost_price_dzd;
    const result = await db.query(
      `INSERT INTO inventory_purchases 
       (product_id, quantity, cost_price_dzd, total_cost_dzd, purchase_date, supplier_id, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [product_id, quantity, cost_price_dzd, total_cost_dzd, purchase_date, supplier_id, notes]
    );
    await db.query(
      `UPDATE products SET stock_quantity = stock_quantity + $1, cost_price_dzd = $2 WHERE id = $3`,
      [quantity, cost_price_dzd, product_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    const purchase = await db.query('SELECT * FROM inventory_purchases WHERE id = $1', [req.params.id]);
    if (purchase.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const { product_id, quantity } = purchase.rows[0];
    await db.query('DELETE FROM inventory_purchases WHERE id = $1', [req.params.id]);
    await db.query(
      'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - $1) WHERE id = $2',
      [quantity, product_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;'''
write("api/inventory.js", inventory_js)
print("✅ Created api/inventory.js")
ok += 1

# =============================================================================
# 2. UPDATE api/db.js
# =============================================================================
backup("api/db.js")
db_js = read("api/db.js")
if "inventory_purchases" not in db_js:
    db_js = db_js.replace(
        "    INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;",
        '''    INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
    CREATE TABLE IF NOT EXISTS inventory_purchases (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      cost_price_dzd REAL NOT NULL,
      total_cost_dzd REAL NOT NULL,
      purchase_date TEXT,
      supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );'''
    )
    write("api/db.js", db_js)
    print("✅ Updated api/db.js")
    ok += 1
else:
    print("⏭️  api/db.js already has inventory_purchases")
    skip += 1

# =============================================================================
# 3. UPDATE api/products.js
# =============================================================================
backup("api/products.js")
prod_js = read("api/products.js")
old_query = "const result = await db.query('SELECT p.*, s.name as supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id ORDER BY p.created_at DESC');"
if old_query in prod_js and "total_purchased" not in prod_js:
    new_query = '''const result = await db.query(`
      SELECT 
        p.*, 
        s.name as supplier_name,
        COALESCE(SUM(ip.quantity), 0) as total_purchased,
        COALESCE(SUM(ip.total_cost_dzd), 0) as total_inventory_investment,
        COALESCE((
          SELECT SUM(e.orders * e.confirmation_rate / 100.0 * e.delivery_rate / 100.0) 
          FROM entries e 
          WHERE e.product_id = p.id
        ), 0) as total_delivered,
        COALESCE(SUM(ip.quantity), 0) - COALESCE((
          SELECT SUM(e.orders * e.confirmation_rate / 100.0 * e.delivery_rate / 100.0) 
          FROM entries e 
          WHERE e.product_id = p.id
        ), 0) as remaining_stock
      FROM products p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN inventory_purchases ip ON ip.product_id = p.id
      GROUP BY p.id, s.name
      ORDER BY p.created_at DESC
    `);'''
    prod_js = prod_js.replace(old_query, new_query)
    write("api/products.js", prod_js)
    print("✅ Updated api/products.js")
    ok += 1
else:
    print("⏭️  api/products.js already updated or structure changed")
    skip += 1

# =============================================================================
# 4. UPDATE server.js
# =============================================================================
backup("server.js")
srv_js = read("server.js")
if "import inventoryRouter" not in srv_js:
    srv_js = srv_js.replace(
        "import backupRouter from './api/backup.js';",
        "import backupRouter from './api/backup.js';\nimport inventoryRouter from './api/inventory.js';"
    )
    srv_js = srv_js.replace(
        "app.use('/api/backup', backupRouter);",
        "app.use('/api/backup', backupRouter);\napp.use('/api/inventory', inventoryRouter);"
    )
    write("server.js", srv_js)
    print("✅ Updated server.js")
    ok += 1
else:
    print("⏭️  server.js already has inventory route")
    skip += 1

# =============================================================================
# 5. UPDATE src/utils/calculator.js
# =============================================================================
backup("src/utils/calculator.js")
calc_js = read("src/utils/calculator.js")
if "calculateAccountingBreakEven" not in calc_js:
    calc_js += r'''

// ======================
// INVENTORY & BREAK-EVEN
// ======================

export function calculateDelivered(orders, confirmationRate, deliveryRate) {
  return orders * (confirmationRate / 100) * (deliveryRate / 100);
}

export function calculateAccountingBreakEven(adSpendUSD, sellingPriceDZD, productCostDZD, exchangeRate) {
  const marginPerUnitDZD = sellingPriceDZD - productCostDZD;
  const marginPerUnitUSD = marginPerUnitDZD / exchangeRate;
  if (marginPerUnitUSD <= 0) return Infinity;
  return adSpendUSD / marginPerUnitUSD;
}

export function calculateInvestmentBreakEven(totalInventoryCostDZD, totalAdSpendUSD, sellingPriceDZD, productCostDZD, exchangeRate) {
  const marginPerUnitDZD = sellingPriceDZD - productCostDZD;
  if (marginPerUnitDZD <= 0) return Infinity;
  const totalAdSpendDZD = totalAdSpendUSD * exchangeRate;
  const totalInvestment = totalInventoryCostDZD + totalAdSpendDZD;
  return totalInvestment / marginPerUnitDZD;
}

export function calculateInventoryValue(remainingStock, costPriceDZD) {
  return remainingStock * costPriceDZD;
}

export function calculateBreakEvenProgress(totalDelivered, breakEvenUnits) {
  if (breakEvenUnits <= 0 || !isFinite(breakEvenUnits)) return 0;
  return Math.min(100, (totalDelivered / breakEvenUnits) * 100);
}
'''
    write("src/utils/calculator.js", calc_js)
    print("✅ Updated src/utils/calculator.js")
    ok += 1
else:
    print("⏭️  calculator.js already has break-even functions")
    skip += 1

# =============================================================================
# 6. REPLACE src/pages/Products.jsx
# =============================================================================
backup("src/pages/Products.jsx")
products_jsx = r'''import { useState, useEffect } from 'react';
import { Plus, Package, Trash2, TrendingUp } from 'lucide-react';
import { API_URL } from '../utils/constants';
import { formatCurrency, formatNumber } from '../utils/formatter';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({ name: '', selling_price_dzd: '', cost_price_dzd: '', stock_quantity: 0, supplier_id: '' });
  const [purchaseForm, setPurchaseForm] = useState({ product_id: '', quantity: '', cost_price_dzd: '', purchase_date: '', supplier_id: '', notes: '' });

  useEffect(() => { fetchProducts(); fetchSuppliers(); }, []);

  const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/api/products`);
    const data = await res.json();
    setProducts(data);
  };

  const fetchSuppliers = async () => {
    const res = await fetch(`${API_URL}/api/suppliers`);
    const data = await res.json();
    setSuppliers(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ name: '', selling_price_dzd: '', cost_price_dzd: '', stock_quantity: 0, supplier_id: '' });
    setShowForm(false);
    fetchProducts();
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/api/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(purchaseForm)
    });
    setPurchaseForm({ product_id: '', quantity: '', cost_price_dzd: '', purchase_date: '', supplier_id: '', notes: '' });
    setShowPurchaseForm(false);
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6" /> Produits & Stock
        </h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouveau Produit
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="Nom du produit" className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input placeholder="Prix de vente (DZD)" type="number" className="input" value={form.selling_price_dzd} onChange={e => setForm({...form, selling_price_dzd: e.target.value})} required />
            <input placeholder="Coût produit (DZD)" type="number" className="input" value={form.cost_price_dzd} onChange={e => setForm({...form, cost_price_dzd: e.target.value})} required />
            <select className="input" value={form.supplier_id} onChange={e => setForm({...form, supplier_id: e.target.value})}>
              <option value="">Fournisseur (optionnel)</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Créer</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
          </div>
        </form>
      )}

      {showPurchaseForm && selectedProduct && (
        <form onSubmit={handlePurchase} className="card space-y-4 border-l-4 border-blue-500">
          <h3 className="font-semibold text-lg">Achat de Stock — {selectedProduct.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input placeholder="Quantité" type="number" className="input" value={purchaseForm.quantity} onChange={e => setPurchaseForm({...purchaseForm, product_id: selectedProduct.id, quantity: e.target.value})} required />
            <input placeholder="Coût unitaire (DZD)" type="number" className="input" value={purchaseForm.cost_price_dzd} onChange={e => setPurchaseForm({...purchaseForm, cost_price_dzd: e.target.value})} required />
            <input placeholder="Date d'achat" type="date" className="input" value={purchaseForm.purchase_date} onChange={e => setPurchaseForm({...purchaseForm, purchase_date: e.target.value})} />
            <select className="input" value={purchaseForm.supplier_id} onChange={e => setPurchaseForm({...purchaseForm, supplier_id: e.target.value})}>
              <option value="">Fournisseur</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <input placeholder="Notes (optionnel)" className="input w-full" value={purchaseForm.notes} onChange={e => setPurchaseForm({...purchaseForm, notes: e.target.value})} />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Enregistrer l'achat</button>
            <button type="button" onClick={() => setShowPurchaseForm(false)} className="btn-secondary">Annuler</button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-left text-gray-400">
              <th className="pb-3 pr-4">Produit</th>
              <th className="pb-3 pr-4 text-right">Prix Vente</th>
              <th className="pb-3 pr-4 text-right">Coût Unit.</th>
              <th className="pb-3 pr-4 text-right">Total Acheté</th>
              <th className="pb-3 pr-4 text-right">Total Livré</th>
              <th className="pb-3 pr-4 text-right">Stock Restant</th>
              <th className="pb-3 pr-4 text-right">Valeur Stock</th>
              <th className="pb-3 pr-4 text-right">Investissement</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {products.map(p => (
              <tr key={p.id} className="group">
                <td className="py-3 pr-4 font-medium">{p.name}</td>
                <td className="py-3 pr-4 text-right">{formatCurrency(p.selling_price_dzd, 'DZD')}</td>
                <td className="py-3 pr-4 text-right">{formatCurrency(p.cost_price_dzd, 'DZD')}</td>
                <td className="py-3 pr-4 text-right">{formatNumber(p.total_purchased, 0)}</td>
                <td className="py-3 pr-4 text-right text-blue-400">{formatNumber(p.total_delivered, 1)}</td>
                <td className="py-3 pr-4 text-right font-semibold text-green-400">{formatNumber(p.remaining_stock, 0)}</td>
                <td className="py-3 pr-4 text-right text-gray-400">{formatCurrency((parseFloat(p.remaining_stock)||0)*(parseFloat(p.cost_price_dzd)||0), 'DZD')}</td>
                <td className="py-3 pr-4 text-right text-yellow-400">{formatCurrency(p.total_inventory_investment, 'DZD')}</td>
                <td className="py-3 text-right">
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setSelectedProduct(p); setShowPurchaseForm(true); }}
                      className="p-1.5 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30"
                      title="Acheter du stock"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}'''
write("src/pages/Products.jsx", products_jsx)
print("✅ Replaced src/pages/Products.jsx")
ok += 1

# =============================================================================
# 7. REPLACE src/pages/BreakEvenCalculator.jsx
# =============================================================================
backup("src/pages/BreakEvenCalculator.jsx")
be_jsx = r'''import { useState, useEffect } from 'react';
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
}'''
write("src/pages/BreakEvenCalculator.jsx", be_jsx)
print("✅ Replaced src/pages/BreakEvenCalculator.jsx")
ok += 1

# =============================================================================
# 8. SURGICAL: src/pages/Dashboard.jsx
# =============================================================================
if os.path.exists(os.path.join(BASE, "src/pages/Dashboard.jsx")):
    backup("src/pages/Dashboard.jsx")
    dash = read("src/pages/Dashboard.jsx")
    changed = False

    if "const [products, setProducts]" not in dash:
        # Try to inject after entries state
        if "const [entries, setEntries] = useState([]);" in dash:
            dash = dash.replace(
                "const [entries, setEntries] = useState([]);",
                "const [entries, setEntries] = useState([]);\n  const [products, setProducts] = useState([]);"
            )
            changed = True

    if "fetch(`${API_URL}/api/products`)" not in dash:
        # Inject before return statement in component body
        if "return (" in dash:
            dash = dash.replace(
                "return (",
                "useEffect(() => {\n    fetch(`${API_URL}/api/products`).then(r => r.json()).then(setProducts);\n  }, []);\n\n  return (",
                1
            )
            changed = True

    if "Valeur Stock (Actif)" not in dash:
        # Find a good injection point - after the last KPICard or before Répartition
        if "Répartition des Coûts" in dash:
            dash = dash.replace(
                "### Répartition des Coûts",
                '''### KPIs Stock & Break-Even

{/* Valeur Stock (Actif) */}
<KPICard
  title="Valeur Stock (Actif)"
  value={products.reduce((sum, p) => sum + ((parseFloat(p.remaining_stock)||0)*(parseFloat(p.cost_price_dzd)||0)), 0)}
  prefix="DZD"
  type="neutral"
/>

{/* Break-Even Progress */}
{products.length > 0 && (() => {
  const totalDelivered = products.reduce((s, p) => s + (parseFloat(p.total_delivered)||0), 0);
  const totalAdSpend = totals.adSpend || 0;
  const avgPrice = products.reduce((s, p) => s + (parseFloat(p.selling_price_dzd)||0), 0) / (products.length||1);
  const avgCost = products.reduce((s, p) => s + (parseFloat(p.cost_price_dzd)||0), 0) / (products.length||1);
  const beUnits = (avgPrice - avgCost) > 0 ? (totalAdSpend * exchangeRate) / (avgPrice - avgCost) : 0;
  const progress = beUnits > 0 ? Math.min(100, (totalDelivered / beUnits) * 100) : 0;
  return (
    <KPICard
      title="Progression Break-Even"
      value={`${formatNumber(progress, 0)}%`}
      subtitle={`${formatNumber(totalDelivered, 0)} / ${formatNumber(beUnits, 0)} livrées`}
      type={progress >= 100 ? 'profit' : 'warning'}
    />
  );
})()}

### Répartition des Coûts'''
            )
            changed = True

    if changed:
        write("src/pages/Dashboard.jsx", dash)
        print("✅ Updated src/pages/Dashboard.jsx")
        ok += 1
    else:
        print("⏭️  Dashboard.jsx already updated or needs manual check")
        skip += 1
else:
    print("⚠️  src/pages/Dashboard.jsx not found")
    skip += 1

# =============================================================================
# 9. SURGICAL: src/components/EntryForm.jsx
# =============================================================================
if os.path.exists(os.path.join(BASE, "src/components/EntryForm.jsx")):
    backup("src/components/EntryForm.jsx")
    entry = read("src/components/EntryForm.jsx")
    changed = False

    if "const [products, setProducts]" not in entry:
        if "const [toast, setToast] = useState(null);" in entry:
            entry = entry.replace(
                "const [toast, setToast] = useState(null);",
                "const [toast, setToast] = useState(null);\n  const [products, setProducts] = useState([]);\n  useEffect(() => {\n    fetch(`${API_URL}/api/products`).then(r => r.json()).then(setProducts);\n  }, []);"
            )
            changed = True

    if "Produit" not in entry and "Campagne" in entry:
        # Find the campaign select and add product select after it
        if "</select>" in entry:
            # Find the campaign select block
            idx = entry.find("Campagne")
            if idx != -1:
                # Find closing </select> after Campagne
                close_idx = entry.find("</select>", idx)
                if close_idx != -1:
                    insert_after = close_idx + len("</select>")
                    product_select = '''
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Produit</label>
            <select
              className="input w-full"
              value={form.product_id || ''}
              onChange={e => updateValue('product_id', e.target.value)}
            >
              <option value="">-- Sélectionner --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>'''
                    entry = entry[:insert_after] + product_select + entry[insert_after:]
                    changed = True

    if changed:
        write("src/components/EntryForm.jsx", entry)
        print("✅ Updated src/components/EntryForm.jsx")
        ok += 1
    else:
        print("⏭️  EntryForm.jsx already updated or needs manual check")
        skip += 1
else:
    print("⚠️  src/components/EntryForm.jsx not found")
    skip += 1

# =============================================================================
# Done
# =============================================================================
print()
print("=" * 50)
print(f"Done: {ok} modified, {skip} skipped")
print("=" * 50)
print()
print("Next steps:")
print("  1. git diff  (review changes)")
print("  2. git add . && git commit -m 'add inventory tracking & break-even'")
print("  3. git push origin main")
print("  4. On Render: the new table auto-creates on next deploy")
print()
print(f"If anything looks wrong, restore from: {BACKUP}/")