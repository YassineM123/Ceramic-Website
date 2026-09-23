import { motion } from 'motion/react';

const craftingSteps = [
  {
    id: 1,
    title: 'Façonnage | التشكيل',
    description: 'Chaque pièce est façonnée à la main avec patience, équilibre et précision. كل قطعة تتشكل يدويا بعناية.',
    image: 'https://images.unsplash.com/photo-1590605095243-072811dbe64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxhcnRpc2FuJTIwcG90dGVyeSUyMGhhbmRzJTIwY3JhZnRpbmd8ZW58MXx8fHwxNzgwNDQxMjEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    title: 'Détails | التفاصيل',
    description: 'Les bords, textures et volumes sont travaillés pour garder une âme artisanale. التفاصيل تمنح كل قطعة شخصيتها.',
    image: 'https://images.unsplash.com/photo-1620140036708-455ed5c0426a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxhcnRpc2FuJTIwcG90dGVyeSUyMGhhbmRzJTIwY3JhZnRpbmd8ZW58MXx8fHwxNzgwNDQxMjEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    title: 'Cuisson | الحرق',
    description: 'La cuisson révèle la solidité, la couleur et la profondeur de l\'émail. النار تثبت الجمال والمتانة.',
    image: 'https://images.unsplash.com/photo-1609881583302-61548332039c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxhcnRpc2FuJTIwcG90dGVyeSUyMGhhbmRzJTIwY3JhZnRpbmd8ZW58MXx8fHwxNzgwNDQxMjEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 4,
    title: 'Finition | اللمسة الأخيرة',
    description: 'Les émaux sont appliqués avec soin pour une finition douce et durable. اللمسة الأخيرة تجعل القطعة جاهزة للبيت.',
    image: 'https://images.unsplash.com/photo-1589051088132-06f36a22012a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxhcnRpc2FuJTIwcG90dGVyeSUyMGhhbmRzJTIwY3JhZnRpbmd8ZW58MXx8fHwxNzgwNDQxMjEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export function Craftsmanship() {
  return (
    <section className="overflow-hidden py-24 lg:py-32 bg-[#F8FBFA]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-[#075D9A] uppercase tracking-widest text-sm">
              Fabrication artisanale
              <br />
              صناعة يدوية تونسية
            </p>
            <h2 className="text-4xl lg:text-6xl font-serif text-[#17324D]">
              Le geste tunisien, la ligne contemporaine
              <br />
              حرفية تونسية بروح عصرية
            </h2>
            <p className="text-lg text-[#5E6F73] leading-relaxed">
              Nos céramiques sont façonnées en petites séries, avec des matières naturelles et un regard moderne sur l'artisanat tunisien. Chaque assiette, vase ou service garde la trace de la main qui l'a créé.
              <br />
              قطعنا تصنع بكميات محدودة وتحمل دفء اليد التونسية وأناقة التصميم المعاصر.
            </p>
            <div className="pt-4">
              <button className="bg-[#075D9A] text-white px-8 py-4 rounded-full hover:bg-[#B86F3B] transition-colors duration-300">
                Découvrir notre histoire
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxhcnRpc2FuJTIwcG90dGVyeSUyMGhhbmRzJTIwY3JhZnRpbmd8ZW58MXx8fHwxNzgwNDQxMjEwfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Artisan façonnant une pièce en céramique"
              className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
            />
            <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-2xl shadow-xl">
              <div className="text-4xl font-serif text-[#075D9A] mb-2">100%</div>
              <div className="text-[#5E6F73]">Fait main | يدوي</div>
            </div>
          </motion.div>
        </div>

        {/* Crafting Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {craftingSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative mb-6 overflow-hidden rounded-2xl aspect-square">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#17324D]/60 to-transparent" />
                <div className="absolute top-6 left-6 w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xl font-serif text-[#075D9A]">{step.id}</span>
                </div>
              </div>
              <h3 className="text-xl font-serif text-[#17324D] mb-2">{step.title}</h3>
              <p className="text-[#5E6F73] text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
