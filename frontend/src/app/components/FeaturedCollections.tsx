import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { StorefrontCollection, StorefrontContent } from '../services/storefrontApi';

const fallbackCollections: StorefrontCollection[] = [
  {
    id: 'cups-collection',
    title: 'Collection Tasses & Cafés | فناجين وقهوة',
    description: 'Tasses & sous-tasses façonnées et peintes à la main en séries exclusives',
    image: '/album/cups/cup-collection-overview.jpeg',
    itemCountLabel: '10 créations exclusives',
  },
  {
    id: 'oil-bottles-collection',
    title: 'Collection Huiliers & Art de la Table | مزايت وفن المائدة',
    description: 'Bouteilles d\'huile d\'olive artisanales avec socles assortis pour tables raffinées',
    image: '/album/oil-bottles/oil-bottle-olives.jpeg',
    itemCountLabel: '9 modèles artisanaux',
  },
  {
    id: 'mediterranean-gifts',
    title: 'Coffrets & Inspirations Cadeaux | هدايا راقية',
    description: 'Cadeaux uniques aux motifs tunisiens et méditerranéens prêts à offrir',
    image: '/album/cups/cup-lemon-set.jpeg',
    itemCountLabel: 'Coffrets disponibles',
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
            className="text-[#075D9A] uppercase tracking-widest text-sm font-medium"
          >
            {content?.collectionEyebrow || 'Découvrez nos collections artisanales | تشكيلاتنا الحرفية'}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-serif text-[#17324D]"
          >
            {content?.collectionTitle || 'Céramique artisanale faite avec passion'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#5E6F73] max-w-2xl mx-auto"
          >
            {content?.collectionSubtitle ||
              "Des créations pensées pour l'art de la table, le plaisir du café et les cadeaux raffinés."}
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
                <div className="aspect-[4/5] overflow-hidden bg-[#F0F4F4]">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#17324D]/90 via-[#17324D]/30 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="mb-2 text-xs uppercase tracking-wider text-[#E9D8BE] font-medium">
                    {collection.itemCountLabel || collection.items}
                  </div>
                  <h3 className="text-2xl font-serif mb-2 leading-tight">{collection.title}</h3>
                  <p className="text-sm text-[#E9D8BE]/90 mb-4 line-clamp-2">
                    {collection.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-white group-hover:text-[#E9D8BE] transition-colors duration-300">
                    <span>Explorer la collection</span>
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
