cat > api/settings.js << 'EOF'
import { Router } from 'express';
import { getDb } from './db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('SELECT * FROM settings WHERE id = 1');
    res.json(result.rows[0] || { id: 1, exchange_rate: 250, business_name: 'Mon Entreprise', default_price: 4900, default_cost: 3400, default_confirmation: 70, default_delivery: 70, dark_mode: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const db = getDb();
    const { exchange_rate, business_name, default_price, default_cost, 
            default_confirmation, default_delivery, dark_mode } = req.body;
    
    await db.query(
      `INSERT INTO settings (id, exchange_rate, business_name, default_price, default_cost, default_confirmation, default_delivery, dark_mode)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         exchange_rate = EXCLUDED.exchange_rate,
         business_name = EXCLUDED.business_name,
         default_price = EXCLUDED.default_price,
         default_cost = EXCLUDED.default_cost,
         default_confirmation = EXCLUDED.default_confirmation,
         default_delivery = EXCLUDED.default_delivery,
         dark_mode = EXCLUDED.dark_mode`,
      [exchange_rate, business_name, default_price, default_cost, 
       default_confirmation, default_delivery, dark_mode]
    );
    
    const result = await db.query('SELECT * FROM settings WHERE id = 1');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
EOF
