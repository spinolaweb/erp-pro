import { useState, useEffect } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useCalculator } from '../hooks/useCalculator';
import { LivePreview } from './LivePreview';
import { api } from '../hooks/useApi';
import { Toast } from './ui/Toast';

export function EntryForm({ settings, onSuccess }) {
  const exchangeRate = settings?.exchange_rate || 250;
  const { values, updateValue, metrics, setValues } = useCalculator({
    orders: 0,
    confirmation_rate: settings?.default_confirmation || 70,
    delivery_rate: settings?.default_delivery || 70,
    ad_spend_usd: 0,
    clicks: 0,
    selling_price_dzd: settings?.default_price || 4900,
    product_cost_dzd: settings?.default_cost || 3400
  }, exchangeRate);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [campaign, setCampaign] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState(null);
  useEffect(() => {
  }, []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const res = await api.get('/api/campaigns');
      setCampaigns(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/entries', {
        date,
        campaign,
        ...values,
        notes
      });
      setToast({ message: 'Entrée enregistrée avec succès !', type: 'success' });
      setValues({
        orders: 0, confirmation_rate: 70, delivery_rate: 70,
        ad_spend_usd: 0, clicks: 0,
        selling_price_dzd: settings?.default_price || 4900,
        product_cost_dzd: settings?.default_cost || 3400
      });
      setCampaign('');
      setNotes('');
      onSuccess?.();
    } catch (err) {
      setToast({ message: 'Erreur lors de l\'enregistrement', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h3 className="font-bold text-lg mb-4">Informations Générales</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Date" 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              required 
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campagne</label>
              <input 
                list="campaigns"
                className="input-field"
                value={campaign}
                onChange={e => setCampaign(e.target.value)}
                placeholder="Nom de la campagne"
              />
              <datalist id="campaigns">
                {campaigns.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-lg mb-4">Métriques de Commande</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Nombre de Commandes" 
              type="number" 
              min="0"
              value={values.orders || ''} 
              onChange={e => updateValue('orders', e.target.value)} 
              required 
            />
            <Input 
              label="Nombre de Clicks" 
              type="number" 
              min="0"
              value={values.clicks || ''} 
              onChange={e => updateValue('clicks', e.target.value)} 
            />
            <Input 
              label="Taux de Confirmation %" 
              type="number" 
              min="0" max="100" step="0.1"
              value={values.confirmation_rate || ''} 
              onChange={e => updateValue('confirmation_rate', e.target.value)} 
            />
            <Input 
              label="Taux de Livraison %" 
              type="number" 
              min="0" max="100" step="0.1"
              value={values.delivery_rate || ''} 
              onChange={e => updateValue('delivery_rate', e.target.value)} 
            />
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-lg mb-4">Financier</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Dépenses Publicitaires (USD)" 
              type="number" 
              min="0" step="0.01"
              value={values.ad_spend_usd || ''} 
              onChange={e => updateValue('ad_spend_usd', e.target.value)} 
            />
            <Input 
              label="CPR USD (auto)" 
              type="number" 
              step="0.01"
              value={values.cpr_usd?.toFixed(2) || ''} 
              readOnly 
              className="bg-gray-100"
            />
            <Input 
              label="Prix de Vente Unitaire (DZD)" 
              type="number" 
              min="0"
              value={values.selling_price_dzd || ''} 
              onChange={e => updateValue('selling_price_dzd', e.target.value)} 
            />
            <Input 
              label="Coût Produit Unitaire (DZD)" 
              type="number" 
              min="0"
              value={values.product_cost_dzd || ''} 
              onChange={e => updateValue('product_cost_dzd', e.target.value)} 
            />
          </div>
        </div>

        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea 
            className="input-field h-20 resize-none"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes optionnelles..."
          />
        </div>

        <Button type="submit" disabled={saving} className="w-full py-3 text-lg">
          {saving ? 'Enregistrement...' : '💾 Enregistrer l\'Entrée'}
        </Button>
      </form>

      <div className="lg:sticky lg:top-6 h-fit">
        <LivePreview metrics={metrics} exchangeRate={exchangeRate} />
      </div>
    </div>
  );
}
