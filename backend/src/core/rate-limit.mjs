import { AppError } from './errors.mjs';

const buckets = new Map();

function nowMs() {
  return Date.now();
}

function clientKey(request) {
  const forwarded = String(request.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim();
  return forwarded || request.socket?.remoteAddress || 'unknown';
}

function routeLimit(method, pathPattern) {
  const key = `${String(method || 'GET').toUpperCase()} ${pathPattern}`;
  if (key === 'POST /api/auth/login') return { name: 'auth', limit: 8, windowMs: 15 * 60 * 1000 };
  if (key === 'POST /api/auth/refresh') return { name: 'refresh', limit: 30, windowMs: 15 * 60 * 1000 };
  if (key === 'POST /api/public/orders') return { name: 'public-order', limit: 12, windowMs: 10 * 60 * 1000 };
  if (key === 'POST /api/public/contact-messages') return { name: 'public-form', limit: 10, windowMs: 10 * 60 * 1000 };
  if (key === 'POST /api/public/newsletter') return { name: 'newsletter', limit: 8, windowMs: 10 * 60 * 1000 };
  if (key === 'POST /api/uploads' || key.startsWith('PUT /api/uploads/')) return { name: 'upload', limit: 30, windowMs: 60 * 60 * 1000 };
  return null;
}

export function assertRateLimit(context, method, pathPattern) {
  const limit = routeLimit(method, pathPattern);
  if (!limit) return;

  const key = `${limit.name}:${clientKey(context.request)}`;
  const current = buckets.get(key);
  const timestamp = nowMs();
  if (!current || current.resetAt <= timestamp) {
    buckets.set(key, { count: 1, resetAt: timestamp + limit.windowMs });
    return;
  }

  current.count += 1;
  if (current.count > limit.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - timestamp) / 1000));
    context.response.setHeader('Retry-After', String(retryAfterSeconds));
    throw new AppError(429, 'RATE_LIMITED', 'Too many requests. Please try again later.');
  }
}
