import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { KPICard } from '../components/admin/KPICard';
import { StatusBadge } from '../components/admin/StatusBadge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  WebsiteModuleRecord,
  createWebsiteModuleItemApi,
  deleteWebsiteModuleItemApi,
  fetchWebsiteModuleApi,
  updateWebsiteModuleItemApi,
} from '../services/api';

type CouponRecord = WebsiteModuleRecord & {
  code: string;
  type: 'percentage' | 'fixed' | string;
  value: number;
  minOrderValue?: number;
  maximumDiscount?: number;
  active?: boolean;
  startsAt?: string;
  endsAt?: string;
  usageLimit?: number;
  usagePerCustomer?: number;
  usedCount?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
};

const defaultCouponForm = {
  code: '',
  type: 'percentage',
  value: '',
  minOrderValue: '',
  maximumDiscount: '',
  startsAt: '',
  endsAt: '',
  usageLimit: '',
  usagePerCustomer: '',
  applicableProducts: '',
  applicableCategories: '',
};

function numberOrZero(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function splitList(value: string) {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function formatDate(value?: string) {
  if (!value) return 'Permanent';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('fr-FR');
}

export function MarketingPage() {
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [couponForm, setCouponForm] = useState(defaultCouponForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  const stats = useMemo(() => {
    const active = coupons.filter((coupon) => coupon.active !== false).length;
    const totalUses = coupons.reduce((sum, coupon) => sum + Number(coupon.usedCount || 0), 0);
    const totalLimit = coupons.reduce((sum, coupon) => sum + Number(coupon.usageLimit || 0), 0);
    return {
      total: coupons.length,
      active,
      paused: coupons.length - active,
      usageRate: totalLimit ? Math.round((totalUses / totalLimit) * 100) : 0,
    };
  }, [coupons]);

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const rows = await fetchWebsiteModuleApi<CouponRecord>('coupons');
      setCoupons(rows);
      setLoadError('');
    } catch (error) {
      setCoupons([]);
      setLoadError(error instanceof Error ? error.message : 'Impossible de charger les coupons.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCoupons();
  }, []);

  const resetDialog = () => {
    setCouponDialogOpen(false);
    setCouponForm(defaultCouponForm);
  };

  const createCoupon = async () => {
    if (!couponForm.code.trim()) {
      toast.error('Le code coupon est obligatoire');
      return;
    }
    if (Number(couponForm.value) <= 0) {
      toast.error('La valeur de reduction est obligatoire');
      return;
    }
    setIsSaving(true);
    try {
      const created = await createWebsiteModuleItemApi<CouponRecord>('coupons', {
        code: couponForm.code.trim().toUpperCase(),
        type: couponForm.type,
        value: numberOrZero(couponForm.value),
        minOrderValue: numberOrZero(couponForm.minOrderValue),
        maximumDiscount: numberOrZero(couponForm.maximumDiscount),
        startsAt: couponForm.startsAt,
        endsAt: couponForm.endsAt,
        usageLimit: numberOrZero(couponForm.usageLimit),
        usagePerCustomer: numberOrZero(couponForm.usagePerCustomer),
        applicableProducts: splitList(couponForm.applicableProducts),
        applicableCategories: splitList(couponForm.applicableCategories),
        active: true,
      } as Partial<CouponRecord>);
      setCoupons((current) => [created, ...current.filter((coupon) => coupon.id !== created.id)]);
      toast.success(`Coupon ${created.code} cree`);
      resetDialog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Creation coupon echouee');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCoupon = async (coupon: CouponRecord) => {
    try {
      const updated = await updateWebsiteModuleItemApi<CouponRecord>('coupons', coupon.id, { active: coupon.active === false });
      setCoupons((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
      toast.success(updated.active === false ? 'Coupon desactive' : 'Coupon active');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Mise a jour impossible');
    }
  };

  const deleteCoupon = async (coupon: CouponRecord) => {
    try {
      await deleteWebsiteModuleItemApi('coupons', coupon.id);
      setCoupons((current) => current.filter((entry) => entry.id !== coupon.id));
      toast.success(`Coupon ${coupon.code} supprime`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Suppression impossible');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1>Marketing</h1>
          <p className="text-muted-foreground">Coupons reels, restrictions et etat de configuration marketing.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => void loadCoupons()}>
            <RefreshCw size={16} />
            Actualiser
          </Button>
          <Button className="gap-2" onClick={() => setCouponDialogOpen(true)}>
            <Plus size={16} />
            Creer coupon
          </Button>
        </div>
      </div>

      {loadError && (
        <Card className="border-warning bg-warning/5 p-4">
          <p className="text-sm">{loadError}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KPICard title="Coupons" value={String(stats.total)} icon={<Plus size={24} />} />
        <KPICard title="Actifs" value={String(stats.active)} trend="up" icon={<Plus size={24} />} />
        <KPICard title="Inactifs" value={String(stats.paused)} icon={<AlertTriangle size={24} />} />
        <KPICard title="Usage limite" value={`${stats.usageRate}%`} icon={<AlertTriangle size={24} />} />
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3>Coupons</h3>
          <Button size="sm" onClick={() => setCouponDialogOpen(true)} className="gap-2">
            <Plus size={16} />
            Nouveau
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement des coupons...</p>
        ) : coupons.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            Aucun coupon configure.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-medium text-muted-foreground">Code</th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-muted-foreground">Reduction</th>
                  <th className="px-3 py-2 text-right text-sm font-medium text-muted-foreground">Min.</th>
                  <th className="px-3 py-2 text-right text-sm font-medium text-muted-foreground">Usage</th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-muted-foreground">Validite</th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-muted-foreground">Statut</th>
                  <th className="px-3 py-2 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b">
                    <td className="px-3 py-3 text-sm font-medium">{coupon.code}</td>
                    <td className="px-3 py-3 text-sm">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value} TND`}
                      {Number(coupon.maximumDiscount || 0) > 0 ? ` max ${coupon.maximumDiscount} TND` : ''}
                    </td>
                    <td className="px-3 py-3 text-right text-sm">{Number(coupon.minOrderValue || 0)} TND</td>
                    <td className="px-3 py-3 text-right text-sm">
                      {Number(coupon.usedCount || 0)}/{Number(coupon.usageLimit || 0) || 'illimite'}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      {formatDate(coupon.startsAt)} - {formatDate(coupon.endsAt)}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={coupon.active === false ? 'Inactif' : 'Actif'} type={coupon.active === false ? 'warning' : 'success'} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => void toggleCoupon(coupon)}>
                          {coupon.active === false ? 'Activer' : 'Desactiver'}
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2 text-destructive" onClick={() => void deleteCoupon(coupon)}>
                          <Trash2 size={14} />
                          Supprimer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="border-warning bg-warning/5 p-4">
        <p className="text-sm font-medium">Attribution publicitaire non configuree</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Les KPI Google/Facebook/Instagram restent indisponibles tant qu'un fournisseur analytique reel n'est pas connecte.
        </p>
      </Card>

      <Dialog open={couponDialogOpen} onOpenChange={(open) => (open ? setCouponDialogOpen(true) : resetDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Creer un coupon</DialogTitle>
            <DialogDescription>Le backend valide le code unique, les dates, les limites et les restrictions.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input value={couponForm.code} onChange={(event) => setCouponForm((current) => ({ ...current, code: event.target.value }))} placeholder="WELCOME10" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={couponForm.type} onValueChange={(type) => setCouponForm((current) => ({ ...current, type }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Pourcentage</SelectItem>
                  <SelectItem value="fixed">Montant fixe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valeur</Label>
              <Input type="number" min="0" value={couponForm.value} onChange={(event) => setCouponForm((current) => ({ ...current, value: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Commande minimum</Label>
              <Input type="number" min="0" value={couponForm.minOrderValue} onChange={(event) => setCouponForm((current) => ({ ...current, minOrderValue: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Remise maximum</Label>
              <Input type="number" min="0" value={couponForm.maximumDiscount} onChange={(event) => setCouponForm((current) => ({ ...current, maximumDiscount: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Limite usage</Label>
              <Input type="number" min="0" value={couponForm.usageLimit} onChange={(event) => setCouponForm((current) => ({ ...current, usageLimit: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Debut</Label>
              <Input type="date" value={couponForm.startsAt} onChange={(event) => setCouponForm((current) => ({ ...current, startsAt: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Fin</Label>
              <Input type="date" value={couponForm.endsAt} onChange={(event) => setCouponForm((current) => ({ ...current, endsAt: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Usage par client</Label>
              <Input type="number" min="0" value={couponForm.usagePerCustomer} onChange={(event) => setCouponForm((current) => ({ ...current, usagePerCustomer: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Produits autorises</Label>
              <Input value={couponForm.applicableProducts} onChange={(event) => setCouponForm((current) => ({ ...current, applicableProducts: event.target.value }))} placeholder="prd_1, prd_2" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Categories autorisees</Label>
              <Input value={couponForm.applicableCategories} onChange={(event) => setCouponForm((current) => ({ ...current, applicableCategories: event.target.value }))} placeholder="Art de la table, Cadeaux" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetDialog} disabled={isSaving}>Annuler</Button>
            <Button onClick={() => void createCoupon()} disabled={isSaving}>{isSaving ? 'Creation...' : 'Creer coupon'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
