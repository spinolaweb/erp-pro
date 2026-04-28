import { Router } from 'express';
import { getDb } from './db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const customers = await db.all('SELECT * FROM customers ORDER BY total_spent_dzd DESC');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { name, phone, wilaya, address } = req.body;
    const result = await db.run(
      'INSERT INTO customers (name, phone, wilaya, address) VALUES (?, ?, ?, ?)',
      [name, phone, wilaya, address]
    );
    const customer = await db.get('SELECT * FROM customers WHERE id = ?', result.lastID);
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
