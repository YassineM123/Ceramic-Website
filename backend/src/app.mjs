import { createReadStream } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseJsonBody } from './core/body.mjs';
import { isAppError } from './core/errors.mjs';
import { JsonStore } from './core/json-store.mjs';
import { SqliteJsonStore } from './core/sqlite-json-store.mjs';
import { assertRateLimit } from './core/rate-limit.mjs';
import { createRouter } from './core/router.mjs';
import { sendError, sendSuccess, setCorsHeaders } from './core/response.mjs';
import { requireAuth } from './middleware/auth.mjs';
import { createInvoiceRepository } from './repositories/invoice-repo.mjs';
import { createArrayRepository, createObjectRepository } from './repositories/resource-repo.mjs';
import { createSettingsRepository } from './repositories/settings-repo.mjs';
import { createUsersRepository } from './repositories/users-repo.mjs';
import { registerAgentsRoutes } from './routes/agents-routes.mjs';
import { registerAuthRoutes } from './routes/auth-routes.mjs';
import { registerCopilotRoutes } from './routes/copilot-routes.mjs';
import { registerEcommerceRoutes } from './routes/ecommerce-routes.mjs';
import { registerEntityRoutes } from './routes/entity-routes.mjs';
import { registerHealthRoutes } from './routes/health-routes.mjs';
import { registerLeadsRoutes } from './routes/leads-routes.mjs';
import { registerNotificationsRoutes } from './routes/notifications-routes.mjs';
import { registerSearchRoutes } from './routes/search-routes.mjs';
import { registerSettingsRoutes } from './routes/settings-routes.mjs';
import { registerUploadRoutes } from './routes/upload-routes.mjs';
import { registerWebsiteRoutes } from './routes/website-routes.mjs';
import { createCopilotService } from './services/copilot-service.mjs';
import { createConversationAnalyzerService } from './services/conversation-analyzer-service.mjs';
import { createDashboardAssistantService } from './services/dashboard-assistant-service.mjs';
import { createAuditLogService } from './services/audit-log-service.mjs';
import { createAccountingService } from './services/accounting-service.mjs';
import { createDeliveryNoteService } from './services/delivery-note-service.mjs';
import { createEcommerceService } from './services/ecommerce-service.mjs';
import { createInvoiceService } from './services/invoice-service.mjs';
import { createIntegrationSettingsService } from './services/integration-settings-service.mjs';
import { createLeadNotificationIntelligenceService } from './services/lead-notification-intelligence-service.mjs';
import { createLearningMemoryService } from './services/learning-memory-service.mjs';
import { createNotificationService } from './services/notification-service.mjs';
import { createPdfGenerationService } from './services/pdf-generation-service.mjs';
import { createScrapeService } from './services/scrape-service.mjs';
import { createSocialAgentService } from './services/social-agent-service.mjs';
import { createUploadService } from './services/upload-service.mjs';
import { createWebsiteService } from './services/website-service.mjs';

const PUBLIC_API_ROUTES = new Set([
  'GET /api/health',
  'POST /api/auth/login',
  'POST /api/auth/refresh',
  'GET /api/public/website',
  'GET /api/public/products',
  'GET /api/public/categories',
  'POST /api/public/orders',
  'POST /api/public/contact-messages',
  'POST /api/public/newsletter',
]);

function toQueryObject(searchParams) {
  const out = {};
  for (const [key, value] of searchParams.entries()) {
    out[key] = value;
  }
  return out;
}

function isPublicApiRoute(method, pathPattern) {
  return PUBLIC_API_ROUTES.has(`${String(method || 'GET').toUpperCase()} ${pathPattern}`);
}

