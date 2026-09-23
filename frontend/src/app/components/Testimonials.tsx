import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';
import { useState } from 'react';
import type { StorefrontReview } from '../services/storefrontApi';

const testimonials = [
  {
    id: 1,
    name: 'Sarra Ben Youssef',
    location: 'Tunis',
    rating: 5,
    text: 'J\'ai commandé un service à café pour ma nouvelle maison. La finition est très élégante et l\'emballage était impeccable.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  },
  {
    id: 2,
    name: 'Mouna Dridi',
    location: 'Sousse',
    rating: 5,
    text: 'Le coffret cadeau a beaucoup plu à ma soeur pour son mariage. Simple, chic et vraiment différent des cadeaux classiques.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  },
  {
    id: 3,
    name: 'Youssef Karray',
    location: 'Sfax',
    rating: 5,
    text: 'Les assiettes donnent tout de suite une autre présence à la table. On sent le travail artisanal sans perdre le côté moderne.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
  },
  {
    id: 4,
    name: 'Nour Hammami',
    location: 'Nabeul',
    rating: 5,
    text: 'Très belle céramique tunisienne. Livraison rapide à Hammamet et service client sérieux.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  },
];

interface TestimonialsProps {
  reviews?: StorefrontReview[];
}

export function Testimonials({ reviews }: TestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleTestimonials = reviews?.length ? reviews : testimonials;
  const safeActiveIndex = Math.min(activeIndex, visibleTestimonials.length - 1);

  return (
    <section className="overflow-hidden py-24 lg:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#075D9A] uppercase tracking-widest text-sm"
          >
            Avis clients
            <br />
            آراء الحرفاء
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-serif text-[#17324D]"
          >
            Ils parlent de Le Monde Céramique
            <br />
            حرفاؤنا يحكون تجربتهم
          </motion.h2>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-5xl mx-auto">
          <div className="overflow-hidden">
            <motion.div
              animate={{ x: `-${safeActiveIndex * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex"
            >
              {visibleTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="min-w-full px-4">
                  <div className="bg-[#F8FBFA] rounded-3xl p-12 lg:p-16 relative">
                    <Quote className="absolute top-8 right-8 w-16 h-16 text-[#075D9A] opacity-20" />

                    <div className="flex flex-col items-center text-center space-y-6">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        loading="lazy"
                        decoding="async"
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                      />

                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-[#B86F3B] text-[#B86F3B]" />
                        ))}
                      </div>

                      <p className="text-xl lg:text-2xl text-[#17324D] leading-relaxed max-w-3xl font-light italic">
                        « {testimonial.text} »
                      </p>

                      <div>
                        <div className="font-serif text-xl text-[#17324D]">{testimonial.name}</div>
                        <div className="text-[#5E6F73]">{testimonial.location}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {visibleTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                aria-label={`Afficher l'avis client ${index + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  index === activeIndex
                    ? 'w-12 h-3 bg-[#075D9A]'
                    : 'w-3 h-3 bg-[#E9D8BE] hover:bg-[#075D9A]/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="text-4xl font-serif text-[#075D9A] mb-2">4.9</div>
            <div className="text-sm text-[#5E6F73]">Note moyenne</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-serif text-[#075D9A] mb-2">2,500+</div>
            <div className="text-sm text-[#5E6F73]">Clients satisfaits</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-serif text-[#075D9A] mb-2">98%</div>
            <div className="text-sm text-[#5E6F73]">Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-serif text-[#075D9A] mb-2">1,800+</div>
            <div className="text-sm text-[#5E6F73]">Avis cinq étoiles</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
