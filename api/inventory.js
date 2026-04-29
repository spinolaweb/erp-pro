import { Router } from 'express';
import { getDb } from './db.js';
const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query(`
      SELECT ip.*, p.name as product_name, s.name as supplier_name 
      FROM inventory_purchases ip
      LEFT JOIN products p ON ip.product_id = p.id
      LEFT JOIN suppliers s ON ip.supplier_id = s.id
      ORDER BY ip.purchase_date DESC, ip.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/product/:productId', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query(`
      SELECT ip.*, s.name as supplier_name 
      FROM inventory_purchases ip
      LEFT JOIN suppliers s ON ip.supplier_id = s.id
      WHERE ip.product_id = $1
      ORDER BY ip.purchase_date DESC
    `, [req.params.productId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { product_id, quantity, cost_price_dzd, purchase_date, supplier_id, notes } = req.body;
    const total_cost_dzd = quantity * cost_price_dzd;
    const result = await db.query(
      `INSERT INTO inventory_purchases 
       (product_id, quantity, cost_price_dzd, total_cost_dzd, purchase_date, supplier_id, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [product_id, quantity, cost_price_dzd, total_cost_dzd, purchase_date, supplier_id, notes]
    );
    await db.query(
      `UPDATE products SET stock_quantity = stock_quantity + $1, cost_price_dzd = $2 WHERE id = $3`,
      [quantity, cost_price_dzd, product_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    const purchase = await db.query('SELECT * FROM inventory_purchases WHERE id = $1', [req.params.id]);
    if (purchase.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const { product_id, quantity } = purchase.rows[0];
    await db.query('DELETE FROM inventory_purchases WHERE id = $1', [req.params.id]);
    await db.query(
      'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - $1) WHERE id = $2',
      [quantity, product_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;