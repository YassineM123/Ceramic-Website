import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { Product } from '../data/products';

interface BestSellersProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
}

export function BestSellers({ products, onAddToCart, onQuickView, onViewDetails }: BestSellersProps) {
  const [favorites, setFavorites] = useState<Array<Product['id']>>([]);

  const toggleFavorite = (id: Product['id']) => {
    setFavorites(prev =>
      prev.some((favoriteId) => String(favoriteId) === String(id))
        ? prev.filter((favoriteId) => String(favoriteId) !== String(id))
        : [...prev, id]
    );
  };

  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#075D9A] uppercase tracking-widest text-sm"
          >
            Sélection client
            <br />
            اختيارات الحرفاء
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-serif text-[#17324D]"
          >
            Les pièces les plus aimées
            <br />
            الأكثر طلبا
          </motion.h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => onViewDetails?.(product)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onViewDetails?.(product);
                  }
                }}
                className="bg-[#F8FBFA] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#075D9A] focus-visible:ring-offset-4 focus-visible:ring-offset-white"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-4 left-4 bg-[#075D9A] text-white px-3 py-1 rounded-full text-xs">
                      {product.badge}
                    </div>
                  )}

                  {/* Wishlist */}
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-300"
                    aria-label={`Ajouter aux favoris ${product.name}`}
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors duration-300 ${
                        favorites.some((favoriteId) => String(favoriteId) === String(product.id))
                          ? 'fill-[#075D9A] text-[#075D9A]'
                          : 'text-[#17324D]'
                      }`}
                    />
                  </button>

                  {/* Hover Actions */}
                  <div className="absolute inset-x-0 bottom-0 p-4 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onAddToCart(product);
                      }}
                      className="flex-1 bg-[#075D9A] text-white py-3 rounded-full hover:bg-[#B86F3B] transition-colors duration-300 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-sm">Ajouter</span>
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onQuickView?.(product);
                    }}
                    className="w-12 h-12 bg-white text-[#17324D] rounded-full hover:bg-[#E9D8BE] transition-colors duration-300 flex items-center justify-center"
                    aria-label={`Aperçu rapide ${product.name}`}
                  >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6 space-y-2">
                  <h3 className="font-serif text-lg text-[#17324D] group-hover:text-[#075D9A] transition-colors duration-300">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-serif text-[#075D9A]">
                      {product.price} DT
                    </span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 fill-[#B86F3B]"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="border-2 border-[#075D9A] text-[#075D9A] px-10 py-4 rounded-full hover:bg-[#075D9A] hover:text-white transition-all duration-300">
            Voir toute la boutique
            <br />
            عرض كل المنتجات
          </button>
        </motion.div>
      </div>
    </section>
  );
}
