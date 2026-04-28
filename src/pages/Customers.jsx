import { useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { Users, Phone, MapPin, ShoppingBag } from 'lucide-react';

export function Customers() {
  const { data: customers, fetch, loading } = useApi('/api/customers');

  useEffect(() => { fetch(); }, []);

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers?.map(customer => (
          <div key={customer.id} className="card">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{customer.name || 'Client ' + customer.phone}</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {customer.phone}</p>
                  <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {customer.wilaya || '-'}</p>
                </div>
                <div className="mt-3 flex gap-4 text-sm">
                  <span className="flex items-center gap-1 text-blue-600 font-medium">
                    <ShoppingBag className="w-4 h-4" /> {customer.orders_count} cmd
                  </span>
                  <span className="font-bold tabular-nums">{customer.total_spent_dzd?.toLocaleString('fr-FR')} DZD</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
