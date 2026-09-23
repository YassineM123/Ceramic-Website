import { motion } from 'motion/react';
import { Heart, Users, Award, Globe } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Amour du geste | حب الحرفة',
    description: 'Nous valorisons le travail manuel, les textures naturelles et les pièces qui gardent une présence humaine.',
  },
  {
    icon: Users,
    title: 'Artisanat local | حرفية محلية',
    description: 'Nous collaborons avec des savoir-faire tunisiens et mettons en avant une production responsable.',
  },
  {
    icon: Award,
    title: 'Exigence | جودة',
    description: 'Chaque pièce est sélectionnée pour sa finition, son équilibre et sa durabilité.',
  },
  {
    icon: Globe,
    title: 'Sobriété | بساطة واعية',
    description: 'Nous privilégions des collections utiles, durables et produites en quantités maîtrisées.',
  },
];

const milestones = [
  { year: 'Idée', title: 'Une marque tunisienne moderne', description: 'Créer une maison de céramique qui relie artisanat local et goût contemporain' },
  { year: 'Atelier', title: 'Des petites séries choisies', description: 'Développer des pièces utiles, belles et adaptées aux intérieurs tunisiens' },
  { year: 'Boutique', title: 'Une expérience simple', description: 'Rendre la céramique artisanale accessible avec livraison partout en Tunisie' },
  { year: 'Demain', title: 'Plus de collections locales', description: 'Continuer à valoriser le fait main, les cadeaux premium et l\'art de la table' },
];

