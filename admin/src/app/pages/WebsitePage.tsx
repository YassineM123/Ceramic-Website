import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Edit, ExternalLink, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { UploadDropzone } from '../components/admin/UploadDropzone';
import {
  createWebsiteModuleItemApi,
  deleteWebsiteModuleItemApi,
  fetchWebsiteContentApi,
  fetchWebsiteModuleApi,
  updateWebsiteContentApi,
  updateWebsiteModuleItemApi,
  UploadPurpose,
  UploadRecord,
  WebsiteContent,
  WebsiteModuleName,
  WebsiteModuleRecord,
} from '../services/api';

type FieldKind = 'text' | 'textarea' | 'number' | 'boolean' | 'array' | 'date';

type ModuleField = {
  key: string;
  label: string;
  kind?: FieldKind;
  placeholder?: string;
};

type ModuleConfig = {
  name: WebsiteModuleName;
  label: string;
  description: string;
  fields: ModuleField[];
  columns: string[];
};

const emptyContent: WebsiteContent = {
  homepage: {},
  contact: {},
};

const moduleConfigs: ModuleConfig[] = [
  {
    name: 'categories',
    label: 'Categories',
    description: 'Website navigation and product category filters.',
    columns: ['name', 'slug', 'active', 'sortOrder'],
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'slug', label: 'Slug' },
      { key: 'description', label: 'Description', kind: 'textarea' },
      { key: 'image', label: 'Image URL' },
      { key: 'active', label: 'Active', kind: 'boolean' },
      { key: 'sortOrder', label: 'Sort order', kind: 'number' },
    ],
  },
  {
    name: 'coupons',
    label: 'Coupons',
    description: 'Checkout coupon codes exposed to the storefront payload.',
    columns: ['code', 'type', 'value', 'active'],
    fields: [
      { key: 'code', label: 'Code' },
      { key: 'type', label: 'Type', placeholder: 'percentage or fixed' },
      { key: 'value', label: 'Value', kind: 'number' },
      { key: 'minOrderValue', label: 'Minimum order', kind: 'number' },
      { key: 'startsAt', label: 'Starts at', kind: 'date' },
      { key: 'endsAt', label: 'Ends at', kind: 'date' },
      { key: 'usageLimit', label: 'Usage limit', kind: 'number' },
      { key: 'active', label: 'Active', kind: 'boolean' },
    ],
  },
  {
    name: 'discounts',
    label: 'Discounts',
    description: 'Global or targeted discounts for future storefront pricing rules.',
    columns: ['name', 'type', 'value', 'active'],
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type', placeholder: 'percentage or fixed' },
      { key: 'value', label: 'Value', kind: 'number' },
      { key: 'scope', label: 'Scope', placeholder: 'all_products, category, product' },
      { key: 'targetId', label: 'Target ID' },
      { key: 'startsAt', label: 'Starts at', kind: 'date' },
      { key: 'endsAt', label: 'Ends at', kind: 'date' },
      { key: 'active', label: 'Active', kind: 'boolean' },
    ],
  },
  {
    name: 'shippingZones',
    label: 'Shipping',
    description: 'Shipping fees and delivery estimates used at checkout.',
    columns: ['name', 'fee', 'freeShippingThreshold', 'active'],
    fields: [
      { key: 'name', label: 'Zone name' },
      { key: 'countries', label: 'Countries', kind: 'array', placeholder: 'Tunisia, France' },
      { key: 'cities', label: 'Cities', kind: 'array', placeholder: 'Tunis, Sousse' },
      { key: 'fee', label: 'Fee', kind: 'number' },
      { key: 'freeShippingThreshold', label: 'Free shipping from', kind: 'number' },
      { key: 'estimatedDays', label: 'Estimated days' },
      { key: 'active', label: 'Active', kind: 'boolean' },
    ],
  },
  {
    name: 'taxRates',
    label: 'Taxes',
    description: 'Tax rates used by checkout totals.',
    columns: ['name', 'country', 'rate', 'active'],
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'country', label: 'Country' },
      { key: 'rate', label: 'Rate percent', kind: 'number' },
      { key: 'includedInPrice', label: 'Included in price', kind: 'boolean' },
      { key: 'active', label: 'Active', kind: 'boolean' },
    ],
  },
  {
    name: 'collections',
    label: 'Collections',
    description: 'Homepage collection cards and featured category blocks.',
    columns: ['title', 'slug', 'productId', 'active'],
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'slug', label: 'Slug' },
      { key: 'description', label: 'Description', kind: 'textarea' },
      { key: 'image', label: 'Image URL' },
      { key: 'productId', label: 'Linked product ID' },
      { key: 'itemCountLabel', label: 'Item count label' },
      { key: 'sortOrder', label: 'Sort order', kind: 'number' },
      { key: 'active', label: 'Active', kind: 'boolean' },
    ],
  },
  {
    name: 'reviews',
    label: 'Reviews',
    description: 'Customer testimonials shown on the ecommerce website.',
    columns: ['name', 'rating', 'location', 'active'],
    fields: [
      { key: 'name', label: 'Customer name' },
      { key: 'location', label: 'Location' },
      { key: 'rating', label: 'Rating', kind: 'number' },
      { key: 'text', label: 'Review', kind: 'textarea' },
      { key: 'image', label: 'Avatar URL' },
      { key: 'date', label: 'Date', kind: 'date' },
      { key: 'verified', label: 'Verified', kind: 'boolean' },
      { key: 'active', label: 'Active', kind: 'boolean' },
    ],
  },
  {
    name: 'blogs',
    label: 'Blogs',
    description: 'Blog posts and editorial content for the website.',
    columns: ['title', 'status', 'author', 'publishedAt'],
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'slug', label: 'Slug' },
      { key: 'excerpt', label: 'Excerpt', kind: 'textarea' },
      { key: 'body', label: 'Body', kind: 'textarea' },
      { key: 'image', label: 'Image URL' },
      { key: 'author', label: 'Author' },
      { key: 'status', label: 'Status', placeholder: 'draft or published' },
      { key: 'publishedAt', label: 'Published at', kind: 'date' },
    ],
  },
  {
    name: 'contactMessages',
    label: 'Messages',
    description: 'Messages submitted from the website contact form.',
    columns: ['name', 'email', 'subject', 'status'],
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'subject', label: 'Subject' },
      { key: 'message', label: 'Message', kind: 'textarea' },
      { key: 'status', label: 'Status', placeholder: 'new, read, archived' },
    ],
  },
  {
    name: 'newsletterSubscribers',
    label: 'Newsletter',
    description: 'Newsletter subscribers collected from the website.',
    columns: ['email', 'name', 'source', 'status'],
    fields: [
      { key: 'email', label: 'Email' },
      { key: 'name', label: 'Name' },
      { key: 'source', label: 'Source' },
      { key: 'status', label: 'Status', placeholder: 'subscribed or unsubscribed' },
    ],
  },
];

