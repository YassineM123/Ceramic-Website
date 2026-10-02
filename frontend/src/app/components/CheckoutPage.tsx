import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Lock,
  MapPin,
  Package,
  Truck,
  Banknote,
  Phone,
  User,
  Building2,
  ChevronDown,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { CartItem } from '../data/products';
import type { PublicOrderPayload, ShippingZone, TaxRate } from '../services/storefrontApi';
import { TUNISIA_GOVERNORATES } from '../data/tunisiaRegions';

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

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedDelegation, setSelectedDelegation] = useState('');
  const [couponCode, setCouponCode] = useState('');

  // Available Delegations based on selected Governorate
  const currentGovernorateData = useMemo(() => {
    return TUNISIA_GOVERNORATES.find((gov) => gov.name === selectedGovernorate);
  }, [selectedGovernorate]);

  const delegationsList = currentGovernorateData ? currentGovernorateData.delegations : [];

  const handleGovernorateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const govName = e.target.value;
    setSelectedGovernorate(govName);
    setSelectedDelegation(''); // Reset delegation when governorate changes
  };

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

    if (!fullName.trim()) {
      setError('Veuillez saisir votre nom et prénom.');
      return;
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setError('Veuillez saisir un numéro de téléphone valide (ex: 98 123 456).');
      return;
    }

    if (!selectedGovernorate) {
      setError('Veuillez sélectionner votre gouvernorat.');
      return;
    }

    if (!selectedDelegation) {
      setError('Veuillez sélectionner votre délégation (معتمدية).');
      return;
    }

    if (!address.trim()) {
      setError('Veuillez renseigner votre adresse de livraison.');
      return;
    }

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const payload: PublicOrderPayload = {
      customer: {
        name: fullName.trim(),
        firstName,
        lastName,
        email: `${cleanPhone}@lemondeceramique.tn`,
        phone: phone.trim(),
        address: address.trim(),
        city: selectedGovernorate,
        governorate: selectedGovernorate,
        delegation: selectedDelegation,
        country: 'Tunisie',
      },
      items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })),
      paymentMethod: 'Cash on delivery',
      couponCode: couponCode.trim(),
    };

    setIsSubmitting(true);
    setError('');
    try {
      const created = onSubmitOrder ? await onSubmitOrder(payload) : null;
      setOrderId(created?.id || '');
      setServerTotal(typeof created?.total === 'number' ? created.total : total);
      setIsComplete(true);
      onOrderComplete(created || undefined);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Impossible de confirmer la commande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <main className="min-h-screen bg-[#F8FBFA] pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-10 lg:p-14 shadow-xl border border-[#17324D]/5"
          >
            <div className="w-20 h-20 bg-[#075D9A] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-[#075D9A]/20">
              <CheckCircle2 className="w-11 h-11 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif text-[#17324D] mb-3">Commande confirmée avec succès !</h1>
            <p className="text-emerald-700 font-medium text-lg mb-4">
              🎉 شكراً لثقتكم - Merci pour votre commande
            </p>
            <p className="text-[#5E6F73] text-base lg:text-lg leading-relaxed mb-6">
              Notre équipe vous contactera par téléphone pour confirmer les détails de la livraison.
            </p>

            <div className="bg-[#F8FBFA] rounded-2xl p-6 text-left mb-8 border border-[#17324D]/5 space-y-3 max-w-lg mx-auto">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#5E6F73]">Client :</span>
                <span className="font-semibold text-[#17324D]">{fullName}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#5E6F73]">Téléphone :</span>
                <span className="font-semibold text-[#17324D]">{phone}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#5E6F73]">Destination :</span>
                <span className="font-semibold text-[#17324D]">{selectedGovernorate}, {selectedDelegation}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#5E6F73]">Paiement :</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <Banknote className="w-4 h-4" /> Espèces à la livraison
                </span>
              </div>
              {orderId && (
                <div className="flex justify-between items-center text-sm pt-2 border-t border-[#17324D]/10">
                  <span className="text-[#5E6F73]">Réf. Commande :</span>
                  <span className="font-mono font-bold text-[#075D9A]">{orderId}</span>
                </div>
              )}
              {serverTotal !== null && (
                <div className="flex justify-between items-center text-base pt-2 border-t border-[#17324D]/10">
                  <span className="font-serif text-[#17324D]">Montant à payer :</span>
                  <span className="font-serif font-bold text-[#075D9A] text-lg">{serverTotal} TND</span>
                </div>
              )}
            </div>

            <button
              onClick={onContinueShopping}
              className="bg-[#075D9A] text-white px-10 py-4 rounded-full font-medium hover:bg-[#B86F3B] shadow-md transition-all duration-300"
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
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#075D9A] text-xs font-semibold mb-3">
            <span>🇹🇳 Livraison express sur toute la Tunisie</span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-serif text-[#17324D] mb-2">Finaliser la commande</h1>
          <p className="text-[#5E6F73] text-base lg:text-lg">
            Remplissez vos coordonnées. Paiement en espèces à la livraison.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-lg border border-[#17324D]/5">
            <Package className="w-16 h-16 text-[#075D9A] mx-auto mb-5" />
            <h2 className="text-2xl lg:text-3xl font-serif text-[#17324D] mb-3">Votre panier est vide</h2>
            <p className="text-[#5E6F73] mb-7">Ajoutez des articles avant de finaliser votre commande.</p>
            <button
              onClick={onContinueShopping}
              className="bg-[#075D9A] text-white px-8 py-3 rounded-full hover:bg-[#B86F3B] transition-colors duration-300 font-medium"
            >
              Découvrir la boutique
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_420px] gap-8 items-start">
            <div className="space-y-6">
              {/* Section Coordonnées & Livraison */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#17324D]/5">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#17324D]/5">
                  <div className="w-10 h-10 rounded-xl bg-[#075D9A]/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#075D9A]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif text-[#17324D]">Coordonnées de livraison</h2>
                    <p className="text-xs text-[#5E6F73]">Informations requises pour acheminer votre colis</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
                  {/* Nom et Prénom */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#17324D] uppercase tracking-wider mb-2">
                      Nom & Prénom <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 text-[#5E6F73] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        name="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ex: Mohamed Ben Salah"
                        className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-[#F8FBFA] outline-none border border-[#17324D]/10 focus:border-[#075D9A] focus:bg-white transition-all text-[#17324D] text-sm"
                      />
                    </div>
                  </div>

                  {/* Numéro de téléphone */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#17324D] uppercase tracking-wider mb-2">
                      Numéro de téléphone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-[#5E6F73] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        name="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex: 98 123 456 ou 22 345 678"
                        className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-[#F8FBFA] outline-none border border-[#17324D]/10 focus:border-[#075D9A] focus:bg-white transition-all text-[#17324D] text-sm"
                      />
                    </div>
                    <p className="text-[11px] text-[#5E6F73] mt-1.5 ml-1">
                      Le livreur vous contactera sur ce numéro avant la livraison.
                    </p>
                  </div>

                  {/* Gouvernorat Select */}
                  <div>
                    <label className="block text-xs font-semibold text-[#17324D] uppercase tracking-wider mb-2">
                      Gouvernorat (الولاية) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="governorate"
                        required
                        value={selectedGovernorate}
                        onChange={handleGovernorateChange}
                        className="w-full appearance-none px-4 py-3.5 rounded-2xl bg-[#F8FBFA] outline-none border border-[#17324D]/10 focus:border-[#075D9A] focus:bg-white transition-all text-[#17324D] text-sm font-medium cursor-pointer"
                      >
                        <option value="">Sélectionnez votre gouvernorat</option>
                        {TUNISIA_GOVERNORATES.map((gov) => (
                          <option key={gov.id} value={gov.name}>
                            {gov.name} {gov.nameAr ? `(${gov.nameAr})` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#5E6F73] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Délégation Select */}
                  <div>
                    <label className="block text-xs font-semibold text-[#17324D] uppercase tracking-wider mb-2">
                      Délégation (المعتمدية) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="delegation"
                        required
                        disabled={!selectedGovernorate}
                        value={selectedDelegation}
                        onChange={(e) => setSelectedDelegation(e.target.value)}
                        className={`w-full appearance-none px-4 py-3.5 rounded-2xl outline-none border transition-all text-sm font-medium ${
                          !selectedGovernorate
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-[#F8FBFA] border-[#17324D]/10 focus:border-[#075D9A] focus:bg-white text-[#17324D] cursor-pointer'
                        }`}
                      >
                        <option value="">
                          {selectedGovernorate ? 'Sélectionnez votre délégation' : 'Choisissez d’abord un gouvernorat'}
                        </option>
                        {delegationsList.map((del) => (
                          <option key={del} value={del}>
                            {del}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#5E6F73] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Adresse exacte */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#17324D] uppercase tracking-wider mb-2">
                      Adresse exacte <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-5 h-5 text-[#5E6F73] absolute left-4 top-4 pointer-events-none" />
                      <textarea
                        name="address"
                        required
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Rue, numéro de maison / bâtiment, étage, repère connu..."
                        className="w-full pl-12 pr-5 py-3 rounded-2xl bg-[#F8FBFA] outline-none border border-[#17324D]/10 focus:border-[#075D9A] focus:bg-white transition-all text-[#17324D] text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Section Mode de Paiement - Cash uniquement */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#17324D]/5">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#17324D]/5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif text-[#17324D]">Mode de paiement</h2>
                    <p className="text-xs text-[#5E6F73]">Paiement sécurisé et direct à la réception</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-500/50 flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-[#17324D]">
                        Paiement en espèces à la livraison (Cash on Delivery)
                      </h3>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                        الدفع عند الاستلام
                      </span>
                    </div>
                    <p className="text-sm text-[#5E6F73] mt-1.5 leading-relaxed">
                      Vous ne payez rien en ligne. Le règlement se fait en espèces au livreur lors de la réception de votre commande.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 text-xs text-[#5E6F73] pl-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Commande 100% sans risque : vérifiez votre colis avant de payer.</span>
                </div>
              </section>
            </div>

            {/* Aside Récapitulatif */}
            <aside className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#17324D]/5 sticky top-28">
              <h2 className="text-2xl font-serif text-[#17324D] mb-5">Résumé de commande</h2>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3.5 items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-gray-50 shrink-0 border border-[#17324D]/5"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-sm text-[#17324D] truncate">{item.name}</h3>
                      <p className="text-xs text-[#5E6F73]">Quantité: {item.quantity}</p>
                      <p className="text-sm font-semibold text-[#075D9A]">{item.price * item.quantity} TND</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-[#17324D]/10 pt-4">
                <div className="pb-1">
                  <label className="mb-1.5 block text-xs font-semibold text-[#5E6F73] uppercase tracking-wider" htmlFor="couponCode">
                    Code Promo
                  </label>
                  <input
                    id="couponCode"
                    name="couponCode"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="WELCOME10"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8FBFA] outline-none border border-[#17324D]/10 focus:border-[#075D9A] text-sm uppercase"
                  />
                </div>

                <div className="flex justify-between text-sm text-[#5E6F73]">
                  <span>Sous-total</span>
                  <span className="font-semibold text-[#17324D]">{subtotal} TND</span>
                </div>

                <div className="flex justify-between text-sm text-[#5E6F73]">
                  <span>Frais de livraison</span>
                  <span className="font-semibold text-[#17324D]">{shipping === 0 ? 'Offerte' : `${shipping} TND`}</span>
                </div>

                {tax > 0 && (
                  <div className="flex justify-between text-sm text-[#5E6F73]">
                    <span>Taxes</span>
                    <span className="font-semibold text-[#17324D]">{tax} TND</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline text-xl font-serif text-[#17324D] border-t border-[#17324D]/10 pt-3">
                  <span>Total</span>
                  <span className="text-2xl font-bold text-[#075D9A]">{total} TND</span>
                </div>
              </div>

              <div className="flex items-center gap-3 my-5 p-3.5 rounded-2xl bg-[#F8FBFA] text-[#5E6F73] border border-[#17324D]/5">
                <Truck className="w-5 h-5 text-[#075D9A] shrink-0" />
                <span className="text-xs">
                  {shippingZone?.estimatedDays || 'Livraison rapide à domicile sous 24 à 48h partout en Tunisie.'}
                </span>
              </div>

              {error && (
                <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#075D9A] hover:bg-[#B86F3B] text-white py-4 rounded-full font-semibold text-base shadow-lg shadow-[#075D9A]/20 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Confirmation en cours...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Confirmer la commande ({total} TND)</span>
                  </>
                )}
              </button>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}
