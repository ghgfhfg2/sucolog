import { Router } from 'express';
import { db } from '../db.js';
import { syncManagedCrontab } from '../cronSync.js';
import { importSystemCrontab, suggestTopicByCommand } from '../cronImport.js';

const router = Router();

function respondWithOptionalSync(res, payload) {
  syncManagedCrontab(db, (syncErr, syncResult) => {
    if (syncErr) {
      return res.json({
        ...payload,
        warning: `크론 반영 실패: ${syncErr.message}`,
      });
    }

    return res.json({ ...payload, sync: syncResult });
  });
}

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
    SELECT j.id, j.topic_id AS topicId, j.name, j.schedule, j.command, j.description,
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
  const { topicId, name, schedule, command, description } = req.body || {};
  if (!topicId || !name?.trim() || !schedule?.trim() || !command?.trim()) {
    return res.status(400).json({ error: 'topicId, name, schedule, command are required' });
  }

  db.run(
    'INSERT INTO jobs(topic_id, name, schedule, command, description) VALUES (?, ?, ?, ?, ?)',
    [topicId, name.trim(), schedule.trim(), command.trim(), description?.trim() || null],
    function onInsert(err) {
      if (err) return res.status(400).json({ error: err.message });
      return respondWithOptionalSync(res, { id: this.lastID });
    }
  );
});

router.patch('/:id', (req, res) => {
  const { name, schedule, command, description, topicId, enabled } = req.body || {};

  db.run(
    `
    UPDATE jobs
    SET name = COALESCE(?, name),
        schedule = COALESCE(?, schedule),
        command = COALESCE(?, command),
        description = COALESCE(?, description),
        topic_id = COALESCE(?, topic_id),
        enabled = COALESCE(?, enabled),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
    [
      name ?? null,
      schedule ?? null,
      command ?? null,
      description ?? null,
      topicId ?? null,
      enabled ?? null,
      req.params.id,
    ],
    function onUpdate(err) {
      if (err) return res.status(500).json({ error: err.message });
      return respondWithOptionalSync(res, { updated: this.changes > 0 });
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
    return respondWithOptionalSync(res, { deleted: this.changes > 0 });
  });
});

router.post('/import', (_req, res) => {
  importSystemCrontab(db, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    syncManagedCrontab(db, (syncErr, syncResult) => {
      if (syncErr) {
        return res.json({ ...result, warning: `크론 반영 실패: ${syncErr.message}` });
      }

      return res.json({ ...result, sync: syncResult });
    });
  });
});

router.post('/auto-categorize', (_req, res) => {
  db.all(`SELECT id, command FROM jobs`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const topicIds = new Map();
    let updated = 0;

    const ensureTopic = (name, cb) => {
      if (topicIds.has(name)) return cb(null, topicIds.get(name));

      db.run(`INSERT OR IGNORE INTO topics(name) VALUES (?)`, [name], (insertErr) => {
        if (insertErr) return cb(insertErr);
        db.get(`SELECT id FROM topics WHERE name=? LIMIT 1`, [name], (getErr, row) => {
          if (getErr) return cb(getErr);
          if (!row?.id) return cb(new Error(`topic not found: ${name}`));
          topicIds.set(name, row.id);
          return cb(null, row.id);
        });
      });
    };

    let i = 0;
    const step = () => {
      if (i >= rows.length) return res.json({ total: rows.length, updated });

      const row = rows[i++];
      const topicName = suggestTopicByCommand(row.command || '');

      ensureTopic(topicName, (topicErr, topicId) => {
        if (topicErr) return res.status(500).json({ error: topicErr.message });

        db.run(`UPDATE jobs SET topic_id=? WHERE id=?`, [topicId, row.id], (updateErr) => {
          if (updateErr) return res.status(500).json({ error: updateErr.message });
          updated += 1;
          return step();
        });
      });
    };

    step();
  });
});

router.post('/sync', (_req, res) => {
  syncManagedCrontab(db, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(result);
  });
});

export default router;
