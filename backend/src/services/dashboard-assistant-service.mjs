import { AppError } from '../core/errors.mjs';
import { callAiText, canAttemptAi } from './ai-provider-service.mjs';
import { normalizeStringArray, safeStructuredParse } from './ai-json-utils.mjs';
import { clampConfidenceScore, resolveConfidenceTier } from './confidence-rules.mjs';
import { buildPromptTemplate } from './prompt-registry.mjs';

const MAX_HISTORY_ITEMS = 12;
const MAX_TURN_LENGTH = 280;
const MAX_MESSAGE_LENGTH = 1200;
const DEFAULT_LANGUAGE = 'en';
const DEFAULT_ASSISTANT_MODE = 'assistant';
const DASHBOARD_MODULES = ['orders', 'products', 'customers', 'aiOrders', 'leads', 'conversations', 'settings'];
const SUPPORTED_INTENTS = ['kpi_analysis', 'sales_analysis', 'product_analysis', 'customer_analysis', 'growth_strategy', 'general'];

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(toNumber(value) * factor) / factor;
}

function parseDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function sortByDateDesc(rows, key) {
  return [...rows].sort((a, b) => {
    const left = parseDate(a?.[key]);
    const right = parseDate(b?.[key]);
    return (right?.getTime() || 0) - (left?.getTime() || 0);
  });
}

function countBy(rows, key) {
  const counters = {};
  for (const row of rows) {
    const value = String(row?.[key] || 'unknown').trim() || 'unknown';
    counters[value] = (counters[value] || 0) + 1;
  }
  return counters;
}

function topEntriesByCount(rows, key, limit = 5) {
  const counters = countBy(rows, key);
  return Object.entries(counters)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function detectLanguage(input) {
  const text = String(input || '').trim();
  if (!text) {
    return DEFAULT_LANGUAGE;
  }
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'ar';
  }
  const lowered = text.toLowerCase();
  if (
    /(bonjour|salut|strategie|campagne|ventes|tableau de bord|indicateur|conversion|clients|produit|publicite|aide|merci)/.test(
      lowered
    )
  ) {
    return 'fr';
  }
  return 'en';
}

function normalizeAssistantMode(mode) {
  return String(mode || DEFAULT_ASSISTANT_MODE).trim().toLowerCase() === 'agent'
    ? 'agent'
    : DEFAULT_ASSISTANT_MODE;
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }
  return history
    .map((turn) => ({
      role: turn?.role === 'assistant' ? 'assistant' : 'user',
      content: String(turn?.content || '').trim().slice(0, MAX_TURN_LENGTH),
    }))
    .filter((turn) => turn.content)
    .slice(-MAX_HISTORY_ITEMS);
}

function normalizeIntent(value, fallback = 'general') {
  const normalized = String(value || '').trim().toLowerCase();
  return SUPPORTED_INTENTS.includes(normalized) ? normalized : fallback;
}

function detectAssistantIntent(message = '') {
  const text = String(message || '').toLowerCase();
  if (
    /(kpi|indic|metric|analytics|report|tableau de bord|dashboard|chiffre|performance|funnel|conversion rate|aov|cac|roas)/.test(
      text
    )
  ) {
    return { intent: 'kpi_analysis', confidence: 0.84 };
  }
  if (/(sales|vente|revenue|ca|chiffre d|order status|commande|orders|panier moyen|aov)/.test(text)) {
    return { intent: 'sales_analysis', confidence: 0.82 };
  }
  if (/(product|produit|stock|rupture|inventory|catalog|sku|views|popular)/.test(text)) {
    return { intent: 'product_analysis', confidence: 0.82 };
  }
  if (/(customer|client|retention|loyal|repeat|segment|crm|lifetime|ltv)/.test(text)) {
    return { intent: 'customer_analysis', confidence: 0.8 };
  }
  if (/(growth|croissance|strategie|strategy|scale|expand|plan|roadmap|acquisition)/.test(text)) {
    return { intent: 'growth_strategy', confidence: 0.78 };
  }
  return { intent: 'general', confidence: 0.54 };
}

