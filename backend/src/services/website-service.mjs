import { AppError } from '../core/errors.mjs';

function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function now() {
  return new Date().toISOString();
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function slugify(value, fallback = 'item') {
  const slug = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

function cleanString(value, fallback = '') {
  return String(value ?? fallback).trim();
}

const fallbackProductImages = [
  'https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=900',
  'https://images.unsplash.com/photo-1631125915732-b98f8774f675?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=900',
  'https://images.unsplash.com/photo-1526198049595-f32cde2a219d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=900',
];

function normalizeImageSource(value, fallbackSeed = '') {
  const source = cleanString(value);
  if (/^(https?:\/\/|data:image\/|\/)/i.test(source)) {
    return source;
  }
  const seed = cleanString(fallbackSeed, source);
  const index = Math.abs(
    seed.split('').reduce((total, char) => total + char.charCodeAt(0), 0)
  ) % fallbackProductImages.length;
  return fallbackProductImages[index];
}

function normalizeCategory(category = {}) {
  const name = cleanString(category.name || category.title, 'General');
  return {
    ...category,
    id: String(category.id || slugify(name, 'cat')),
    name,
    slug: cleanString(category.slug, slugify(name, 'category')),
    description: cleanString(category.description),
    image: category.image ? normalizeImageSource(category.image, name) : '',
    active: category.active !== false,
    sortOrder: toNumber(category.sortOrder, 0),
    updatedAt: category.updatedAt || now(),
  };
}

function normalizeCoupon(coupon = {}) {
  const code = cleanString(coupon.code, 'WELCOME').toUpperCase();
  return {
    ...coupon,
    id: String(coupon.id || slugify(code, 'coupon')),
    code,
    type: ['percentage', 'fixed'].includes(coupon.type) ? coupon.type : 'percentage',
    value: Math.max(0, toNumber(coupon.value, 0)),
    minOrderValue: Math.max(0, toNumber(coupon.minOrderValue ?? coupon.minimumOrder, 0)),
    maximumDiscount: Math.max(0, toNumber(coupon.maximumDiscount, 0)),
    active: coupon.active !== false,
    startsAt: cleanString(coupon.startsAt),
    endsAt: cleanString(coupon.endsAt),
    usageLimit: Math.max(0, Math.trunc(toNumber(coupon.usageLimit, 0))),
    usagePerCustomer: Math.max(0, Math.trunc(toNumber(coupon.usagePerCustomer, 0))),
    usedCount: Math.max(0, Math.trunc(toNumber(coupon.usedCount, 0))),
    applicableProducts: Array.isArray(coupon.applicableProducts) ? coupon.applicableProducts.map(String).filter(Boolean) : [],
    applicableCategories: Array.isArray(coupon.applicableCategories) ? coupon.applicableCategories.map(String).filter(Boolean) : [],
    updatedAt: coupon.updatedAt || now(),
  };
}

function validateCouponRecord(coupon, existingRows = [], currentId = '') {
  if (!coupon.code) throw new AppError(400, 'VALIDATION_ERROR', 'Coupon code is required');
  if (!/^[A-Z0-9_-]{3,40}$/.test(coupon.code)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Coupon code must be 3-40 letters, numbers, dashes or underscores');
  }
  if (!['percentage', 'fixed'].includes(coupon.type)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Coupon type must be percentage or fixed');
  }
  if (coupon.value <= 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Coupon value must be greater than zero');
  }
  if (coupon.type === 'percentage' && coupon.value > 100) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Percentage coupons cannot exceed 100');
  }
  if (coupon.startsAt && Number.isNaN(new Date(coupon.startsAt).getTime())) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Coupon start date is invalid');
  }
  if (coupon.endsAt && Number.isNaN(new Date(coupon.endsAt).getTime())) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Coupon end date is invalid');
  }
  if (coupon.startsAt && coupon.endsAt && new Date(coupon.endsAt).getTime() < new Date(coupon.startsAt).getTime()) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Coupon end date must be after start date');
  }
  if (coupon.maximumDiscount > 0 && coupon.type === 'fixed' && coupon.maximumDiscount < coupon.value) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Maximum discount cannot be less than fixed discount value');
  }
  if (coupon.usageLimit > 0 && coupon.usageLimit < coupon.usedCount) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Usage limit cannot be less than current usage');
  }
  const duplicate = existingRows
    .map(normalizeCoupon)
    .find((row) => row.code === coupon.code && String(row.id) !== String(currentId));
  if (duplicate) {
    throw new AppError(409, 'COUPON_CODE_EXISTS', 'Coupon code already exists');
  }
}

