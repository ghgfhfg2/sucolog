import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import topicsRouter from './routes/topics.js';
import jobsRouter from './routes/jobs.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initDb();

app.use(cors());
app.use(express.json());

app.use('/api/topics', topicsRouter);
app.use('/api/jobs', jobsRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`cron-hub running at http://localhost:${port}`);
});
