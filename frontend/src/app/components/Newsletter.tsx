import { Mail, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { subscribeNewsletter, type StorefrontContent } from '../services/storefrontApi';

interface NewsletterProps {
  content?: StorefrontContent['homepage'];
}

export function Newsletter({ content }: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await subscribeNewsletter(email);
      setStatus('Inscription confirmee.');
      setEmail('');
    } catch (_error) {
      setStatus("Impossible d'enregistrer l'inscription pour le moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#F8FBFA] to-[#E9D8BE] rounded-3xl p-12 lg:p-20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#075D9A]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#B86F3B]/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-gradient-to-br from-[#075D9A] to-[#B86F3B] rounded-2xl flex items-center justify-center mx-auto"
            >
              <Mail className="w-10 h-10 text-white" />
            </motion.div>

            <div className="space-y-4">
              <h2 className="text-4xl lg:text-6xl font-serif text-[#17324D]">
                {content?.newsletterTitle || 'Recevez nos nouvelles collections'}
              </h2>
              <p className="text-lg lg:text-xl text-[#5E6F73] max-w-2xl mx-auto leading-relaxed">
                {content?.newsletterSubtitle ||
                  'Avant-premieres, coffrets cadeaux et inspirations decoration maison directement dans votre boite mail.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  required
                  className="flex-1 px-6 py-4 rounded-full bg-white border-2 border-transparent focus:border-[#075D9A] outline-none transition-colors duration-300 text-[#17324D] placeholder:text-[#5E6F73]/50"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#075D9A] text-white px-8 py-4 rounded-full hover:bg-[#B86F3B] transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap group disabled:opacity-60"
                >
                  <span>{isSubmitting ? 'Envoi...' : "S'inscrire"}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </form>

            {status && <p className="text-sm text-[#075D9A]">{status}</p>}

            <p className="text-sm text-[#5E6F73]/70">
              Nous respectons votre confidentialite. Desinscription possible a tout moment.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              {['Avant-premieres', 'Offres privees', "Histoires d'atelier"].map((label, index) => (
                <div key={label} className="space-y-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="text-sm text-[#17324D]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
