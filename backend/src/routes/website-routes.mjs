import { AppError } from '../core/errors.mjs';
import { requirePermission } from '../core/permissions.mjs';
import { requireAuth } from '../middleware/auth.mjs';

const MODULES = {
  categories: '/api/categories',
  coupons: '/api/coupons',
  discounts: '/api/discounts',
  shippingZones: '/api/shipping-zones',
  taxRates: '/api/tax-rates',
  collections: '/api/collections',
  reviews: '/api/reviews',
  blogs: '/api/blogs',
  contactMessages: '/api/contact-messages',
  newsletterSubscribers: '/api/newsletter-subscribers',
};

function cleanBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid JSON payload');
  }
  return body;
}

const MODULE_PERMISSIONS = {
  categories: { read: 'categories.read', create: 'categories.write', update: 'categories.write', delete: 'categories.write' },
  coupons: { read: 'coupons.read', create: 'coupons.create', update: 'coupons.update', delete: 'coupons.delete' },
  discounts: { read: 'discounts.read', create: 'discounts.write', update: 'discounts.write', delete: 'discounts.write' },
  shippingZones: { read: 'shipping.read', create: 'shipping.write', update: 'shipping.write', delete: 'shipping.write' },
  taxRates: { read: 'tax.read', create: 'tax.write', update: 'tax.write', delete: 'tax.write' },
  collections: { read: 'website.settings.read', create: 'website.settings.write', update: 'website.settings.write', delete: 'website.settings.write' },
  reviews: { read: 'reviews.read', create: 'reviews.moderate', update: 'reviews.moderate', delete: 'reviews.moderate' },
  blogs: { read: 'blog.read', create: 'blog.write', update: 'blog.write', delete: 'blog.write' },
  contactMessages: { read: 'website.settings.read', create: 'website.settings.write', update: 'website.settings.write', delete: 'website.settings.write' },
  newsletterSubscribers: { read: 'website.settings.read', create: 'website.settings.write', update: 'website.settings.write', delete: 'website.settings.write' },
};

function requireModulePermission(context, moduleName, action) {
  const permission = MODULE_PERMISSIONS[moduleName]?.[action];
  if (!permission) {
    throw new AppError(500, 'PERMISSION_CONFIG_ERROR', 'Website module permission is not configured');
  }
  requirePermission(context, permission);
}

function registerModuleRoutes(router, moduleName, basePath, websiteService) {
  router.register('GET', basePath, async (context) => {
    await requireAuth(context);
    requireModulePermission(context, moduleName, 'read');
    const rows = await websiteService.listModule(moduleName);
    return { status: 200, data: rows, meta: { total: rows.length } };
  });

  router.register('GET', `${basePath}/:id`, async (context) => {
    await requireAuth(context);
    requireModulePermission(context, moduleName, 'read');
    const row = await websiteService.getModuleItem(moduleName, context.params.id);
    if (!row) throw new AppError(404, 'NOT_FOUND', 'Website module item not found');
    return { status: 200, data: row };
  });

  router.register('POST', basePath, async (context) => {
    await requireAuth(context);
    requireModulePermission(context, moduleName, 'create');
    const created = await websiteService.createModuleItem(context, moduleName, cleanBody(await context.getBody()));
    return { status: 201, data: created };
  });

  router.register('PATCH', `${basePath}/:id`, async (context) => {
    await requireAuth(context);
    requireModulePermission(context, moduleName, 'update');
    const updated = await websiteService.updateModuleItem(context, moduleName, context.params.id, cleanBody(await context.getBody()));
    return { status: 200, data: updated };
  });

  router.register('PUT', `${basePath}/:id`, async (context) => {
    await requireAuth(context);
    requireModulePermission(context, moduleName, 'update');
    const updated = await websiteService.updateModuleItem(context, moduleName, context.params.id, cleanBody(await context.getBody()));
    return { status: 200, data: updated };
  });

  router.register('DELETE', `${basePath}/:id`, async (context) => {
    await requireAuth(context);
    requireModulePermission(context, moduleName, 'delete');
    const deleted = await websiteService.deleteModuleItem(context, moduleName, context.params.id);
    return { status: 200, data: deleted };
  });
}

export function registerWebsiteRoutes(router, deps) {
  const { websiteService } = deps;

  router.register('GET', '/api/public/website', async () => {
    return { status: 200, data: await websiteService.getPublicPayload() };
  });

  router.register('GET', '/api/public/products', async () => {
    const rows = await websiteService.getPublicProducts();
    return { status: 200, data: rows, meta: { total: rows.length } };
  });

  router.register('GET', '/api/public/categories', async () => {
    const rows = await websiteService.listModule('categories', { publicOnly: true });
    return { status: 200, data: rows, meta: { total: rows.length } };
  });

  router.register('POST', '/api/public/orders', async (context) => {
    const order = await websiteService.createPublicOrder(context, cleanBody(await context.getBody()));
    return { status: 201, data: order };
  });

  router.register('POST', '/api/public/contact-messages', async (context) => {
    const message = await websiteService.createContactMessage(context, cleanBody(await context.getBody()));
    return { status: 201, data: { id: message.id, status: message.status } };
  });

  router.register('POST', '/api/public/newsletter', async (context) => {
    const subscriber = await websiteService.subscribeNewsletter(context, cleanBody(await context.getBody()));
    return { status: 201, data: { id: subscriber.id, status: subscriber.status } };
  });

  router.register('GET', '/api/website/content', async (context) => {
    await requireAuth(context);
    requirePermission(context, 'website.settings.read');
    return { status: 200, data: await websiteService.getContent() };
  });

  router.register('PATCH', '/api/website/content', async (context) => {
    await requireAuth(context);
    requirePermission(context, 'website.settings.write');
    const updated = await websiteService.updateContent(context, cleanBody(await context.getBody()));
    return { status: 200, data: updated };
  });

  router.register('PUT', '/api/website/content', async (context) => {
    await requireAuth(context);
    requirePermission(context, 'website.settings.write');
    const updated = await websiteService.updateContent(context, cleanBody(await context.getBody()));
    return { status: 200, data: updated };
  });

  for (const [moduleName, basePath] of Object.entries(MODULES)) {
    registerModuleRoutes(router, moduleName, basePath, websiteService);
  }
}
