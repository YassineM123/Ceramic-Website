import { Instagram } from 'lucide-react';
import { motion } from 'motion/react';

const instagramPosts = [
  {
    id: 1,
    image: '/album/oil-bottles/oil-bottle-olives.jpeg',
    likes: 428,
    tag: '#lemonde_ceramique',
  },
  {
    id: 2,
    image: '/album/cups/cup-red-flower-single.jpeg',
    likes: 512,
    tag: '#artisanat_tunisien',
  },
  {
    id: 3,
    image: '/album/oil-bottles/oil-bottle-red-chili.jpeg',
    likes: 389,
    tag: '#poterie_fait_main',
  },
  {
    id: 4,
    image: '/album/cups/cup-lemon-set.jpeg',
    likes: 645,
    tag: '#ceramique_art',
  },
  {
    id: 5,
    image: '/album/oil-bottles/oil-bottle-cherry.jpeg',
    likes: 377,
    tag: '#fait_main_tunisie',
  },
  {
    id: 6,
    image: '/album/cups/cup-evil-eye.jpeg',
    likes: 720,
    tag: '#nazar_ceramics',
  },
];

export function InstagramShowcase() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3"
          >
            <Instagram className="w-8 h-8 text-[#075D9A]" />
            <p className="text-[#075D9A] uppercase tracking-widest text-sm font-semibold">
              Suivez-nous sur Instagram
              <br />
              تابعونا على إنستغرام
            </p>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-serif text-[#17324D]"
          >
            @lemonde_ceramique
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#5E6F73] max-w-2xl mx-auto"
          >
            Inspirations de table, nouvelles créations en atelier et commandes personnalisées.
            <br />
            إلهام للمائدة والديكور ولمحات من الحرفة التونسية.
          </motion.p>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post, index) => (
            <motion.a
              key={post.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-[#F0F4F4] shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <img
                src={post.image}
                alt={`Publication Le Monde Céramique ${post.id}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17324D]/85 via-[#17324D]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                <div className="flex items-center gap-2 text-white font-medium mb-1">
                  <svg className="w-5 h-5 fill-red-400 stroke-red-400" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span>{post.likes}</span>
                </div>
                <span className="text-[11px] text-[#E9D8BE]">{post.tag}</span>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Instagram className="w-5 h-5 text-white drop-shadow" />
              </div>
            </motion.a>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#075D9A] text-white px-10 py-4 rounded-full hover:bg-[#B86F3B] transition-colors duration-300 shadow-lg shadow-[#075D9A]/20"
          >
            <Instagram className="w-5 h-5" />
            <span>Suivre @lemonde_ceramique sur Instagram</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
