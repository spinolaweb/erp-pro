import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000; // Render defaults to 10000

// Serve the static files from the Vite build
app.use(express.static(path.join(__dirname, 'src/dist')));

// Handle React Router: send all other requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
