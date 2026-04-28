import { Router } from 'express';
import fs from 'fs';
const router = Router();
const DB_PATH = process.env.DB_PATH || './database.sqlite';

router.get('/download', (req, res) => {
  if (fs.existsSync(DB_PATH)) {
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename=database_backup.sqlite');
    fs.createReadStream(DB_PATH).pipe(res);
  } else {
    res.status(404).json({ error: 'Database file not found' });
  }
});

router.post('/restore', (req, res) => {
  res.status(501).json({ error: 'Use file upload endpoint with multipart/form-data' });
});

export default router;