function detectSpecialist(message = '', intent = 'general') {
  const text = String(message || '').toLowerCase();
  if (/(client|customer|crm|fidel|segment|lead)/.test(text)) return 'crm';
  if (/(stock|rupture|inventaire|produit|sku|reappro|variant)/.test(text)) return 'inventory';
  if (/(marketing|campagne|publicite|ads|acquisition|promotion|newsletter)/.test(text)) return 'marketing';
  if (/(support|plainte|reclamation|probleme|retour|remboursement|aide)/.test(text)) return 'support';
  if (/(kpi|analytics|analyse|dashboard|rapport|performance)/.test(text)) return 'analytics';
  if (intent === 'sales_analysis' || /(vente|commande|order|achat|add|create|save|buy|bought|purchase|prix|chiffre)/.test(text)) return 'sales';
  return intent === 'product_analysis' ? 'inventory' : 'analytics';
}

function detectOperationalRequest(message = '') {
  return /(ajouter|add|create|save|register|buy|bought|purchase|creer|créer|enregistrer|saisir|modifier|supprimer|commande|acheter|achat|order)/i.test(
    String(message || '')
  );
}

function buildOperationalReply({ language, assistantMode }) {
  if (assistantMode !== 'agent') return null;
  const french = language === 'fr';
  return {
    intent: 'general',
    confidence: 0.95,
    reply: french
      ? 'Je peux vous aider à enregistrer cette opération en mode Agent. Pour créer le client et la commande, il me faut le nom complet du client, son téléphone, son adresse et la variante du produit. Envoyez ces informations puis confirmez avec « enregistrer ».'
      : 'I can help register this operation in Agent mode. To create the customer and order, I need the customer full name, phone, address, and product variant. Send those details and confirm with “register”.',
    suggestions: french ? ['Afficher les clients existants', 'Ouvrir une commande manuelle'] : ['Show existing customers', 'Open a manual order'],
    facts: [],
    hypotheses: [],
    priority_actions: french
      ? ['Collecter les informations obligatoires', 'Demander une confirmation explicite avant enregistrement']
      : ['Collect required fields', 'Ask for explicit confirmation before saving'],
  };
}

function parseAgentOrder(message) {
  const text = String(message || '').trim();
  if (!/(enregistrer|sauvegarder|save|register|confirmer|confirm)/i.test(text)) return null;
  const jsonStart = text.indexOf('{');
  if (jsonStart < 0) return null;
  try {
    const payload = JSON.parse(text.slice(jsonStart));
    if (!payload || typeof payload !== 'object') return null;
    return payload;
  } catch (_error) {
    return null;
  }
}

function parseNaturalAgentOrder(text, products = []) {
  const source = String(text || '').trim();
  if (!/(register|enregistrer|sauvegarder|confirm|confirmer)/i.test(source)) return null;
  const phoneMatch = source.match(/(?:phone|tel|telephone|t[ée]l[ée]phone)\s*[:.]?\s*(\+?\d[\d\s-]{6,})/i);
  const addressMatch = source.match(/(?:address|adresse)\s*[:.]?\s*([^,.;]+(?:\s+[^,.;]+){0,4})/i);
  const quantityMatch = source.match(/(?:quantity|quantit[ée]|qty)\s*[:.]?\s*(\d+)|\b(\d+)\s+(?:x|pieces?|pi[èe]ces?|coffee|coffees?)\b/i);
  const product = products.find((row) => {
    const name = String(row?.name || '').trim();
    return name && source.toLowerCase().includes(name.toLowerCase());
  });
  if (!phoneMatch || !addressMatch || !product || !quantityMatch) return null;
  const nameMatch = source.match(/(?:customer|client|for)\s*[:.]?\s*([^,]+?)(?:,?\s+phone|,?\s+tel)/i)
    || source.match(/(?:^|\s)([A-ZÀ-Ý][a-zà-ÿ]+(?:\s+[A-ZÀ-Ý][a-zà-ÿ]+){1,3}),\s*(?:phone|tel|telephone)/);
  const customerName = String(nameMatch?.[1] || '')
    .trim()
    .replace(new RegExp(`^${String(product?.name || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`, 'i'), '')
    .trim()
    .split(/\s+/)
    .slice(-3)
    .join(' ');
  if (!customerName) return null;
  const variant = Array.isArray(product.variants) ? product.variants[0] : null;
  return {
    customer: {
      name: customerName,
      phone: phoneMatch[1].replace(/[\s-]/g, ''),
      address: addressMatch[1].trim(),
    },
    items: [{ productId: product.id, variantId: variant?.id, quantity: Number(quantityMatch[1] || quantityMatch[2]) }],
  };
}

