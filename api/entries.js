import { Router } from 'express';
import { getDb } from './db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { startDate, endDate, campaign, search } = req.query;
    let sql = 'SELECT * FROM entries WHERE 1=1';
    const params = [];

    if (startDate) { sql += ' AND date >= ?'; params.push(startDate); }
    if (endDate) { sql += ' AND date <= ?'; params.push(endDate); }
    if (campaign) { sql += ' AND campaign = ?'; params.push(campaign); }
    if (search) { sql += ' AND (campaign LIKE ? OR notes LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    sql += ' ORDER BY date DESC, created_at DESC';
    const entries = await db.all(sql, params);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { date, campaign, orders, confirmation_rate, delivery_rate, ad_spend_usd, 
            cpr_usd, clicks, selling_price_dzd, product_cost_dzd, notes, product_id } = req.body;

    const calculatedCpr = orders > 0 ? ad_spend_usd / orders : 0;

    const result = await db.run(
      `INSERT INTO entries (date, campaign, orders, confirmation_rate, delivery_rate, 
        ad_spend_usd, cpr_usd, clicks, selling_price_dzd, product_cost_dzd, notes, product_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, campaign, orders, confirmation_rate, delivery_rate, ad_spend_usd, 
       cpr_usd || calculatedCpr, clicks || 0, selling_price_dzd, product_cost_dzd, notes, product_id]
    );

    const entry = await db.get('SELECT * FROM entries WHERE id = ?', result.lastID);
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.run('DELETE FROM entries WHERE id = ?', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/bulk/delete', async (req, res) => {
  try {
    const db = getDb();
    const { ids } = req.body;
    const placeholders = ids.map(() => '?').join(',');
    await db.run(`DELETE FROM entries WHERE id IN (${placeholders})`, ids);
    res.json({ success: true, deleted: ids.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
