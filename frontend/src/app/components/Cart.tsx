import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { CartItem } from '../data/products';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onCheckout?: () => void;
}

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onCheckout }: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 199 ? 0 : 12;
  const total = subtotal + shipping;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#17324D]/60 backdrop-blur-sm z-50"
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#17324D]/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-[#075D9A]" />
                  <h2 className="text-2xl font-serif text-[#17324D]">Panier</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F8FBFA] transition-colors duration-300"
                  aria-label="Fermer le panier"
                >
                  <X className="w-6 h-6 text-[#17324D]" />
                </button>
              </div>
              {items.length > 0 && (
                <p className="text-sm text-[#5E6F73] mt-2">
                  {items.length} {items.length === 1 ? 'article' : 'articles'} dans votre panier
                </p>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-24 h-24 bg-[#F8FBFA] rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-[#075D9A]" />
                  </div>
                  <h3 className="text-xl font-serif text-[#17324D]">Votre panier est vide</h3>
                  <p className="text-[#5E6F73]">Découvrez nos pièces en céramique artisanale</p>
                  <button
                    onClick={onClose}
                    className="bg-[#075D9A] text-white px-8 py-3 rounded-full hover:bg-[#B86F3B] transition-colors duration-300"
                  >
                    Continuer mes achats
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 p-4 bg-[#F8FBFA] rounded-2xl"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="w-24 h-24 object-cover rounded-xl"
                      />
                      <div className="flex-1 space-y-2">
                        <h4 className="font-serif text-[#17324D]">{item.name}</h4>
                        <p className="text-lg font-serif text-[#075D9A]">
                          {item.price} TND
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-[#E9D8BE] transition-colors duration-300"
                            aria-label={`Diminuer la quantité de ${item.name}`}
                          >
                            <Minus className="w-4 h-4 text-[#17324D]" />
                          </button>
                          <span className="w-8 text-center font-medium text-[#17324D]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-[#E9D8BE] transition-colors duration-300"
                            aria-label={`Augmenter la quantité de ${item.name}`}
                          >
                            <Plus className="w-4 h-4 text-[#17324D]" />
                          </button>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 0)}
                            className="ml-auto text-sm text-[#5E6F73] hover:text-[#B86F3B] transition-colors duration-300"
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="p-6 border-t border-[#17324D]/10 bg-[#F8FBFA]">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[#17324D]">
                    <span>Sous-total</span>
                    <span>{subtotal} TND</span>
                  </div>
                  <div className="flex justify-between text-[#17324D]">
                    <span>Livraison</span>
                    <span>{shipping === 0 ? 'Offerte' : `${shipping} TND`}</span>
                  </div>
                  {subtotal < 199 && (
                    <p className="text-xs text-[#5E6F73]">
                      Ajoutez {199 - subtotal} TND pour profiter de la livraison offerte
                    </p>
                  )}
                  <div className="pt-3 border-t border-[#17324D]/10 flex justify-between font-serif text-lg text-[#17324D]">
                    <span>Total</span>
                    <span>{total} TND</span>
                  </div>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full bg-[#075D9A] text-white py-4 rounded-full hover:bg-[#B86F3B] transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <span>Finaliser la commande</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                <button
                  onClick={onClose}
                  className="w-full mt-3 text-[#5E6F73] hover:text-[#B86F3B] transition-colors duration-300"
                >
                  Continuer mes achats
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
