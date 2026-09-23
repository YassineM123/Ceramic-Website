import { Instagram } from 'lucide-react';
import { motion } from 'motion/react';

const instagramPosts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1631125915973-e0d155a14e4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxoYW5kbWFkZSUyMHBvdHRlcnklMjBjZXJhbWljJTIwdmFzZXxlbnwxfHx8fDE3ODA0NDEyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 342,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1495100497150-fe209c585f50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxjb2ZmZWUlMjBtdWclMjBjZXJhbWljJTIwYnJlYWtmYXN0fGVufDF8fHx8MTc4MDQ0MTIwOXww&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 289,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1462015679637-c0c320830925?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxsdXh1cnklMjBjZXJhbWljJTIwdGFibGV3YXJlJTIwZGluaW5nfGVufDF8fHx8MTc4MDQ0MTIwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 421,
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1677761640321-b80251be00ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxoYW5kbWFkZSUyMHBvdHRlcnklMjBjZXJhbWljJTIwdmFzZXxlbnwxfHx8fDE3ODA0NDEyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 518,
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1586904118338-8ce35f4417dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxMHx8Y29mZmVlJTIwbXVnJTIwY2VyYW1pYyUyMGJyZWFrZmFzdHxlbnwxfHx8fDE3ODA0NDEyMTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 395,
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1633000116322-d7f5cb7d3ebb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxoYW5kbWFkZSUyMHBvdHRlcnklMjBjZXJhbWljJTIwdmFzZXxlbnwxfHx8fDE3ODA0NDEyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 267,
  },
];

export function InstagramShowcase() {
  return (
    <section className="py-24 lg:py-32 bg-[#F8FBFA]">
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
            <p className="text-[#075D9A] uppercase tracking-widest text-sm">
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
            Inspirations table, décoration maison et coulisses de notre atelier.
            <br />
            إلهام للمائدة والديكور ولمحات من الحرفة.
          </motion.p>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post, index) => (
            <motion.a
              key={post.id}
              href="#"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative aspect-square overflow-hidden rounded-xl"
            >
              <img
                src={post.image}
                alt={`Publication Le Monde Céramique ${post.id}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17324D]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex items-center gap-2 text-white">
                  <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="font-medium">{post.likes}</span>
                </div>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Instagram className="w-6 h-6 text-white" />
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
          <button className="bg-[#075D9A] text-white px-10 py-4 rounded-full hover:bg-[#B86F3B] transition-colors duration-300 flex items-center gap-3 mx-auto">
            <Instagram className="w-5 h-5" />
            <span>Suivre @lemonde_ceramique</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