function formatCurrency(value, currency) {
  return `${round(value, 2)} ${String(currency || 'TND')}`;
}

function cleanSuggestions(rawSuggestions) {
  return normalizeStringArray(rawSuggestions, 3);
}

function buildDashboardSnapshot({ orders, products, customers, aiOrders, leads, conversations, settings }) {
  const totalRevenue = round(orders.reduce((sum, row) => sum + toNumber(row?.amount), 0));
  const averageOrderValue = orders.length ? round(totalRevenue / orders.length) : 0;
  const unreadConversations = conversations.reduce((sum, row) => sum + toNumber(row?.unread), 0);
  const lowStockProducts = products.filter((row) => toNumber(row?.stock) > 0 && toNumber(row?.stock) <= 10).length;
  const outOfStockProducts = products.filter((row) => toNumber(row?.stock) <= 0).length;
  const averageAiConfidence = aiOrders.length
    ? round(aiOrders.reduce((sum, row) => sum + toNumber(row?.confidence), 0) / aiOrders.length, 1)
    : 0;

  return {
    sales: {
      ordersCount: orders.length,
      totalRevenue,
      averageOrderValue,
      orderStatusBreakdown: countBy(orders, 'status'),
      recentOrders: sortByDateDesc(orders, 'date')
        .slice(0, 6)
        .map((row) => ({
          id: row.id,
          customer: row.customer,
          amount: toNumber(row.amount),
          status: row.status,
          date: row.date,
        })),
    },
    inventory: {
      productsCount: products.length,
      lowStockProducts,
      outOfStockProducts,
      byCategory: countBy(products, 'category'),
      topViewedProducts: [...products]
        .sort((a, b) => toNumber(b?.views) - toNumber(a?.views))
        .slice(0, 6)
        .map((row) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          stock: toNumber(row.stock),
          views: toNumber(row.views),
        })),
    },
    customers: {
      total: customers.length,
      active: customers.filter((row) => String(row?.status || '').toLowerCase() === 'active').length,
      blocked: customers.filter((row) => String(row?.status || '').toLowerCase() === 'blocked').length,
      topBySpent: [...customers]
        .sort((a, b) => toNumber(b?.totalSpent) - toNumber(a?.totalSpent))
        .slice(0, 5)
        .map((row) => ({
          id: row.id,
          name: row.name,
          totalSpent: toNumber(row.totalSpent),
          orders: toNumber(row.orders),
        })),
    },
    aiOrders: {
      total: aiOrders.length,
      averageConfidence: averageAiConfidence,
      byStatus: countBy(aiOrders, 'status'),
      topProducts: topEntriesByCount(aiOrders, 'product', 5),
    },
    leads: {
      total: leads.length,
      byStatus: countBy(leads, 'status'),
      topCities: topEntriesByCount(leads, 'city', 5),
    },
    conversations: {
      total: conversations.length,
      unread: unreadConversations,
      byChannel: countBy(conversations, 'channel'),
    },
    settings: {
      storeName: settings?.store?.name || 'Store',
      currency: settings?.payments?.currency || 'TND',
      agentLanguage: settings?.agents?.language || 'fr',
      autoReplyEnabled: Boolean(settings?.agents?.autoReplyEnabled),
    },
  };
}

