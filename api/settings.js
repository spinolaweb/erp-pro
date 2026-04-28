import { Router } from 'express';
import { getDb } from './db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const settings = await db.get('SELECT * FROM settings WHERE id = 1');
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const db = getDb();
    const { exchange_rate, business_name, default_price, default_cost, 
            default_confirmation, default_delivery, dark_mode } = req.body;

    await db.run(
      `UPDATE settings SET exchange_rate = ?, business_name = ?, default_price = ?, 
       default_cost = ?, default_confirmation = ?, default_delivery = ?, dark_mode = ? WHERE id = 1`,
      [exchange_rate, business_name, default_price, default_cost, 
       default_confirmation, default_delivery, dark_mode]
    );

    const settings = await db.get('SELECT * FROM settings WHERE id = 1');
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
