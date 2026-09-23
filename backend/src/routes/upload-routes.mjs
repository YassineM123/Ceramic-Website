import { AppError } from '../core/errors.mjs';
import { requirePermission } from '../core/permissions.mjs';
import { assertObject } from '../core/validation.mjs';

function body(value) {
  return assertObject(value || {}, 'Invalid JSON payload');
}

export function registerUploadRoutes(router, deps) {
  const { uploadService } = deps;

  router.register('GET', '/api/uploads', async (context) => {
    requirePermission(context, 'products.read');
    const rows = await uploadService.listUploads({ purpose: context.query.purpose });
    return { status: 200, data: rows, meta: { total: rows.length } };
  });

  router.register('GET', '/api/uploads/:id', async (context) => {
    requirePermission(context, 'products.read');
    const upload = await uploadService.getUpload(context.params.id);
    if (!upload) throw new AppError(404, 'NOT_FOUND', 'Upload not found');
    return { status: 200, data: upload };
  });

  router.register('POST', '/api/uploads', async (context) => {
    requirePermission(context, 'products.write');
    const upload = await uploadService.createUpload(context, body(await context.getBody()));
    return { status: 201, data: upload };
  });

  router.register('PUT', '/api/uploads/:id', async (context) => {
    requirePermission(context, 'products.write');
    const upload = await uploadService.replaceUpload(context, context.params.id, body(await context.getBody()));
    return { status: 200, data: upload };
  });

  router.register('DELETE', '/api/uploads/:id', async (context) => {
    requirePermission(context, 'products.write');
    const upload = await uploadService.deleteUpload(context, context.params.id);
    return { status: 200, data: upload };
  });
}