function buildAccessScope(snapshot) {
  return {
    level: 'full-dashboard',
    modules: DASHBOARD_MODULES,
    records: {
      orders: snapshot.sales.ordersCount,
      products: snapshot.inventory.productsCount,
      customers: snapshot.customers.total,
      aiOrders: snapshot.aiOrders.total,
      leads: snapshot.leads.total,
      conversations: snapshot.conversations.total,
    },
  };
}

async function safeList(repo) {
  if (!repo || typeof repo.list !== 'function') {
    return [];
  }
  try {
    const rows = await repo.list();
    return Array.isArray(rows) ? rows : [];
  } catch (_error) {
    return [];
  }
}

async function safeSettings(settingsRepo) {
  if (!settingsRepo || typeof settingsRepo.getAll !== 'function') {
    return null;
  }
  try {
    return await settingsRepo.getAll();
  } catch (_error) {
    return null;
  }
}

async function loadDashboardContext(dataAccess) {
  const [orders, products, customers, aiOrders, leads, conversations, settings] = await Promise.all([
    safeList(dataAccess?.ordersRepo),
    safeList(dataAccess?.productsRepo),
    safeList(dataAccess?.customersRepo),
    safeList(dataAccess?.aiOrdersRepo),
    safeList(dataAccess?.leadsRepo),
    safeList(dataAccess?.conversationsRepo),
    safeSettings(dataAccess?.settingsRepo),
  ]);

  const snapshot = buildDashboardSnapshot({
    orders,
    products,
    customers,
    aiOrders,
    leads,
    conversations,
    settings,
  });

  return {
    snapshot,
    accessScope: buildAccessScope(snapshot),
  };
}

