import { Router } from 'express';
import { getDb } from './db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const campaigns = await db.all('SELECT * FROM campaigns ORDER BY created_at DESC');
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { name, platform, budget_usd, start_date, end_date } = req.body;
    const result = await db.run(
      'INSERT INTO campaigns (name, platform, budget_usd, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      [name, platform, budget_usd, start_date, end_date]
    );
    const campaign = await db.get('SELECT * FROM campaigns WHERE id = ?', result.lastID);
    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
