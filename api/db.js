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
  `);
  client.release();
  console.log('PostgreSQL initialized');
}

export function getDb() {
  return pool;
}
