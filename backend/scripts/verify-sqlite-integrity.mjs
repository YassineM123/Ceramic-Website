import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendDir = resolve(scriptDir, '..');
const defaultDataDir = resolve(backendDir, 'src', 'data');
const dataDir = resolve(process.env.DATA_DIR || defaultDataDir);
const dbPath = resolve(process.env.ECOMMERCE_DB_PATH || join(dataDir, 'ecommerce.sqlite3'));

const requiredTables = [
  'products',
  'categories',
  'product_images',
  'product_variants',
  'orders',
  'payments',
  'users',
  'roles',
  'user_roles',
  'coupons',
  'discounts',
  'shipping_zones',
  'tax_rates',
  'collections',
  'blogs',
  'contact_messages',
  'newsletter_subscribers',
  'reviews',
  'addresses',
  'wishlist_items',
  'carts',
  'cart_items',
];

const requiredIndexes = [
  'idx_products_category',
  'idx_products_status_active',
  'idx_product_images_product',
  'idx_product_variants_product',
  'idx_orders_customer',
  'idx_orders_status_date',
  'idx_order_items_order',
  'idx_order_items_product',
  'idx_payments_order',
  'idx_payments_status',
  'idx_discounts_product',
  'idx_discounts_category',
  'idx_shipping_zones_active',
  'idx_tax_rates_country_active',
  'idx_collections_product',
  'idx_blogs_status_published',
  'idx_contact_messages_status_created',
  'idx_newsletter_status',
  'idx_addresses_customer',
  'idx_addresses_user',
  'idx_addresses_order',
  'idx_reviews_product',
  'idx_cart_items_cart',
  'ux_cart_items_cart_product_variant',
  'idx_wishlist_customer',
  'idx_wishlist_user',
];

if (!existsSync(dbPath)) {
  throw new Error(`SQLite database does not exist at ${dbPath}. Run npm run db:migrate first.`);
}

const db = new DatabaseSync(dbPath, { readOnly: true });

try {
  db.exec('PRAGMA foreign_keys = ON');
  const fkErrors = db.prepare('PRAGMA foreign_key_check').all();
  const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name));
  const indexes = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type = 'index'").all().map((row) => row.name));

  const missingTables = requiredTables.filter((table) => !tables.has(table));
  const missingIndexes = requiredIndexes.filter((index) => !indexes.has(index));
  const counts = Object.fromEntries(
    requiredTables
      .filter((table) => tables.has(table))
      .map((table) => [table, db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count])
  );

  const result = {
    ok: fkErrors.length === 0 && missingTables.length === 0 && missingIndexes.length === 0,
    dbPath,
    foreignKeyErrors: fkErrors,
    missingTables,
    missingIndexes,
    counts,
  };

  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) {
    process.exitCode = 1;
  }
} finally {
  db.close();
}