function fallbackCardsByIntent({ intent, language, snapshot }) {
  const currency = snapshot.settings.currency || 'TND';
  const topCity = snapshot.leads.topCities[0]?.name || 'n/a';
  const topProduct = snapshot.inventory.topViewedProducts[0]?.name || 'n/a';
  const topCustomer = snapshot.customers.topBySpent[0]?.name || 'n/a';
  const commonFacts = [
    `Revenue: ${formatCurrency(snapshot.sales.totalRevenue, currency)}.`,
    `Orders: ${snapshot.sales.ordersCount}, AOV: ${formatCurrency(snapshot.sales.averageOrderValue, currency)}.`,
  ];

  if (intent === 'kpi_analysis') {
    return {
      facts: [
        ...commonFacts,
        `AI orders average confidence: ${snapshot.aiOrders.averageConfidence}%.`,
        `Unread conversations: ${snapshot.conversations.unread}.`,
      ],
      hypotheses: [
        'If conversion drops while traffic is stable, checkout friction is likely the blocker.',
        'If unread conversations are high, delayed social response may reduce conversions.',
      ],
      suggestions:
        language === 'fr'
          ? ['Prioriser KPI du jour', 'Verifier tunnel checkout', 'Segmenter sources trafic']
          : ['Prioritize today KPI', 'Check checkout funnel', 'Segment traffic sources'],
    };
  }

  if (intent === 'sales_analysis') {
    const statusRows = Object.entries(snapshot.sales.orderStatusBreakdown)
      .slice(0, 3)
      .map(([status, count]) => `${status}: ${count}`)
      .join(', ');
    return {
      facts: [
        ...commonFacts,
        `Top order statuses: ${statusRows || 'n/a'}.`,
        `AI draft orders: ${snapshot.aiOrders.byStatus.brouillon || 0}.`,
      ],
      hypotheses: [
        'A high draft-order share can indicate missing follow-up on social checkout.',
        'If cancelled orders grow, expectation mismatch on product or delivery may be rising.',
      ],
      suggestions:
        language === 'fr'
          ? ['Analyser statuts commandes', 'Auditer relance commandes brouillon', 'Comparer CA par periode']
          : ['Analyze order statuses', 'Audit draft-order follow-up', 'Compare revenue by period'],
    };
  }

  if (intent === 'product_analysis') {
    return {
      facts: [
        `Products total: ${snapshot.inventory.productsCount}.`,
        `Low stock: ${snapshot.inventory.lowStockProducts}, out of stock: ${snapshot.inventory.outOfStockProducts}.`,
        `Top viewed product: ${topProduct}.`,
      ],
      hypotheses: [
        'Out-of-stock items among top viewed products likely reduce realized revenue.',
        'Low stock at campaign peaks can create avoidable cart abandonment.',
      ],
      suggestions:
        language === 'fr'
          ? ['Lister top produits en rupture', 'Prioriser reapprovisionnement', 'Aligner ads avec stock reel']
          : ['List top out-of-stock products', 'Prioritize replenishment', 'Align ads with real stock'],
    };
  }

  if (intent === 'customer_analysis') {
    return {
      facts: [
        `Customers total: ${snapshot.customers.total}, active: ${snapshot.customers.active}, blocked: ${snapshot.customers.blocked}.`,
        `Top customer by spend: ${topCustomer}.`,
        `Top lead city: ${topCity}.`,
      ],
      hypotheses: [
        'If active customers plateau, retention automation may be underused.',
        'Lead-city concentration can signal opportunity for localized campaign creatives.',
      ],
      suggestions:
        language === 'fr'
          ? ['Segmenter clients fideles', 'Activer flow re-achat', 'Prioriser top ville leads']
          : ['Segment loyal customers', 'Activate repeat-purchase flow', 'Prioritize top lead city'],
    };
  }

  if (intent === 'growth_strategy') {
    return {
      facts: [
        `Revenue base: ${formatCurrency(snapshot.sales.totalRevenue, currency)} across ${snapshot.sales.ordersCount} orders.`,
        `Inventory pressure: ${snapshot.inventory.lowStockProducts + snapshot.inventory.outOfStockProducts} products need stock attention.`,
        `Lead pool: ${snapshot.leads.total} contacts.`,
      ],
      hypotheses: [
        'Growth will be stronger if conversion bottlenecks are fixed before raising acquisition spend.',
        'Retention workflows can improve margin faster than net-new paid traffic alone.',
      ],
      suggestions:
        language === 'fr'
          ? ['Plan croissance 30 jours', 'Plan retention 14 jours', 'Checklist execution hebdo']
          : ['Build 30-day growth plan', 'Build 14-day retention plan', 'Create weekly execution checklist'],
    };
  }

  return {
    facts: [
      ...commonFacts,
      `Inventory pressure: ${snapshot.inventory.lowStockProducts + snapshot.inventory.outOfStockProducts} products.`,
      `Leads: ${snapshot.leads.total}, unread conversations: ${snapshot.conversations.unread}.`,
    ],
    hypotheses: [
      'Cross-team alignment between marketing and inventory can unlock faster growth.',
      'Faster response in conversations can improve conversion from social channels.',
    ],
    suggestions:
      language === 'fr'
        ? ['Resume KPI global', 'Focus conversion', 'Prioriser actions semaine']
        : ['Get KPI summary', 'Focus on conversion', 'Prioritize weekly actions'],
  };
}

function buildFallbackReply({ language, intent, assistantMode, dashboardContext, intentConfidence }) {
  const snapshot = dashboardContext.snapshot;
  const cards = fallbackCardsByIntent({
    intent,
    language,
    snapshot,
  });
  const tier = resolveConfidenceTier(intentConfidence);
  const confidenceText =
    language === 'fr'
      ? `Confiance intention: ${Math.round(clampConfidenceScore(intentConfidence, 0.5) * 100)}% (${tier}).`
      : `Intent confidence: ${Math.round(clampConfidenceScore(intentConfidence, 0.5) * 100)}% (${tier}).`;
  const modeLine =
    assistantMode === 'agent'
      ? language === 'fr'
        ? 'Mode agent actif: actions data-driven prioritaires.'
        : 'Agent mode active: prioritizing data-driven actions.'
      : language === 'fr'
      ? 'Mode assistant actif: guidance concise et strategique.'
      : 'Assistant mode active: concise strategic guidance.';

  const intro =
    language === 'fr'
      ? `Analyse ${intent.replace('_', ' ')}.`
      : `Analysis ${intent.replace('_', ' ')}.`;
  const reply = [intro, cards.facts[0], cards.facts[1], cards.hypotheses[0], modeLine, confidenceText]
    .filter(Boolean)
    .join(' ');

  return {
    intent,
    confidence: clampConfidenceScore(intentConfidence, 0.5),
    reply,
    suggestions: cards.suggestions,
    facts: cards.facts,
    hypotheses: cards.hypotheses,
    priority_actions: cards.suggestions,
  };
}

