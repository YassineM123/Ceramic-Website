import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Masonry from 'react-responsive-masonry';
import { X, ZoomIn, Sparkles, Filter } from 'lucide-react';

interface GalleryItem {
  id: number;
  url: string;
  title: string;
  arabicTitle: string;
  category: 'cups' | 'oil-bottles';
  categoryLabel: string;
  description: string;
}

const galleryImages: GalleryItem[] = [
  {
    id: 1,
    url: '/album/oil-bottles/oil-bottle-olives.jpeg',
    title: 'Huilier Olives Noires & Socle Assorti',
    arabicTitle: 'مزيتة زيتون سوداء مع حامل فخم',
    category: 'oil-bottles',
    categoryLabel: 'Huiliers Artisanaux',
    description: 'Faïence blanche émaillée avec branches d\'olivier et olives noires peintes à la main.',
  },
  {
    id: 2,
    url: '/album/cups/cup-red-flower-single.jpeg',
    title: 'Tasse & Sous-Tasse Fleur Rouge Éclatante',
    arabicTitle: 'فنجان وصحن بزهور حمراء متألقة',
    category: 'cups',
    categoryLabel: 'Tasses & Cafés',
    description: 'Ensemble élégant peint aux pigments rouges et verts avec finition brillante.',
  },
  {
    id: 3,
    url: '/album/oil-bottles/oil-bottle-red-chili.jpeg',
    title: 'Huilier Piment Rouge & Socle Rouge Laqué',
    arabicTitle: 'مزيتة فلفل حار وقاعدة حمراء تونسية',
    category: 'oil-bottles',
    categoryLabel: 'Huiliers Artisanaux',
    description: 'Le charme du terroir tunisien sublimé par un rouge vibrant.',
  },
  {
    id: 4,
    url: '/album/cups/cup-lemon-set.jpeg',
    title: 'Tasse Citron Solaire & Rayures Jaunes',
    arabicTitle: 'فنجان ليمون صيفي منعش',
    category: 'cups',
    categoryLabel: 'Tasses & Cafés',
    description: 'Inspiration méditerranéenne solaire pour un réveil lumineux.',
  },
  {
    id: 5,
    url: '/album/oil-bottles/oil-bottle-cherry.jpeg',
    title: 'Huilier Motif Cerises & Socle Moucheté',
    arabicTitle: 'مزيتة كرز أنيقة مع قاعدة منقطة',
    category: 'oil-bottles',
    categoryLabel: 'Huiliers Artisanaux',
    description: 'Motif fruité délicat et socle ergonomique anti-goutte.',
  },
  {
    id: 6,
    url: '/album/cups/cup-evil-eye.jpeg',
    title: 'Tasse Sculptée Nazar Œil Protecteur',
    arabicTitle: 'فنجان عين الحسود الحامي باللون الأزرق',
    category: 'cups',
    categoryLabel: 'Tasses & Cafés',
    description: 'Finition artisanale texturée et anse bleu cobalt avec symbole Nazar.',
  },
  {
    id: 7,
    url: '/album/oil-bottles/oil-bottle-green-chili.jpeg',
    title: 'Huilier Piment Vert & Socle Vert Olive',
    arabicTitle: 'مزيتة فلفل أخضر بحامل متناسق',
    category: 'oil-bottles',
    categoryLabel: 'Huiliers Artisanaux',
    description: 'Harmonie des tons vert végétal et blanc pur pour une table authentique.',
  },
  {
    id: 8,
    url: '/album/cups/cup-croissant.jpeg',
    title: 'Tasse Matin Croissant Gourmand',
    arabicTitle: 'فنجان فطور الصباح بالكرواسون',
    category: 'cups',
    categoryLabel: 'Tasses & Cafés',
    description: 'Design chaleureux pour les amateurs de viennoiseries et café au lait.',
  },
  {
    id: 9,
    url: '/album/oil-bottles/oil-bottle-lemon.jpeg',
    title: 'Huilier Citron Mûr & Socle Jaune Vif',
    arabicTitle: 'مزيتة ليمون وقاعدة صفراء براقة',
    category: 'oil-bottles',
    categoryLabel: 'Huiliers Artisanaux',
    description: 'Idéal pour conserver et servir vos huiles aromatisées au citron.',
  },
  {
    id: 10,
    url: '/album/cups/cup-teddy-bear.jpeg',
    title: 'Tasse Ourson Douceur & Cœurs',
    arabicTitle: 'فنجان دبدوب وقلوب دافئة',
    category: 'cups',
    categoryLabel: 'Tasses & Cafés',
    description: 'Peinture délicate pour apporter un sourire à chaque gorgée.',
  },
  {
    id: 11,
    url: '/album/oil-bottles/oil-bottle-blue-hearts.jpeg',
    title: 'Huilier Cœurs Bleus Style Sidi Bou Saïd',
    arabicTitle: 'مزيتة قلوب زرقاء بطابع سيدي بوسعيد',
    category: 'oil-bottles',
    categoryLabel: 'Huiliers Artisanaux',
    description: 'Alliance intemporelle du bleu azur et de la céramique blanche.',
  },
  {
    id: 12,
    url: '/album/cups/cup-collection-overview.jpeg',
    title: 'Collection Complète Tasses & Sous-Tasses',
    arabicTitle: 'التشكيلة الكاملة لفناجين الخزف اليدوي',
    category: 'cups',
    categoryLabel: 'Tasses & Cafés',
    description: 'Vue d\'ensemble de nos modèles uniques façonnés dans notre atelier.',
  },
  {
    id: 13,
    url: '/album/oil-bottles/oil-bottle-pink-hearts.jpeg',
    title: 'Huilier Rayures Roses & Petits Cœurs',
    arabicTitle: 'مزيتة قلوب وردية ناعمة',
    category: 'oil-bottles',
    categoryLabel: 'Huiliers Artisanaux',
    description: 'Douceur pastel et forme ergonomique avec bouchon naturel.',
  },
  {
    id: 14,
    url: '/album/cups/cup-kiwi.jpeg',
    title: 'Tasse Kiwi Fraîcheur & Rayures Vertes',
    arabicTitle: 'فنجان كيوي منعش ومميز',
    category: 'cups',
    categoryLabel: 'Tasses & Cafés',
    description: 'Couleurs vives et design moderne sur céramique faite main.',
  },
  {
    id: 15,
    url: '/album/cups/cup-blue-flower.jpeg',
    title: 'Tasse Fleur Bleue Délicate',
    arabicTitle: 'فنجان بزهور زرقاء ملكية',
    category: 'cups',
    categoryLabel: 'Tasses & Cafés',
    description: 'Pétales bleus aquarellés et soucoupe coordonnée.',
  },
];

