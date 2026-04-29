import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Toast } from '../components/ui/Toast';
import { Package, AlertTriangle } from 'lucide-react';

export function Products() {
  const { data: products, fetch, create, remove } = useApi('/api/products');
  const [form, setForm] = useState({ name: '', selling_price_dzd: '', cost_price_dzd: '', stock_quantity: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await create(form);
      setToast({ message: 'Produit ajouté', type: 'success' });
      setForm({ name: '', selling_price_dzd: '', cost_price_dzd: '', stock_quantity: '' });
      fetch();
    } catch (err) {
      setToast({ message: 'Erreur', type: 'error' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="card">
        <h3 className="font-bold text-lg mb-4">Nouveau Produit</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input label="Nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <Input label="Prix Vente DZD" type="number" value={form.selling_price_dzd} onChange={e => setForm({...form, selling_price_dzd: e.target.value})} required />
          <Input label="Coût DZD" type="number" value={form.cost_price_dzd} onChange={e => setForm({...form, cost_price_dzd: e.target.value})} required />
          <Input label="Stock" type="number" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})} />
          <div className="md:col-span-4">
            <Button type="submit">Ajouter Produit</Button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products?.map(product => (
          <div key={product.id} className="card relative">
            {product.stock_quantity < 10 && (
              <div className="absolute top-4 right-4">
                <Badge variant="warning"><AlertTriangle className="w-3 h-3 mr-1" /> Stock Faible</Badge>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-500">{product.supplier_name || 'Sans fournisseur'}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-500">Prix</p>
                <p className="font-bold tabular-nums">{product.selling_price_dzd}</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-500">Coût</p>
                <p className="font-bold tabular-nums">{product.cost_price_dzd}</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-500">Stock</p>
                <p className={`font-bold tabular-nums ${product.stock_quantity < 10 ? 'text-red-600' : ''}`}>
                  {product.stock_quantity}
                </p>
              </div>
            </div>
            <Button variant="danger" className="w-full mt-4" onClick={() => remove(product.id).then(fetch)}>
              Supprimer
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
