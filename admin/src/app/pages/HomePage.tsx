import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  Package,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useRole } from '../contexts/RoleContext';
import { KPICard } from '../components/admin/KPICard';
import { StatusBadge } from '../components/admin/StatusBadge';
import { RoleSwitcher } from '../components/admin/RoleSwitcher';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  AnalyticsOverview,
  CustomerRecord,
  fetchAnalyticsOverviewApi,
  fetchCustomersApi,
  fetchOrdersApi,
  fetchProductsApi,
  fetchStockAlertsApi,
  fetchWebsiteContentApi,
  fetchWebsiteModuleApi,
  OrderRecord,
  ProductRecord,
  StockAlertRecord,
  WebsiteContent,
  WebsiteModuleRecord,
} from '../services/api';
import { toast } from 'sonner';

const STOREFRONT_URL = (import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:5173').replace(/\/+$/, '');

const fallbackRevenueData = [
  { date: '1 Mar', revenue: 12400 },
  { date: '2 Mar', revenue: 15200 },
  { date: '3 Mar', revenue: 13800 },
  { date: '4 Mar', revenue: 16500 },
  { date: '5 Mar', revenue: 14900 },
  { date: '6 Mar', revenue: 18200 },
  { date: '7 Mar', revenue: 17600 },
];

const fallbackCategoryData = [
  { name: 'Electronique', revenue: 45000 },
  { name: 'Mode', revenue: 32000 },
  { name: 'Maison', revenue: 28000 },
  { name: 'Sports', revenue: 18000 },
];

const fallbackRecentOrders = [
  { id: '#10245', customer: 'Jean Dupont', status: 'paid', amount: 156, date: '3 Mar 2026' },
  { id: '#10244', customer: 'Marie Martin', status: 'shipped', amount: 289, date: '3 Mar 2026' },
  { id: '#10243', customer: 'Pierre Durand', status: 'delivered', amount: 543, date: '2 Mar 2026' },
  { id: '#10242', customer: 'Sophie Bernard', status: 'pending', amount: 98, date: '2 Mar 2026' },
  { id: '#10241', customer: 'Luc Petit', status: 'paid', amount: 234, date: '2 Mar 2026' },
];

type DashboardSnapshot = {
  analytics: AnalyticsOverview | null;
  orders: OrderRecord[];
  products: ProductRecord[];
  customers: CustomerRecord[];
  stockAlerts: StockAlertRecord[];
  websiteContent: WebsiteContent | null;
  categories: WebsiteModuleRecord[];
  collections: WebsiteModuleRecord[];
  reviews: WebsiteModuleRecord[];
  blogs: WebsiteModuleRecord[];
  contactMessages: WebsiteModuleRecord[];
  newsletterSubscribers: WebsiteModuleRecord[];
  shippingZones: WebsiteModuleRecord[];
  taxRates: WebsiteModuleRecord[];
};

type KpiDefinition = {
  title: string;
  value: string;
  change?: number;
  trend?: 'up' | 'down';
  icon: ReactNode;
  subtitle?: string;
};

const emptySnapshot: DashboardSnapshot = {
  analytics: null,
  orders: [],
  products: [],
  customers: [],
  stockAlerts: [],
  websiteContent: null,
  categories: [],
  collections: [],
  reviews: [],
  blogs: [],
  contactMessages: [],
  newsletterSubscribers: [],
  shippingZones: [],
  taxRates: [],
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function orderAmount(order: OrderRecord) {
  if (typeof order.total === 'number') return order.total;
  if (typeof order.amount === 'number') return order.amount;
  return (order.lineItems || []).reduce((total, item) => total + item.unitPrice * item.quantity, 0);
}

function orderCost(order: OrderRecord, productById: Map<string, ProductRecord>) {
  return (order.lineItems || []).reduce((total, item) => {
    const fallbackCost = productById.get(String(item.productId))?.costPrice || 0;
    return total + (item.costPrice || fallbackCost) * item.quantity;
  }, 0);
}

function formatOrderDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function toRecentOrder(order: OrderRecord) {
  return {
    id: order.id,
    customer: order.customer,
    status: order.status,
    amount: orderAmount(order),
    date: formatOrderDate(order.date),
  };
}

function latestOrderTimestamp(orders: OrderRecord[]) {
  return orders.reduce((latest, order) => {
    const time = new Date(order.date).getTime();
    return Number.isFinite(time) ? Math.max(latest, time) : latest;
  }, 0);
}

function valueInWindow(
  orders: OrderRecord[],
  latestTimestamp: number,
  days: number,
  offsetDays: number,
  selector: (order: OrderRecord) => number
) {
  if (!latestTimestamp) return 0;
  const dayMs = 24 * 60 * 60 * 1000;
  const end = latestTimestamp - offsetDays * dayMs;
  const start = end - days * dayMs;
  return orders.reduce((total, order) => {
    const time = new Date(order.date).getTime();
    if (!Number.isFinite(time) || time <= start || time > end) return total;
    return total + selector(order);
  }, 0);
}

function percentChange(current: number, previous: number) {
  if (!previous && !current) return 0;
  if (!previous) return 100;
  return ((current - previous) / previous) * 100;
}

function trendFromChange(change: number): 'up' | 'down' {
  return change >= 0 ? 'up' : 'down';
}

function getActiveRows(rows: WebsiteModuleRecord[]) {
  return rows.filter((row) => row.active !== false && row.status !== 'archived' && row.status !== 'draft');
}

function buildRevenueData(analytics: AnalyticsOverview | null, orders: OrderRecord[]) {
  if (analytics?.revenueByDay?.length) {
    return analytics.revenueByDay.slice(-7).map((row) => ({
      date: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(row.date)),
      revenue: row.revenue,
    }));
  }

  if (!orders.length) return fallbackRevenueData;

  const rowsByDate = new Map<string, number>();
  [...orders]
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
    .slice(-30)
    .forEach((order) => {
      const date = new Date(order.date);
      if (Number.isNaN(date.getTime())) return;
      const key = date.toISOString().slice(0, 10);
      rowsByDate.set(key, (rowsByDate.get(key) || 0) + orderAmount(order));
    });

  const rows = Array.from(rowsByDate.entries()).slice(-7).map(([date, revenue]) => ({
    date: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(date)),
    revenue,
  }));
  return rows.length ? rows : fallbackRevenueData;
}

