import { useEffect, useState } from 'react';
import { Plus, Wand2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import {
  MarketingCampaignRecord,
  MarketingTemplateRecord,
  createMarketingCampaignApi,
  fetchMarketingCampaignsApi,
  fetchMarketingTemplatesApi,
  generateMarketingCopyApi,
} from '../services/api';
import { toast } from 'sonner';

const statusVariant: Record<string, 'default' | 'outline' | 'secondary'> = {
  Draft: 'outline',
  Scheduled: 'secondary',
  Sent: 'default',
};

const defaultForm = {
  name: '',
  channel: 'Email',
  segment: 'Tous les clients',
  subject: '',
  body: '',
  status: 'Draft' as MarketingCampaignRecord['status'],
  scheduledAt: '',
};

export function EmailSmsMarketingPage() {
  const [campaigns, setCampaigns] = useState<MarketingCampaignRecord[]>([]);
  const [templates, setTemplates] = useState<MarketingTemplateRecord[]>([]);
  const [copy, setCopy] = useState('');
  const [error, setError] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [campaignRows, templateRows] = await Promise.all([fetchMarketingCampaignsApi(), fetchMarketingTemplatesApi()]);
        setCampaigns(campaignRows);
        setTemplates(templateRows);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur marketing');
      }
    };
    void load();
  }, []);

  const generateCopy = async () => {
    setIsGenerating(true);
    try {
      const result = await generateMarketingCopyApi({ product: 'new collection', audience: 'VIP customers' });
      const generatedCopy = `${result.subject}\n${result.body}`;
      setCopy(generatedCopy);
      setForm((prev) => ({ ...prev, subject: result.subject, body: result.body }));
      toast.success('Copy email genere');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation echouee');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!form.name.trim()) {
      toast.error('Le nom de la campagne est obligatoire');
      return;
    }
    if (!form.subject.trim()) {
      toast.error('Le sujet est obligatoire');
      return;
    }
    setIsSaving(true);
    try {
      const created = await createMarketingCampaignApi({
        name: form.name.trim(),
        channel: form.channel,
        segment: form.segment,
        subject: form.subject.trim(),
        body: form.body.trim(),
        status: form.status,
        scheduledAt: form.scheduledAt || undefined,
      });
      setCampaigns((prev) => [created, ...prev]);
      setCreateDialogOpen(false);
      setForm(defaultForm);
      setCopy('');
      toast.success(`Campagne "${created.name}" creee`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Creation echouee');
    } finally {
      setIsSaving(false);
    }
  };

  const abandonedCartsCount = campaigns.filter((c) => c.segment?.toLowerCase().includes('abandon')).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1>Email / SMS marketing</h1>
          <p className="text-muted-foreground">Campagnes, segments, templates, paniers abandonnes et copy IA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => void generateCopy()} disabled={isGenerating}>
            <Wand2 size={16} />
            {isGenerating ? 'Generation...' : 'Generer copy IA'}
          </Button>
          <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
            <Plus size={16} />
            Nouvelle campagne
          </Button>
        </div>
      </div>

      {error && <Card className="border-warning bg-warning/5 p-4 text-sm">{error}</Card>}
      {copy && (
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Copy genere par IA</p>
          <p className="whitespace-pre-wrap text-sm">{copy}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Campagnes totales</p>
          <p className="text-2xl font-semibold">{campaigns.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Templates disponibles</p>
          <p className="text-2xl font-semibold">{templates.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Campagnes paniers abandonnes</p>
          <p className="text-2xl font-semibold">{abandonedCartsCount}</p>
        </Card>
      </div>

      <Card>
        <div className="px-6 pt-5 pb-2">
          <h3>Campagnes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Campagne</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Canal</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Segment</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Planification</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Aucune campagne. Cliquez sur "Nouvelle campagne" pour commencer.
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b hover:bg-accent/50">
                    <td className="px-4 py-3 text-sm font-medium">
                      {campaign.name}
                      <p className="text-xs text-muted-foreground">{campaign.subject}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{campaign.channel}</td>
                    <td className="px-4 py-3 text-sm">{campaign.segment}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[campaign.status] || 'outline'}>{campaign.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {campaign.scheduledAt || campaign.sentAt || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4">Templates</h3>
        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun template disponible.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {templates.map((template) => (
              <div key={template.id} className="rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">{template.subject || template.channel}</p>
                  </div>
                  {template.placeholder && <Badge variant="outline">Placeholder</Badge>}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      subject: template.subject || '',
                      body: template.body || '',
                      channel: template.channel || prev.channel,
                    }));
                    setCreateDialogOpen(true);
                  }}
                >
                  Utiliser ce template
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle campagne</DialogTitle>
            <DialogDescription>Creez une campagne Email ou SMS pour vos clients.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="camp-name">Nom de la campagne</Label>
              <Input
                id="camp-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Newsletter juin 2026"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Canal</Label>
                <Select value={form.channel} onValueChange={(v) => setForm((prev) => ({ ...prev, channel: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Segment</Label>
                <Select value={form.segment} onValueChange={(v) => setForm((prev) => ({ ...prev, segment: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tous les clients">Tous les clients</SelectItem>
                    <SelectItem value="VIP">VIP (LTV &gt; 1000)</SelectItem>
                    <SelectItem value="Nouveaux">Nouveaux clients (30j)</SelectItem>
                    <SelectItem value="Inactifs">Inactifs (90j+)</SelectItem>
                    <SelectItem value="Paniers abandonnes">Paniers abandonnes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="camp-subject">Sujet / Titre</Label>
              <Input
                id="camp-subject"
                value={form.subject}
                onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Ex: Offre exclusive pour vous !"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="camp-body">Contenu</Label>
              <Textarea
                id="camp-body"
                value={form.body}
                onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                placeholder="Corps du message..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((prev) => ({ ...prev, status: v as MarketingCampaignRecord['status'] }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Brouillon</SelectItem>
                    <SelectItem value="Scheduled">Planifiee</SelectItem>
                    <SelectItem value="Sent">Envoyee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="camp-scheduled">Date planification</Label>
                <Input
                  id="camp-scheduled"
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateDialogOpen(false); setForm(defaultForm); }}>Annuler</Button>
            <Button onClick={() => void handleCreateCampaign()} disabled={isSaving}>
              {isSaving ? 'Creation...' : 'Creer campagne'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
