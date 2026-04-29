import { useState, useEffect } from 'react';
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
}