const team = [
  {
    name: 'Artisans partenaires',
    role: 'Façonnage et finition',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    bio: 'Des mains tunisiennes qui donnent à chaque pièce sa forme, sa texture et son caractère',
  },
  {
    name: 'Équipe design',
    role: 'Collections et direction visuelle',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    bio: 'Une sélection pensée pour unir artisanat tunisien, maison moderne et élégance discrète',
  },
  {
    name: 'Service client',
    role: 'Conseil et suivi',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    bio: 'Une équipe disponible pour accompagner les commandes, les cadeaux et la livraison',
  },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FBFA] pt-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxhcnRpc2FuJTIwcG90dGVyeSUyMGhhbmRzJTIwY3JhZnRpbmd8ZW58MXx8fHwxNzgwNDQxMjEwfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Artisan façonnant une pièce en céramique"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#17324D]/80 via-[#17324D]/40 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white space-y-4 px-6"
          >
            <h1 className="text-5xl lg:text-7xl font-serif">
              Notre histoire
              <br />
              حكايتنا
            </h1>
            <p className="text-xl lg:text-2xl max-w-3xl mx-auto">
              Une marque tunisienne de céramique artisanale, élégante et contemporaine.
              <br />
              خزف تونسي يدوي بروح عصرية.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mission Statement */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[#075D9A] uppercase tracking-widest text-sm"
            >
              Notre mission
              <br />
              مهمتنا
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-serif text-[#17324D] leading-tight"
            >
              Valoriser l'artisanat tunisien dans la maison moderne
              <br />
              إبراز الحرفة التونسية في البيت العصري
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-[#5E6F73] leading-relaxed"
            >
              Le Monde Céramique propose des pièces faites main pour l'art de la table, la décoration maison, les cadeaux de mariage et les moments de Ramadan. Notre approche est simple: préserver la chaleur du geste artisanal tout en créant des collections raffinées, utiles et faciles à intégrer dans un intérieur tunisien contemporain.
              <br />
              نقدم قطعا خزفية يدوية للمائدة والديكور والهدايا، تجمع بين دفء الحرفة التونسية وأناقة التصميم الحديث.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16 space-y-4">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[#075D9A] uppercase tracking-widest text-sm"
            >
              Nos valeurs
              <br />
              قيمنا
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-serif text-[#17324D]"
            >
              Ce qui guide chaque collection
              <br />
              ما يوجه كل مجموعة
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center space-y-4"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-[#075D9A] to-[#B86F3B] rounded-2xl flex items-center justify-center mx-auto">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-serif text-[#17324D]">{value.title}</h3>
                  <p className="text-[#5E6F73]">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Heritage Section */}
      <section className="py-24 lg:py-32 bg-[#F8FBFA]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <p className="text-[#075D9A] uppercase tracking-widest text-sm">
                Artisanat tunisien
                <br />
                حرفة تونسية
              </p>
              <h2 className="text-4xl lg:text-5xl font-serif text-[#17324D]">
                Héritage local, usage contemporain
                <br />
                تراث محلي لاستعمال عصري
              </h2>
              <p className="text-lg text-[#5E6F73] leading-relaxed">
                La céramique tunisienne porte une culture du geste, de la terre et de la table. Nous nous inspirons de cette richesse pour créer des produits sobres, chaleureux et premium.
              </p>
              <p className="text-lg text-[#5E6F73] leading-relaxed">
                Chaque collection est pensée pour accompagner la vraie vie: repas en famille, réception, coin café, décoration d'entrée, cadeau de mariage ou table de Ramadan.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <img
                src="https://images.unsplash.com/photo-1590605095243-072811dbe64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxhcnRpc2FuJTIwcG90dGVyeSUyMGhhbmRzJTIwY3JhZnRpbmd8ZW58MXx8fHwxNzgwNDQxMjEwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Mains d'artisan"
                className="rounded-2xl shadow-xl aspect-square object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1620140036708-455ed5c0426a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxhcnRpc2FuJTIwcG90dGVyeSUyMGhhbmRzJTIwY3JhZnRpbmd8ZW58MXx8fHwxNzgwNDQxMjEwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Façonnage de céramique"
                className="rounded-2xl shadow-xl aspect-square object-cover mt-12"
              />
              <img
                src="https://images.unsplash.com/photo-1609881583302-61548332039c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxhcnRpc2FuJTIwcG90dGVyeSUyMGhhbmRzJTIwY3JhZnRpbmd8ZW58MXx8fHwxNzgwNDQxMjEwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Tour de potier"
                className="rounded-2xl shadow-xl aspect-square object-cover -mt-6"
              />
              <img
                src="https://images.unsplash.com/photo-1589051088132-06f36a22012a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxhcnRpc2FuJTIwcG90dGVyeSUyMGhhbmRzJTIwY3JhZnRpbmd8ZW58MXx8fHwxNzgwNDQxMjEwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Bol en céramique"
                className="rounded-2xl shadow-xl aspect-square object-cover mt-6"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16 space-y-4">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[#075D9A] uppercase tracking-widest text-sm"
            >
              Notre démarche
              <br />
              مسارنا
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-serif text-[#17324D]"
            >
              Une marque construite avec patience
              <br />
              علامة تنمو بصبر
            </motion.h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-8 mb-12 last:mb-0"
              >
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#075D9A] to-[#B86F3B] rounded-full flex items-center justify-center">
                    <span className="text-white font-serif text-xl">{milestone.year}</span>
                  </div>
                </div>
                <div className="flex-1 pt-4">
                  <h3 className="text-2xl font-serif text-[#17324D] mb-2">{milestone.title}</h3>
                  <p className="text-lg text-[#5E6F73]">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 lg:py-32 bg-[#F8FBFA]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16 space-y-4">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[#075D9A] uppercase tracking-widest text-sm"
            >
              Les personnes derrière la marque
              <br />
              من يقف وراء العلامة
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-serif text-[#17324D]"
            >
              Un réseau de savoir-faire
              <br />
              شبكة من الخبرات
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h3 className="text-2xl font-serif text-[#17324D] mb-2">{member.name}</h3>
                    <div className="text-[#075D9A] mb-3">{member.role}</div>
                    <p className="text-[#5E6F73]">{member.bio}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-r from-[#075D9A] to-[#B86F3B] text-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-4xl lg:text-6xl font-serif">
              Découvrez notre céramique artisanale
              <br />
              اكتشف خزفنا اليدوي
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Des pièces pour la table, les cadeaux, Ramadan et la décoration maison.
              <br />
              قطع للمائدة والهدايا ورمضان والديكور.
            </p>
            <button className="bg-white text-[#075D9A] px-10 py-4 rounded-full hover:bg-[#F8FBFA] transition-colors duration-300 font-medium text-lg">
              Voir la boutique
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
