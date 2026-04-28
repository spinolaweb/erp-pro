import { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { Download, Moon, Sun } from 'lucide-react';

export function Settings() {
  const { settings, updateSettings, loading } = useSettings();
  const [form, setForm] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(form);
      setToast({ message: 'Paramètres enregistrés', type: 'success' });
    } catch (err) {
      setToast({ message: 'Erreur', type: 'error' });
    }
  };

  const downloadBackup = () => {
    window.open('/api/backup/download', '_blank');
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6 max-w-2xl space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h3 className="font-bold text-lg mb-4">Paramètres Généraux</h3>
          <div className="space-y-4">
            <Input 
              label="Nom de l'Entreprise" 
              value={form.business_name || ''} 
              onChange={e => setForm({...form, business_name: e.target.value})}
            />
            <Input 
              label="Taux de Change DZD/USD" 
              type="number" 
              step="0.01"
              value={form.exchange_rate || ''} 
              onChange={e => setForm({...form, exchange_rate: Number(e.target.value)})}
            />
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-lg mb-4">Valeurs par Défaut</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prix Vente DZD" type="number" value={form.default_price || ''} onChange={e => setForm({...form, default_price: Number(e.target.value)})} />
            <Input label="Coût Produit DZD" type="number" value={form.default_cost || ''} onChange={e => setForm({...form, default_cost: Number(e.target.value)})} />
            <Input label="Confirmation %" type="number" value={form.default_confirmation || ''} onChange={e => setForm({...form, default_confirmation: Number(e.target.value)})} />
            <Input label="Livraison %" type="number" value={form.default_delivery || ''} onChange={e => setForm({...form, default_delivery: Number(e.target.value)})} />
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-lg mb-4">Apparence</h3>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setForm({...form, dark_mode: 0})}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${form.dark_mode === 0 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}
            >
              <Sun className="w-4 h-4" /> Clair
            </button>
            <button
              type="button"
              onClick={() => setForm({...form, dark_mode: 1})}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${form.dark_mode === 1 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}
            >
              <Moon className="w-4 h-4" /> Sombre
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full">Enregistrer les Paramètres</Button>
      </form>

      <div className="card">
        <h3 className="font-bold text-lg mb-4">Sauvegarde des Données</h3>
        <div className="flex gap-4">
          <Button variant="outline" onClick={downloadBackup} className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Télécharger Backup
          </Button>
        </div>
      </div>
    </div>
  );
}