function buildCategoryData(orders: OrderRecord[], products: ProductRecord[]) {
  const productById = new Map(products.map((product) => [String(product.id), product]));
  const revenueByCategory = new Map<string, number>();

  orders.forEach((order) => {
    (order.lineItems || []).forEach((item) => {
      const product = productById.get(String(item.productId));
      const category = product?.category || 'Autre';
      revenueByCategory.set(category, (revenueByCategory.get(category) || 0) + item.unitPrice * item.quantity);
    });
  });

  const rows = Array.from(revenueByCategory.entries())
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((left, right) => right.revenue - left.revenue)
    .slice(0, 5);

  return rows.length ? rows : fallbackCategoryData;
}

function calculateMetrics(snapshot: DashboardSnapshot) {
  const productById = new Map(snapshot.products.map((product) => [String(product.id), product]));
  const totalRevenue = snapshot.analytics?.kpis.revenue ?? snapshot.orders.reduce((total, order) => total + orderAmount(order), 0);
  const totalOrders = snapshot.analytics?.kpis.orders ?? snapshot.orders.length;
  const totalCustomers = snapshot.analytics?.kpis.customers ?? snapshot.customers.length;
  const currentTimestamp = latestOrderTimestamp(snapshot.orders);
  const currentRevenue = valueInWindow(snapshot.orders, currentTimestamp, 7, 0, orderAmount);
  const previousRevenue = valueInWindow(snapshot.orders, currentTimestamp, 7, 7, orderAmount);
  const currentOrders = valueInWindow(snapshot.orders, currentTimestamp, 7, 0, () => 1);
  const previousOrders = valueInWindow(snapshot.orders, currentTimestamp, 7, 7, () => 1);
  const totalCost = snapshot.orders.reduce((total, order) => total + orderCost(order, productById), 0);
  const estimatedMargin = totalRevenue > 0 && totalCost > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;
  const visibleProducts = snapshot.products.filter((product) => product.active !== false && product.status !== 'hidden');
  const newMessages = snapshot.contactMessages.filter((message) => String(message.status || 'new').toLowerCase() === 'new').length;

  return {
    totalRevenue,
    totalOrders,
    totalCustomers,
    averageOrderValue: snapshot.analytics?.kpis.averageOrderValue ?? (totalOrders ? totalRevenue / totalOrders : 0),
    conversionRate: snapshot.analytics?.kpis.conversionRate ?? null,
    estimatedMargin,
    revenueChange: percentChange(currentRevenue, previousRevenue),
    ordersChange: percentChange(currentOrders, previousOrders),
    visibleProducts: visibleProducts.length,
    stockAlerts: snapshot.stockAlerts.length,
    newMessages,
    newsletterSubscribers: snapshot.newsletterSubscribers.length,
  };
}