function isActiveForDate(record, currentDate = new Date()) {
  const startsAt = cleanString(record.startsAt || record.startAt);
  const endsAt = cleanString(record.endsAt || record.endAt);
  if (startsAt && new Date(startsAt).getTime() > currentDate.getTime()) return false;
  if (endsAt && new Date(endsAt).getTime() < currentDate.getTime()) return false;
  return true;
}

function calculateCouponDiscount(coupon, lineItems, subtotal) {
  if (!coupon) return 0;
  if (!coupon.active || !isActiveForDate(coupon)) {
    throw new AppError(400, 'INVALID_COUPON', 'Coupon is not active');
  }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError(400, 'COUPON_USAGE_LIMIT_REACHED', 'Coupon usage limit has been reached');
  }
  if (subtotal < coupon.minOrderValue) {
    throw new AppError(400, 'COUPON_MINIMUM_NOT_MET', 'Order does not meet coupon minimum');
  }

  const applicableProductIds = Array.isArray(coupon.applicableProducts) ? coupon.applicableProducts.map(String) : [];
  const applicableCategories = Array.isArray(coupon.applicableCategories) ? coupon.applicableCategories.map(String) : [];
  const eligibleSubtotal = lineItems
    .filter((item) => {
      if (!applicableProductIds.length && !applicableCategories.length) return true;
      return applicableProductIds.includes(String(item.productId)) || applicableCategories.includes(String(item.category));
    })
    .reduce((sum, item) => sum + toNumber(item.total, 0), 0);
  if (eligibleSubtotal <= 0) {
    throw new AppError(400, 'COUPON_NOT_APPLICABLE', 'Coupon does not apply to these products');
  }

  const rawDiscount = coupon.type === 'fixed' ? coupon.value : eligibleSubtotal * (coupon.value / 100);
  const capped = coupon.maximumDiscount > 0 ? Math.min(rawDiscount, coupon.maximumDiscount) : rawDiscount;
  return Math.round(Math.min(capped, subtotal) * 100) / 100;
}

function normalizeDiscount(discount = {}) {
  const name = cleanString(discount.name || discount.title, 'Discount');
  return {
    ...discount,
    id: String(discount.id || createId('dsc')),
    name,
    type: ['percentage', 'fixed'].includes(discount.type) ? discount.type : 'percentage',
    value: Math.max(0, toNumber(discount.value, 0)),
    scope: cleanString(discount.scope, 'all_products'),
    targetId: cleanString(discount.targetId),
    active: discount.active === true,
    startsAt: cleanString(discount.startsAt),
    endsAt: cleanString(discount.endsAt),
    updatedAt: discount.updatedAt || now(),
  };
}

function normalizeShippingZone(zone = {}) {
  const name = cleanString(zone.name, 'Tunisia');
  return {
    ...zone,
    id: String(zone.id || slugify(name, 'ship')),
    name,
    countries: Array.isArray(zone.countries) ? zone.countries.map(String) : ['Tunisia'],
    cities: Array.isArray(zone.cities) ? zone.cities.map(String) : [],
    fee: Math.max(0, toNumber(zone.fee, 0)),
    freeShippingThreshold: Math.max(0, toNumber(zone.freeShippingThreshold, 0)),
    estimatedDays: cleanString(zone.estimatedDays, '2-5 days'),
    active: zone.active !== false,
    updatedAt: zone.updatedAt || now(),
  };
}

function normalizeTaxRate(rate = {}) {
  const name = cleanString(rate.name, 'Default tax');
  return {
    ...rate,
    id: String(rate.id || slugify(name, 'tax')),
    name,
    country: cleanString(rate.country, 'Tunisia'),
    rate: Math.max(0, toNumber(rate.rate, 0)),
    includedInPrice: rate.includedInPrice !== false,
    active: rate.active !== false,
    updatedAt: rate.updatedAt || now(),
  };
}

