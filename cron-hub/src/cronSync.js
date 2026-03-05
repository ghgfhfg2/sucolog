import { spawnSync } from 'child_process';

const START = '# >>> cron-hub managed start >>>';
const END = '# <<< cron-hub managed end <<<';

function readCrontab() {
  const result = spawnSync('crontab', ['-l'], { encoding: 'utf8' });

  if (result.error) {
    throw new Error(`crontab read failed: ${result.error.message}`);
  }

  if (result.status !== 0) {
    const stderr = (result.stderr || '').toLowerCase();
    if (stderr.includes('no crontab')) return '';
    throw new Error(`crontab -l failed: ${result.stderr || 'unknown error'}`);
  }

  return result.stdout || '';
}

function writeCrontab(content) {
  const result = spawnSync('crontab', ['-'], {
    input: content,
    encoding: 'utf8',
  });

  if (result.error) {
    throw new Error(`crontab write failed: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(`crontab apply failed: ${result.stderr || 'unknown error'}`);
  }
}

function stripManagedBlock(text) {
  const start = text.indexOf(START);
  const end = text.indexOf(END);

  if (start === -1 || end === -1 || end < start) return text.trim();

  const before = text.slice(0, start).trim();
  const after = text.slice(end + END.length).trim();
  return [before, after].filter(Boolean).join('\n\n').trim();
}

function renderManagedBlock(rows) {
  const lines = [START, '# managed by cron-hub (do not edit this block manually)'];

  rows.forEach((row) => {
    lines.push(`# job:${row.id} topic:${row.topicName} name:${row.name}`);
    lines.push(`${row.schedule} ${row.command} # cron-hub:id=${row.id}`);
  });

  lines.push(END);
  return lines.join('\n');
}

export function syncManagedCrontab(db, done) {
  db.all(
    `
    SELECT j.id, j.name, j.schedule, j.command, t.name AS topicName
    FROM jobs j
    JOIN topics t ON t.id = j.topic_id
    WHERE j.enabled = 1
    ORDER BY j.id ASC
  `,
    [],
    (err, rows) => {
      if (err) return done(err);

      try {
        const current = readCrontab();
        const withoutManaged = stripManagedBlock(current);
        const managed = renderManagedBlock(rows || []);

        const next = [withoutManaged, managed].filter(Boolean).join('\n\n').trim() + '\n';
        writeCrontab(next);

        return done(null, { synced: true, jobs: rows.length });
      } catch (e) {
        return done(e);
      }
    }
  );
}
