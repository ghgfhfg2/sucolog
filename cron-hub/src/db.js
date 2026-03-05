import sqlite3 from 'sqlite3';

export const db = new sqlite3.Database('./cron_hub.db');

export function initDb() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        schedule TEXT NOT NULL,
        command TEXT NOT NULL,
        description TEXT,
        enabled INTEGER NOT NULL DEFAULT 1,
        last_status TEXT NOT NULL DEFAULT 'never',
        last_run_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(topic_id) REFERENCES topics(id)
      )
    `);

    db.all(`PRAGMA table_info(jobs)`, [], (_err, cols) => {
      const hasDescription = (cols || []).some((c) => c.name === 'description');
      if (!hasDescription) {
        db.run(`ALTER TABLE jobs ADD COLUMN description TEXT`);
      }
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS job_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ended_at DATETIME,
        message TEXT,
        FOREIGN KEY(job_id) REFERENCES jobs(id)
      )
    `);

    db.run(`INSERT OR IGNORE INTO topics(id, name) VALUES (1, '기타')`);
  });
}
