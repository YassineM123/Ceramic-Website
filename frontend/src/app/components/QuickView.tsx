import { useState } from 'react';
import { X, ShoppingCart, Star, Minus, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { Product } from '../data/products';

interface QuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product, quantity?: number) => void;
  onViewDetails?: (product: Product) => void;
}

export function QuickView({ isOpen, onClose, product, onAddToCart, onViewDetails }: QuickViewProps) {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#17324D]/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-5 top-5 z-10 w-11 h-11 rounded-full bg-white/95 text-[#17324D] shadow-md flex items-center justify-center hover:bg-[#F8FBFA] transition-colors duration-300"
              aria-label="Fermer l'aperçu"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid md:grid-cols-2">
              <div className="min-h-[320px] bg-[#F8FBFA]">
                <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>

              <div className="p-8 lg:p-12 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {product.badge && (
                      <span className="bg-[#075D9A] text-white px-3 py-1 rounded-full text-xs">
                        {product.badge}
                      </span>
                    )}
                    <span className="text-sm text-[#5E6F73]">{product.category}</span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-serif text-[#17324D] mb-3">{product.name}</h2>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} className="w-4 h-4 fill-[#B86F3B] text-[#B86F3B]" />
                      ))}
                    </div>
                    <span className="text-sm text-[#5E6F73]">Note client 4.9</span>
                  </div>
                  <div className="text-3xl font-serif text-[#075D9A] mb-4">{product.price} TND</div>
                  <p className="text-[#5E6F73] leading-relaxed">{product.description}</p>
                </div>

                <div>
                  <label className="text-sm text-[#17324D] mb-2 block">Quantité</label>
                  <div className="inline-flex items-center gap-3 bg-[#F8FBFA] rounded-full px-5 py-3">
                    <button
                      onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-colors duration-300"
                      aria-label="Diminuer la quantité"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity((value) => value + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-colors duration-300"
                      aria-label="Augmenter la quantité"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-[#075D9A] text-white py-4 rounded-full hover:bg-[#B86F3B] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Ajouter au panier</span>
                  </button>
                  {onViewDetails && (
                    <button
                      onClick={() => {
                        onViewDetails(product);
                        onClose();
                      }}
                      className="w-full border-2 border-[#075D9A] text-[#075D9A] py-3 rounded-full hover:bg-[#075D9A] hover:text-white transition-colors duration-300"
                    >
                      Voir les détails
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