function normalizeCollection(collection = {}) {
  const title = cleanString(collection.title || collection.name, 'Collection');
  return {
    ...collection,
    id: String(collection.id || createId('col')),
    title,
    slug: cleanString(collection.slug, slugify(title, 'collection')),
    description: cleanString(collection.description),
    image: normalizeImageSource(collection.image, title),
    productId: cleanString(collection.productId),
    itemCountLabel: cleanString(collection.itemCountLabel || collection.items),
    active: collection.active !== false,
    sortOrder: toNumber(collection.sortOrder, 0),
    updatedAt: collection.updatedAt || now(),
  };
}

function normalizeReview(review = {}) {
  const name = cleanString(review.name, 'Customer');
  return {
    ...review,
    id: String(review.id || createId('rev')),
    name,
    location: cleanString(review.location),
    rating: Math.max(1, Math.min(5, Math.round(toNumber(review.rating, 5)))),
    text: cleanString(review.text),
    image: review.image ? normalizeImageSource(review.image, name) : '',
    verified: review.verified !== false,
    active: review.active !== false,
    date: cleanString(review.date, now().slice(0, 10)),
    updatedAt: review.updatedAt || now(),
  };
}

function normalizeBlogPost(post = {}) {
  const title = cleanString(post.title, 'Blog post');
  return {
    ...post,
    id: String(post.id || createId('blog')),
    title,
    slug: cleanString(post.slug, slugify(title, 'blog-post')),
    excerpt: cleanString(post.excerpt),
    body: cleanString(post.body),
    image: post.image ? normalizeImageSource(post.image, title) : '',
    author: cleanString(post.author, 'Admin'),
    status: ['draft', 'published'].includes(post.status) ? post.status : 'draft',
    publishedAt: cleanString(post.publishedAt),
    updatedAt: post.updatedAt || now(),
  };
}

function normalizeContactMessage(message = {}) {
  return {
    ...message,
    id: String(message.id || createId('msg')),
    name: cleanString(message.name, 'Website visitor'),
    email: cleanString(message.email),
    phone: cleanString(message.phone),
    subject: cleanString(message.subject, 'general'),
    message: cleanString(message.message),
    status: ['new', 'read', 'archived'].includes(message.status) ? message.status : 'new',
    createdAt: message.createdAt || now(),
    updatedAt: message.updatedAt || now(),
  };
}

function normalizeSubscriber(subscriber = {}) {
  return {
    ...subscriber,
    id: String(subscriber.id || createId('sub')),
    email: cleanString(subscriber.email).toLowerCase(),
    name: cleanString(subscriber.name),
    source: cleanString(subscriber.source, 'website'),
    status: ['subscribed', 'unsubscribed'].includes(subscriber.status) ? subscriber.status : 'subscribed',
    createdAt: subscriber.createdAt || now(),
    updatedAt: subscriber.updatedAt || now(),
  };
}

const defaultWebsiteContent = {
  homepage: {
    announcement: 'Livraison partout en Tunisie',
    heroTitle: 'Ceramique artisanale tunisienne pour une maison elegante',
    heroSubtitle:
      'Vaisselle, decoration maison et cadeaux faconnes a la main par des artisans tunisiens.',
    heroPrimaryCta: 'Decouvrir la boutique',
    heroSecondaryCta: 'Notre histoire',
    heroImage:
      'https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
    heroDetailImage:
      'https://images.unsplash.com/photo-1631125915732-b98f8774f675?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
    heroTextureImage:
      'https://images.unsplash.com/photo-1526198049595-f32cde2a219d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
    featuredProductId: '',
    collectionEyebrow: 'Decouvrez nos collections',
    collectionTitle: 'Ceramique artisanale pour chaque moment',
    collectionSubtitle:
      "Des collections pensees pour l'art de la table, la decoration maison, Ramadan, les mariages et les cadeaux elegants.",
    newsletterTitle: 'Recevez nos nouvelles collections',
    newsletterSubtitle:
      'Avant-premieres, coffrets cadeaux, collections Ramadan et inspirations decoration maison directement dans votre boite mail.',
  },
  contact: {
    phone: '+216 XX XXX XXX',
    email: 'contact@lemondeceramique.tn',
    whatsapp: '+216 XX XXX XXX',
    address: 'Tunisie',
    hours: 'Lundi - vendredi: 9:00 - 18:00',
  },
};

