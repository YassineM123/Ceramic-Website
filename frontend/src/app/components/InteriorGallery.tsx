import { motion } from 'motion/react';
import Masonry from 'react-responsive-masonry';

const galleryImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1762534729099-fbe059aaf1d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjZXJhbWljJTIwdGFibGV3YXJlJTIwZGluaW5nfGVufDF8fHx8MTc4MDQ0MTIwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Table élégante',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1516390118834-21602d501886?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBtdWclMjBjZXJhbWljJTIwYnJlYWtmYXN0fGVufDF8fHx8MTc4MDQ0MTIwOXww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Café du matin',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxoYW5kbWFkZSUyMHBvdHRlcnklMjBjZXJhbWljJTIwdmFzZXxlbnwxfHx8fDE3ODA0NDEyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Vases décoratifs',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1593854989775-ae5e4d9e49e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBjZXJhbWljJTIwdGFibGV3YXJlJTIwZGluaW5nfGVufDF8fHx8MTc4MDQ0MTIwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Présentation raffinée',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1610635967007-34ebbd66f64d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxjb2ZmZWUlMjBtdWclMjBjZXJhbWljJTIwYnJlYWtmYXN0fGVufDF8fHx8MTc4MDQ0MTIwOXww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Table du petit déjeuner',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1631125916276-69bcd14e3980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxoYW5kbWFkZSUyMHBvdHRlcnklMjBjZXJhbWljJTIwdmFzZXxlbnwxfHx8fDE3ODA0NDEyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Céramique artisanale',
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1738408660942-78dbf4985c3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBjZXJhbWljJTIwdGFibGV3YXJlJTIwZGluaW5nfGVufDF8fHx8MTc4MDQ0MTIwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Art de la table',
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1689180822961-01ed06c40d20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw5fHxsdXh1cnklMjBjZXJhbWljJTIwdGFibGV3YXJlJTIwZGluaW5nfGVufDF8fHx8MTc4MDQ0MTIwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Service de table',
  },
];

export function InteriorGallery() {
  return (
    <section className="py-24 lg:py-32 bg-[#F8FBFA]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#075D9A] uppercase tracking-widest text-sm"
          >
            Inspiration maison
            <br />
            إلهام للبيت
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-serif text-[#17324D]"
          >
            La céramique dans les intérieurs tunisiens
            <br />
            خزف يزين بيوتا تونسية
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#5E6F73] max-w-2xl mx-auto"
          >
            Des idées pour dresser une table, décorer un salon ou composer un cadeau élégant.
            <br />
            أفكار للمائدة والديكور والهدايا الراقية.
          </motion.p>
        </div>

        {/* Masonry Gallery */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Masonry columnsCount={3} gutter="24px">
            {galleryImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer relative overflow-hidden rounded-2xl"
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-auto group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#17324D]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-white text-xl font-serif">{image.title}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </Masonry>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="border-2 border-[#075D9A] text-[#075D9A] px-10 py-4 rounded-full hover:bg-[#075D9A] hover:text-white transition-all duration-300">
            Voir plus d'inspiration
            <br />
            شاهد المزيد
          </button>
        </motion.div>
      </div>
    </section>
  );
}
