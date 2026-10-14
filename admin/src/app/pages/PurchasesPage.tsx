import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Package, Plus, RefreshCw, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  createPurchaseOrderApi, createSupplierApi, fetchProductsApi, fetchPurchaseOrdersApi,
  fetchReorderSuggestionsApi, fetchSuppliersApi, ProductRecord, PurchaseOrderRecord,
  ReorderSuggestion, receivePurchaseOrderApi, SupplierRecord,
} from '../services/api';

const money = (value: number) => `${Number(value || 0).toFixed(2)} TND`;

export function PurchasesPage() {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [orders, setOrders] = useState<PurchaseOrderRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [suggestions, setSuggestions] = useState<ReorderSuggestion[]>([]);
  const [name, setName] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [productId, setProductId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitCost, setUnitCost] = useState('0');
  const [loading, setLoading] = useState(true);
  const [addingSupplier, setAddingSupplier] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [receivingId, setReceivingId] = useState('');
  const [error, setError] = useState('');

  const selectedProduct = useMemo(() => products.find((product) => product.id === productId), [products, productId]);
  const orderSubtotal = Math.max(0, Number(quantity) || 0) * Math.max(0, Number(unitCost) || 0);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [nextSuppliers, nextOrders, nextProducts, nextSuggestions] = await Promise.all([
        fetchSuppliersApi(), fetchPurchaseOrdersApi(), fetchProductsApi(), fetchReorderSuggestionsApi(),
      ]);
      setSuppliers(nextSuppliers); setOrders(nextOrders); setProducts(nextProducts); setSuggestions(nextSuggestions);
      setSupplierId((current) => nextSuppliers.some((row) => row.id === current) ? current : (nextSuppliers[0]?.id || ''));
      setProductId((current) => nextProducts.some((row) => row.id === current) ? current : (nextProducts[0]?.id || ''));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Impossible de charger les achats';
      setError(message); toast.error(message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setVariantId(selectedProduct?.variants?.[0]?.id || ''); }, [productId, selectedProduct]);

  const addSupplier = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || addingSupplier) return;
    setAddingSupplier(true);
    try {
      const supplier = await createSupplierApi({ name: name.trim() });
      setName(''); setSupplierId(supplier.id); toast.success('Fournisseur ajout\u00e9'); await load();
    } catch (caught) { toast.error(caught instanceof Error ? caught.message : 'Erreur lors de la cr\u00e9ation'); }
    finally { setAddingSupplier(false); }
  };

  const addPurchase = async (event: FormEvent) => {
    event.preventDefault();
    const parsedQuantity = Number(quantity); const parsedCost = Number(unitCost);
    if (!supplierId || !productId || !variantId || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0 || !Number.isFinite(parsedCost) || parsedCost < 0) {
      toast.error('S\u00e9lectionnez un fournisseur, un produit, une variante et des valeurs valides'); return;
    }
    if (creatingOrder) return;
    setCreatingOrder(true);
    try {
      await createPurchaseOrderApi({ supplierId, items: [{ productId, variantId, quantity: parsedQuantity, unitCost: parsedCost }] });
      setQuantity('1'); setUnitCost('0'); toast.success('Commande fournisseur cr\u00e9\u00e9e'); await load();
    } catch (caught) { toast.error(caught instanceof Error ? caught.message : 'Erreur lors de la cr\u00e9ation'); }
    finally { setCreatingOrder(false); }
  };

  const receive = async (id: string) => {
    if (receivingId) return;
    setReceivingId(id);
    try { await receivePurchaseOrderApi(id); toast.success('Stock re\u00e7u et ajout\u00e9'); await load(); }
    catch (caught) { toast.error(caught instanceof Error ? caught.message : 'Erreur de r\u00e9ception'); }
    finally { setReceivingId(''); }
  };

  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-semibold tracking-tight">Achats & fournisseurs</h1><p className="mt-1 text-muted-foreground">G&eacute;rez vos fournisseurs, commandes et r&eacute;approvisionnements.</p></div><Button type="button" variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={loading ? 'animate-spin' : ''} />{loading ? 'Chargement...' : 'Actualiser'}</Button></div>
    {error && <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"><AlertCircle className="size-4" />{error}</div>}
    <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,2.2fr)]">
      <Card className="p-5"><div className="mb-5 flex items-center gap-2"><Truck className="size-5 text-primary" /><h2 className="text-lg font-semibold">Nouveau fournisseur</h2></div><form onSubmit={addSupplier} className="space-y-2"><label htmlFor="supplier-name" className="text-sm font-medium">Nom du fournisseur</label><div className="flex gap-2"><Input id="supplier-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Céramique Tunis" disabled={addingSupplier} /><Button type="submit" disabled={addingSupplier || !name.trim()}><Plus />{addingSupplier ? 'Ajout...' : 'Ajouter'}</Button></div></form><div className="mt-5 max-h-44 space-y-2 overflow-y-auto pr-1">{suppliers.map((supplier) => <div key={supplier.id} className="flex items-center justify-between rounded-lg border p-3 text-sm"><span className="font-medium">{supplier.name}</span><span className="text-muted-foreground">{supplier.active ? 'Actif' : 'Inactif'}</span></div>)}{!loading && !suppliers.length && <p className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">Aucun fournisseur. Ajoutez-en un pour commencer.</p>}</div></Card>
      <Card className="p-5"><div className="mb-5 flex items-center gap-2"><Package className="size-5 text-primary" /><h2 className="text-lg font-semibold">Nouvelle commande fournisseur</h2></div><form onSubmit={addPurchase} className="grid gap-4 md:grid-cols-2 xl:grid-cols-12"><label className="space-y-2 xl:col-span-3"><span className="text-sm font-medium">Fournisseur</span><select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={supplierId} onChange={(event) => setSupplierId(event.target.value)} disabled={creatingOrder}><option value="">Sélectionner</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label><label className="space-y-2 xl:col-span-4"><span className="text-sm font-medium">Produit</span><select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={productId} onChange={(event) => setProductId(event.target.value)} disabled={creatingOrder}><option value="">Sélectionner</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label><label className="space-y-2 xl:col-span-3"><span className="text-sm font-medium">Variante</span><select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={variantId} onChange={(event) => setVariantId(event.target.value)} disabled={creatingOrder || !selectedProduct?.variants?.length}><option value="">Sélectionner</option>{(selectedProduct?.variants || []).map((variant) => <option key={variant.id} value={variant.id}>{variant.sku || `${variant.size} ${variant.color}`}</option>)}</select></label><label className="space-y-2 xl:col-span-2"><span className="text-sm font-medium">Quantité</span><Input type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} disabled={creatingOrder} /></label><label className="space-y-2 xl:col-span-3"><span className="text-sm font-medium">Coût unitaire (TND)</span><Input type="number" min="0" step="0.01" value={unitCost} onChange={(event) => setUnitCost(event.target.value)} disabled={creatingOrder} /></label><div className="flex items-end xl:col-span-5"><div className="flex h-9 w-full items-center justify-between rounded-md bg-muted/50 px-3 text-sm"><span className="text-muted-foreground">Sous-total</span><strong>{money(orderSubtotal)}</strong></div></div><div className="flex items-end md:col-span-2 xl:col-span-4"><Button className="w-full" type="submit" disabled={creatingOrder || loading || !supplierId || !productId || !variantId}>{creatingOrder ? 'Cr\u00e9ation...' : 'Cr\u00e9er la commande'}</Button></div></form></Card>
    </div>
    <Card className="p-5"><h2 className="mb-4 text-lg font-semibold">Suggestions de r&eacute;approvisionnement</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{suggestions.slice(0, 9).map((suggestion) => <div key={`${suggestion.productId}:${suggestion.variantId}`} className="rounded-lg border p-3 text-sm"><div className="font-semibold">{suggestion.productName}</div><div className="mt-1 text-muted-foreground">Stock : {suggestion.stock} &middot; Vente/jour : {suggestion.averageDailySales}</div><div className="mt-2 font-semibold text-amber-600">Commander : {suggestion.suggestedQuantity}</div></div>)}{!loading && !suggestions.length && <p className="text-sm text-muted-foreground">Aucune alerte de r&eacute;approvisionnement.</p>}</div></Card>
    <Card className="p-5"><h2 className="mb-4 text-lg font-semibold">Commandes fournisseurs</h2><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b text-muted-foreground"><th className="p-3">Fournisseur</th><th className="p-3">Articles</th><th className="p-3">Total</th><th className="p-3">Statut</th><th className="p-3 text-right">Action</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b last:border-0"><td className="p-3 font-medium">{order.supplierName}</td><td className="p-3">{order.items.length}</td><td className="p-3">{money(order.total)}</td><td className="p-3"><span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">{order.status === 'received' && <CheckCircle2 className="size-3" />}{order.status === 'received' ? 'Re\u00e7ue' : 'Brouillon'}</span></td><td className="p-3 text-right">{order.status !== 'received' && <Button type="button" size="sm" variant="outline" disabled={Boolean(receivingId)} onClick={() => void receive(order.id)}>{receivingId === order.id ? 'R\u00e9ception...' : 'R\u00e9ceptionner'}</Button>}</td></tr>)}</tbody></table>{!loading && !orders.length && <p className="py-8 text-center text-sm text-muted-foreground">Aucune commande fournisseur.</p>}</div></Card>
  </div>;
}