function buildKpis(role: string, snapshot: DashboardSnapshot): KpiDefinition[] {
  const metrics = calculateMetrics(snapshot);

  if (role === 'Operations') {
    const pendingOrders = snapshot.orders.filter((order) => ['new', 'pending', 'preparing'].includes(String(order.status).toLowerCase())).length;
    const deliveryIssues = snapshot.orders.filter((order) => ['failed', 'returned'].includes(String(order.deliveryStatus || order.delivery).toLowerCase())).length;
    return [
      { title: 'Commandes en attente', value: formatInteger(pendingOrders), icon: <Clock size={24} /> },
      { title: 'Alertes stock', value: formatInteger(metrics.stockAlerts), icon: <AlertTriangle size={24} /> },
      { title: 'Incidents livraison', value: formatInteger(deliveryIssues), icon: <Package size={24} /> },
      { title: 'Produits visibles', value: formatInteger(metrics.visibleProducts), icon: <Store size={24} /> },
    ];
  }

  if (role === 'Marketing') {
    return [
      { title: 'Revenus site', value: formatCurrency(metrics.totalRevenue), change: Math.abs(metrics.revenueChange), trend: trendFromChange(metrics.revenueChange), icon: <DollarSign size={24} /> },
      { title: 'Abonnes newsletter', value: formatInteger(metrics.newsletterSubscribers), icon: <Users size={24} /> },
      { title: 'Messages entrants', value: formatInteger(metrics.newMessages), icon: <AlertTriangle size={24} /> },
      { title: 'Conversion', value: metrics.conversionRate == null ? 'N/A' : formatPercent(metrics.conversionRate), icon: <TrendingUp size={24} /> },
    ];
  }

  if (role === 'Support') {
    const unpaidOrders = snapshot.orders.filter((order) => String(order.paymentStatus || order.payment).toLowerCase().includes('unpaid')).length;
    return [
      { title: 'Messages site', value: formatInteger(metrics.newMessages), icon: <AlertTriangle size={24} /> },
      { title: 'Clients', value: formatInteger(metrics.totalCustomers), icon: <Users size={24} /> },
      { title: 'Commandes non payees', value: formatInteger(unpaidOrders), icon: <DollarSign size={24} /> },
      { title: 'Commandes totales', value: formatInteger(metrics.totalOrders), icon: <ShoppingCart size={24} /> },
    ];
  }

  return [
    {
      title: "Chiffre d'affaires",
      value: formatCurrency(metrics.totalRevenue),
      change: Math.abs(metrics.revenueChange),
      trend: trendFromChange(metrics.revenueChange),
      icon: <DollarSign size={24} />,
      subtitle: 'Backend + commandes website',
    },
    {
      title: 'Commandes',
      value: formatInteger(metrics.totalOrders),
      change: Math.abs(metrics.ordersChange),
      trend: trendFromChange(metrics.ordersChange),
      icon: <ShoppingCart size={24} />,
      subtitle: 'Toutes sources',
    },
    {
      title: 'Marge estimee',
      value: metrics.estimatedMargin ? formatPercent(metrics.estimatedMargin) : 'N/A',
      icon: <TrendingUp size={24} />,
      subtitle: 'Selon couts produits',
    },
    {
      title: 'Clients actifs',
      value: formatInteger(metrics.totalCustomers),
      icon: <Users size={24} />,
      subtitle: `${formatInteger(metrics.visibleProducts)} produits visibles`,
    },
  ];
}

