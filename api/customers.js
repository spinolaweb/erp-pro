import { Router } from 'express';
import { getDb } from './db.js';
const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('SELECT * FROM customers ORDER BY total_spent_dzd DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { name, phone, wilaya, address } = req.body;
    const result = await db.query('INSERT INTO customers (name, phone, wilaya, address) VALUES ($1, $2, $3, $4) RETURNING *', [name, phone, wilaya, address]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
