import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useSettings } from '../hooks/useSettings';
import { DataTable } from '../components/DataTable';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { Search, Filter } from 'lucide-react';

export function History() {
  const { data: entries, fetch, loading, remove, bulkRemove } = useApi('/api/entries');
  const { settings } = useSettings();
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => { fetch(); }, []);

  const handleSearch = () => {
    fetch({ search, startDate, endDate });
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette entrée ?')) return;
    try {
      await remove(id);
      setToast({ message: 'Entrée supprimée', type: 'success' });
      fetch();
    } catch (err) {
      setToast({ message: 'Erreur de suppression', type: 'error' });
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await bulkRemove(ids);
      setToast({ message: `${ids.length} entrées supprimées`, type: 'success' });
      fetch();
    } catch (err) {
      setToast({ message: 'Erreur de suppression', type: 'error' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="card">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input 
              label="Recherche" 
              placeholder="Campagne ou notes..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Input label="Du" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <Input label="Au" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <Button onClick={handleSearch} className="flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filtrer
          </Button>
        </div>
      </div>

      <DataTable 
        data={entries || []} 
        exchangeRate={settings?.exchange_rate || 250}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        loading={loading}
      />
    </div>
  );
}
