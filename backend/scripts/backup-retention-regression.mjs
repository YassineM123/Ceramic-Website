import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JsonStore } from '../src/core/json-store.mjs';

function backupName(resourceName, date) {
  return `${resourceName}-${date.toISOString().replace(/[:.]/g, '-')}.json`;
}

const dataDir = await mkdtemp(join(tmpdir(), 'fadi-backup-retention-'));
const backupDir = join(dataDir, 'backups');
await mkdir(backupDir, { recursive: true });

try {
  const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const freshBase = Date.now();
  await writeFile(join(backupDir, backupName('orders', oldDate)), '[]', 'utf8');
  for (let index = 0; index < 5; index += 1) {
    await writeFile(join(backupDir, backupName('orders', new Date(freshBase - index * 1000))), '[]', 'utf8');
  }
  await writeFile(join(dataDir, 'orders.json'), '[]', 'utf8');

  const store = new JsonStore(dataDir, {
    backupRetentionDays: 14,
    backupMaxPerResource: 3,
    backupPruneIntervalMs: 0,
  });
  const result = await store.pruneBackupsIfDue(true);
  const remaining = (await readdir(backupDir)).filter((name) => name.startsWith('orders-'));
  if (remaining.length !== 3) {
    throw new Error(`Expected 3 retained backups, found ${remaining.length}: ${remaining.join(', ')}`);
  }
  if (result.deleted !== 3) {
    throw new Error(`Expected 3 deleted backups, got ${result.deleted}`);
  }
  console.log(JSON.stringify({ ok: true, deleted: result.deleted, remaining: remaining.length }));
} finally {
  await rm(dataDir, { recursive: true, force: true });
}
