import { mkdir, readFile, readdir, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

async function fileExists(path) {
  try {
    await stat(path);
    return true;
  } catch (_error) {
    return false;
  }
}

export class JsonStore {
  constructor(dataDir, options = {}) {
    this.dataDir = dataDir;
    this.cache = new Map();
    this.writeQueues = new Map();
    this.backupDir = join(dataDir, 'backups');
    this.backupRetentionDays = Number(options.backupRetentionDays ?? process.env.BACKUP_RETENTION_DAYS ?? 14);
    this.backupMaxPerResource = Number(options.backupMaxPerResource ?? process.env.BACKUP_MAX_PER_RESOURCE ?? 50);
    this.backupPruneIntervalMs = Number(options.backupPruneIntervalMs ?? process.env.BACKUP_PRUNE_INTERVAL_MS ?? 6 * 60 * 60 * 1000);
    this.lastBackupPruneAt = 0;
  }

  resourcePath(resourceName) {
    return join(this.dataDir, `${resourceName}.json`);
  }

  async read(resourceName, defaultValue) {
    if (this.cache.has(resourceName)) {
      return this.cache.get(resourceName);
    }

    const path = this.resourcePath(resourceName);
    const exists = await fileExists(path);
    if (!exists) {
      await this.write(resourceName, defaultValue);
      return defaultValue;
    }

    const raw = await readFile(path, 'utf8');
    const normalized = raw.replace(/^\uFEFF/, '');
    const parsed = normalized.trim() ? JSON.parse(normalized) : defaultValue;
    this.cache.set(resourceName, parsed);
    return parsed;
  }

  async enqueueWrite(resourceName, operation) {
    const previous = this.writeQueues.get(resourceName) || Promise.resolve();
    const next = previous.then(operation).catch(() => operation());
    this.writeQueues.set(resourceName, next);
    return next;
  }

  async write(resourceName, value) {
    return this.enqueueWrite(resourceName, async () => {
      await this.pruneBackupsIfDue();
      const path = this.resourcePath(resourceName);
      const parent = dirname(path);
      await mkdir(parent, { recursive: true });
      await mkdir(this.backupDir, { recursive: true });

      if (await fileExists(path)) {
        const currentContent = await readFile(path, 'utf8');
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = join(this.backupDir, `${resourceName}-${stamp}.json`);
        await writeFile(backupPath, currentContent, 'utf8');
      }

      const tmpPath = `${path}.tmp`;
      await writeFile(tmpPath, JSON.stringify(value, null, 2), 'utf8');
      await rename(tmpPath, path);
      this.cache.set(resourceName, value);
      return value;
    });
  }

  async runInTransaction(_resourceNames, operation) {
    return operation();
  }

  parseBackupName(name) {
    const match = name.match(/^(.+)-(\d{4}-\d{2}-\d{2}T.+)\.json$/);
    if (!match) return null;
    const timestamp = match[2].replace(/-(\d{3})Z$/, '.$1Z').replace(/T(\d{2})-(\d{2})-(\d{2})/, 'T$1:$2:$3');
    const time = new Date(timestamp).getTime();
    if (!Number.isFinite(time)) return null;
    return { resourceName: match[1], time };
  }

  async pruneBackupsIfDue(force = false) {
    const now = Date.now();
    if (!force && now - this.lastBackupPruneAt < this.backupPruneIntervalMs) {
      return { deleted: 0 };
    }
    this.lastBackupPruneAt = now;
    return this.pruneBackups();
  }

  async pruneBackups() {
    if (this.backupRetentionDays <= 0 && this.backupMaxPerResource <= 0) {
      return { deleted: 0 };
    }

    let entries;
    try {
      entries = await readdir(this.backupDir, { withFileTypes: true });
    } catch (_error) {
      return { deleted: 0 };
    }

    const cutoff = this.backupRetentionDays > 0 ? Date.now() - this.backupRetentionDays * 24 * 60 * 60 * 1000 : -Infinity;
    const grouped = new Map();
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
      const parsed = this.parseBackupName(entry.name);
      if (!parsed) continue;
      const item = { ...parsed, name: entry.name, path: join(this.backupDir, entry.name) };
      const rows = grouped.get(parsed.resourceName) || [];
      rows.push(item);
      grouped.set(parsed.resourceName, rows);
    }

    const deletePaths = new Set();
    for (const rows of grouped.values()) {
      rows.sort((left, right) => right.time - left.time);
      for (const row of rows) {
        if (row.time < cutoff) deletePaths.add(row.path);
      }
      if (this.backupMaxPerResource > 0) {
        for (const row of rows.slice(this.backupMaxPerResource)) {
          deletePaths.add(row.path);
        }
      }
    }

    let deleted = 0;
    for (const path of deletePaths) {
      try {
        await unlink(path);
        deleted += 1;
      } catch (_error) {
        // A concurrent cleanup may already have removed it.
      }
    }
    if (deleted > 0) {
      console.log(`Pruned ${deleted} JSON backup files from ${this.backupDir}`);
    }
    return { deleted };
  }
}
