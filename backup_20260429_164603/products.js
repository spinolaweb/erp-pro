import { Router } from 'express';
import { getDb } from './db.js';
const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('SELECT p.*, s.name as supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id ORDER BY p.created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { name, selling_price_dzd, cost_price_dzd, stock_quantity, supplier_id } = req.body;
    const result = await db.query('INSERT INTO products (name, selling_price_dzd, cost_price_dzd, stock_quantity, supplier_id) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, selling_price_dzd, cost_price_dzd, stock_quantity || 0, supplier_id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = getDb();
    const { name, selling_price_dzd, cost_price_dzd, stock_quantity, supplier_id } = req.body;
    await db.query('UPDATE products SET name = $1, selling_price_dzd = $2, cost_price_dzd = $3, stock_quantity = $4, supplier_id = $5 WHERE id = $6', [name, selling_price_dzd, cost_price_dzd, stock_quantity, supplier_id, req.params.id]);
    const result = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
