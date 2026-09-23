import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { createApp } from '../src/app.mjs';
import { env } from '../src/core/env.mjs';

async function requestJson(base, path, init) {
  const response = await fetch(`${base}${path}`, init);
  const payload = await response.json().catch(() => null);
  return { response, payload };
}

const dataDir = await mkdtemp(join(tmpdir(), 'fadi-sqlite-runtime-'));
const app = await createApp({
  ...env,
  dataDir,
  storageDriver: 'sqlite',
  sqliteRuntimePath: join(dataDir, 'runtime.sqlite3'),
  uploadRootDir: join(dataDir, 'uploads'),
});
const server = createServer((request, response) => app.handle(request, response));
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

try {
  const { payload: website } = await requestJson(base, '/api/public/website');
  const product = website?.data?.products?.find((item) => item.stock > 0);
  if (!product) throw new Error('No stocked product found in seeded storefront data');

  const forgedPayload = {
    customer: {
      firstName: 'Forged',
      lastName: 'Buyer',
      email: 'forged@example.com',
      phone: '+21600000000',
      address: '1 Integrity Street',
      city: 'Tunis',
    },
    items: [{ productId: product.id, quantity: 1 }],
    subtotal: 1,
    deliveryFee: 0,
    discount: 999999,
    tax: 0,
    total: 1,
    paymentStatus: 'Paid',
  };
  const { response: forgedResponse, payload: forgedOrder } = await requestJson(base, '/api/public/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(forgedPayload),
  });
  if (forgedResponse.status !== 201) {
    throw new Error(`Forged pricing order failed unexpectedly: ${forgedResponse.status} ${JSON.stringify(forgedOrder)}`);
  }
  if (forgedOrder.data.total <= 1 || forgedOrder.data.discount !== 0) {
    throw new Error(`Authoritative pricing failed: ${JSON.stringify(forgedOrder)}`);
  }

  const products = await app.deps.ecommerceService.listProducts();
  const first = products[0];
  const variant = first.variants[0];
  await app.deps.productsRepo.update(first.id, {
    stock: 1,
    variants: first.variants.map((entry, index) => ({ ...entry, stock: index === 0 ? 1 : 0 })),
  });
  const racePayload = {
    customer: {
      firstName: 'Race',
      lastName: 'Buyer',
      email: 'race@example.com',
      phone: '+21600000001',
      address: '1 Integrity Street',
      city: 'Tunis',
    },
    items: [{ productId: first.id, variantId: variant.id, quantity: 1 }],
  };
  const raceResponses = await Promise.all([
    fetch(`${base}/api/public/orders`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(racePayload) }),
    fetch(`${base}/api/public/orders`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(racePayload) }),
  ]);
  const raceStatuses = raceResponses.map((response) => response.status).sort();
  if (raceStatuses[0] !== 201 || raceStatuses[1] !== 409) {
    throw new Error(`Expected one success and one stock conflict, got ${raceStatuses.join(',')}`);
  }

  const storedOrders = await app.deps.ordersRepo.list();
  if (!storedOrders.some((order) => order.id === forgedOrder.data.id)) {
    throw new Error('SQLite runtime did not persist the created order');
  }

  console.log(JSON.stringify({ ok: true, storageDriver: 'sqlite', forgedTotal: forgedOrder.data.total, raceStatuses }));
} finally {
  await new Promise((resolve) => server.close(resolve));
  app.deps.store.close?.();
  await rm(dataDir, { recursive: true, force: true });
}
