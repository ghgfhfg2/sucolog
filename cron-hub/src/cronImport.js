import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const START = '# >>> cron-hub managed start >>>';
const END = '# <<< cron-hub managed end <<<';

function safeReadFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (_e) {
    return '';
  }
}

function readCurrentUserCrontab() {
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

function parseCrontabLines(text, mode = 'user') {
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
      // user crontab: @hourly cmd
      // system crontab: @hourly user cmd
      if (mode === 'system') {
        if (parts.length < 3) continue;
        const schedule = parts[0];
        const osUser = parts[1];
        const command = cleanCommand(parts.slice(2).join(' '));
        if (!command) continue;
        jobs.push({ schedule, command, osUser });
      } else {
        if (parts.length < 2) continue;
        const schedule = parts[0];
        const command = cleanCommand(parts.slice(1).join(' '));
        if (!command) continue;
        jobs.push({ schedule, command });
      }
      continue;
    }

    if (mode === 'system') {
      // m h dom mon dow user command
      if (parts.length < 7) continue;
      const schedule = parts.slice(0, 5).join(' ');
      const osUser = parts[5];
      const command = cleanCommand(parts.slice(6).join(' '));
      if (!command) continue;
      jobs.push({ schedule, command, osUser });
    } else {
      // m h dom mon dow command
      if (parts.length < 6) continue;
      const schedule = parts.slice(0, 5).join(' ');
      const command = cleanCommand(parts.slice(5).join(' '));
      if (!command) continue;
      jobs.push({ schedule, command });
    }
  }

  return jobs;
}

function collectSources() {
  const sources = [];

  sources.push({
    source: 'user-crontab',
    mode: 'user',
    text: readCurrentUserCrontab(),
  });

  const etcCrontab = safeReadFile('/etc/crontab');
  if (etcCrontab) {
    sources.push({
      source: '/etc/crontab',
      mode: 'system',
      text: etcCrontab,
    });
  }

  const cronD = '/etc/cron.d';
  try {
    const files = fs.readdirSync(cronD, { withFileTypes: true });
    files
      .filter((f) => f.isFile() && !f.name.startsWith('.'))
      .forEach((f) => {
        const full = path.join(cronD, f.name);
        const text = safeReadFile(full);
        if (text) {
          sources.push({
            source: full,
            mode: 'system',
            text,
          });
        }
      });
  } catch (_e) {
    // ignore unreadable /etc/cron.d
  }

  return sources;
}

export function suggestTopicByCommand(command = '') {
  if (command.includes('/etc/cron.hourly') || command.includes('/etc/cron.daily') || command.includes('/etc/cron.weekly') || command.includes('/etc/cron.monthly')) {
    return '시스템 유지보수';
  }
  if (command.includes('e2scrub_all')) return '디스크 점검';
  if (/backup|dump|snapshot/i.test(command)) return '백업';
  if (/report|stats|metric/i.test(command)) return '리포트';
  if (/notify|telegram|slack|mail|sms/i.test(command)) return '알림';
  return '기타';
}

function inferDescription(command) {
  if (command.includes('/etc/cron.hourly')) return '서버 기본 시간별 유지보수 작업을 실행합니다.';
  if (command.includes('/etc/cron.daily')) return '서버 기본 일간 유지보수 작업을 실행합니다.';
  if (command.includes('/etc/cron.weekly')) return '서버 기본 주간 유지보수 작업을 실행합니다.';
  if (command.includes('/etc/cron.monthly')) return '서버 기본 월간 유지보수 작업을 실행합니다.';
  if (command.includes('e2scrub_all_cron')) return '디스크 상태를 주기적으로 점검하는 작업입니다.';
  if (command.includes('e2scrub_all')) return '디스크 점검(e2scrub) 실행 작업입니다.';
  return '가져온 시스템 크론 작업입니다.';
}

function defaultName(command, source, osUser) {
  const first = command.split(/[\s/]+/).filter(Boolean).pop() || 'job';
  const prefix = source === 'user-crontab' ? 'imported' : `imported:${osUser || 'system'}`;
  return `${prefix}:${first}`.slice(0, 120);
}

function insertJobs(db, rows, done) {
  let imported = 0;
  let skipped = 0;
  let i = 0;
  const topicCache = new Map();

  const getTopicId = (topicName, cb) => {
    if (topicCache.has(topicName)) return cb(null, topicCache.get(topicName));

    db.run(`INSERT OR IGNORE INTO topics(name) VALUES (?)`, [topicName], (insertErr) => {
      if (insertErr) return cb(insertErr);

      db.get(`SELECT id FROM topics WHERE name=? LIMIT 1`, [topicName], (getErr, row) => {
        if (getErr) return cb(getErr);
        if (!row?.id) return cb(new Error(`topic not found: ${topicName}`));
        topicCache.set(topicName, row.id);
        return cb(null, row.id);
      });
    });
  };

  const step = () => {
    if (i >= rows.length) return done(null, { imported, skipped });

    const row = rows[i++];

    db.get(
      `SELECT id FROM jobs WHERE schedule = ? AND command = ? LIMIT 1`,
      [row.schedule, row.command],
      (checkErr, exists) => {
        if (checkErr) return done(checkErr);

        if (exists) {
          skipped += 1;
          return step();
        }

        const topicName = suggestTopicByCommand(row.command);
        getTopicId(topicName, (topicErr, topicId) => {
          if (topicErr) return done(topicErr);

          db.run(
            `INSERT INTO jobs(topic_id, name, schedule, command, description, enabled)
             VALUES (?, ?, ?, ?, ?, 1)`,
            [
              topicId,
              defaultName(row.command, row.source, row.osUser),
              row.schedule,
              row.command,
              inferDescription(row.command),
            ],
            (insertErr) => {
              if (insertErr) return done(insertErr);
              imported += 1;
              return step();
            }
          );
        });
      }
    );
  };

  step();
}

export function importSystemCrontab(db, done) {
  try {
    const sources = collectSources();
    const parsed = [];

    sources.forEach((s) => {
      const jobs = parseCrontabLines(s.text, s.mode).map((j) => ({ ...j, source: s.source }));
      parsed.push(...jobs);
    });

    db.serialize(() => {
      db.run(`INSERT OR IGNORE INTO topics(id, name) VALUES (1, '기타')`);

      insertJobs(db, parsed, (err, result) => {
        if (err) return done(err);

        const sourceStats = sources.map((s) => ({ source: s.source, mode: s.mode }));
        return done(null, {
          total: parsed.length,
          imported: result.imported,
          skipped: result.skipped,
          sources: sourceStats,
        });
      });
    });
  } catch (e) {
    return done(e);
  }
}
