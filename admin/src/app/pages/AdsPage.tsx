import { useEffect, useMemo, useState } from 'react';
import { Lightbulb, Plus } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AdCampaignRecord, fetchAdCampaignsApi, createAdCampaignApi, generateAdCopyApi } from '../services/api';
import { toast } from 'sonner';

const defaultCampaignForm = {
  name: '',
  platform: 'Meta' as string,
  objective: 'Conversions',
  budget: '',
};

export function AdsPage() {
  const [campaigns, setCampaigns] = useState<AdCampaignRecord[]>([]);
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState(defaultCampaignForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setCampaigns(await fetchAdCampaignsApi());
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur campagnes ads');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const totals = useMemo(() => {
    const spend = campaigns.reduce((sum, campaign) => sum + campaign.budget, 0);
    const revenue = campaigns.reduce((sum, campaign) => sum + campaign.revenue, 0);
    return {
      spend,
      revenue,
      roas: spend ? Math.round((revenue / spend) * 100) / 100 : 0,
      clicks: campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0),
    };
  }, [campaigns]);

  const generateIdea = async () => {
    const copy = await generateAdCopyApi({ product: 'best sellers', audience: 'repeat buyers' });
    setIdea(`${copy.headline}: ${copy.primaryText} Ideas: ${copy.ideas.join(', ')}`);
    toast.success('Idee de campagne generee');
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.name.trim()) {
      toast.error('Le nom de la campagne est obligatoire');
      return;
    }
    const budget = Number(campaignForm.budget);
    if (!Number.isFinite(budget) || budget <= 0) {
      toast.error('Le budget doit etre un nombre positif');
      return;
    }
    setIsSaving(true);
    try {
      const created = await createAdCampaignApi({
        name: campaignForm.name.trim(),
        platform: campaignForm.platform,
        objective: campaignForm.objective,
        budget,
        status: 'active',
        impressions: 0,
        clicks: 0,
        leads: 0,
        orders: 0,
        revenue: 0,
        roas: 0,
      });
      setCampaigns((prev) => [created, ...prev]);
      setCreateDialogOpen(false);
      setCampaignForm(defaultCampaignForm);
      toast.success(`Campagne "${created.name}" creee`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Creation echouee');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1>Publicite</h1>
          <p className="text-muted-foreground">Meta Ads, Google Ads, resultats et generateur IA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => void generateIdea()}>
            <Lightbulb size={16} />
            Idee IA
          </Button>
          <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
            <Plus size={16} />
            Nouvelle campagne
          </Button>
        </div>
      </div>

      {error && <Card className="border-warning bg-warning/5 p-4 text-sm">{error}</Card>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="p-4"><p className="text-sm text-muted-foreground">Budget</p><p className="text-2xl font-semibold">{totals.spend} TND</p></Card>
        <Card className="p-4"><p className="text-sm text-muted-foreground">Revenu</p><p className="text-2xl font-semibold">{totals.revenue} TND</p></Card>
        <Card className="p-4"><p className="text-sm text-muted-foreground">ROAS</p><p className="text-2xl font-semibold">{totals.roas}x</p></Card>
        <Card className="p-4"><p className="text-sm text-muted-foreground">Clics</p><p className="text-2xl font-semibold">{totals.clicks}</p></Card>
      </div>

      {idea && <Card className="p-4 text-sm">{idea}</Card>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Campagne</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Plateforme</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Objectif</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Budget</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Resultats</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-4 text-sm text-muted-foreground" colSpan={6}>Chargement...</td></tr>
              ) : campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b hover:bg-accent/50">
                  <td className="px-4 py-3 text-sm font-medium">{campaign.name}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{campaign.platform}</Badge></td>
                  <td className="px-4 py-3 text-sm">{campaign.objective}</td>
                  <td className="px-4 py-3 text-right text-sm">{campaign.budget} TND</td>
                  <td className="px-4 py-3 text-right text-sm">{campaign.impressions} imp. / {campaign.clicks} clics / {campaign.orders} orders</td>
                  <td className="px-4 py-3 text-right text-sm font-medium">{campaign.roas}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle campagne</DialogTitle>
            <DialogDescription>Creez une nouvelle campagne publicitaire.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="camp-name">Nom de la campagne</Label>
              <Input
                id="camp-name"
                value={campaignForm.name}
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Promo ete 2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Plateforme</Label>
              <Select value={campaignForm.platform} onValueChange={(v) => setCampaignForm((prev) => ({ ...prev, platform: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Meta">Meta (Facebook/Instagram)</SelectItem>
                  <SelectItem value="Google">Google Ads</SelectItem>
                  <SelectItem value="TikTok">TikTok Ads</SelectItem>
                  <SelectItem value="Manual">Manuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Objectif</Label>
              <Select value={campaignForm.objective} onValueChange={(v) => setCampaignForm((prev) => ({ ...prev, objective: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Conversions">Conversions</SelectItem>
                  <SelectItem value="Notoriete">Notoriete</SelectItem>
                  <SelectItem value="Trafic">Trafic</SelectItem>
                  <SelectItem value="Leads">Generation de leads</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="camp-budget">Budget journalier (TND)</Label>
              <Input
                id="camp-budget"
                type="number"
                min="1"
                value={campaignForm.budget}
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, budget: e.target.value }))}
                placeholder="100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
            <Button onClick={() => void handleCreateCampaign()} disabled={isSaving}>
              {isSaving ? 'Creation...' : 'Creer campagne'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