const defaults = {
  categories: [
    normalizeCategory({ id: 'art-table', name: 'Art de la table', description: 'Vaisselle artisanale' }),
    normalizeCategory({ id: 'decor', name: 'Decoration maison', description: 'Pieces decoratives' }),
    normalizeCategory({ id: 'cadeaux', name: 'Cadeaux', description: 'Coffrets et cadeaux' }),
  ],
  coupons: [
    normalizeCoupon({ id: 'welcome10', code: 'WELCOME10', type: 'percentage', value: 10, minOrderValue: 100 }),
  ],
  discounts: [],
  shippingZones: [
    normalizeShippingZone({ id: 'tunisia', name: 'Tunisia', countries: ['Tunisia'], fee: 12, freeShippingThreshold: 199 }),
  ],
  taxRates: [normalizeTaxRate({ id: 'tnd-included', name: 'TND included tax', rate: 0, includedInPrice: true })],
  collections: [
    normalizeCollection({
      id: 'tableware',
      title: 'Art de la table',
      description: 'Vaisselle artisanale pour recevoir avec elegance',
      image:
        'https://images.unsplash.com/photo-1762534729099-fbe059aaf1d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
      itemCountLabel: '24 pieces',
    }),
  ],
  reviews: [
    normalizeReview({
      id: 'review-sarra',
      name: 'Sarra Ben Youssef',
      location: 'Tunis',
      rating: 5,
      text: "La finition est tres elegante et l'emballage etait impeccable.",
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    }),
  ],
  blogs: [],
};

const moduleConfig = {
  categories: { repoKey: 'categoriesRepo', normalize: normalizeCategory, defaults: defaults.categories },
  coupons: { repoKey: 'couponsRepo', normalize: normalizeCoupon, defaults: defaults.coupons },
  discounts: { repoKey: 'discountsRepo', normalize: normalizeDiscount, defaults: defaults.discounts },
  shippingZones: { repoKey: 'shippingZonesRepo', normalize: normalizeShippingZone, defaults: defaults.shippingZones },
  taxRates: { repoKey: 'taxRatesRepo', normalize: normalizeTaxRate, defaults: defaults.taxRates },
  collections: { repoKey: 'collectionsRepo', normalize: normalizeCollection, defaults: defaults.collections },
  reviews: { repoKey: 'reviewsRepo', normalize: normalizeReview, defaults: defaults.reviews },
  blogs: { repoKey: 'blogsRepo', normalize: normalizeBlogPost, defaults: defaults.blogs },
  contactMessages: { repoKey: 'contactMessagesRepo', normalize: normalizeContactMessage, defaults: [] },
  newsletterSubscribers: { repoKey: 'newsletterSubscribersRepo', normalize: normalizeSubscriber, defaults: [] },
};

function activeOnly(rows) {
  return rows.filter((row) => row.active !== false && row.status !== 'draft' && row.status !== 'archived');
}

