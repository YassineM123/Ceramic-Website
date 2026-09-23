import { createServer } from 'node:http';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../src/app.mjs';
import { env } from '../src/core/env.mjs';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const dataDir = await mkdtemp(join(tmpdir(), 'fadi-sqlite-transactions-'));
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
  const products = await app.deps.ecommerceService.listProducts();
  const product = products[0];
  const variant = product.variants[0];
  await app.deps.productsRepo.update(product.id, {
    stock: 2,
    variants: product.variants.map((entry, index) => ({ ...entry, stock: index === 0 ? 2 : 0 })),
  });
  await app.deps.couponsRepo.replaceAll([
    {
      id: 'tx-once',
      code: 'TXONCE',
      type: 'fixed',
      value: 5,
      minOrderValue: 0,
      maximumDiscount: 5,
      active: true,
      usageLimit: 1,
      usedCount: 0,
    },
  ]);

  const payload = {
    customer: {
      firstName: 'Coupon',
      lastName: 'Race',
      email: 'coupon-race@example.com',
      phone: '+21600000002',
      address: '1 Transaction Street',
      city: 'Tunis',
    },
    items: [{ productId: product.id, variantId: variant.id, quantity: 1 }],
    couponCode: 'TXONCE',
  };

  const responses = await Promise.all([
    fetch(`${base}/api/public/orders`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }),
    fetch(`${base}/api/public/orders`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }),
  ]);
  const statuses = responses.map((response) => response.status).sort((left, right) => left - right);
  assert(statuses[0] === 201 && statuses[1] === 400, `Expected one coupon success and one coupon rejection, got ${statuses.join(',')}`);

  const orders = await app.deps.ordersRepo.list();
  const couponOrders = orders.filter((order) => order.couponCode === 'TXONCE');
  const [coupon] = await app.deps.couponsRepo.list();
  const [updatedProduct] = await app.deps.productsRepo.list();
  const updatedVariant = updatedProduct.variants.find((entry) => entry.id === variant.id);

  assert(couponOrders.length === 1, `Expected exactly one coupon order, got ${couponOrders.length}`);
  assert(coupon.usedCount === 1, `Expected coupon usedCount 1, got ${coupon.usedCount}`);
  assert(updatedVariant.stock === 1, `Expected stock 1 after one committed order, got ${updatedVariant.stock}`);
  assert(updatedVariant.stock >= 0, 'Stock went negative');

  console.log(JSON.stringify({ ok: true, statuses, couponOrders: couponOrders.length, usedCount: coupon.usedCount, stock: updatedVariant.stock }));
} finally {
  await new Promise((resolve) => server.close(resolve));
  app.deps.store.close?.();
  await rm(dataDir, { recursive: true, force: true });
}
