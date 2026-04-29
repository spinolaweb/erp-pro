import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './api/db.js';
import entriesRouter from './api/entries.js';
import settingsRouter from './api/settings.js';
import productsRouter from './api/products.js';
import suppliersRouter from './api/suppliers.js';
import customersRouter from './api/customers.js';
import campaignsRouter from './api/campaigns.js';
import backupRouter from './api/backup.js';
import authRouter from './api/auth.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

initDatabase();

app.use('/api/auth', authRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/products', productsRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/backup', backupRouter);

app.use(express.static(path.join(__dirname, 'src/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});