export function createWebsiteService(deps) {
  async function getContent() {
    const stored = await deps.websiteContentRepo.get();
    return {
      ...defaultWebsiteContent,
      ...stored,
      homepage: {
        ...defaultWebsiteContent.homepage,
        ...(stored.homepage || {}),
      },
      contact: {
        ...defaultWebsiteContent.contact,
        ...(stored.contact || {}),
      },
    };
  }

  async function updateContent(context, patch = {}) {
    const current = await getContent();
    const next = {
      ...current,
      ...patch,
      homepage: {
        ...current.homepage,
        ...(patch.homepage || {}),
      },
      contact: {
        ...current.contact,
        ...(patch.contact || {}),
      },
      updatedAt: now(),
    };
    const saved = await deps.websiteContentRepo.replace(next);
    await deps.auditLogService.record(context, 'website.content_update', 'website', 'content', patch);
    return saved;
  }

  async function listModule(moduleName, { publicOnly = false } = {}) {
    const config = moduleConfig[moduleName];
    if (!config) throw new AppError(404, 'NOT_FOUND', 'Website module not found');
    const repo = deps[config.repoKey];
    const storedRows = await repo.list();
    const sourceRows = storedRows.length ? storedRows : config.defaults;
    const rows = sourceRows.map(config.normalize).sort((left, right) => toNumber(left.sortOrder, 0) - toNumber(right.sortOrder, 0));
    return publicOnly ? activeOnly(rows) : rows;
  }

  async function getModuleItem(moduleName, id) {
    const rows = await listModule(moduleName);
    return rows.find((row) => String(row.id) === String(id)) || null;
  }

  async function createModuleItem(context, moduleName, payload = {}) {
    const config = moduleConfig[moduleName];
    if (!config) throw new AppError(404, 'NOT_FOUND', 'Website module not found');
    const row = config.normalize({
      ...payload,
      id: payload.id || createId(moduleName.slice(0, 3)),
      createdAt: payload.createdAt || now(),
      updatedAt: now(),
    });
    if (moduleName === 'coupons') {
      validateCouponRecord(row, await deps[config.repoKey].list(), row.id);
    }
    const created = await deps[config.repoKey].create(row);
    await deps.auditLogService.record(context, `website.${moduleName}.create`, moduleName, created.id, created);
    return created;
  }

  async function updateModuleItem(context, moduleName, id, patch = {}) {
    const config = moduleConfig[moduleName];
    if (!config) throw new AppError(404, 'NOT_FOUND', 'Website module not found');
    const current = await getModuleItem(moduleName, id);
    if (!current) throw new AppError(404, 'NOT_FOUND', 'Website module item not found');
    const next = config.normalize({ ...current, ...patch, id, updatedAt: now() });
    if (moduleName === 'coupons') {
      validateCouponRecord(next, await deps[config.repoKey].list(), id);
    }
    const updated = await deps[config.repoKey].update(id, next);
    await deps.auditLogService.record(context, `website.${moduleName}.update`, moduleName, id, patch);
    return updated;
  }

  async function deleteModuleItem(context, moduleName, id) {
    const config = moduleConfig[moduleName];
    if (!config) throw new AppError(404, 'NOT_FOUND', 'Website module not found');
    const deleted = await deps[config.repoKey].remove(id);
    await deps.auditLogService.record(context, `website.${moduleName}.delete`, moduleName, id, {});
    return deleted;
  }

  async function getPublicProducts() {
    const products = await deps.ecommerceService.listProducts();
    return products
      .filter((product) => product.active !== false && product.status !== 'hidden')
      .map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        image: normalizeImageSource(product.image, product.name || product.category),
        badge: product.badge || '',
        isNew: Boolean(product.isNew),
        description: product.description || product.name,
        stock: product.stock,
        status: product.status,
        variants: Array.isArray(product.variants) ? product.variants : [],
      }));
  }

  async function getPublicPayload() {
    const [settings, content, products, categories, collections, reviews, blogs, shippingZones, taxRates, coupons, discounts] =
      await Promise.all([
        deps.settingsRepo.getAll(),
        getContent(),
        getPublicProducts(),
        listModule('categories', { publicOnly: true }),
        listModule('collections', { publicOnly: true }),
        listModule('reviews', { publicOnly: true }),
        listModule('blogs', { publicOnly: true }),
        listModule('shippingZones', { publicOnly: true }),
        listModule('taxRates', { publicOnly: true }),
        listModule('coupons', { publicOnly: true }),
        listModule('discounts', { publicOnly: true }),
      ]);
    return {
      settings: {
        store: settings.store,
        payments: settings.payments,
      },
      content,
      products,
      categories,
      collections,
      reviews,
      blogs,
      shippingZones,
      taxRates,
      coupons,
      discounts,
      generatedAt: now(),
    };
  }

  async function createPublicOrder(context, payload = {}) {
    return deps.store.runInTransaction(
      ['products', 'orders', 'customers', 'coupons', 'stock-movements', 'notifications', 'audit-logs'],
      async () => {
    const customer = payload.customer && typeof payload.customer === 'object' ? payload.customer : {};
    const items = Array.isArray(payload.items) ? payload.items : [];
    if (!items.length) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Order items are required');
    }

    const products = await deps.ecommerceService.listProducts();
    const lineItems = items.map((item) => {
      const product = products.find((row) => String(row.id) === String(item.productId || item.id));
      if (!product) throw new AppError(404, 'NOT_FOUND', `Product ${item.productId || item.id} not found`);
      const variant = product.variants?.find((row) => String(row.id) === String(item.variantId)) || product.variants?.[0];
      return {
        productId: product.id,
        variantId: variant?.id || '',
        name: product.name,
        sku: variant?.sku || product.sku || '',
        quantity: Math.max(1, Math.trunc(toNumber(item.quantity, 1))),
        unitPrice: product.price,
        costPrice: product.costPrice,
        category: product.category,
        total: Math.round(product.price * Math.max(1, Math.trunc(toNumber(item.quantity, 1))) * 100) / 100,
      };
    });
    const subtotal = Math.round(lineItems.reduce((sum, item) => sum + toNumber(item.total, 0), 0) * 100) / 100;
    const shippingZones = await listModule('shippingZones', { publicOnly: true });
    const shippingZone =
      shippingZones.find((zone) => {
        const countries = Array.isArray(zone.countries) ? zone.countries.map((value) => String(value).toLowerCase()) : [];
        const cities = Array.isArray(zone.cities) ? zone.cities.map((value) => String(value).toLowerCase()) : [];
        const country = cleanString(customer.country, 'Tunisia').toLowerCase();
        const city = cleanString(customer.city).toLowerCase();
        return (!countries.length || countries.includes(country)) && (!cities.length || cities.includes(city));
      }) || shippingZones[0];
    const deliveryFee =
      subtotal === 0 || (shippingZone?.freeShippingThreshold > 0 && subtotal >= shippingZone.freeShippingThreshold)
        ? 0
        : Math.max(0, toNumber(shippingZone?.fee, 0));
    const taxRates = await listModule('taxRates', { publicOnly: true });
    const taxRate = taxRates[0];
    const taxTotal = taxRate?.includedInPrice ? 0 : Math.round(subtotal * (toNumber(taxRate?.rate, 0) / 100) * 100) / 100;
    const couponCode = cleanString(payload.couponCode || payload.coupon).toUpperCase();
    const coupons = couponCode ? await listModule('coupons', { publicOnly: true }) : [];
    const coupon = couponCode ? coupons.find((entry) => entry.code === couponCode) : null;
    if (couponCode && !coupon) {
      throw new AppError(400, 'INVALID_COUPON', 'Coupon not found');
    }
    const discount = calculateCouponDiscount(coupon, lineItems, subtotal);

    const order = await deps.ecommerceService.createOrder(context, {
      customer: cleanString(customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(), 'Website customer'),
      email: cleanString(customer.email),
      phone: cleanString(customer.phone),
      address: cleanString(customer.address),
      city: cleanString(customer.delegation ? `${customer.city || customer.governorate || ''}, ${customer.delegation}` : customer.city || customer.governorate || ''),
      governorate: cleanString(customer.governorate || customer.city),
      delegation: cleanString(customer.delegation),
      country: cleanString(customer.country, 'Tunisia'),
      source: 'Website',
      customerSource: 'Website',
      customerNote: cleanString(payload.note),
      status: 'Confirmed',
      paymentStatus: 'Cash on Delivery',
      paymentMethod: 'Cash on delivery',
      deliveryStatus: 'Waiting',
      deliveryFee,
      discount,
      taxTotal,
      couponCode,
      lineItems,
    });

    if (coupon) {
      await updateModuleItem(context, 'coupons', coupon.id, {
        usedCount: coupon.usedCount + 1,
      });
    }

    return {
      id: order.id,
      status: order.status,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      taxTotal: order.taxTotal || 0,
      total: order.total,
    };
      }
    );
  }

  async function createContactMessage(context, payload = {}) {
    if (!payload.email || !payload.message) {
      throw new AppError(400, 'VALIDATION_ERROR', 'email and message are required');
    }
    const created = await createModuleItem(context, 'contactMessages', payload);
    await deps.notificationService.notify({
      type: 'info',
      priority: 'medium',
      title: 'New website contact message',
      message: `${created.name} sent a message from the website.`,
      link: '/admin/website',
      entityType: 'contact_message',
      entityId: created.id,
    });
    return created;
  }

  async function subscribeNewsletter(context, payload = {}) {
    const email = cleanString(payload.email).toLowerCase();
    if (!email || !email.includes('@')) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Valid email is required');
    }
    const rows = await listModule('newsletterSubscribers');
    const existing = rows.find((row) => row.email === email);
    if (existing) {
      return updateModuleItem(context, 'newsletterSubscribers', existing.id, {
        status: 'subscribed',
        source: payload.source || existing.source,
      });
    }
    return createModuleItem(context, 'newsletterSubscribers', { ...payload, email });
  }

  return {
    getContent,
    updateContent,
    listModule,
    getModuleItem,
    createModuleItem,
    updateModuleItem,
    deleteModuleItem,
    getPublicProducts,
    getPublicPayload,
    createPublicOrder,
    createContactMessage,
    subscribeNewsletter,
  };
}
