import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { basename, extname, normalize, resolve } from 'node:path';
import { AppError } from '../core/errors.mjs';

const PURPOSES = new Set(['product-image', 'category-image', 'hero-image', 'gallery-image', 'logo', 'icon', 'document']);

const IMAGE_TYPES = new Map([
  ['image/jpeg', '.jpg'],
  ['image/jpg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
]);

const DOCUMENT_TYPES = new Map([
  ['application/pdf', '.pdf'],
  ['text/plain', '.txt'],
  ['text/csv', '.csv'],
  ['application/msword', '.doc'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx'],
  ['application/vnd.ms-excel', '.xls'],
  ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.xlsx'],
]);

function now() {
  return new Date().toISOString();
}

function cleanFileName(value) {
  const fallback = 'upload';
  return basename(String(value || fallback))
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || fallback;
}

function assertPurpose(value) {
  const purpose = String(value || '').trim();
  if (!PURPOSES.has(purpose)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'purpose must be one of product-image, category-image, hero-image, gallery-image, logo, icon, document');
  }
  return purpose;
}

function allowedTypesForPurpose(purpose) {
  return purpose === 'document' ? DOCUMENT_TYPES : IMAGE_TYPES;
}

function decodeBase64Upload(payload) {
  const raw = String(payload.dataBase64 || payload.base64 || payload.dataUrl || '').trim();
  if (!raw) {
    throw new AppError(400, 'VALIDATION_ERROR', 'dataBase64 is required');
  }

  const dataUrlMatch = raw.match(/^data:([^;,]+);base64,(.+)$/);
  if (dataUrlMatch) {
    return {
      contentType: String(payload.contentType || dataUrlMatch[1]).toLowerCase(),
      buffer: Buffer.from(dataUrlMatch[2], 'base64'),
    };
  }

  return {
    contentType: String(payload.contentType || '').toLowerCase(),
    buffer: Buffer.from(raw, 'base64'),
  };
}

function hasMagic(buffer, bytes) {
  if (buffer.length < bytes.length) return false;
  return bytes.every((byte, index) => buffer[index] === byte);
}

function looksLikeText(buffer) {
  return buffer.every((byte) => byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126) || byte >= 128);
}

function assertContentMatchesType(contentType, buffer) {
  const type = String(contentType || '').toLowerCase();
  const valid =
    (type === 'image/jpeg' || type === 'image/jpg') && hasMagic(buffer, [0xff, 0xd8, 0xff]) ||
    type === 'image/png' && hasMagic(buffer, [0x89, 0x50, 0x4e, 0x47]) ||
    type === 'image/gif' && (hasMagic(buffer, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) || hasMagic(buffer, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])) ||
    type === 'image/webp' && hasMagic(buffer, [0x52, 0x49, 0x46, 0x46]) && buffer.slice(8, 12).toString('ascii') === 'WEBP' ||
    type === 'application/pdf' && hasMagic(buffer, [0x25, 0x50, 0x44, 0x46]) ||
    (type === 'text/plain' || type === 'text/csv') && looksLikeText(buffer) ||
    DOCUMENT_TYPES.has(type) && !['application/pdf', 'text/plain', 'text/csv'].includes(type);

  if (!valid) {
    throw new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', 'File content does not match the declared content type');
  }
}

function safeUploadPath(rootDir, purpose, fileName) {
  const target = resolve(rootDir, purpose, fileName);
  const allowedRoot = resolve(rootDir);
  if (!target.startsWith(allowedRoot)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid upload path');
  }
  return target;
}

