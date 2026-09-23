import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Ban,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  MapPin,
  Package,
  Phone,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Truck,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '../components/admin/StatusBadge';
import { EmptyState } from '../components/admin/EmptyState';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import {
  cancelOrderApi,
  downloadOrderInvoicePdfApi,
  exportOrdersApi,
  fetchOrdersApi,
  OrderRecord,
  refundOrderApi,
  updateOrderApi,
  updateOrderTrackingApi,
} from '../services/api';
import { SimpleManualOrderSheet } from '../components/orders/SimpleManualOrderSheet';

const orderStatuses = ['New', 'Confirmed', 'Preparing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
const deliveryStatuses = ['Waiting', 'Assigned', 'Picked up', 'On the way', 'Delivered', 'Failed', 'Returned'];

function money(value: number | undefined) {
  return `${Number(value || 0).toFixed(2)} TND`;
}

function statusType(status: string): 'success' | 'warning' | 'danger' | 'info' {
  if (status === 'Delivered' || status === 'Paid') return 'success';
  if (status === 'Cancelled' || status === 'Returned' || status === 'Failed') return 'danger';
  if (status === 'Shipped' || status === 'On the way' || status === 'Picked up') return 'info';
  return 'warning';
}

function downloadTextFile(file: { filename: string; contentType: string; content: string }) {
  const blob = new Blob([file.content], { type: file.contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function pdfBlobFromBase64(base64: string, contentType = 'application/pdf') {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: contentType });
}

function downloadPdf(file: { filename: string; contentType: string; base64: string }) {
  const blob = pdfBlobFromBase64(file.base64, file.contentType);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [noteDraft, setNoteDraft] = useState('');
  const [trackingForm, setTrackingForm] = useState({ trackingNumber: '', courier: '', eta: '', deliveryStatus: 'On the way' });
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundForm, setRefundForm] = useState({ amount: '', reason: '' });

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const apiOrders = await fetchOrdersApi();
      setOrders(apiOrders);
      setLoadError('');
    } catch (_error) {
      setOrders([]);
      setLoadError('Impossible de charger les commandes depuis le serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  useEffect(() => {
    if (!selectedOrder) return;
    setNoteDraft(selectedOrder.internalNote || selectedOrder.internalNotes?.at(-1)?.text || '');
    setTrackingForm({
      trackingNumber: selectedOrder.trackingNumber || selectedOrder.tracking || '',
      courier: selectedOrder.courier || selectedOrder.deliveryCompanyName || '',
      eta: selectedOrder.eta || '',
      deliveryStatus: selectedOrder.deliveryStatus || 'On the way',
    });
  }, [selectedOrder]);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return orders.filter((order) => {
      const matchesSearch = [order.id, order.customer, order.email, order.phone, order.city, order.trackingNumber]
        .some((value) => String(value || '').toLowerCase().includes(query));
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(order.status);
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const selectedLineItems = selectedOrder?.lineItems?.length ? selectedOrder.lineItems : [];

  const applyOrderUpdate = (updated: OrderRecord) => {
    setOrders((current) => current.map((order) => (order.id === updated.id ? updated : order)));
    setSelectedOrder((current) => (current?.id === updated.id ? updated : current));
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]));
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter((prev) => (prev.includes(status) ? prev.filter((entry) => entry !== status) : [...prev, status]));
  };

  const handleStatusChange = async (order: OrderRecord, status: string) => {
    setIsBusy(true);
    try {
      const updated = await updateOrderApi(order.id, { status });
      applyOrderUpdate(updated);
      toast.success('Statut de commande mis a jour');
    } finally {
      setIsBusy(false);
    }
  };

  const handleMarkSelectedAsShipped = async () => {
    if (!selectedOrders.length) return;
    setIsBusy(true);
    try {
      const results = await Promise.all(selectedOrders.map((id) => updateOrderApi(id, { status: 'Shipped', deliveryStatus: 'On the way' })));
      results.forEach(applyOrderUpdate);
      setSelectedOrders([]);
      toast.success('Commandes marquees comme expediees');
    } finally {
      setIsBusy(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    setIsBusy(true);
    try {
      const updated = await cancelOrderApi(selectedOrder.id, { reason: cancelReason.trim() });
      applyOrderUpdate(updated);
      setCancelReason('');
      setIsCancelDialogOpen(false);
      toast.success('Commande annulee');
    } finally {
      setIsBusy(false);
    }
  };

  const handleRefundOrder = async () => {
    if (!selectedOrder) return;
    const amount = Number(refundForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Montant de remboursement invalide');
      return;
    }
    setIsBusy(true);
    try {
      const updated = await refundOrderApi(selectedOrder.id, { amount, reason: refundForm.reason.trim() });
      applyOrderUpdate(updated);
      setRefundForm({ amount: '', reason: '' });
      setIsRefundDialogOpen(false);
      toast.success('Remboursement enregistre');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSaveInternalNote = async () => {
    if (!selectedOrder) return;
    setIsBusy(true);
    try {
      const updated = await updateOrderApi(selectedOrder.id, {
        internalNote: noteDraft.trim(),
        internalNotes: [
          ...(selectedOrder.internalNotes || []),
          ...(noteDraft.trim() ? [{ id: `note_${Date.now()}`, text: noteDraft.trim(), createdAt: new Date().toISOString() }] : []),
        ],
      });
      applyOrderUpdate(updated);
      toast.success('Note enregistree');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    setIsBusy(true);
    try {
      const updated = await updateOrderTrackingApi(selectedOrder.id, trackingForm);
      applyOrderUpdate(updated);
      toast.success('Suivi livraison mis a jour');
    } finally {
      setIsBusy(false);
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    const file = await exportOrdersApi(format, { search: searchQuery, status: statusFilter[0] });
    downloadTextFile(file);
    toast.success(format === 'xlsx' ? 'Export Excel genere' : 'Export CSV genere');
  };

  const handleDownloadInvoice = async () => {
    if (!selectedOrder) return;
    const file = await downloadOrderInvoicePdfApi(selectedOrder.id);
    downloadPdf(file);
    toast.success('Facture PDF telechargee');
  };

  const handlePrintInvoice = async () => {
    if (!selectedOrder) return;
    const file = await downloadOrderInvoicePdfApi(selectedOrder.id);
    const url = URL.createObjectURL(pdfBlobFromBase64(file.base64, file.contentType));
    const printWindow = window.open(url, '_blank', 'noopener,noreferrer');
    printWindow?.addEventListener('load', () => printWindow.print());
    toast.success('Facture ouverte pour impression');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1>Commandes</h1>
          <p className="text-muted-foreground">Gerez toutes vos commandes et leur synchronisation avec le site.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => void loadOrders()}>
            <RefreshCw size={16} />
            Actualiser
          </Button>
          <Button className="gap-2" onClick={() => setIsManualOrderOpen(true)}>
            <FileText size={16} />
            New Manual Order
          </Button>
        </div>
      </div>

      {loadError && (
        <Card className="border-warning bg-warning/5 p-4">
          <p className="text-sm">{loadError}</p>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Rechercher ID, client, email, ville ou tracking..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info('Filtrez par recherche ou statut.')}>
              <Filter size={16} />
              Filtres
            </Button>
            {orderStatuses.map((status) => (
              <Badge key={status} variant={statusFilter.includes(status) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleStatusFilter(status)}>
                {status}
              </Badge>
            ))}
            {statusFilter.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setStatusFilter([])}>
                Effacer
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => void handleExport('csv')}>
              <Download size={16} />
              CSV
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => void handleExport('xlsx')}>
              <FileSpreadsheet size={16} />
              Excel
            </Button>
          </div>
        </div>
      </Card>

      {selectedOrders.length > 0 && (
        <Card className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-medium">{selectedOrders.length} commande(s) selectionnee(s)</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => void handleMarkSelectedAsShipped()} disabled={isBusy}>Marquer expediees</Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedOrders([])}>Deselectionner</Button>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Chargement des commandes...</p>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <EmptyState icon={<Package size={40} />} title="Aucune commande trouvee" description="Aucune commande ne correspond aux filtres appliques." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 border-b bg-card">
                <tr>
                  <th className="px-4 py-3">
                    <Checkbox
                      checked={selectedOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                      aria-label="Selectionner toutes les commandes"
                      onCheckedChange={(checked) => setSelectedOrders(checked ? filteredOrders.map((order) => order.id) : [])}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Paiement</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Livraison</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b transition-colors hover:bg-accent/50">
                    <td className="px-4 py-3">
                      <Checkbox checked={selectedOrders.includes(order.id)} aria-label={`Selectionner la commande ${order.id}`} onCheckedChange={() => toggleOrderSelection(order.id)} />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{order.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.email || order.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Select value={order.status} onValueChange={(value) => void handleStatusChange(order, value)}>
                        <SelectTrigger className="h-8 min-w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {orderStatuses.map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.paymentStatus || order.payment} type={statusType(order.paymentStatus || order.payment)} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.deliveryStatus || order.delivery} type={statusType(order.deliveryStatus || order.delivery)} />
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium">{money(order.total || order.amount)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{String(order.date || '').slice(0, 10)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}>Apercu</Button>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/admin/orders/${encodeURIComponent(order.id)}`)}>Details</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle>Details de la commande {selectedOrder.id}</SheetTitle>
                <SheetDescription>Actions, timeline client, paiement, facture et livraison.</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                <Card className="p-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => void handlePrintInvoice()} disabled={isBusy}>
                      <Printer size={15} />
                      Print invoice
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => void handleDownloadInvoice()} disabled={isBusy}>
                      <FileText size={15} />
                      Export PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        setRefundForm({ amount: String(selectedOrder.total || selectedOrder.amount || 0), reason: '' });
                        setIsRefundDialogOpen(true);
                      }}
                      disabled={isBusy}
                    >
                      <RotateCcw size={15} />
                      Refund
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 text-destructive"
                      onClick={() => setIsCancelDialogOpen(true)}
                      disabled={isBusy}
                    >
                      <Ban size={15} />
                      Cancel
                    </Button>
                  </div>
                  <div className="grid gap-3 text-sm md:grid-cols-2">
                    <div className="flex items-center gap-2"><User size={14} className="text-muted-foreground" />{selectedOrder.customer}</div>
                    <div className="flex items-center gap-2"><Phone size={14} className="text-muted-foreground" />{selectedOrder.phone || selectedOrder.email || '-'}</div>
                    <div className="flex items-center gap-2 md:col-span-2"><MapPin size={14} className="text-muted-foreground" />{selectedOrder.address || '-'} {selectedOrder.city ? `, ${selectedOrder.city}` : ''}</div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="mb-3 flex items-center gap-2"><Package size={18} />Produits commandes</h4>
                  <div className="space-y-3">
                    {selectedLineItems.length ? selectedLineItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 border-b pb-3 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">SKU {item.sku || '-'} · Qty {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium">{money(item.total || item.unitPrice * item.quantity)}</p>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground">Aucune ligne produit detaillee.</p>
                    )}
                  </div>
                  <div className="mt-4 border-t pt-4 text-sm">
                    <div className="flex justify-between"><span>Sous-total</span><span>{money(selectedOrder.subtotal)}</span></div>
                    <div className="flex justify-between"><span>Livraison</span><span>{money(selectedOrder.deliveryFee)}</span></div>
                    <div className="flex justify-between"><span>Remise</span><span>{money(selectedOrder.discount)}</span></div>
                    <div className="flex justify-between pt-2 font-semibold"><span>Total</span><span>{money(selectedOrder.total || selectedOrder.amount)}</span></div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="mb-3 flex items-center gap-2"><Truck size={18} />Shipping tracking</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input value={trackingForm.trackingNumber} onChange={(event) => setTrackingForm((current) => ({ ...current, trackingNumber: event.target.value }))} placeholder="Tracking number" />
                    <Input value={trackingForm.courier} onChange={(event) => setTrackingForm((current) => ({ ...current, courier: event.target.value }))} placeholder="Courier" />
                    <Input type="date" value={trackingForm.eta} onChange={(event) => setTrackingForm((current) => ({ ...current, eta: event.target.value }))} />
                    <Select value={trackingForm.deliveryStatus} onValueChange={(value) => setTrackingForm((current) => ({ ...current, deliveryStatus: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {deliveryStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" className="mt-3" onClick={() => void handleSaveTracking()} disabled={isBusy}>Save tracking</Button>
                </Card>

                <Card className="p-4">
                  <h4 className="mb-3">Customer timeline</h4>
                  <div className="space-y-3">
                    {(selectedOrder.timeline || []).slice().reverse().map((event) => (
                      <div key={event.id} className="border-l-2 border-primary/40 pl-3">
                        <p className="text-sm font-medium">{event.label || event.status || event.type}</p>
                        <p className="text-xs text-muted-foreground">{String(event.timestamp || '').replace('T', ' ').slice(0, 16)}</p>
                      </div>
                    ))}
                    {!selectedOrder.timeline?.length && <p className="text-sm text-muted-foreground">Aucune activite enregistree.</p>}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="mb-3">Notes internes</h4>
                  <textarea
                    className="min-h-24 w-full resize-none rounded-md border bg-background p-3 text-sm"
                    placeholder="Ajouter une note..."
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                  />
                  <Button size="sm" className="mt-2" onClick={() => void handleSaveInternalNote()} disabled={isBusy}>Enregistrer</Button>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <SimpleManualOrderSheet open={isManualOrderOpen} onOpenChange={setIsManualOrderOpen} />

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la commande</DialogTitle>
            <DialogDescription>
              Cette action annule la commande selectionnee et restaure le stock si la commande l'avait reserve.
            </DialogDescription>
          </DialogHeader>
          <textarea
            className="min-h-24 w-full resize-none rounded-md border bg-background p-3 text-sm"
            placeholder="Raison de l'annulation"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)} disabled={isBusy}>Retour</Button>
            <Button variant="destructive" onClick={() => void handleCancelOrder()} disabled={isBusy}>Confirmer l'annulation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer un remboursement</DialogTitle>
            <DialogDescription>
              Le backend verifie que le montant ne depasse pas le total de la commande avant de modifier l'etat.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={refundForm.amount}
              onChange={(event) => setRefundForm((current) => ({ ...current, amount: event.target.value }))}
              placeholder="Montant"
            />
            <textarea
              className="min-h-24 w-full resize-none rounded-md border bg-background p-3 text-sm"
              placeholder="Raison du remboursement"
              value={refundForm.reason}
              onChange={(event) => setRefundForm((current) => ({ ...current, reason: event.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)} disabled={isBusy}>Retour</Button>
            <Button onClick={() => void handleRefundOrder()} disabled={isBusy}>Confirmer le remboursement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