export function HomePage() {
  const navigate = useNavigate();
  const { role } = useRole();
  const [loading, setLoading] = useState(true);
  const [loadErrors, setLoadErrors] = useState<string[]>([]);
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(emptySnapshot);

  useEffect(() => {
    let active = true;

    const loadOverview = async () => {
      setLoading(true);
      const errors: string[] = [];
      const [
        analytics,
        orders,
        products,
        customers,
        stockAlerts,
        websiteContent,
        categories,
        collections,
        reviews,
        blogs,
        contactMessages,
        newsletterSubscribers,
        shippingZones,
        taxRates,
      ] = await Promise.allSettled([
        fetchAnalyticsOverviewApi(),
        fetchOrdersApi(),
        fetchProductsApi(),
        fetchCustomersApi(),
        fetchStockAlertsApi(),
        fetchWebsiteContentApi(),
        fetchWebsiteModuleApi('categories'),
        fetchWebsiteModuleApi('collections'),
        fetchWebsiteModuleApi('reviews'),
        fetchWebsiteModuleApi('blogs'),
        fetchWebsiteModuleApi('contactMessages'),
        fetchWebsiteModuleApi('newsletterSubscribers'),
        fetchWebsiteModuleApi('shippingZones'),
        fetchWebsiteModuleApi('taxRates'),
      ]);

      const value = <T,>(result: PromiseSettledResult<T>, fallback: T, label: string) => {
        if (result.status === 'fulfilled') return result.value;
        errors.push(label);
        return fallback;
      };

      if (!active) return;
      setSnapshot({
        analytics: value(analytics, null, 'analytics'),
        orders: value(orders, [], 'orders'),
        products: value(products, [], 'products'),
        customers: value(customers, [], 'customers'),
        stockAlerts: value(stockAlerts, [], 'stock alerts'),
        websiteContent: value(websiteContent, null, 'website content'),
        categories: value(categories, [], 'categories'),
        collections: value(collections, [], 'collections'),
        reviews: value(reviews, [], 'reviews'),
        blogs: value(blogs, [], 'blogs'),
        contactMessages: value(contactMessages, [], 'contact messages'),
        newsletterSubscribers: value(newsletterSubscribers, [], 'newsletter'),
        shippingZones: value(shippingZones, [], 'shipping zones'),
        taxRates: value(taxRates, [], 'tax rates'),
      });
      setLoadErrors(errors);
      setLoading(false);
    };

    void loadOverview();
    return () => {
      active = false;
    };
  }, []);

  const kpis = useMemo(() => buildKpis(role, snapshot), [role, snapshot]);
  const metrics = useMemo(() => calculateMetrics(snapshot), [snapshot]);
  const revenueData = useMemo(() => buildRevenueData(snapshot.analytics, snapshot.orders), [snapshot.analytics, snapshot.orders]);
  const categoryData = useMemo(() => buildCategoryData(snapshot.orders, snapshot.products), [snapshot.orders, snapshot.products]);
  const recentOrders = useMemo(() => {
    const rows = [...snapshot.orders]
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
      .slice(0, 5)
      .map(toRecentOrder);
    return rows.length ? rows : fallbackRecentOrders;
  }, [snapshot.orders]);

  const activeCategories = getActiveRows(snapshot.categories);
  const activeCollections = getActiveRows(snapshot.collections);
  const activeReviews = getActiveRows(snapshot.reviews);
  const publicReadiness = [
    Boolean(snapshot.websiteContent?.homepage?.heroTitle),
    Boolean(snapshot.websiteContent?.homepage?.heroImage),
    activeCategories.length > 0,
    activeCollections.length > 0,
    snapshot.products.some((product) => product.active !== false && product.status !== 'hidden'),
    snapshot.shippingZones.length > 0,
    snapshot.taxRates.length > 0,
  ];
  const readinessScore = Math.round((publicReadiness.filter(Boolean).length / publicReadiness.length) * 100);

  const roleAlerts = [
    {
      severity: metrics.stockAlerts ? 'warning' : 'success',
      title: metrics.stockAlerts ? 'Stock faible detecte' : 'Stock sous controle',
      message: metrics.stockAlerts
        ? `${metrics.stockAlerts} alerte(s) de stock peuvent impacter le site public.`
        : 'Aucune alerte stock active pour les produits visibles.',
      link: '/admin/stock',
    },
    {
      severity: metrics.newMessages ? 'info' : 'success',
      title: metrics.newMessages ? 'Messages du site a traiter' : 'Aucun message site en attente',
      message: metrics.newMessages
        ? `${metrics.newMessages} message(s) client proviennent du formulaire de contact.`
        : 'La boite de reception du site est a jour.',
      link: '/admin/website',
    },
  ];

  const actions = [
    {
      priority: readinessScore < 80 ? 'high' : 'low',
      action: readinessScore < 80 ? 'Completer le contenu public du site' : 'Verifier le rendu du site public',
      dueDate: "Aujourd'hui",
      path: '/admin/website',
    },
    {
      priority: metrics.stockAlerts ? 'high' : 'medium',
      action: metrics.stockAlerts ? 'Reapprovisionner les produits en alerte' : 'Revoir les commandes recentes',
      dueDate: metrics.stockAlerts ? "Aujourd'hui" : 'Cette semaine',
      path: metrics.stockAlerts ? '/admin/stock' : '/admin/orders',
    },
  ];

  const openStorefront = () => {
    window.open(STOREFRONT_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1>Accueil - {role}</h1>
          <p className="text-muted-foreground">Vue d'ensemble connectee au site web et au backend.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={openStorefront}>
            <ExternalLink size={16} />
            Ouvrir le site
          </Button>
          <Link to="/admin/website">
            <Button className="gap-2">
              <Store size={16} />
              Gerer le site
            </Button>
          </Link>
          <div className="xl:hidden">
            <RoleSwitcher />
          </div>
        </div>
      </div>

      {loadErrors.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Donnees partielles: impossible de charger {loadErrors.join(', ')}.
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} loading={loading} />
        ))}
      </div>

      {role === 'Executive' && (
        <Card className="p-6">
          <h3 className="mb-4">Resume executif du jour</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <p className="mb-2 text-sm text-muted-foreground">7 derniers jours vs periode precedente</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">Revenus</span>
                  <span className={`flex items-center gap-1 text-sm font-medium ${metrics.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.revenueChange >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    {formatPercent(Math.abs(metrics.revenueChange))}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">Commandes</span>
                  <span className={`flex items-center gap-1 text-sm font-medium ${metrics.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.ordersChange >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    {formatPercent(Math.abs(metrics.ordersChange))}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Moyenne commerciale</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">Panier moyen</span>
                  <span className="text-sm font-medium">{formatCurrency(metrics.averageOrderValue)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">Produits visibles</span>
                  <span className="text-sm font-medium">{formatInteger(metrics.visibleProducts)}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Site public</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">Readiness</span>
                  <span className={`text-sm font-medium ${readinessScore >= 80 ? 'text-green-600' : 'text-amber-600'}`}>{readinessScore}%</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">Modules actifs</span>
                  <span className="text-sm font-medium">{activeCategories.length + activeCollections.length + activeReviews.length}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="mb-1">Connexion site web</h3>
            <p className="text-sm text-muted-foreground">Etat du contenu consomme par le storefront public.</p>
          </div>
          <StatusBadge
            status={readinessScore >= 80 ? 'Connecte' : 'A completer'}
            type={readinessScore >= 80 ? 'success' : 'warning'}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Hero public</p>
            <p className="mt-1 text-base font-semibold">{snapshot.websiteContent?.homepage?.heroTitle || 'Titre non configure'}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Catalogue visible</p>
            <p className="mt-1 text-2xl font-bold">{formatInteger(metrics.visibleProducts)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Categories / collections</p>
            <p className="mt-1 text-2xl font-bold">{activeCategories.length} / {activeCollections.length}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Avis / newsletter</p>
            <p className="mt-1 text-2xl font-bold">{activeReviews.length} / {snapshot.newsletterSubscribers.length}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6 transition-shadow hover:shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="mb-1">Revenu quotidien</h3>
              <p className="text-sm text-muted-foreground">Donnees backend des 7 derniers points</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground">Connecte</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenueData}>
              <CartesianGrid key="grid-revenue" strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis key="xaxis-revenue" dataKey="date" className="text-xs" stroke="hsl(var(--muted-foreground))" />
              <YAxis key="yaxis-revenue" className="text-xs" stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                key="tooltip-revenue"
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
              <Line
                key="line-revenue"
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 transition-shadow hover:shadow-md">
          <div className="mb-6">
            <h3 className="mb-1">Contribution par categorie</h3>
            <p className="text-sm text-muted-foreground">Calculee depuis les lignes de commande et le catalogue</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryData}>
              <CartesianGrid key="grid-category" strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis key="xaxis-category" dataKey="name" className="text-xs" stroke="hsl(var(--muted-foreground))" />
              <YAxis key="yaxis-category" className="text-xs" stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                key="tooltip-category"
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar key="bar-category" dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
              <AlertTriangle className="text-amber-600 dark:text-amber-400" size={20} />
            </div>
            <div>
              <h3 className="mb-0">Insights & alertes</h3>
              <p className="text-sm text-muted-foreground">{roleAlerts.length} notifications connectees</p>
            </div>
          </div>
          <div className="space-y-3">
            {roleAlerts.map((alert) => (
              <div key={alert.title} className="group rounded-xl border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <StatusBadge
                    status={alert.severity === 'warning' ? 'Attention' : alert.severity === 'success' ? 'OK' : 'Info'}
                    type={alert.severity}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-sm font-semibold">{alert.title}</p>
                    <p className="mb-2 text-sm text-muted-foreground">{alert.message}</p>
                    <Link to={alert.link} className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
                      Voir details <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
              <CheckCircle2 className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <h3 className="mb-0">File d'actions</h3>
              <p className="text-sm text-muted-foreground">{actions.length} taches basees sur le site</p>
            </div>
          </div>
          <div className="space-y-3">
            {actions.map((action) => (
              <div key={action.action} className="group rounded-xl border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <StatusBadge
                        status={action.priority === 'high' ? 'Haute' : action.priority === 'medium' ? 'Moyenne' : 'Basse'}
                        type={action.priority === 'high' ? 'danger' : action.priority === 'medium' ? 'warning' : 'info'}
                      />
                      <span className="text-xs font-medium text-muted-foreground">{action.dueDate}</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{action.action}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                    onClick={() => {
                      toast.success(`Action ouverte: ${action.action}`);
                      navigate(action.path);
                    }}
                  >
                    Traiter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h3 className="mb-1">Commandes recentes</h3>
            <p className="text-sm text-muted-foreground">Dernieres transactions, dont les commandes du site web</p>
          </div>
          <Link to="/admin/orders">
            <Button variant="ghost" size="sm" className="gap-2 transition-all hover:gap-3">
              Voir tout <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Client</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Statut</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Montant</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Date</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="group border-b transition-colors last:border-0 hover:bg-accent/30">
                  <td className="px-6 py-4 text-sm font-semibold font-mono">{order.id}</td>
                  <td className="px-4 py-4 text-sm font-medium">{order.customer}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={order.status} type={order.status} />
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-semibold">{formatCurrency(order.amount)}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{order.date}</td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => navigate(`/admin/orders/${encodeURIComponent(String(order.id))}`)}
                    >
                      Voir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