function normalizeAssistantAiPayload({ parsedPayload, fallbackPayload }) {
  const source = parsedPayload && typeof parsedPayload === 'object' ? parsedPayload : {};
  const reply = String(source.reply || '').trim() || fallbackPayload.reply;
  const intent = normalizeIntent(source.intent, fallbackPayload.intent);
  const confidence = clampConfidenceScore(source.confidence, fallbackPayload.confidence);
  const suggestions = cleanSuggestions(source.suggestions);
  const facts = normalizeStringArray(source.facts, 6);
  const hypotheses = normalizeStringArray(source.hypotheses, 5);
  const priorityActions = normalizeStringArray(source.priority_actions || source.priorityActions, 4);

  return {
    intent,
    confidence,
    reply,
    suggestions: suggestions.length ? suggestions : fallbackPayload.suggestions,
    facts: facts.length ? facts : fallbackPayload.facts,
    hypotheses: hypotheses.length ? hypotheses : fallbackPayload.hypotheses,
    priority_actions: priorityActions.length ? priorityActions : fallbackPayload.priority_actions,
  };
}

async function callAssistantAi({
  env,
  message,
  history,
  user,
  language,
  assistantMode,
  dashboardContext,
  intentDetection,
}) {
  const historyBlock = history
    .map((turn) => `${turn.role === 'assistant' ? 'Assistant' : 'User'}: ${turn.content}`)
    .join('\n');
  const prompts = buildPromptTemplate('dashboard.assistant.reply', {
    assistantMode,
    language,
    userRole: user?.role || 'manager',
    userName: user?.name || 'admin',
    intent: intentDetection.intent,
    intentConfidence: intentDetection.confidence,
    historyBlock,
    dashboardContext,
    message,
  });

  const aiResult = await callAiText({
    env,
    systemPrompt: prompts.systemPrompt,
    userPrompt: prompts.userPrompt,
    temperature: 0.2,
  });

  const parsed = safeStructuredParse({
    text: aiResult.text,
    fallback: null,
  });
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid dashboard assistant JSON output');
  }
  return parsed;
}

