import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { StorefrontCollection, StorefrontContent } from '../services/storefrontApi';

const fallbackCollections: StorefrontCollection[] = [
  {
    id: 'tableware',
    title: 'Art de la table',
    description: 'Vaisselle artisanale pour recevoir avec elegance',
    image:
      'https://images.unsplash.com/photo-1762534729099-fbe059aaf1d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
    itemCountLabel: '24 pieces',
  },
  {
    id: 'decor',
    title: 'Decoration maison',
    description: 'Pieces sculpturales pour salons et entrees',
    image:
      'https://images.unsplash.com/photo-1526198049595-f32cde2a219d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
    itemCountLabel: '15 pieces',
  },
  {
    id: 'gifts',
    title: 'Coffrets cadeaux',
    description: 'Idees premium pour mariages et nouvelles maisons',
    image:
      'https://images.unsplash.com/photo-1631125916276-69bcd14e3980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
    itemCountLabel: '12 coffrets',
  },
];

interface FeaturedCollectionsProps {
  content?: StorefrontContent['homepage'];
  collections?: StorefrontCollection[];
  onOpenProduct: (productId: string | number) => void;
}

export function FeaturedCollections({ content, collections, onOpenProduct }: FeaturedCollectionsProps) {
  const visibleCollections = collections?.length ? collections : fallbackCollections;

  return (
    <section className="py-24 lg:py-32 bg-[#F8FBFA]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16 space-y-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#075D9A] uppercase tracking-widest text-sm"
          >
            {content?.collectionEyebrow || 'Decouvrez nos collections'}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-serif text-[#17324D]"
          >
            {content?.collectionTitle || 'Ceramique artisanale pour chaque moment'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#5E6F73] max-w-2xl mx-auto"
          >
            {content?.collectionSubtitle ||
              "Des collections pensees pour l'art de la table, la decoration maison et les cadeaux elegants."}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleCollections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              role={collection.productId ? 'button' : undefined}
              tabIndex={collection.productId ? 0 : undefined}
              onClick={() => {
                if (collection.productId) onOpenProduct(collection.productId);
              }}
              onKeyDown={(event) => {
                if (!collection.productId) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpenProduct(collection.productId);
                }
              }}
              className={`group ${collection.productId ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#075D9A] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F8FBFA] rounded-3xl' : ''}`}
            >
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500">
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#17324D]/80 via-[#17324D]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="mb-2 text-sm text-[#E9D8BE] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {collection.itemCountLabel || collection.items}
                  </div>
                  <h3 className="text-2xl font-serif mb-2">{collection.title}</h3>
                  <p className="text-sm text-[#E9D8BE] mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {collection.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span>Voir la collection</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
