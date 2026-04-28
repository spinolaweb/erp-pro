import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { Truck, Phone, MapPin } from 'lucide-react';

export function Suppliers() {
  const { data: suppliers, fetch, create, remove } = useApi('/api/suppliers');
  const [form, setForm] = useState({ name: '', phone: '', address: '', wilaya: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await create(form);
      setToast({ message: 'Fournisseur ajouté', type: 'success' });
      setForm({ name: '', phone: '', address: '', wilaya: '' });
      fetch();
    } catch (err) {
      setToast({ message: 'Erreur', type: 'error' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="card">
        <h3 className="font-bold text-lg mb-4">Nouveau Fournisseur</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input label="Nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <Input label="Téléphone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <Input label="Wilaya" value={form.wilaya} onChange={e => setForm({...form, wilaya: e.target.value})} />
          <Input label="Adresse" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          <div className="md:col-span-4">
            <Button type="submit">Ajouter Fournisseur</Button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suppliers?.map(supplier => (
          <div key={supplier.id} className="card flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Truck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{supplier.name}</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  {supplier.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {supplier.phone}</p>}
                  {supplier.wilaya && <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {supplier.wilaya}</p>}
                  {supplier.address && <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {supplier.address}</p>}
                </div>
              </div>
            </div>
            <Button variant="ghost" onClick={() => remove(supplier.id).then(fetch)}>Supprimer</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
