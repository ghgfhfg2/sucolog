import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { topicId, status = 'all', q = '' } = req.query;
  const where = [];
  const params = [];

  if (topicId) {
    where.push('j.topic_id = ?');
    params.push(topicId);
  }

  if (status === 'failed') where.push("j.last_status = 'failed'");
  if (status === 'active') where.push('j.enabled = 1');

  if (q) {
    where.push('j.name LIKE ?');
    params.push(`%${q}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  db.all(
    `
    SELECT j.id, j.topic_id AS topicId, j.name, j.schedule, j.command,
           j.enabled, j.last_status AS lastStatus, j.last_run_at AS lastRunAt
    FROM jobs j
    ${whereSql}
    ORDER BY j.id DESC
  `,
    params,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.json(rows);
    }
  );
});

router.post('/', (req, res) => {
  const { topicId, name, schedule, command } = req.body || {};
  if (!topicId || !name?.trim() || !schedule?.trim() || !command?.trim()) {
    return res.status(400).json({ error: 'topicId, name, schedule, command are required' });
  }

  db.run(
    'INSERT INTO jobs(topic_id, name, schedule, command) VALUES (?, ?, ?, ?)',
    [topicId, name.trim(), schedule.trim(), command.trim()],
    function onInsert(err) {
      if (err) return res.status(400).json({ error: err.message });
      return res.json({ id: this.lastID });
    }
  );
});

router.patch('/:id', (req, res) => {
  const { name, schedule, command, topicId, enabled } = req.body || {};

  db.run(
    `
    UPDATE jobs
    SET name = COALESCE(?, name),
        schedule = COALESCE(?, schedule),
        command = COALESCE(?, command),
        topic_id = COALESCE(?, topic_id),
        enabled = COALESCE(?, enabled),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
    [name ?? null, schedule ?? null, command ?? null, topicId ?? null, enabled ?? null, req.params.id],
    function onUpdate(err) {
      if (err) return res.status(500).json({ error: err.message });
      return res.json({ updated: this.changes > 0 });
    }
  );
});

router.post('/:id/run', (req, res) => {
  const jobId = req.params.id;
  db.run(
    `INSERT INTO job_runs(job_id, status, message, ended_at)
     VALUES (?, 'success', 'manual run', CURRENT_TIMESTAMP)`,
    [jobId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      db.run(
        `UPDATE jobs
         SET last_status='success', last_run_at=CURRENT_TIMESTAMP
         WHERE id=?`,
        [jobId],
        (e2) => {
          if (e2) return res.status(500).json({ error: e2.message });
          return res.json({ ok: true });
        }
      );
    }
  );
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM jobs WHERE id=?', [req.params.id], function onDelete(err) {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ deleted: this.changes > 0 });
  });
});

export default router;
