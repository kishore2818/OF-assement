import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export function setupDatabase(dbPath?: string) {
  const targetPath = dbPath || path.resolve(__dirname, '../data/reconciliation.db');
  const dbDir = path.dirname(targetPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(targetPath);
  db.pragma('foreign_keys = ON');

  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const seedPath = path.resolve(__dirname, 'seed.sql');

  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  const seedSql = fs.readFileSync(seedPath, 'utf-8');

  db.exec(schemaSql);
  db.exec(seedSql);

  return db;
}

if (process.argv[1] && process.argv[1].endsWith('seed-database.ts')) {
  console.log('Seeding SQLite database...');
  const db = setupDatabase();
  const rowCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get() as { count: number };
  console.log(`Database seeded successfully. Total transactions: ${rowCount.count}`);
  db.close();
}
