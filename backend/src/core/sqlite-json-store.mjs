import { AsyncLocalStorage } from 'node:async_hooks';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function now() {
  return new Date().toISOString();
}

function readSeedFile(dataDir, resourceName, defaultValue) {
  const path = join(dataDir, `${resourceName}.json`);
  if (!existsSync(path)) return clone(defaultValue);
  const raw = readFileSync(path, 'utf8').replace(/^\uFEFF/, '').trim();
  return raw ? JSON.parse(raw) : clone(defaultValue);
}

export class SqliteJsonStore {
  constructor(dataDir, options = {}) {
    this.dataDir = dataDir;
    this.dbPath = resolve(options.dbPath || join(dataDir, 'ecommerce.sqlite3'));
    this.cache = new Map();
    this.operationQueue = Promise.resolve();
    this.transactions = new AsyncLocalStorage();
    mkdirSync(dirname(this.dbPath), { recursive: true });
    this.db = new DatabaseSync(this.dbPath);
    this.db.exec(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
      PRAGMA busy_timeout = 5000;
      CREATE TABLE IF NOT EXISTS resource_documents (
        resource_name TEXT PRIMARY KEY,
        body_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    this.selectStatement = this.db.prepare('SELECT body_json FROM resource_documents WHERE resource_name = ?');
    this.upsertStatement = this.db.prepare(`
      INSERT INTO resource_documents (resource_name, body_json, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(resource_name) DO UPDATE SET
        body_json = excluded.body_json,
        updated_at = excluded.updated_at
    `);
  }

  resourcePath(resourceName) {
    return `${this.dbPath}#${resourceName}`;
  }

  async enqueueOperation(operation) {
    const previous = this.operationQueue;
    const next = previous.catch(() => {}).then(operation);
    this.operationQueue = next.catch(() => {});
    return next;
  }

  readInsideTransaction(context, resourceName, defaultValue) {
    if (context.documents.has(resourceName)) {
      return clone(context.documents.get(resourceName));
    }

    const row = this.selectStatement.get(resourceName);
    const value = row?.body_json ? JSON.parse(row.body_json) : readSeedFile(this.dataDir, resourceName, defaultValue);
    context.documents.set(resourceName, value);
    return clone(value);
  }

  async read(resourceName, defaultValue) {
    const transactionContext = this.transactions.getStore();
    if (transactionContext) {
      return this.readInsideTransaction(transactionContext, resourceName, defaultValue);
    }

    return this.enqueueOperation(async () => {
    if (this.cache.has(resourceName)) {
      return clone(this.cache.get(resourceName));
    }

    const row = this.selectStatement.get(resourceName);
    if (row?.body_json) {
      const parsed = JSON.parse(row.body_json);
      this.cache.set(resourceName, parsed);
      return clone(parsed);
    }

    const seeded = readSeedFile(this.dataDir, resourceName, defaultValue);
    const timestamp = now();
    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.upsertStatement.run(resourceName, JSON.stringify(seeded), timestamp, timestamp);
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
    this.cache.set(resourceName, seeded);
    return clone(seeded);
    });
  }

  async enqueueWrite(resourceName, operation) {
    return this.enqueueOperation(operation);
  }

  async write(resourceName, value) {
    const transactionContext = this.transactions.getStore();
    if (transactionContext) {
      const stored = clone(value);
      transactionContext.documents.set(resourceName, stored);
      transactionContext.dirty.add(resourceName);
      return clone(stored);
    }

    return this.enqueueWrite(resourceName, async () => {
      const stored = clone(value);
      const timestamp = now();
      this.db.exec('BEGIN IMMEDIATE');
      try {
        this.upsertStatement.run(resourceName, JSON.stringify(stored), timestamp, timestamp);
        this.db.exec('COMMIT');
      } catch (error) {
        this.db.exec('ROLLBACK');
        throw error;
      }
      this.cache.set(resourceName, stored);
      return clone(stored);
    });
  }

  async runInTransaction(resourceNames, operation) {
    if (this.transactions.getStore()) {
      return operation();
    }

    return this.enqueueOperation(async () => {
      const context = {
        documents: new Map(),
        dirty: new Set(),
      };
      const timestamp = now();
      this.db.exec('BEGIN IMMEDIATE');
      try {
        for (const resourceName of resourceNames || []) {
          this.readInsideTransaction(context, resourceName, []);
        }
        const result = await this.transactions.run(context, operation);
        for (const resourceName of context.dirty) {
          const stored = clone(context.documents.get(resourceName));
          this.upsertStatement.run(resourceName, JSON.stringify(stored), timestamp, timestamp);
          this.cache.set(resourceName, stored);
        }
        this.db.exec('COMMIT');
        return result;
      } catch (error) {
        this.db.exec('ROLLBACK');
        throw error;
      }
    });
  }

  close() {
    this.db.close();
  }
}
