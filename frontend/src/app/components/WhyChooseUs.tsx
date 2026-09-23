import { Hand, Leaf, Truck, Award, Sparkles, Headphones } from 'lucide-react';
import { motion } from 'motion/react';

const features = [
  {
    icon: Hand,
    title: 'Fait main | صناعة يدوية',
    description: 'Chaque pièce est travaillée par des artisans tunisiens avec soin et précision. كل قطعة مصنوعة يدويا بعناية.',
  },
  {
    icon: Leaf,
    title: 'Matières naturelles | مواد طبيعية',
    description: 'Argile sélectionnée et émaux doux pour une céramique durable et agréable au quotidien. مواد مختارة لاستعمال يدوم.',
  },
  {
    icon: Truck,
    title: 'Livraison en Tunisie | توصيل في تونس',
    description: 'Livraison partout en Tunisie avec emballage renforcé pour protéger chaque commande. توصيل آمن إلى جميع الولايات.',
  },
  {
    icon: Award,
    title: 'Qualité premium | جودة عالية',
    description: 'Chaque article est contrôlé avant expédition pour garantir finition, stabilité et beauté. نراقب الجودة قبل الإرسال.',
  },
  {
    icon: Sparkles,
    title: 'Designs exclusifs | تصاميم خاصة',
    description: 'Collections modernes inspirées par l\'artisanat tunisien, produites en petites séries. تصاميم محدودة وأنيقة.',
  },
  {
    icon: Headphones,
    title: 'Service attentionné | خدمة قريبة',
    description: 'Conseil, suivi et assistance pour choisir la bonne pièce ou le bon coffret. نساعدك في اختيار الهدية المناسبة.',
  },
];

export function WhyChooseUs() {
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
            Pourquoi nous choisir
            <br />
            لماذا تختارنا
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-serif text-[#17324D]"
          >
            Élégance, confiance et artisanat tunisien
            <br />
            أناقة وثقة وحرفة تونسية
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#5E6F73] max-w-2xl mx-auto"
          >
            Une expérience d'achat simple, premium et locale, pensée pour les maisons tunisiennes.
            <br />
            تجربة شراء راقية ومناسبة للبيت التونسي.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-[#F8FBFA] p-8 rounded-2xl hover:shadow-xl transition-all duration-500 hover:-translate-y-2 h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#075D9A] to-[#B86F3B] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-serif text-[#17324D] mb-3">{feature.title}</h3>
                  <p className="text-[#5E6F73] leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-r from-[#075D9A] to-[#B86F3B] rounded-3xl p-12 lg:p-16 text-center text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h3 className="text-3xl lg:text-5xl font-serif">
              Offrez à votre intérieur une pièce qui a une âme
              <br />
              امنح بيتك قطعة بروح
            </h3>
            <p className="text-lg text-white/90">
              Découvrez notre sélection de céramique artisanale, vaisselle et décoration maison avec livraison partout en Tunisie.
              <br />
              اكتشف خزفا يدويا وديكورا راقيا مع توصيل لكل تونس.
            </p>
            <button className="bg-white text-[#075D9A] px-10 py-4 rounded-full hover:bg-[#F8FBFA] transition-colors duration-300 font-medium">
              Découvrir la boutique
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
