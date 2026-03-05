import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  db.all(
    `
    SELECT t.id, t.name, COUNT(j.id) AS jobCount
    FROM topics t
    LEFT JOIN jobs j ON j.topic_id = t.id
    GROUP BY t.id
    ORDER BY t.id ASC
  `,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.json(rows);
    }
  );
});

router.post('/', (req, res) => {
  const { name } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'name is required' });

  db.run('INSERT INTO topics(name) VALUES (?)', [name.trim()], function onInsert(err) {
    if (err) return res.status(400).json({ error: err.message });
    return res.json({ id: this.lastID, name: name.trim() });
  });
});

router.patch('/:id', (req, res) => {
  const { name } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'name is required' });

  db.run('UPDATE topics SET name=? WHERE id=?', [name.trim(), req.params.id], function onUpdate(err) {
    if (err) return res.status(400).json({ error: err.message });
    return res.json({ updated: this.changes > 0 });
  });
});

export default router;
