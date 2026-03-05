import { spawnSync } from 'child_process';

const START = '# >>> cron-hub managed start >>>';
const END = '# <<< cron-hub managed end <<<';

function readCrontab() {
  const result = spawnSync('crontab', ['-l'], { encoding: 'utf8' });

  if (result.error) throw new Error(`crontab read failed: ${result.error.message}`);

  if (result.status !== 0) {
    const stderr = (result.stderr || '').toLowerCase();
    if (stderr.includes('no crontab')) return '';
    throw new Error(`crontab -l failed: ${result.stderr || 'unknown error'}`);
  }

  return result.stdout || '';
}

function stripManagedBlock(text) {
  const start = text.indexOf(START);
  const end = text.indexOf(END);

  if (start === -1 || end === -1 || end < start) return text;

  const before = text.slice(0, start);
  const after = text.slice(end + END.length);
  return [before, after].filter(Boolean).join('\n');
}

function cleanCommand(commandRaw) {
  const idx = commandRaw.indexOf(' #');
  return (idx >= 0 ? commandRaw.slice(0, idx) : commandRaw).trim();
}

function parseCrontabLines(text) {
  const lines = stripManagedBlock(text)
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('#'))
    .filter((line) => !/^[A-Za-z_][A-Za-z0-9_]*\s*=/.test(line));

  const jobs = [];

  for (const line of lines) {
    if (line.includes('# cron-hub:id=')) continue;

    const parts = line.split(/\s+/);
    if (!parts.length) continue;

    if (parts[0].startsWith('@')) {
      if (parts.length < 2) continue;
      const schedule = parts[0];
      const command = cleanCommand(parts.slice(1).join(' '));
      if (!command) continue;
      jobs.push({ schedule, command });
      continue;
    }

    if (parts.length < 6) continue;
    const schedule = parts.slice(0, 5).join(' ');
    const command = cleanCommand(parts.slice(5).join(' '));
    if (!command) continue;
    jobs.push({ schedule, command });
  }

  return jobs;
}

function defaultName(command) {
  const first = command.split(/[\s/]+/).filter(Boolean).pop() || 'job';
  return `imported:${first}`.slice(0, 120);
}

export function importSystemCrontab(db, done) {
  try {
    const raw = readCrontab();
    const parsed = parseCrontabLines(raw);

    db.serialize(() => {
      db.run(`INSERT OR IGNORE INTO topics(id, name) VALUES (1, '기타')`);

      let imported = 0;
      let skipped = 0;
      let i = 0;

      const step = () => {
        if (i >= parsed.length) {
          return done(null, { total: parsed.length, imported, skipped });
        }

        const row = parsed[i++];

        db.get(
          `SELECT id FROM jobs WHERE schedule = ? AND command = ? LIMIT 1`,
          [row.schedule, row.command],
          (checkErr, exists) => {
            if (checkErr) return done(checkErr);

            if (exists) {
              skipped += 1;
              return step();
            }

            db.run(
              `INSERT INTO jobs(topic_id, name, schedule, command, enabled)
               VALUES (1, ?, ?, ?, 1)`,
              [defaultName(row.command), row.schedule, row.command],
              (insertErr) => {
                if (insertErr) return done(insertErr);
                imported += 1;
                return step();
              }
            );
          }
        );
      };

      step();
    });
  } catch (e) {
    return done(e);
  }
}
