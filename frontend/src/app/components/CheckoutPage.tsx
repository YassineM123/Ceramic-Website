import { useMemo, useState } from 'react';
import { CheckCircle2, CreditCard, Lock, MapPin, Package, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import type { CartItem } from '../data/products';
import type { PublicOrderPayload, ShippingZone, TaxRate } from '../services/storefrontApi';

interface CheckoutPageProps {
  cartItems: CartItem[];
  shippingZones?: ShippingZone[];
  taxRates?: TaxRate[];
  onSubmitOrder?: (payload: PublicOrderPayload) => Promise<{ id: string; status: string; total: number }>;
  onOrderComplete: (order?: { id: string; status: string; total: number }) => void;
  onContinueShopping: () => void;
}

export function CheckoutPage({
  cartItems,
  shippingZones = [],
  taxRates = [],
  onSubmitOrder,
  onOrderComplete,
  onContinueShopping,
}: CheckoutPageProps) {
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const [error, setError] = useState('');
  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
  const shippingZone = shippingZones[0];
  const shipping =
    subtotal === 0 || (shippingZone?.freeShippingThreshold && subtotal >= shippingZone.freeShippingThreshold)
      ? 0
      : shippingZone?.fee ?? 12;
  const taxRate = taxRates[0];
  const tax = taxRate?.includedInPrice ? 0 : Math.round(subtotal * ((taxRate?.rate || 0) / 100) * 100) / 100;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartItems.length) return;
    const form = new FormData(event.currentTarget);
    const payload: PublicOrderPayload = {
      customer: {
        firstName: String(form.get('firstName') || ''),
        lastName: String(form.get('lastName') || ''),
        email: String(form.get('email') || ''),
        phone: String(form.get('phone') || ''),
        address: String(form.get('address') || ''),
        city: String(form.get('city') || ''),
        country: 'Tunisia',
      },
      items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })),
      paymentMethod: String(form.get('paymentMethod') || 'Cash on delivery'),
      couponCode: String(form.get('couponCode') || '').trim(),
    };

    setIsSubmitting(true);
    setError('');
    try {
      const created = onSubmitOrder ? await onSubmitOrder(payload) : null;
      setOrderId(created?.id || '');
      setServerTotal(typeof created?.total === 'number' ? created.total : null);
      setIsComplete(true);
      onOrderComplete(created || undefined);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Impossible de confirmer la commande.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <main className="min-h-screen bg-[#F8FBFA] pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-10 lg:p-14 shadow-xl"
          >
            <div className="w-20 h-20 bg-[#075D9A] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-11 h-11 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-serif text-[#17324D] mb-4">Commande confirmee</h1>
            <p className="text-[#5E6F73] text-lg leading-relaxed mb-8">
              Merci pour votre commande. Notre equipe vous contactera pour confirmer la livraison.
              {orderId && (
                <>
                  <br />
              Reference commande: {orderId}
                </>
              )}
              {serverTotal !== null && (
                <>
                  <br />
                  Total confirme: {serverTotal} DT
                </>
              )}
            </p>
            <button
              onClick={onContinueShopping}
              className="bg-[#075D9A] text-white px-10 py-4 rounded-full hover:bg-[#B86F3B] transition-colors duration-300"
            >
              Continuer mes achats
            </button>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FBFA] pt-28 pb-16">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-10">
          <h1 className="text-4xl lg:text-6xl font-serif text-[#17324D] mb-3">Finaliser la commande</h1>
          <p className="text-[#5E6F73] text-lg">Paiement a la livraison et livraison partout en Tunisie.</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-lg">
            <Package className="w-16 h-16 text-[#075D9A] mx-auto mb-5" />
            <h2 className="text-3xl font-serif text-[#17324D] mb-3">Votre panier est vide</h2>
            <p className="text-[#5E6F73] mb-7">Ajoutez une piece avant de finaliser votre commande.</p>
            <button
              onClick={onContinueShopping}
              className="bg-[#075D9A] text-white px-8 py-3 rounded-full hover:bg-[#B86F3B] transition-colors duration-300"
            >
              Decouvrir la boutique
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_420px] gap-10 items-start">
            <div className="space-y-8">
              <section className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-[#075D9A]" />
                  <h2 className="text-2xl font-serif text-[#17324D]">Coordonnees de livraison</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <input name="firstName" required placeholder="Prenom" className="px-5 py-3 rounded-full bg-[#F8FBFA] outline-none border-2 border-transparent focus:border-[#075D9A]" />
                  <input name="lastName" required placeholder="Nom" className="px-5 py-3 rounded-full bg-[#F8FBFA] outline-none border-2 border-transparent focus:border-[#075D9A]" />
                  <input name="email" required type="email" placeholder="Adresse email" className="px-5 py-3 rounded-full bg-[#F8FBFA] outline-none border-2 border-transparent focus:border-[#075D9A]" />
                  <input name="phone" required type="tel" placeholder="+216 XX XXX XXX" className="px-5 py-3 rounded-full bg-[#F8FBFA] outline-none border-2 border-transparent focus:border-[#075D9A]" />
                  <input name="address" required placeholder="Adresse de livraison" className="md:col-span-2 px-5 py-3 rounded-full bg-[#F8FBFA] outline-none border-2 border-transparent focus:border-[#075D9A]" />
                  <input name="city" required placeholder="Ville" className="px-5 py-3 rounded-full bg-[#F8FBFA] outline-none border-2 border-transparent focus:border-[#075D9A]" />
                  <input name="postalCode" placeholder="Code postal" className="px-5 py-3 rounded-full bg-[#F8FBFA] outline-none border-2 border-transparent focus:border-[#075D9A]" />
                </div>
              </section>

              <section className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-[#075D9A]" />
                  <h2 className="text-2xl font-serif text-[#17324D]">Paiement</h2>
                </div>
                <input
                  name="paymentMethod"
                  required
                  defaultValue="Cash on delivery"
                  className="w-full px-5 py-3 rounded-full bg-[#F8FBFA] outline-none border-2 border-transparent focus:border-[#075D9A]"
                />
                <div className="flex items-center gap-2 mt-5 text-sm text-[#5E6F73]">
                  <Lock className="w-4 h-4" />
                  <span>Paiement a la livraison disponible en Tunisie.</span>
                </div>
              </section>
            </div>

            <aside className="bg-white rounded-3xl p-8 shadow-xl sticky top-28">
              <h2 className="text-2xl font-serif text-[#17324D] mb-6">Resume de commande</h2>
              <div className="space-y-5 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <h3 className="font-serif text-[#17324D]">{item.name}</h3>
                      <p className="text-sm text-[#5E6F73]">Qte {item.quantity}</p>
                      <p className="text-[#075D9A] font-serif">{item.price * item.quantity} DT</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-[#17324D]/10 pt-5">
                <div className="pb-3">
                  <label className="mb-2 block text-sm text-[#5E6F73]" htmlFor="couponCode">Code coupon</label>
                  <input
                    id="couponCode"
                    name="couponCode"
                    placeholder="WELCOME10"
                    className="w-full px-5 py-3 rounded-full bg-[#F8FBFA] outline-none border-2 border-transparent focus:border-[#075D9A]"
                  />
                </div>
                <div className="flex justify-between text-[#17324D]">
                  <span>Sous-total</span>
                  <span>{subtotal} DT</span>
                </div>
                <div className="flex justify-between text-[#17324D]">
                  <span>Livraison</span>
                  <span>{shipping === 0 ? 'Offerte' : `${shipping} DT`}</span>
                </div>
                <div className="flex justify-between text-[#17324D]">
                  <span>Taxes</span>
                  <span>{tax} DT</span>
                </div>
                <div className="flex justify-between text-xl font-serif text-[#17324D] border-t border-[#17324D]/10 pt-4">
                  <span>Total</span>
                  <span>{total} DT</span>
                </div>
              </div>

              <div className="flex items-center gap-3 my-6 p-4 rounded-2xl bg-[#F8FBFA] text-[#5E6F73]">
                <Truck className="w-5 h-5 text-[#075D9A]" />
                <span className="text-sm">{shippingZone?.estimatedDays || 'Emballage securise pour chaque commande.'}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#075D9A] text-white py-4 rounded-full hover:bg-[#B86F3B] transition-colors duration-300 disabled:opacity-60"
              >
                {isSubmitting ? 'Confirmation...' : 'Confirmer la commande'}
              </button>
              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}
