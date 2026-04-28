cat > api/campaigns.js << 'EOF'
import { Router } from 'express';
import { getDb } from './db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('SELECT * FROM campaigns ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { name, platform, budget_usd, start_date, end_date } = req.body;
    const result = await db.query(
      'INSERT INTO campaigns (name, platform, budget_usd, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, platform, budget_usd, start_date, end_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
EOF
