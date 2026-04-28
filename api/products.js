import { Router } from 'express';
import { getDb } from './db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const products = await db.all(`
      SELECT p.*, s.name as supplier_name 
      FROM products p 
      LEFT JOIN suppliers s ON p.supplier_id = s.id 
      ORDER BY p.created_at DESC
    `);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { name, selling_price_dzd, cost_price_dzd, stock_quantity, supplier_id } = req.body;
    const result = await db.run(
      'INSERT INTO products (name, selling_price_dzd, cost_price_dzd, stock_quantity, supplier_id) VALUES (?, ?, ?, ?, ?)',
      [name, selling_price_dzd, cost_price_dzd, stock_quantity || 0, supplier_id]
    );
    const product = await db.get('SELECT * FROM products WHERE id = ?', result.lastID);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = getDb();
    const { name, selling_price_dzd, cost_price_dzd, stock_quantity, supplier_id } = req.body;
    await db.run(
      'UPDATE products SET name = ?, selling_price_dzd = ?, cost_price_dzd = ?, stock_quantity = ?, supplier_id = ? WHERE id = ?',
      [name, selling_price_dzd, cost_price_dzd, stock_quantity, supplier_id, req.params.id]
    );
    const product = await db.get('SELECT * FROM products WHERE id = ?', req.params.id);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.run('DELETE FROM products WHERE id = ?', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