const controlLinks = [
  { label: 'Products', path: '/admin/products', detail: 'Catalog, prices, visibility and product images.' },
  { label: 'Orders', path: '/admin/orders', detail: 'Website checkout creates orders here.' },
  { label: 'Customers', path: '/admin/customers', detail: 'Customer profiles and order history.' },
  { label: 'Inventory', path: '/admin/stock', detail: 'Stock movements and low-stock alerts.' },
  { label: 'Settings', path: '/admin/settings', detail: 'Store, payment and operational settings.' },
];

const mediaPurposes: Array<{ purpose: UploadPurpose; label: string }> = [
  { purpose: 'hero-image', label: 'Hero images' },
  { purpose: 'gallery-image', label: 'Gallery images' },
  { purpose: 'category-image', label: 'Category images' },
  { purpose: 'logo', label: 'Logos' },
  { purpose: 'icon', label: 'Icons' },
  { purpose: 'document', label: 'Documents' },
];

function fieldValueForInput(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value ?? '');
}

function displayValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value ?? '-');
}

function emptyForm(fields: ModuleField[]) {
  return fields.reduce<Record<string, string | boolean>>((acc, field) => {
    acc[field.key] = field.kind === 'boolean' ? true : '';
    return acc;
  }, {});
}

function payloadFromForm(fields: ModuleField[], form: Record<string, string | boolean>) {
  return fields.reduce<Record<string, unknown>>((acc, field) => {
    const raw = form[field.key];
    if (field.kind === 'boolean') {
      acc[field.key] = Boolean(raw);
      return acc;
    }
    if (field.kind === 'number') {
      acc[field.key] = raw === '' ? 0 : Number(raw);
      return acc;
    }
    if (field.kind === 'array') {
      acc[field.key] = String(raw || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      return acc;
    }
    acc[field.key] = String(raw ?? '').trim();
    return acc;
  }, {});
}

export function WebsitePage() {
  const [content, setContent] = useState<WebsiteContent>(emptyContent);
  const [selectedModule, setSelectedModule] = useState<WebsiteModuleName>('categories');
  const [rows, setRows] = useState<WebsiteModuleRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [mediaUploads, setMediaUploads] = useState<Record<string, UploadRecord>>({});

  const activeConfig = useMemo(
    () => moduleConfigs.find((config) => config.name === selectedModule) || moduleConfigs[0],
    [selectedModule]
  );

  useEffect(() => {
    let active = true;
    const loadContent = async () => {
      try {
        const apiContent = await fetchWebsiteContentApi();
        if (active) {
          setContent(apiContent);
        }
      } catch (_error) {
        if (active) {
          setLoadError('Website content could not be loaded.');
        }
      } finally {
        if (active) {
          setIsLoadingContent(false);
        }
      }
    };
    void loadContent();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setForm(emptyForm(activeConfig.fields));
    setEditingId(null);
    void loadRows(activeConfig.name);
  }, [activeConfig]);

  const loadRows = async (moduleName = selectedModule) => {
    setIsLoadingRows(true);
    try {
      const apiRows = await fetchWebsiteModuleApi(moduleName);
      setRows(apiRows);
      setLoadError('');
    } catch (_error) {
      setLoadError(`Could not load ${activeConfig.label}.`);
    } finally {
      setIsLoadingRows(false);
    }
  };

  const updateHomepage = (key: keyof WebsiteContent['homepage'], value: string) => {
    setContent((current) => ({
      ...current,
      homepage: { ...(current.homepage || {}), [key]: value },
    }));
  };

  const updateContact = (key: keyof WebsiteContent['contact'], value: string) => {
    setContent((current) => ({
      ...current,
      contact: { ...(current.contact || {}), [key]: value },
    }));
  };

  const saveContent = async () => {
    setIsSaving(true);
    try {
      const updated = await updateWebsiteContentApi(content);
      setContent(updated);
      toast.success('Website content saved');
    } finally {
      setIsSaving(false);
    }
  };

  const startNew = () => {
    setEditingId(null);
    setForm(emptyForm(activeConfig.fields));
  };

  const startEdit = (row: WebsiteModuleRecord) => {
    setEditingId(row.id);
    setForm(
      activeConfig.fields.reduce<Record<string, string | boolean>>((acc, field) => {
        const value = row[field.key];
        acc[field.key] = field.kind === 'boolean' ? value !== false : fieldValueForInput(value);
        return acc;
      }, {})
    );
  };

  const saveModuleItem = async () => {
    setIsSaving(true);
    try {
      const payload = payloadFromForm(activeConfig.fields, form);
      if (editingId) {
        await updateWebsiteModuleItemApi(activeConfig.name, editingId, payload);
        toast.success(`${activeConfig.label} updated`);
      } else {
        await createWebsiteModuleItemApi(activeConfig.name, payload);
        toast.success(`${activeConfig.label} item created`);
      }
      startNew();
      await loadRows(activeConfig.name);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteModuleItem = async (id: string) => {
    setIsSaving(true);
    try {
      await deleteWebsiteModuleItemApi(activeConfig.name, id);
      if (editingId === id) startNew();
      await loadRows(activeConfig.name);
      toast.success(`${activeConfig.label} item deleted`);
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (field: ModuleField) => {
    const value = form[field.key];
    if (field.kind === 'boolean') {
      return (
        <div key={field.key} className="flex items-center justify-between rounded-lg border px-3 py-2">
          <Label>{field.label}</Label>
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(checked) => setForm((current) => ({ ...current, [field.key]: checked }))}
          />
        </div>
      );
    }
    if (field.kind === 'textarea') {
      return (
        <div key={field.key} className="space-y-2">
          <Label>{field.label}</Label>
          <Textarea
            rows={4}
            value={String(value || '')}
            placeholder={field.placeholder}
            onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
          />
        </div>
      );
    }
    return (
      <div key={field.key} className="space-y-2">
        <Label>{field.label}</Label>
        <Input
          type={field.kind === 'number' ? 'number' : field.kind === 'date' ? 'date' : 'text'}
          value={String(value || '')}
          placeholder={field.placeholder}
          onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
        />
        {field.key.toLowerCase().includes('image') && (
          <UploadDropzone
            purpose={selectedModule === 'categories' ? 'category-image' : selectedModule === 'collections' ? 'gallery-image' : 'hero-image'}
            value={String(value || '')}
            compact
            label={`Upload ${field.label.toLowerCase()}`}
            onUploaded={(upload) => setForm((current) => ({ ...current, [field.key]: upload.url }))}
            onDeleted={() => setForm((current) => ({ ...current, [field.key]: '' }))}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Website Control Center</h1>
          <p className="text-muted-foreground">
            Manage the ecommerce website from the admin dashboard. Storefront data refreshes automatically.
          </p>
        </div>
        <Button onClick={() => void loadRows()} variant="outline" className="gap-2">
          <RefreshCw size={16} />
          Refresh module
        </Button>
      </div>

      {loadError && (
        <Card className="border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {loadError}
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-5">
        {controlLinks.map((item) => (
          <Link key={item.path} to={item.path}>
            <Card className="h-full p-4 transition-colors hover:bg-accent">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <ExternalLink size={16} className="text-muted-foreground" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="content">Homepage and contact</TabsTrigger>
          <TabsTrigger value="modules">Website modules</TabsTrigger>
          <TabsTrigger value="media">Media library</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card className="p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Homepage, hero banner and contact settings</h2>
                <p className="text-sm text-muted-foreground">
                  These fields drive the live hero, collections copy, newsletter block and contact page.
                </p>
              </div>
              <Button onClick={saveContent} disabled={isSaving || isLoadingContent} className="gap-2">
                <Save size={16} />
                Save content
              </Button>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-semibold">Homepage and hero</h3>
                <Input value={content.homepage?.announcement || ''} onChange={(event) => updateHomepage('announcement', event.target.value)} placeholder="Announcement" />
                <Input value={content.homepage?.heroTitle || ''} onChange={(event) => updateHomepage('heroTitle', event.target.value)} placeholder="Hero title" />
                <Textarea rows={3} value={content.homepage?.heroSubtitle || ''} onChange={(event) => updateHomepage('heroSubtitle', event.target.value)} placeholder="Hero subtitle" />
                <div className="grid gap-3 md:grid-cols-2">
                  <Input value={content.homepage?.heroPrimaryCta || ''} onChange={(event) => updateHomepage('heroPrimaryCta', event.target.value)} placeholder="Primary CTA" />
                  <Input value={content.homepage?.heroSecondaryCta || ''} onChange={(event) => updateHomepage('heroSecondaryCta', event.target.value)} placeholder="Secondary CTA" />
                </div>
                <Input value={content.homepage?.featuredProductId || ''} onChange={(event) => updateHomepage('featuredProductId', event.target.value)} placeholder="Featured product ID" />
                <Input value={content.homepage?.heroImage || ''} onChange={(event) => updateHomepage('heroImage', event.target.value)} placeholder="Hero image URL" />
                <UploadDropzone
                  purpose="hero-image"
                  value={content.homepage?.heroImage || ''}
                  compact
                  label="Upload hero image"
                  onUploaded={(upload) => updateHomepage('heroImage', upload.url)}
                  onDeleted={() => updateHomepage('heroImage', '')}
                />
                <Input value={content.homepage?.heroDetailImage || ''} onChange={(event) => updateHomepage('heroDetailImage', event.target.value)} placeholder="Detail image URL" />
                <UploadDropzone
                  purpose="gallery-image"
                  value={content.homepage?.heroDetailImage || ''}
                  compact
                  label="Upload detail image"
                  onUploaded={(upload) => updateHomepage('heroDetailImage', upload.url)}
                  onDeleted={() => updateHomepage('heroDetailImage', '')}
                />
                <Input value={content.homepage?.heroTextureImage || ''} onChange={(event) => updateHomepage('heroTextureImage', event.target.value)} placeholder="Texture image URL" />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Collections, newsletter and contact</h3>
                <Input value={content.homepage?.collectionEyebrow || ''} onChange={(event) => updateHomepage('collectionEyebrow', event.target.value)} placeholder="Collection eyebrow" />
                <Input value={content.homepage?.collectionTitle || ''} onChange={(event) => updateHomepage('collectionTitle', event.target.value)} placeholder="Collection title" />
                <Textarea rows={3} value={content.homepage?.collectionSubtitle || ''} onChange={(event) => updateHomepage('collectionSubtitle', event.target.value)} placeholder="Collection subtitle" />
                <Input value={content.homepage?.newsletterTitle || ''} onChange={(event) => updateHomepage('newsletterTitle', event.target.value)} placeholder="Newsletter title" />
                <Textarea rows={3} value={content.homepage?.newsletterSubtitle || ''} onChange={(event) => updateHomepage('newsletterSubtitle', event.target.value)} placeholder="Newsletter subtitle" />
                <div className="grid gap-3 md:grid-cols-2">
                  <Input value={content.contact?.phone || ''} onChange={(event) => updateContact('phone', event.target.value)} placeholder="Phone" />
                  <Input value={content.contact?.whatsapp || ''} onChange={(event) => updateContact('whatsapp', event.target.value)} placeholder="WhatsApp" />
                  <Input value={content.contact?.email || ''} onChange={(event) => updateContact('email', event.target.value)} placeholder="Email" />
                  <Input value={content.contact?.hours || ''} onChange={(event) => updateContact('hours', event.target.value)} placeholder="Hours" />
                </div>
                <Input value={content.contact?.address || ''} onChange={(event) => updateContact('address', event.target.value)} placeholder="Address" />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card className="p-5">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Media library</h2>
              <p className="text-sm text-muted-foreground">
                Upload optimized assets for products, categories, heroes, galleries, brand files and documents.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {mediaPurposes.map((item) => {
                const upload = mediaUploads[item.purpose];
                return (
                  <UploadDropzone
                    key={item.purpose}
                    purpose={item.purpose}
                    record={upload || null}
                    value={upload?.url || ''}
                    label={item.label}
                    onUploaded={(nextUpload) => setMediaUploads((current) => ({ ...current, [item.purpose]: nextUpload }))}
                    onDeleted={() => setMediaUploads((current) => {
                      const next = { ...current };
                      delete next[item.purpose];
                      return next;
                    })}
                  />
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <Card className="p-5">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Shared website modules</h2>
                <p className="text-sm text-muted-foreground">
                  Categories, coupons, discounts, shipping, taxes, collections, reviews, blogs, messages and newsletter data.
                </p>
              </div>
              <Button onClick={startNew} variant="outline" className="gap-2">
                <Plus size={16} />
                New item
              </Button>
            </div>

            <Tabs value={selectedModule} onValueChange={(value) => setSelectedModule(value as WebsiteModuleName)}>
              <TabsList className="mb-4 flex h-auto flex-wrap justify-start">
                {moduleConfigs.map((config) => (
                  <TabsTrigger key={config.name} value={config.name}>
                    {config.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {moduleConfigs.map((config) => (
                <TabsContent key={config.name} value={config.name} className="mt-0">
                  <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold">{config.label}</h3>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {config.columns.map((column) => (
                              <TableHead key={column}>{column}</TableHead>
                            ))}
                            <TableHead className="w-24 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingRows ? (
                            <TableRow>
                              <TableCell colSpan={config.columns.length + 1}>Loading...</TableCell>
                            </TableRow>
                          ) : rows.length ? (
                            rows.map((row) => (
                              <TableRow key={row.id}>
                                {config.columns.map((column) => (
                                  <TableCell key={column} className="max-w-56 truncate">
                                    {displayValue(row[column])}
                                  </TableCell>
                                ))}
                                <TableCell>
                                  <div className="flex justify-end gap-1">
                                    <Button size="icon" variant="ghost" onClick={() => startEdit(row)}>
                                      <Edit size={15} />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => void deleteModuleItem(row.id)}>
                                      <Trash2 size={15} />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={config.columns.length + 1}>No records yet.</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="space-y-4 rounded-lg border p-4">
                      <div>
                        <h3 className="font-semibold">{editingId ? 'Edit item' : 'Create item'}</h3>
                        <p className="text-xs text-muted-foreground">
                          Changes are saved to the backend and picked up by the storefront refresh.
                        </p>
                      </div>
                      {config.fields.map(renderField)}
                      <div className="flex gap-2">
                        <Button onClick={() => void saveModuleItem()} disabled={isSaving} className="flex-1 gap-2">
                          <Save size={16} />
                          Save
                        </Button>
                        <Button onClick={startNew} variant="outline">
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