export function createUploadService(deps) {
  const { uploadsRepo, uploadRootDir, auditLogService } = deps;

  async function listUploads(filters = {}) {
    let rows = await uploadsRepo.list();
    if (filters.purpose) rows = rows.filter((row) => row.purpose === filters.purpose);
    return rows.sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
  }

  async function getUpload(id) {
    return uploadsRepo.getById(id);
  }

  async function writeUploadFile(context, payload, existingRecord = null) {
    const purpose = assertPurpose(payload.purpose || existingRecord?.purpose);
    const allowedTypes = allowedTypesForPurpose(purpose);
    const { contentType, buffer } = decodeBase64Upload(payload);
    if (!allowedTypes.has(contentType)) {
      throw new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', `Unsupported content type: ${contentType || 'unknown'}`);
    }
    assertContentMatchesType(contentType, buffer);

    const maxBytes = purpose === 'document' ? 15 * 1024 * 1024 : 8 * 1024 * 1024;
    if (!buffer.length || buffer.length > maxBytes) {
      throw new AppError(413, 'PAYLOAD_TOO_LARGE', `Upload must be between 1 byte and ${Math.round(maxBytes / 1024 / 1024)}MB`);
    }

    const originalName = String(payload.fileName || payload.name || existingRecord?.originalName || 'upload');
    const requestedExt = extname(originalName).toLowerCase();
    const safeExt = allowedTypes.has(contentType) ? allowedTypes.get(contentType) : requestedExt;
    const fileName = `${new Date().toISOString().slice(0, 10)}-${randomUUID()}-${cleanFileName(originalName)}${safeExt}`;
    const targetDir = resolve(uploadRootDir, purpose);
    await mkdir(targetDir, { recursive: true });
    const filePath = safeUploadPath(uploadRootDir, purpose, fileName);
    await writeFile(filePath, buffer);

    if (existingRecord?.fileName) {
      await unlink(safeUploadPath(uploadRootDir, existingRecord.purpose, existingRecord.fileName)).catch(() => {});
    }

    const record = {
      ...(existingRecord || {}),
      id: existingRecord?.id || `upl_${randomUUID().slice(0, 12)}`,
      purpose,
      originalName,
      fileName,
      contentType,
      size: buffer.length,
      url: `/uploads/${purpose}/${encodeURIComponent(fileName)}`,
      createdAt: existingRecord?.createdAt || now(),
      updatedAt: now(),
      createdBy: existingRecord?.createdBy || context?.user?.id || 'system',
    };
    return record;
  }

  async function createUpload(context, payload) {
    const record = await writeUploadFile(context, payload);
    const created = await uploadsRepo.create(record);
    await auditLogService.record(context, 'uploads.create', 'upload', created.id, {
      purpose: created.purpose,
      originalName: created.originalName,
      size: created.size,
    });
    return created;
  }

  async function replaceUpload(context, id, payload) {
    const current = await uploadsRepo.getById(id);
    if (!current) throw new AppError(404, 'NOT_FOUND', 'Upload not found');
    const next = await writeUploadFile(context, payload, current);
    const updated = await uploadsRepo.update(id, next);
    await auditLogService.record(context, 'uploads.replace', 'upload', id, {
      purpose: updated.purpose,
      originalName: updated.originalName,
      size: updated.size,
    });
    return updated;
  }

  async function deleteUpload(context, id) {
    const current = await uploadsRepo.getById(id);
    if (!current) throw new AppError(404, 'NOT_FOUND', 'Upload not found');
    await unlink(safeUploadPath(uploadRootDir, current.purpose, current.fileName)).catch(() => {});
    const removed = await uploadsRepo.remove(id);
    await auditLogService.record(context, 'uploads.delete', 'upload', id, {
      purpose: current.purpose,
      originalName: current.originalName,
    });
    return removed;
  }

  return {
    listUploads,
    getUpload,
    createUpload,
    replaceUpload,
    deleteUpload,
    normalizeStaticPath(pathname) {
      const prefix = '/uploads/';
      if (!pathname.startsWith(prefix)) return null;
      const decoded = decodeURIComponent(pathname.slice(prefix.length));
      const safeRelative = normalize(decoded).replace(/^(\.\.[/\\])+/, '');
      const target = resolve(uploadRootDir, safeRelative);
      if (!target.startsWith(resolve(uploadRootDir))) return null;
      return target;
    },
  };
}