function contentTypeForFile(path) {
  const extension = extname(path).toLowerCase();
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  if (extension === '.gif') return 'image/gif';
  if (extension === '.pdf') return 'application/pdf';
  if (extension === '.csv') return 'text/csv; charset=utf-8';
  if (extension === '.txt') return 'text/plain; charset=utf-8';
  if (extension === '.doc') return 'application/msword';
  if (extension === '.docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (extension === '.xls') return 'application/vnd.ms-excel';
  if (extension === '.xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  return 'application/octet-stream';
}

function setSecurityHeaders(response) {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
}

function bodyLimitForRoute(method, pathPattern) {
  const routeKey = `${String(method || 'GET').toUpperCase()} ${pathPattern}`;
  if (routeKey === 'POST /api/uploads' || routeKey.startsWith('PUT /api/uploads/')) {
    return 22 * 1024 * 1024;
  }
  return 1024 * 1024;
}

async function fileExists(path) {
  try {
    await stat(path);
    return true;
  } catch (_error) {
    return false;
  }
}

async function seedDataDirIfNeeded(sourceDir, targetDir) {
  if (sourceDir === targetDir) {
    return;
  }

  await mkdir(targetDir, { recursive: true });
  const entries = await readdir(sourceDir, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map(async (entry) => {
        const targetPath = join(targetDir, entry.name);
        if (!(await fileExists(targetPath))) {
          await copyFile(join(sourceDir, entry.name), targetPath);
        }
      })
  );
}

export async function createApp(env) {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const seedDataDir = join(currentDir, 'data');
  const dataDir = env.dataDir || seedDataDir;
  const uploadRootDir = env.uploadRootDir || join(dirname(dataDir), 'uploads');
  await seedDataDirIfNeeded(seedDataDir, dataDir);
  await mkdir(uploadRootDir, { recursive: true });
  const storageDriver = env.storageDriver || 'json';
  if (process.env.NODE_ENV === 'production' && storageDriver !== 'sqlite') {
    throw new Error('Production runtime must use STORAGE_DRIVER=sqlite');
  }
  let store;
  try {
    store =
      storageDriver === 'sqlite'
        ? new SqliteJsonStore(dataDir, { dbPath: env.sqliteRuntimePath || join(dataDir, 'runtime.sqlite3') })
        : new JsonStore(dataDir, {
            backupRetentionDays: env.backupRetentionDays,
            backupMaxPerResource: env.backupMaxPerResource,
          });
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Database initialization failed. Application startup aborted. ${error instanceof Error ? error.message : ''}`);
    }
    throw error;
  }
  if (store.pruneBackupsIfDue) {
    await store.pruneBackupsIfDue(true);
  }

  const usersRepo = createUsersRepository(store, env);
  await usersRepo.ensureHashes();

  const deps = {
    env,
    store,
    usersRepo,
    ordersRepo: createArrayRepository(store, 'orders'),
    productsRepo: createArrayRepository(store, 'products'),
    categoriesRepo: createArrayRepository(store, 'categories'),
    customersRepo: createArrayRepository(store, 'customers'),
    aiOrdersRepo: createArrayRepository(store, 'ai-orders'),
    leadsRepo: createArrayRepository(store, 'leads'),
    jobsRepo: createArrayRepository(store, 'scrape-jobs'),
    conversationsRepo: createArrayRepository(store, 'conversations'),
    conversationAnalysesRepo: createArrayRepository(store, 'conversation-analyses'),
    deliveriesRepo: createArrayRepository(store, 'deliveries'),
    stockMovementsRepo: createArrayRepository(store, 'stock-movements'),
    invoicesRepo: createInvoiceRepository(store),
    deliveryNotesRepo: createArrayRepository(store, 'delivery-notes'),
    expensesRepo: createArrayRepository(store, 'expenses'),
    marketingCampaignsRepo: createArrayRepository(store, 'marketing-campaigns'),
    marketingTemplatesRepo: createArrayRepository(store, 'marketing-templates'),
    adCampaignsRepo: createArrayRepository(store, 'ad-campaigns'),
    salesChannelsRepo: createArrayRepository(store, 'sales-channels'),
    syncJobsRepo: createArrayRepository(store, 'sync-jobs'),
    auditLogsRepo: createArrayRepository(store, 'audit-logs'),
    learnedKnowledgeRepo: createArrayRepository(store, 'learned-knowledge'),
    replyTemplatesRepo: createArrayRepository(store, 'reply-templates'),
    notificationsRepo: createArrayRepository(store, 'notifications'),
    learningRepo: createArrayRepository(store, 'agent-learning'),
    refreshTokensRepo: createArrayRepository(store, 'refresh-tokens'),
    couponsRepo: createArrayRepository(store, 'coupons'),
    discountsRepo: createArrayRepository(store, 'discounts'),
    shippingZonesRepo: createArrayRepository(store, 'shipping-zones'),
    taxRatesRepo: createArrayRepository(store, 'tax-rates'),
    collectionsRepo: createArrayRepository(store, 'collections'),
    reviewsRepo: createArrayRepository(store, 'reviews'),
    blogsRepo: createArrayRepository(store, 'blogs'),
    contactMessagesRepo: createArrayRepository(store, 'contact-messages'),
    newsletterSubscribersRepo: createArrayRepository(store, 'newsletter-subscribers'),
    websiteContentRepo: createObjectRepository(store, 'website-content', {}),
    settingsRepo: createSettingsRepository(store),
    uploadsRepo: createArrayRepository(store, 'uploads'),
    uploadRootDir,
  };

  deps.auditLogService = createAuditLogService({
    auditLogsRepo: deps.auditLogsRepo,
  });
  deps.notificationService = createNotificationService({
    notificationsRepo: deps.notificationsRepo,
  });
  deps.pdfGenerationService = createPdfGenerationService();

  deps.scrapeService = createScrapeService({
    jobsRepo: deps.jobsRepo,
    leadsRepo: deps.leadsRepo,
  });
  deps.copilotService = createCopilotService({ env });
  deps.dashboardAssistantService = createDashboardAssistantService({
    env,
    dataAccess: {
      ordersRepo: deps.ordersRepo,
      productsRepo: deps.productsRepo,
      customersRepo: deps.customersRepo,
      aiOrdersRepo: deps.aiOrdersRepo,
      leadsRepo: deps.leadsRepo,
      conversationsRepo: deps.conversationsRepo,
      settingsRepo: deps.settingsRepo,
    },
  });
  deps.conversationAnalyzerService = createConversationAnalyzerService({
    env,
  });
  deps.learningMemoryService = createLearningMemoryService({
    env,
    dataAccess: {
      conversationAnalysesRepo: deps.conversationAnalysesRepo,
      learnedKnowledgeRepo: deps.learnedKnowledgeRepo,
      replyTemplatesRepo: deps.replyTemplatesRepo,
    },
  });
  deps.socialAgentService = createSocialAgentService({
    env,
    dataAccess: {
      productsRepo: deps.productsRepo,
      settingsRepo: deps.settingsRepo,
      conversationsRepo: deps.conversationsRepo,
      learningRepo: deps.learningRepo,
      learnedKnowledgeRepo: deps.learnedKnowledgeRepo,
      replyTemplatesRepo: deps.replyTemplatesRepo,
    },
  });
  deps.leadNotificationIntelligenceService = createLeadNotificationIntelligenceService({
    leadsRepo: deps.leadsRepo,
    notificationsRepo: deps.notificationsRepo,
  });
  deps.ecommerceService = createEcommerceService(deps);
  deps.invoiceService = createInvoiceService(deps);
  deps.deliveryNoteService = createDeliveryNoteService(deps);
  deps.accountingService = createAccountingService(deps);
  deps.integrationSettingsService = createIntegrationSettingsService(deps);
  deps.uploadService = createUploadService(deps);
  deps.websiteService = createWebsiteService(deps);

  const router = createRouter();
  registerHealthRoutes(router);
  registerAuthRoutes(router, deps);
  registerEcommerceRoutes(router, deps);
  registerEntityRoutes(router, deps);
  registerLeadsRoutes(router, deps);
  registerAgentsRoutes(router, deps);
  registerCopilotRoutes(router, deps);
  registerSettingsRoutes(router, deps);
  registerSearchRoutes(router, deps);
  registerNotificationsRoutes(router, deps);
  registerUploadRoutes(router, deps);
  registerWebsiteRoutes(router, deps);

  const handle = async (request, response) => {
    setSecurityHeaders(response);
    const requestOrigin = request.headers.origin;

    if ((request.method || 'GET').toUpperCase() === 'OPTIONS') {
      setCorsHeaders(response, env.corsOrigins, requestOrigin);
      response.statusCode = 204;
      response.end();
      return;
    }

    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

    if (url.pathname.startsWith('/uploads/')) {
      const staticPath = deps.uploadService.normalizeStaticPath(url.pathname);
      if (!staticPath || !(await fileExists(staticPath))) {
        sendError(response, 404, 'NOT_FOUND', 'File not found', env.corsOrigins, requestOrigin);
        return;
      }
      setCorsHeaders(response, env.corsOrigins, requestOrigin);
      response.statusCode = 200;
      response.setHeader('Content-Type', contentTypeForFile(staticPath));
      response.setHeader('Content-Disposition', contentTypeForFile(staticPath).startsWith('image/') ? 'inline' : 'attachment');
      response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      createReadStream(staticPath).pipe(response);
      return;
    }

    const matched = router.match(request.method || 'GET', url.pathname);

    if (!matched) {
      sendError(response, 404, 'NOT_FOUND', 'Route not found', env.corsOrigins, requestOrigin);
      return;
    }

    let parsedBody = null;
    const context = {
      request,
      response,
      env,
      params: matched.params,
      query: toQueryObject(url.searchParams),
      user: null,
      getBody: async () => {
        if (parsedBody === null) {
          parsedBody = await parseJsonBody(request, {
            maxBytes: bodyLimitForRoute(matched.method, matched.pathPattern),
          });
        }
        return parsedBody;
      },
    };

    try {
      assertRateLimit(context, matched.method, matched.pathPattern);
      const isApiCall = url.pathname.startsWith('/api/');
      if (isApiCall && !isPublicApiRoute(matched.method, matched.pathPattern)) {
        await requireAuth(context);
      }

      const result = await matched.handler(context);
      sendSuccess(
        response,
        result?.status || 200,
        result?.data ?? null,
        result?.meta,
        env.corsOrigins,
        requestOrigin
      );
    } catch (error) {
      if (isAppError(error)) {
        sendError(response, error.status, error.code, error.message, env.corsOrigins, requestOrigin);
        return;
      }
      sendError(
        response,
        500,
        'INTERNAL_ERROR',
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : error instanceof Error
            ? error.message
            : 'Internal server error',
        env.corsOrigins,
        requestOrigin
      );
    }
  };

  return {
    handle,
    deps,
  };
}
