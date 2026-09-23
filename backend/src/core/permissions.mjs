import { AppError } from './errors.mjs';
import { normalizeRole } from './roles.mjs';

const ALL_PERMISSIONS = ['*'];

const ROLE_PERMISSIONS = {
  Executive: ALL_PERMISSIONS,
  Operations: [
    'orders.read',
    'orders.write',
    'products.read',
    'products.write',
    'stock.read',
    'stock.write',
    'customers.read',
    'customers.write',
    'delivery.read',
    'delivery.write',
    'invoices.read',
    'invoices.write',
    'analytics.read',
    'integrations.read',
    'integrations.write',
    'categories.read',
    'categories.write',
    'coupons.read',
    'coupons.create',
    'coupons.update',
    'coupons.delete',
    'discounts.read',
    'discounts.write',
    'shipping.read',
    'shipping.write',
    'tax.read',
    'tax.write',
    'blog.read',
    'blog.write',
    'reviews.read',
    'reviews.moderate',
    'website.settings.read',
    'website.settings.write',
  ],
  Marketing: [
    'customers.read',
    'customers.write',
    'social.read',
    'social.write',
    'ads.read',
    'ads.write',
    'analytics.read',
    'marketing.read',
    'marketing.write',
    'integrations.read',
    'categories.read',
    'coupons.read',
    'coupons.create',
    'coupons.update',
    'coupons.delete',
    'discounts.read',
    'discounts.write',
    'blog.read',
    'blog.write',
    'reviews.read',
    'reviews.moderate',
    'website.settings.read',
    'website.settings.write',
  ],
  Support: [
    'orders.read',
    'orders.support_write',
    'customers.read',
    'customers.support_write',
    'social.read',
    'social.write',
    'delivery.read',
    'categories.read',
    'coupons.read',
    'discounts.read',
    'shipping.read',
    'tax.read',
    'blog.read',
    'reviews.read',
    'website.settings.read',
  ],
};

export function hasPermission(role, permission) {
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole) {
    return false;
  }

  const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
  if (permissions.includes('*') || permissions.includes(permission)) {
    return true;
  }

  const [moduleName] = String(permission || '').split('.');
  return permissions.includes(`${moduleName}.*`);
}

export function requirePermission(context, permission) {
  if (!context.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  if (!hasPermission(context.user.role, permission)) {
    throw new AppError(403, 'FORBIDDEN', `Missing permission: ${permission}`);
  }
}

export function listRolePermissions(role) {
  const normalizedRole = normalizeRole(role);
  return normalizedRole ? [...(ROLE_PERMISSIONS[normalizedRole] || [])] : [];
}