export function InteriorGallery() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'cups' | 'oil-bottles'>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const filteredImages =
    activeFilter === 'all'
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeFilter);

  return (
    <section className="py-24 lg:py-32 bg-[#F8FBFA] relative" id="album-gallery">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-[#075D9A]/10 text-[#075D9A] px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Album Photo & Galerie Artisanale | ألبوم الصور الحرفية</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-serif text-[#17324D]"
          >
            Nos créations réelles faites à la main
            <br />
            <span className="text-2xl lg:text-4xl text-[#075D9A] font-normal block mt-2">
              إبداعاتنا اليدوية المصنوعة بكل شغف
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#5E6F73] max-w-2xl mx-auto"
          >
            Découvrez nos photos authentiques de tasses peintes et d'huiliers sculptés avec socle assorti.
          </motion.p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              activeFilter === 'all'
                ? 'bg-[#075D9A] text-white shadow-md shadow-[#075D9A]/20 scale-105'
                : 'bg-white text-[#17324D] hover:bg-[#EAF3F2] border border-[#17324D]/10'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Toutes les créations ({galleryImages.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('cups')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              activeFilter === 'cups'
                ? 'bg-[#075D9A] text-white shadow-md shadow-[#075D9A]/20 scale-105'
                : 'bg-white text-[#17324D] hover:bg-[#EAF3F2] border border-[#17324D]/10'
            }`}
          >
            ☕ Tasses & Cafés | الفناجين ({galleryImages.filter((i) => i.category === 'cups').length})
          </button>
          <button
            onClick={() => setActiveFilter('oil-bottles')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              activeFilter === 'oil-bottles'
                ? 'bg-[#075D9A] text-white shadow-md shadow-[#075D9A]/20 scale-105'
                : 'bg-white text-[#17324D] hover:bg-[#EAF3F2] border border-[#17324D]/10'
            }`}
          >
            🫒 Huiliers & Bouteilles | المزايت ({galleryImages.filter((i) => i.category === 'oil-bottles').length})
          </button>
        </div>

        {/* Masonry Grid */}
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Masonry columnsCount={3} gutter="24px">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 6) * 0.06 }}
                onClick={() => setSelectedItem(image)}
                className="group cursor-pointer relative overflow-hidden rounded-3xl bg-white shadow-md hover:shadow-2xl transition-all duration-500 mb-6 border border-black/5"
              >
                <div className="overflow-hidden bg-[#F0F4F4] relative">
                  <img
                    src={image.url}
                    alt={image.title}
                    loading="lazy"
                    className="w-full h-auto object-cover group-hover:scale-108 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#17324D] text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                    {image.categoryLabel}
                  </div>
                  <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-[#075D9A] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#17324D]/95 via-[#17324D]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-6 text-white">
                  <span className="text-xs uppercase tracking-wider text-[#E9D8BE] mb-1 font-medium">
                    {image.arabicTitle}
                  </span>
                  <h3 className="text-lg font-serif leading-snug">{image.title}</h3>
                  <p className="text-xs text-white/80 mt-1 line-clamp-2">{image.description}</p>
                </div>
              </motion.div>
            ))}
          </Masonry>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 lg:p-10"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2"
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="bg-[#17324D]/5 flex items-center justify-center p-4 max-h-[75vh]">
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  className="max-h-[68vh] w-auto object-contain rounded-2xl shadow-md"
                />
              </div>

              <div className="p-8 flex flex-col justify-between">
                <div>
                  <span className="inline-block bg-[#075D9A]/10 text-[#075D9A] text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    {selectedItem.categoryLabel}
                  </span>
                  <h3 className="text-2xl font-serif text-[#17324D] mb-2">{selectedItem.title}</h3>
                  <p className="text-[#075D9A] text-lg font-serif mb-4">{selectedItem.arabicTitle}</p>
                  <p className="text-[#5E6F73] text-sm leading-relaxed mb-6">{selectedItem.description}</p>
                  <div className="space-y-2 border-t border-gray-100 pt-4 text-xs text-[#5E6F73]">
                    <div className="flex justify-between py-1">
                      <span>Matière :</span>
                      <strong className="text-[#17324D]">Faïence / Céramique artisanale</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Technique :</span>
                      <strong className="text-[#17324D]">Façonnage & Peinture à la main</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Origine :</span>
                      <strong className="text-[#17324D]">Tunisie (100% Artisanal)</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="w-full bg-[#075D9A] text-white py-3.5 rounded-full font-medium hover:bg-[#B86F3B] transition-colors"
                  >
                    Fermer la vue
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
