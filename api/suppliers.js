import { Router } from 'express';
import { getDb } from './db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const suppliers = await db.all('SELECT * FROM suppliers ORDER BY name');
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { name, phone, address, wilaya } = req.body;
    const result = await db.run(
      'INSERT INTO suppliers (name, phone, address, wilaya) VALUES (?, ?, ?, ?)',
      [name, phone, address, wilaya]
    );
    const supplier = await db.get('SELECT * FROM suppliers WHERE id = ?', result.lastID);
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.run('DELETE FROM suppliers WHERE id = ?', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
