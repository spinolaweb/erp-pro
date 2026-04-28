import { Router } from 'express';
import { getDb } from './db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { startDate, endDate, campaign, search } = req.query;
    let sql = 'SELECT * FROM entries WHERE 1=1';
    const params = [];
    const conditions = [];

    if (startDate) { conditions.push('date >= $' + (params.length + 1)); params.push(startDate); }
    if (endDate) { conditions.push('date <= $' + (params.length + 1)); params.push(endDate); }
    if (campaign) { conditions.push('campaign = $' + (params.length + 1)); params.push(campaign); }
    if (search) { conditions.push('(campaign ILIKE $' + (params.length + 1) + ' OR notes ILIKE $' + (params.length + 2) + ')'); params.push('%' + search + '%', '%' + search + '%'); }
    
    if (conditions.length) sql += ' AND ' + conditions.join(' AND ');
    sql += ' ORDER BY date DESC, created_at DESC';
    
    const result = await db.query(sql, params);
    res.json(result.rows);
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
    
    const result = await db.query(
      `INSERT INTO entries (date, campaign, orders, confirmation_rate, delivery_rate, 
        ad_spend_usd, cpr_usd, clicks, selling_price_dzd, product_cost_dzd, notes, product_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [date, campaign, orders, confirmation_rate, delivery_rate, ad_spend_usd, 
       cpr_usd || calculatedCpr, clicks || 0, selling_price_dzd, product_cost_dzd, notes, product_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.query('DELETE FROM entries WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/bulk/delete', async (req, res) => {
  try {
    const db = getDb();
    const { ids } = req.body;
    const placeholders = ids.map((_, i) => '$' + (i + 1)).join(',');
    await db.query(`DELETE FROM entries WHERE id IN (${placeholders})`, ids);
    res.json({ success: true, deleted: ids.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;