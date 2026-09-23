import { existsSync, readFileSync, statSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendDir = resolve(scriptDir, '..');
const defaultDataDir = resolve(backendDir, 'src', 'data');
const dataDir = resolve(process.env.DATA_DIR || defaultDataDir);
const dbPath = resolve(process.env.ECOMMERCE_DB_PATH || join(dataDir, 'ecommerce.sqlite3'));

const now = () => new Date().toISOString();

function readJson(name, fallback) {
  const file = join(dataDir, `${name}.json`);
  if (!existsSync(file)) return fallback;
  const raw = readFileSync(file, 'utf8').replace(/^\uFEFF/, '').trim();
  return raw ? JSON.parse(raw) : fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value, fallback = '') {
  return String(value ?? fallback).trim();
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolInt(value, fallback = true) {
  if (value === undefined || value === null || value === '') return fallback ? 1 : 0;
  return value === true || value === 1 || value === '1' || value === 'true' ? 1 : 0;
}

function slugify(value, fallback = 'item') {
  const slug = text(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

function cleanId(value, fallbackPrefix = 'id') {
  const candidate = text(value);
  if (candidate) return candidate;
  return `${fallbackPrefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function safeId(value) {
  return text(value, 'id').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'id';
}

function json(value) {
  return JSON.stringify(value ?? null);
}

function firstName(fullName) {
  return text(fullName).split(/\s+/)[0] || '';
}

function lastName(fullName) {
  const parts = text(fullName).split(/\s+/).filter(Boolean);
  return parts.length > 1 ? parts.slice(1).join(' ') : '';
}

function createSchema(db) {
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT,
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      user_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, role_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image_url TEXT,
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category_id TEXT,
      name TEXT NOT NULL,
      sku TEXT UNIQUE,
      description TEXT,
      price REAL NOT NULL DEFAULT 0 CHECK (price >= 0),
      cost_price REAL NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
      status TEXT NOT NULL DEFAULT 'available',
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
      image_url TEXT,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      url TEXT NOT NULL,
      alt TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      sku TEXT UNIQUE,
      size TEXT,
      color TEXT,
      material TEXT,
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      reserved INTEGER NOT NULL DEFAULT 0 CHECK (reserved >= 0),
      low_stock_threshold INTEGER NOT NULL DEFAULT 0 CHECK (low_stock_threshold >= 0),
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT NOT NULL,
      phone TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      segment TEXT,
      total_spent REAL NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
      orders_count INTEGER NOT NULL DEFAULT 0 CHECK (orders_count >= 0),
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT,
      email TEXT,
      phone TEXT,
      status TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'Unpaid',
      delivery_status TEXT NOT NULL DEFAULT 'Waiting',
      source TEXT,
      subtotal REAL NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
      discount REAL NOT NULL DEFAULT 0 CHECK (discount >= 0),
      delivery_fee REAL NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
      tax REAL NOT NULL DEFAULT 0 CHECK (tax >= 0),
      total REAL NOT NULL DEFAULT 0 CHECK (total >= 0),
      currency TEXT NOT NULL DEFAULT 'TND',
      ordered_at TEXT NOT NULL,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      customer_id TEXT,
      order_id TEXT,
      type TEXT NOT NULL DEFAULT 'shipping',
      full_name TEXT,
      phone TEXT,
      line1 TEXT NOT NULL,
      line2 TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      postal_code TEXT,
      is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      CHECK (user_id IS NOT NULL OR customer_id IS NOT NULL OR order_id IS NOT NULL),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT,
      variant_id TEXT,
      name TEXT NOT NULL,
      sku TEXT,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      unit_price REAL NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
      cost_price REAL NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
      total REAL NOT NULL DEFAULT 0 CHECK (total >= 0),
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
      FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      provider TEXT,
      method TEXT,
      status TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0 CHECK (amount >= 0),
      currency TEXT NOT NULL DEFAULT 'TND',
      transaction_id TEXT,
      paid_at TEXT,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
      value REAL NOT NULL DEFAULT 0 CHECK (value >= 0),
      min_order_value REAL NOT NULL DEFAULT 0 CHECK (min_order_value >= 0),
      starts_at TEXT,
      ends_at TEXT,
      usage_limit INTEGER NOT NULL DEFAULT 0 CHECK (usage_limit >= 0),
      used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS discounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
      value REAL NOT NULL DEFAULT 0 CHECK (value >= 0),
      scope TEXT NOT NULL DEFAULT 'all_products',
      target_product_id TEXT,
      target_category_id TEXT,
      active INTEGER NOT NULL DEFAULT 0 CHECK (active IN (0, 1)),
      starts_at TEXT,
      ends_at TEXT,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (target_product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (target_category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS shipping_zones (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      countries_json TEXT NOT NULL DEFAULT '[]',
      cities_json TEXT NOT NULL DEFAULT '[]',
      fee REAL NOT NULL DEFAULT 0 CHECK (fee >= 0),
      free_shipping_threshold REAL NOT NULL DEFAULT 0 CHECK (free_shipping_threshold >= 0),
      estimated_days TEXT,
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tax_rates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      rate REAL NOT NULL DEFAULT 0 CHECK (rate >= 0),
      included_in_price INTEGER NOT NULL DEFAULT 1 CHECK (included_in_price IN (0, 1)),
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image_url TEXT,
      product_id TEXT,
      item_count_label TEXT,
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
      sort_order INTEGER NOT NULL DEFAULT 0,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT,
      body TEXT,
      image_url TEXT,
      author TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      published_at TEXT,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      source TEXT,
      status TEXT NOT NULL DEFAULT 'subscribed',
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT,
      customer_id TEXT,
      name TEXT NOT NULL,
      email TEXT,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      title TEXT,
      text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'published',
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
      verified INTEGER NOT NULL DEFAULT 0 CHECK (verified IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS carts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      customer_id TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      currency TEXT NOT NULL DEFAULT 'TND',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      CHECK (user_id IS NOT NULL OR customer_id IS NOT NULL),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      cart_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      variant_id TEXT,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      unit_price REAL NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (cart_id, product_id, variant_id),
      FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS wishlist_items (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      customer_id TEXT,
      product_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      CHECK (user_id IS NOT NULL OR customer_id IS NOT NULL),
      UNIQUE (user_id, product_id),
      UNIQUE (customer_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_status_active ON products(status, active);
    CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id, position);
    CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders(status, ordered_at);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
    CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    CREATE INDEX IF NOT EXISTS idx_discounts_product ON discounts(target_product_id);
    CREATE INDEX IF NOT EXISTS idx_discounts_category ON discounts(target_category_id);
    CREATE INDEX IF NOT EXISTS idx_shipping_zones_active ON shipping_zones(active);
    CREATE INDEX IF NOT EXISTS idx_tax_rates_country_active ON tax_rates(country, active);
    CREATE INDEX IF NOT EXISTS idx_collections_product ON collections(product_id);
    CREATE INDEX IF NOT EXISTS idx_blogs_status_published ON blogs(status, published_at);
    CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created ON contact_messages(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);
    CREATE INDEX IF NOT EXISTS idx_addresses_customer ON addresses(customer_id);
    CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
    CREATE INDEX IF NOT EXISTS idx_addresses_order ON addresses(order_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id, active);
    CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
    CREATE UNIQUE INDEX IF NOT EXISTS ux_cart_items_cart_product_variant ON cart_items(cart_id, product_id, COALESCE(variant_id, ''));
    CREATE INDEX IF NOT EXISTS idx_wishlist_customer ON wishlist_items(customer_id);
    CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);
  `);
}

function runUpsert(db, sql, values) {
  db.prepare(sql).run(...values);
}

function categoryIdForName(name) {
  return `cat_${slugify(name, 'general')}`;
}

function migrateUsers(db, users) {
  for (const user of users) {
    const roleName = text(user.role, 'Admin');
    const roleId = `role_${slugify(roleName, 'admin')}`;
    runUpsert(
      db,
      `INSERT INTO roles (id, name, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, updated_at=excluded.updated_at`,
      [roleId, roleName, `${roleName} access`, now(), now()]
    );
    runUpsert(
      db,
      `INSERT INTO users (id, email, name, password_hash, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET email=excluded.email, name=excluded.name, password_hash=excluded.password_hash, active=excluded.active, updated_at=excluded.updated_at`,
      [cleanId(user.id, 'user'), text(user.email), text(user.name, user.email), text(user.passwordHash), boolInt(user.active, true), now(), now()]
    );
    runUpsert(
      db,
      `INSERT INTO user_roles (user_id, role_id, created_at)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id, role_id) DO NOTHING`,
      [cleanId(user.id, 'user'), roleId, now()]
    );
  }
}

function migrateCategories(db, categories, products) {
  const byId = new Map();
  for (const category of categories) {
    const name = text(category.name || category.title, 'General');
    byId.set(cleanId(category.id || categoryIdForName(name), 'cat'), {
      id: cleanId(category.id || categoryIdForName(name), 'cat'),
      name,
      slug: text(category.slug, slugify(name, 'category')),
      description: text(category.description),
      imageUrl: text(category.image || category.imageUrl),
      active: boolInt(category.active, true),
      sortOrder: number(category.sortOrder, 0),
    });
  }
  for (const product of products) {
    const name = text(product.category);
    if (!name) continue;
    const id = categoryIdForName(name);
    if (!byId.has(id)) {
      byId.set(id, {
        id,
        name,
        slug: slugify(name, 'category'),
        description: '',
        imageUrl: '',
        active: 1,
        sortOrder: 0,
      });
    }
  }
  for (const category of byId.values()) {
    runUpsert(
      db,
      `INSERT INTO categories (id, name, slug, description, image_url, active, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, slug=excluded.slug, description=excluded.description, image_url=excluded.image_url, active=excluded.active, sort_order=excluded.sort_order, updated_at=excluded.updated_at`,
      [category.id, category.name, category.slug, category.description, category.imageUrl, category.active, category.sortOrder, now(), now()]
    );
  }
}

function migrateProducts(db, products) {
  for (const product of products) {
    const id = cleanId(product.id, 'prd');
    const categoryId = text(product.category) ? categoryIdForName(product.category) : null;
    runUpsert(
      db,
      `INSERT INTO products (id, category_id, name, sku, description, price, cost_price, stock, views, status, active, image_url, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET category_id=excluded.category_id, name=excluded.name, sku=excluded.sku, description=excluded.description, price=excluded.price, cost_price=excluded.cost_price, stock=excluded.stock, views=excluded.views, status=excluded.status, active=excluded.active, image_url=excluded.image_url, metadata_json=excluded.metadata_json, updated_at=excluded.updated_at`,
      [
        id,
        categoryId,
        text(product.name, 'Product'),
        text(product.sku) || null,
        text(product.description),
        number(product.price, 0),
        number(product.costPrice, 0),
        Math.max(0, Math.trunc(number(product.stock, 0))),
        Math.max(0, Math.trunc(number(product.views, 0))),
        text(product.status, 'available'),
        boolInt(product.active, true),
        text(product.image),
        json(product),
        now(),
        text(product.updated || product.updatedAt, now()),
      ]
    );

    if (text(product.image)) {
      runUpsert(
        db,
        `INSERT INTO product_images (id, product_id, url, alt, position, is_primary, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET url=excluded.url, alt=excluded.alt, position=excluded.position, is_primary=excluded.is_primary`,
        [`img_${safeId(id)}_primary`, id, text(product.image), text(product.name), 0, 1, now()]
      );
    }

    for (const variant of asArray(product.variants)) {
      runUpsert(
        db,
        `INSERT INTO product_variants (id, product_id, sku, size, color, material, stock, reserved, low_stock_threshold, active, metadata_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET product_id=excluded.product_id, sku=excluded.sku, size=excluded.size, color=excluded.color, material=excluded.material, stock=excluded.stock, reserved=excluded.reserved, low_stock_threshold=excluded.low_stock_threshold, active=excluded.active, metadata_json=excluded.metadata_json, updated_at=excluded.updated_at`,
        [
          cleanId(variant.id, 'var'),
          id,
          text(variant.sku) || null,
          text(variant.size),
          text(variant.color),
          text(variant.material),
          Math.max(0, Math.trunc(number(variant.stock, 0))),
          Math.max(0, Math.trunc(number(variant.reserved, 0))),
          Math.max(0, Math.trunc(number(variant.lowStockThreshold, 0))),
          boolInt(variant.active, true),
          json(variant),
          now(),
          now(),
        ]
      );
    }
  }
}

function migrateCustomers(db, customers) {
  for (const customer of customers) {
    const id = cleanId(customer.id, 'cus');
    runUpsert(
      db,
      `INSERT INTO customers (id, email, name, phone, status, segment, total_spent, orders_count, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET email=excluded.email, name=excluded.name, phone=excluded.phone, status=excluded.status, segment=excluded.segment, total_spent=excluded.total_spent, orders_count=excluded.orders_count, metadata_json=excluded.metadata_json, updated_at=excluded.updated_at`,
      [
        id,
        text(customer.email) || null,
        text(customer.name, customer.email || 'Customer'),
        text(customer.phone),
        text(customer.status, 'active'),
        text(customer.segment),
        number(customer.totalSpent, 0),
        Math.max(0, Math.trunc(number(customer.orders, 0))),
        json(customer),
        now(),
        text(customer.lastActivity, now()),
      ]
    );
    if (text(customer.address)) {
      runUpsert(
        db,
        `INSERT INTO addresses (id, user_id, customer_id, order_id, type, full_name, phone, line1, line2, city, state, country, postal_code, is_default, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET full_name=excluded.full_name, phone=excluded.phone, line1=excluded.line1, city=excluded.city, country=excluded.country, is_default=excluded.is_default, updated_at=excluded.updated_at`,
        [
          `addr_customer_${safeId(id)}`,
          null,
          id,
          null,
          'shipping',
          text(customer.name),
          text(customer.phone),
          text(customer.address),
          '',
          text(customer.city),
          '',
          text(customer.country, 'Tunisia'),
          '',
          1,
          now(),
          now(),
        ]
      );
    }
  }
}

function ensureOrderCustomer(db, order) {
  const customerId = text(order.customerId);
  if (!customerId) return null;
  const existing = db.prepare('SELECT id FROM customers WHERE id = ?').get(customerId);
  if (existing) return customerId;
  runUpsert(
    db,
    `INSERT INTO customers (id, email, name, phone, status, segment, total_spent, orders_count, metadata_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO NOTHING`,
    [
      customerId,
      text(order.email) || null,
      text(order.customer, order.email || 'Customer'),
      text(order.phone),
      'active',
      '',
      0,
      0,
      json({ createdFromOrderId: order.id }),
      now(),
      now(),
    ]
  );
  return customerId;
}

function variantExists(db, variantId) {
  if (!text(variantId)) return null;
  return db.prepare('SELECT id FROM product_variants WHERE id = ?').get(text(variantId)) ? text(variantId) : null;
}

function productExists(db, productId) {
  if (!text(productId)) return null;
  return db.prepare('SELECT id FROM products WHERE id = ?').get(text(productId)) ? text(productId) : null;
}

function migrateOrders(db, orders) {
  for (const order of orders) {
    const id = cleanId(order.id, 'ord');
    const customerId = ensureOrderCustomer(db, order);
    const lineItems = asArray(order.lineItems);
    const subtotal = number(order.subtotal, lineItems.reduce((sum, item) => sum + number(item.total, number(item.unitPrice, 0) * number(item.quantity, 1)), 0));
    const discount = number(order.discount, 0);
    const deliveryFee = number(order.deliveryFee, 0);
    const tax = number(order.tax, 0);
    const total = number(order.total ?? order.amount, subtotal + deliveryFee + tax - discount);
    runUpsert(
      db,
      `INSERT INTO orders (id, customer_id, email, phone, status, payment_status, delivery_status, source, subtotal, discount, delivery_fee, tax, total, currency, ordered_at, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET customer_id=excluded.customer_id, email=excluded.email, phone=excluded.phone, status=excluded.status, payment_status=excluded.payment_status, delivery_status=excluded.delivery_status, source=excluded.source, subtotal=excluded.subtotal, discount=excluded.discount, delivery_fee=excluded.delivery_fee, tax=excluded.tax, total=excluded.total, currency=excluded.currency, ordered_at=excluded.ordered_at, metadata_json=excluded.metadata_json, updated_at=excluded.updated_at`,
      [
        id,
        customerId,
        text(order.email),
        text(order.phone),
        text(order.status, 'New'),
        text(order.paymentStatus || order.payment, 'Unpaid'),
        text(order.deliveryStatus || order.delivery, 'Waiting'),
        text(order.source, 'Admin'),
        subtotal,
        discount,
        deliveryFee,
        tax,
        total,
        text(order.currency, 'TND'),
        text(order.date, now()),
        json(order),
        text(order.date, now()),
        now(),
      ]
    );

    if (text(order.address)) {
      runUpsert(
        db,
        `INSERT INTO addresses (id, user_id, customer_id, order_id, type, full_name, phone, line1, line2, city, state, country, postal_code, is_default, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET customer_id=excluded.customer_id, full_name=excluded.full_name, phone=excluded.phone, line1=excluded.line1, city=excluded.city, country=excluded.country, updated_at=excluded.updated_at`,
        [
          `addr_order_${safeId(id)}`,
          null,
          customerId,
          id,
          'shipping',
          text(order.customer),
          text(order.phone),
          text(order.address),
          '',
          text(order.city),
          '',
          text(order.country, 'Tunisia'),
          '',
          0,
          text(order.date, now()),
          now(),
        ]
      );
    }

    for (const item of lineItems) {
      const itemId = cleanId(item.id || `${id}_${item.productId || item.name}`, 'li');
      const itemProductId = productExists(db, item.productId);
      const itemVariantId = variantExists(db, item.variantId);
      runUpsert(
        db,
        `INSERT INTO order_items (id, order_id, product_id, variant_id, name, sku, quantity, unit_price, cost_price, total, metadata_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET order_id=excluded.order_id, product_id=excluded.product_id, variant_id=excluded.variant_id, name=excluded.name, sku=excluded.sku, quantity=excluded.quantity, unit_price=excluded.unit_price, cost_price=excluded.cost_price, total=excluded.total, metadata_json=excluded.metadata_json, updated_at=excluded.updated_at`,
        [
          itemId,
          id,
          itemProductId,
          itemVariantId,
          text(item.name, 'Order item'),
          text(item.sku),
          Math.max(1, Math.trunc(number(item.quantity, 1))),
          number(item.unitPrice, 0),
          number(item.costPrice, 0),
          number(item.total, number(item.unitPrice, 0) * number(item.quantity, 1)),
          json(item),
          text(order.date, now()),
          now(),
        ]
      );
    }

    runUpsert(
      db,
      `INSERT INTO payments (id, order_id, provider, method, status, amount, currency, transaction_id, paid_at, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET status=excluded.status, amount=excluded.amount, method=excluded.method, paid_at=excluded.paid_at, metadata_json=excluded.metadata_json, updated_at=excluded.updated_at`,
      [
        `pay_${safeId(id)}`,
        id,
        text(order.paymentProvider),
        text(order.paymentMethod || order.payment, 'manual'),
        text(order.paymentStatus || order.payment, 'Unpaid'),
        total,
        text(order.currency, 'TND'),
        text(order.transactionId || order.paymentIntentId),
        /paid/i.test(text(order.paymentStatus || order.payment)) ? text(order.date, now()) : null,
        json({ sourceOrderPayment: order.payment, sourceOrderPaymentStatus: order.paymentStatus }),
        text(order.date, now()),
        now(),
      ]
    );
  }
}

function migrateCoupons(db, coupons) {
  for (const coupon of coupons) {
    const code = text(coupon.code, coupon.id || 'COUPON').toUpperCase();
    runUpsert(
      db,
      `INSERT INTO coupons (id, code, type, value, min_order_value, starts_at, ends_at, usage_limit, used_count, active, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET code=excluded.code, type=excluded.type, value=excluded.value, min_order_value=excluded.min_order_value, starts_at=excluded.starts_at, ends_at=excluded.ends_at, usage_limit=excluded.usage_limit, used_count=excluded.used_count, active=excluded.active, metadata_json=excluded.metadata_json, updated_at=excluded.updated_at`,
      [
        cleanId(coupon.id || `coupon_${slugify(code)}`, 'coupon'),
        code,
        ['percentage', 'fixed'].includes(coupon.type) ? coupon.type : 'percentage',
        number(coupon.value, 0),
        number(coupon.minOrderValue, 0),
        text(coupon.startsAt) || null,
        text(coupon.endsAt) || null,
        Math.max(0, Math.trunc(number(coupon.usageLimit, 0))),
        Math.max(0, Math.trunc(number(coupon.usedCount, 0))),
        boolInt(coupon.active, true),
        json(coupon),
        text(coupon.createdAt, now()),
        text(coupon.updatedAt, now()),
      ]
    );
  }
}

function migrateReviews(db, reviews) {
  for (const review of reviews) {
    runUpsert(
      db,
      `INSERT INTO reviews (id, product_id, customer_id, name, email, rating, title, text, status, active, verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET product_id=excluded.product_id, customer_id=excluded.customer_id, name=excluded.name, email=excluded.email, rating=excluded.rating, title=excluded.title, text=excluded.text, status=excluded.status, active=excluded.active, verified=excluded.verified, updated_at=excluded.updated_at`,
      [
        cleanId(review.id, 'rev'),
        productExists(db, review.productId),
        text(review.customerId) && db.prepare('SELECT id FROM customers WHERE id = ?').get(text(review.customerId)) ? text(review.customerId) : null,
        text(review.name, 'Customer'),
        text(review.email) || null,
        Math.max(1, Math.min(5, Math.trunc(number(review.rating, 5)))),
        text(review.title),
        text(review.text || review.message),
        text(review.status, 'published'),
        boolInt(review.active, true),
        boolInt(review.verified, false),
        text(review.date || review.createdAt, now()),
        text(review.updatedAt, now()),
      ]
    );
  }
}

function migrateDiscounts(db, discounts) {
  for (const discount of discounts) {
    const scope = text(discount.scope, 'all_products');
    const targetProductId = productExists(db, discount.productId || discount.targetProductId || (scope === 'product' ? discount.targetId : ''));
    const rawCategoryTarget = text(discount.categoryId || discount.targetCategoryId || (scope === 'category' ? discount.targetId : ''));
    const targetCategoryId = rawCategoryTarget && db.prepare('SELECT id FROM categories WHERE id = ?').get(rawCategoryTarget)
      ? rawCategoryTarget
      : null;
    runUpsert(
      db,
      `INSERT INTO discounts (id, name, type, value, scope, target_product_id, target_category_id, active, starts_at, ends_at, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, type=excluded.type, value=excluded.value, scope=excluded.scope, target_product_id=excluded.target_product_id, target_category_id=excluded.target_category_id, active=excluded.active, starts_at=excluded.starts_at, ends_at=excluded.ends_at, metadata_json=excluded.metadata_json, updated_at=excluded.updated_at`,
      [
        cleanId(discount.id, 'dsc'),
        text(discount.name || discount.title, 'Discount'),
        ['percentage', 'fixed'].includes(discount.type) ? discount.type : 'percentage',
        number(discount.value, 0),
        scope,
        targetProductId,
        targetCategoryId,
        boolInt(discount.active, false),
        text(discount.startsAt) || null,
        text(discount.endsAt) || null,
        json(discount),
        text(discount.createdAt, now()),
        text(discount.updatedAt, now()),
      ]
    );
  }
}

function migrateShippingZones(db, zones) {
  for (const zone of zones) {
    runUpsert(
      db,
      `INSERT INTO shipping_zones (id, name, countries_json, cities_json, fee, free_shipping_threshold, estimated_days, active, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, countries_json=excluded.countries_json, cities_json=excluded.cities_json, fee=excluded.fee, free_shipping_threshold=excluded.free_shipping_threshold, estimated_days=excluded.estimated_days, active=excluded.active, metadata_json=excluded.metadata_json, updated_at=excluded.updated_at`,
      [
        cleanId(zone.id, 'ship'),
        text(zone.name, 'Shipping zone'),
        json(asArray(zone.countries).map(String)),
        json(asArray(zone.cities).map(String)),
        number(zone.fee, 0),
        number(zone.freeShippingThreshold, 0),
        text(zone.estimatedDays),
        boolInt(zone.active, true),
        json(zone),
        text(zone.createdAt, now()),
        text(zone.updatedAt, now()),
      ]
    );
  }
}

function migrateTaxRates(db, rates) {
  for (const rate of rates) {
    runUpsert(
      db,
      `INSERT INTO tax_rates (id, name, country, rate, included_in_price, active, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, country=excluded.country, rate=excluded.rate, included_in_price=excluded.included_in_price, active=excluded.active, metadata_json=excluded.metadata_json, updated_at=excluded.updated_at`,
      [
        cleanId(rate.id, 'tax'),
        text(rate.name, 'Tax rate'),
        text(rate.country, 'Tunisia'),
        number(rate.rate, 0),
        boolInt(rate.includedInPrice, true),
        boolInt(rate.active, true),
        json(rate),
        text(rate.createdAt, now()),
        text(rate.updatedAt, now()),
      ]
    );
  }
}

function migrateCollections(db, collections) {
  for (const collection of collections) {
    const title = text(collection.title || collection.name, 'Collection');
    runUpsert(
      db,
      `INSERT INTO collections (id, title, slug, description, image_url, product_id, item_count_label, active, sort_order, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET title=excluded.title, slug=excluded.slug, description=excluded.description, image_url=excluded.image_url, product_id=excluded.product_id, item_count_label=excluded.item_count_label, active=excluded.active, sort_order=excluded.sort_order, metadata_json=excluded.metadata_json, updated_at=excluded.updated_at`,
      [
        cleanId(collection.id, 'col'),
        title,
        text(collection.slug, slugify(title, 'collection')),
        text(collection.description),
        text(collection.image || collection.imageUrl),
        productExists(db, collection.productId),
        text(collection.itemCountLabel || collection.items),
        boolInt(collection.active, true),
        Math.trunc(number(collection.sortOrder, 0)),
        json(collection),
        text(collection.createdAt, now()),
        text(collection.updatedAt, now()),
      ]
    );
  }
}

function migrateBlogs(db, blogs) {
  for (const blog of blogs) {
    const title = text(blog.title, 'Blog post');
    runUpsert(
      db,
      `INSERT INTO blogs (id, title, slug, excerpt, body, image_url, author, status, published_at, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET title=excluded.title, slug=excluded.slug, excerpt=excluded.excerpt, body=excluded.body, image_url=excluded.image_url, author=excluded.author, status=excluded.status, published_at=excluded.published_at, metadata_json=excluded.metadata_json, updated_at=excluded.updated_at`,
      [
        cleanId(blog.id, 'blog'),
        title,
        text(blog.slug, slugify(title, 'blog-post')),
        text(blog.excerpt),
        text(blog.body),
        text(blog.image || blog.imageUrl),
        text(blog.author, 'Admin'),
        text(blog.status, 'draft'),
        text(blog.publishedAt) || null,
        json(blog),
        text(blog.createdAt, now()),
        text(blog.updatedAt, now()),
      ]
    );
  }
}

function migrateContactMessages(db, messages) {
  for (const message of messages) {
    runUpsert(
      db,
      `INSERT INTO contact_messages (id, name, email, phone, subject, message, status, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, email=excluded.email, phone=excluded.phone, subject=excluded.subject, message=excluded.message, status=excluded.status, metadata_json=excluded.metadata_json, updated_at=excluded.updated_at`,
      [
        cleanId(message.id, 'msg'),
        text(message.name, 'Website visitor'),
        text(message.email),
        text(message.phone),
        text(message.subject, 'general'),
        text(message.message),
        text(message.status, 'new'),
        json(message),
        text(message.createdAt, now()),
        text(message.updatedAt, now()),
      ]
    );
  }
}

function migrateNewsletterSubscribers(db, subscribers) {
  for (const subscriber of subscribers) {
    const email = text(subscriber.email).toLowerCase();
    if (!email) continue;
    runUpsert(
      db,
      `INSERT INTO newsletter_subscribers (id, email, name, source, status, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET email=excluded.email, name=excluded.name, source=excluded.source, status=excluded.status, metadata_json=excluded.metadata_json, updated_at=excluded.updated_at`,
      [
        cleanId(subscriber.id, 'sub'),
        email,
        text(subscriber.name),
        text(subscriber.source, 'website'),
        text(subscriber.status, 'subscribed'),
        json(subscriber),
        text(subscriber.createdAt, now()),
        text(subscriber.updatedAt, now()),
      ]
    );
  }
}

function tableCount(db, tableName) {
  return db.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get().count;
}

function verify(db) {
  const fkErrors = db.prepare('PRAGMA foreign_key_check').all();
  if (fkErrors.length) {
    throw new Error(`Foreign key verification failed: ${JSON.stringify(fkErrors)}`);
  }
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
  const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name));
  const missingTables = requiredTables.filter((table) => !tables.has(table));
  if (missingTables.length) {
    throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
  }
  return Object.fromEntries(requiredTables.map((table) => [table, tableCount(db, table)]));
}

await mkdir(dataDir, { recursive: true });
const existingDbSize = existsSync(dbPath) ? statSync(dbPath).size : 0;
const db = new DatabaseSync(dbPath);

try {
  db.exec('PRAGMA foreign_keys = ON');
  createSchema(db);

  const users = asArray(readJson('users', []));
  const products = asArray(readJson('products', []));
  const orders = asArray(readJson('orders', []));
  const customers = asArray(readJson('customers', []));
  const categories = asArray(readJson('categories', []));
  const coupons = asArray(readJson('coupons', []));
  const reviews = asArray(readJson('reviews', []));
  const discounts = asArray(readJson('discounts', []));
  const shippingZones = asArray(readJson('shipping-zones', []));
  const taxRates = asArray(readJson('tax-rates', []));
  const collections = asArray(readJson('collections', []));
  const blogs = asArray(readJson('blogs', []));
  const contactMessages = asArray(readJson('contact-messages', []));
  const newsletterSubscribers = asArray(readJson('newsletter-subscribers', []));

  db.exec('BEGIN');
  try {
    migrateUsers(db, users);
    migrateCategories(db, categories, products);
    migrateProducts(db, products);
    migrateCustomers(db, customers);
    migrateOrders(db, orders);
    migrateCoupons(db, coupons);
    migrateDiscounts(db, discounts);
    migrateShippingZones(db, shippingZones);
    migrateTaxRates(db, taxRates);
    migrateCollections(db, collections);
    migrateBlogs(db, blogs);
    migrateContactMessages(db, contactMessages);
    migrateNewsletterSubscribers(db, newsletterSubscribers);
    migrateReviews(db, reviews);
    runUpsert(
      db,
      `INSERT INTO schema_migrations (id, applied_at)
       VALUES (?, ?)
       ON CONFLICT(id) DO UPDATE SET applied_at=excluded.applied_at`,
      ['json_to_sqlite_ecommerce_v1', now()]
    );
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  const counts = verify(db);
  console.log(JSON.stringify({ ok: true, dbPath, existingDbSize, counts }, null, 2));
} finally {
  db.close();
}
