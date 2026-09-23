import { AppError } from '../core/errors.mjs';
import { requireAuth } from '../middleware/auth.mjs';

const LEAD_STATUSES = new Set(['nouveau', 'contacte', 'converti']);

function cleanString(value, fallback = '') {
  return String(value ?? fallback).trim();
}

function normalizeLead(input = {}) {
  const status = cleanString(input.status, 'nouveau');
  if (!LEAD_STATUSES.has(status)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'status must be one of: nouveau, contacte, converti');
  }

  return {
    ...input,
    id: cleanString(input.id, `L${Date.now().toString().slice(-6)}`),
    name: cleanString(input.name, 'Nouveau lead'),
    category: cleanString(input.category, 'General'),
    phone: cleanString(input.phone),
    city: cleanString(input.city, 'Tunis'),
    source: cleanString(input.source, 'Manual'),
    status,
    email: cleanString(input.email),
    address: cleanString(input.address),
    notes: cleanString(input.notes),
  };
}

function applyLeadFilters(leads, query) {
  const search = String(query.search || '').trim().toLowerCase();
  const city = String(query.city || 'all');
  const status = String(query.status || '');

  return leads.filter((lead) => {
    const matchesSearch =
      !search ||
      lead.name.toLowerCase().includes(search) ||
      lead.category.toLowerCase().includes(search) ||
      lead.city.toLowerCase().includes(search);

    const matchesCity = city === 'all' || lead.city === city;
    const matchesStatus = !status || lead.status === status;
    return matchesSearch && matchesCity && matchesStatus;
  });
}

export function registerLeadsRoutes(router, deps) {
  const { leadsRepo, scrapeService } = deps;

  router.register('GET', '/api/leads', async (context) => {
    await requireAuth(context);
    const leads = await leadsRepo.list();
    const filtered = applyLeadFilters(leads, context.query);
    return {
      status: 200,
      data: filtered,
      meta: { total: filtered.length },
    };
  });

  router.register('POST', '/api/leads', async (context) => {
    await requireAuth(context);
    const body = await context.getBody();
    const created = await leadsRepo.create(normalizeLead({ ...body, id: body.id || `L${Date.now().toString().slice(-6)}` }));
    return {
      status: 201,
      data: created,
    };
  });

  router.register('GET', '/api/leads/:id', async (context) => {
    await requireAuth(context);
    const lead = await leadsRepo.getById(context.params.id);
    if (!lead) {
      throw new AppError(404, 'NOT_FOUND', 'Lead not found');
    }
    return {
      status: 200,
      data: normalizeLead(lead),
    };
  });

  router.register('PATCH', '/api/leads/:id', async (context) => {
    await requireAuth(context);
    const body = await context.getBody();
    const current = await leadsRepo.getById(context.params.id);
    if (!current) {
      throw new AppError(404, 'NOT_FOUND', 'Lead not found');
    }
    const updated = await leadsRepo.update(context.params.id, normalizeLead({ ...current, ...body, id: context.params.id }));
    return {
      status: 200,
      data: updated,
    };
  });

  router.register('PUT', '/api/leads/:id', async (context) => {
    await requireAuth(context);
    const body = await context.getBody();
    const current = await leadsRepo.getById(context.params.id);
    if (!current) {
      throw new AppError(404, 'NOT_FOUND', 'Lead not found');
    }
    const updated = await leadsRepo.update(context.params.id, normalizeLead({ ...current, ...body, id: context.params.id }));
    return {
      status: 200,
      data: updated,
    };
  });

  router.register('DELETE', '/api/leads/:id', async (context) => {
    await requireAuth(context);
    const deleted = await leadsRepo.remove(context.params.id);
    return {
      status: 200,
      data: deleted,
    };
  });

  router.register('POST', '/api/leads/bulk', async (context) => {
    await requireAuth(context);
    const body = await context.getBody();
    const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
    const action = String(body.action || '');
    if (!ids.length || !action) {
      throw new AppError(400, 'VALIDATION_ERROR', 'ids and action are required');
    }
    if (!['mark_contacted', 'mark_converted', 'add_to_crm'].includes(action)) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Unsupported bulk lead action');
    }

    const leads = await leadsRepo.list();
    let updatedCount = 0;
    const updatedLeads = leads.map((lead) => {
      if (!ids.includes(String(lead.id))) {
        return lead;
      }
      updatedCount += 1;
      if (action === 'mark_contacted') {
        return { ...lead, status: 'contacte' };
      }
      if (action === 'mark_converted') {
        return { ...lead, status: 'converti' };
      }
      if (action === 'add_to_crm') {
        return { ...lead, notes: `${lead.notes || ''} [Ajoute au CRM]`.trim() };
      }
      return lead;
    });
    await leadsRepo.replaceAll(updatedLeads);

    return {
      status: 200,
      data: {
        updatedCount,
      },
    };
  });

  router.register('POST', '/api/leads/scrape-jobs', async (context) => {
    await requireAuth(context);
    const body = await context.getBody();
    const job = await scrapeService.startJob(body);
    return {
      status: 202,
      data: job,
    };
  });

  router.register('GET', '/api/leads/scrape-jobs/:id', async (context) => {
    await requireAuth(context);
    const job = await scrapeService.getJob(context.params.id);
    if (!job) {
      throw new AppError(404, 'NOT_FOUND', 'Scrape job not found');
    }
    return {
      status: 200,
      data: job,
    };
  });
}