export function createDashboardAssistantService({ env, dataAccess = {} }) {
  async function reply({ message, history, user, mode }) {
    const cleanMessage = String(message || '').trim();
    if (!cleanMessage) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Message is required');
    }
    if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Message is too long');
    }

    const normalizedHistory = normalizeHistory(history);
    const language = detectLanguage(cleanMessage);
    const assistantMode = normalizeAssistantMode(mode);
    const dashboardContext = await loadDashboardContext(dataAccess);
    const intentDetection = detectAssistantIntent(cleanMessage);
    const specialist = detectSpecialist(cleanMessage, intentDetection.intent);
    const operationalPayload = buildOperationalReply({
      language,
      assistantMode,
    });
    const conversationText = [...normalizedHistory, { role: 'user', content: cleanMessage }]
      .filter((turn) => turn.role === 'user')
      .map((turn) => turn.content)
      .join(' ');
    const products = await safeList(dataAccess?.productsRepo);
    const agentOrder = parseAgentOrder(cleanMessage) || parseNaturalAgentOrder(conversationText, products);
    const explicitConfirmation = /^(confirme|confirm|register|enregistrer|sauvegarder|save)\b/i.test(cleanMessage.trim());
    const explicitPayload = /^(confirme|confirm|register|enregistrer|sauvegarder|save)\s*\{/i.test(cleanMessage.trim());
    if (assistantMode === 'agent' && agentOrder && (explicitConfirmation || explicitPayload) && typeof dataAccess?.ecommerceService?.createManualOrder === 'function') {
      const order = await dataAccess.ecommerceService.createManualOrder(
        { user },
        agentOrder
      );
      return {
        reply:
          language === 'fr'
            ? `Commande ${order.id} enregistrée avec succès pour ${order.customer}. Total: ${order.total} TND.`
            : `Order ${order.id} was saved successfully for ${order.customer}. Total: ${order.total} TND.`,
        suggestions: language === 'fr' ? ['Afficher les commandes', 'Afficher les clients'] : ['Show orders', 'Show customers'],
        mode: 'action',
        language,
        assistantMode,
        accessScope: dashboardContext.accessScope,
        timestamp: new Date().toISOString(),
        action: { type: 'create_manual_order', id: order.id, status: 'completed' },
        specialist,
        analysis: { intent: 'sales_analysis', confidence: 1, confidence_tier: 'high', facts: [], hypotheses: [], priority_actions: [] },
      };
    }
    const fallbackPayload = buildFallbackReply({
      language,
      intent: intentDetection.intent,
      assistantMode,
      dashboardContext,
      intentConfidence: intentDetection.confidence,
    });

    const confirmationOnly = /^(confirme|confirm|register|enregistrer|sauvegarder|save)\b/i.test(cleanMessage.trim());
    if ((detectOperationalRequest(cleanMessage) || confirmationOnly) && operationalPayload) {
      return {
        reply: confirmationOnly && !agentOrder
          ? (language === 'fr'
            ? `Je ne trouve pas le produit demandé dans le catalogue actuel. Produits disponibles: ${products.slice(0, 8).map((row) => row.name).join(', ') || 'aucun'}. Choisissez un produit exact avant la sauvegarde.`
            : `I cannot find the requested product in the current catalog. Available products: ${products.slice(0, 8).map((row) => row.name).join(', ') || 'none'}. Choose an exact product before saving.`)
          : operationalPayload.reply,
        suggestions: operationalPayload.suggestions,
        mode: 'fallback',
        language,
        assistantMode,
        accessScope: dashboardContext.accessScope,
        timestamp: new Date().toISOString(),
        analysis: {
          intent: operationalPayload.intent,
          confidence: operationalPayload.confidence,
          confidence_tier: resolveConfidenceTier(operationalPayload.confidence),
          facts: operationalPayload.facts,
          hypotheses: operationalPayload.hypotheses,
          priority_actions: operationalPayload.priority_actions,
        },
        specialist,
      };
    }

    if (canAttemptAi(env)) {
      try {
        const aiPayload = await callAssistantAi({
          env,
          message: cleanMessage,
          history: normalizedHistory,
          user,
          language,
          assistantMode,
          dashboardContext,
          intentDetection,
        });
        const normalized = normalizeAssistantAiPayload({
          parsedPayload: aiPayload,
          fallbackPayload,
        });
        return {
          reply: normalized.reply,
          suggestions: normalized.suggestions,
          mode: 'ai',
          language,
          assistantMode,
          accessScope: dashboardContext.accessScope,
          timestamp: new Date().toISOString(),
          analysis: {
            intent: normalized.intent,
            confidence: normalized.confidence,
            confidence_tier: resolveConfidenceTier(normalized.confidence),
            facts: normalized.facts,
            hypotheses: normalized.hypotheses,
            priority_actions: normalized.priority_actions,
          },
        specialist,
        };
      } catch (_error) {
        // Keep dashboard assistant available with local fallback if AI fails.
      }
    }

    return {
      reply: fallbackPayload.reply,
      suggestions: fallbackPayload.suggestions,
      mode: 'fallback',
      language,
      assistantMode,
      accessScope: dashboardContext.accessScope,
      timestamp: new Date().toISOString(),
      analysis: {
        intent: fallbackPayload.intent,
        confidence: fallbackPayload.confidence,
        confidence_tier: resolveConfidenceTier(fallbackPayload.confidence),
        facts: fallbackPayload.facts,
        hypotheses: fallbackPayload.hypotheses,
        priority_actions: fallbackPayload.priority_actions,
      },
      specialist,
    };
  }

  return {
    reply,
  };
}
