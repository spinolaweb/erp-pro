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
    campaign_quantity: 0,
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
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCampaigns(); }, []);
  const loadCampaigns = async () => {
    try { const res = await api.get('/api/campaigns'); setCampaigns(res.data); } 
    catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/entries', { date, campaign, ...values, notes });
      setToast({ message: 'Entrée enregistrée avec succès !', type: 'success' });
      setValues({
        campaign_quantity: 0, orders: 0, confirmation_rate: 70, delivery_rate: 70,
        ad_spend_usd: 0, clicks: 0, selling_price_dzd: settings?.default_price || 4900, product_cost_dzd: settings?.default_cost || 3400
      });
      setCampaign(''); setNotes(''); onSuccess?.();
    } catch (err) {
      setToast({ message: 'Erreur lors de lenregistrement', type: 'error' });
    } finally { setSaving(false); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <form onSubmit={handleSubmit} className="space-y-


echo "🚀 Upgrading ERP to Advanced True-Profit Tracking..."

cd /workspaces/erp-pro

# 1. Update Database Schema to include campaign_quantity
echo "🛠️ Upgrading database schema..."
cat << 'EOF' > api/db.js
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function initDatabase() {
  const client = await pool.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      exchange_rate REAL DEFAULT 250,
      business_name TEXT DEFAULT 'Mon Entreprise',
      default_price REAL DEFAULT 4900,
      default_cost REAL DEFAULT 3400,
      default_confirmation REAL DEFAULT 70,
      default_delivery REAL DEFAULT 70,
      dark_mode INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS entries (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      campaign TEXT,
      orders INTEGER NOT NULL,
      confirmation_rate REAL NOT NULL,
      delivery_rate REAL NOT NULL,
      ad_spend_usd REAL NOT NULL,
      cpr_usd REAL,
      clicks INTEGER DEFAULT 0,
      selling_price_dzd REAL NOT NULL,
      product_cost_dzd REAL NOT NULL,
      notes TEXT,
      product_id INTEGER,
      campaign_quantity INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      selling_price_dzd REAL NOT NULL,
      cost_price_dzd REAL NOT NULL,
      stock_quantity INTEGER DEFAULT 0,
      supplier_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS suppliers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      wilaya TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name TEXT,
      phone TEXT UNIQUE,
      wilaya TEXT,
      address TEXT,
      orders_count INTEGER DEFAULT 0,
      total_spent_dzd REAL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS campaigns (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      platform TEXT,
      budget_usd REAL,
      start_date TEXT,
      end_date TEXT,
      active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
    
    -- Safely add the new column to existing databases
    ALTER TABLE entries ADD COLUMN IF NOT EXISTS campaign_quantity INTEGER DEFAULT 0;
  `);
  client.release();
  console.log('PostgreSQL initialized & updated with campaign_quantity');
}

export function getDb() {
  return pool;
}
