import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { submitContactMessage, type StorefrontContent } from '../services/storefrontApi';

interface ContactPageProps {
  contact?: StorefrontContent['contact'];
}

export function ContactPage({ contact }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await submitContactMessage(formData);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (_error) {
      setError("Impossible d'envoyer le message pour le moment.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FBFA] pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#E9D8BE] to-[#F8FBFA] py-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-5xl lg:text-6xl font-serif text-[#17324D]">
              Contact
              <br />
              تواصل معنا
            </h1>
            <p className="text-lg text-[#5E6F73] max-w-2xl mx-auto">
              Une question sur une commande, un cadeau ou une collection? Notre équipe vous répond avec attention.
              <br />
              لديك سؤال حول طلب أو هدية؟ نحن هنا لمساعدتك.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16">
        <div className="grid lg:grid-cols-3 gap-12 mb-16">
          {/* Contact Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#075D9A] to-[#B86F3B] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-serif text-[#17324D] mb-3">Téléphone</h3>
            <p className="text-[#5E6F73] mb-4">Du lundi au vendredi</p>
            <a href="tel:+216XXXXXXXX" className="text-[#075D9A] hover:underline text-lg">
              {contact?.phone || '+216 XX XXX XXX'}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#075D9A] to-[#B86F3B] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-serif text-[#17324D] mb-3">Email</h3>
            <p className="text-[#5E6F73] mb-4">Réponse dans les meilleurs délais</p>
            <a href="mailto:contact@lemondeceramique.tn" className="text-[#075D9A] hover:underline">
              {contact?.email || 'contact@lemondeceramique.tn'}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#075D9A] to-[#B86F3B] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-serif text-[#17324D] mb-3">WhatsApp</h3>
            <p className="text-[#5E6F73] mb-4">Conseil rapide avant commande</p>
            <a href="https://wa.me/216XXXXXXXX" className="text-[#075D9A] hover:underline text-lg">
              {contact?.whatsapp || contact?.phone || '+216 XX XXX XXX'}
            </a>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl"
          >
            <h2 className="text-3xl font-serif text-[#17324D] mb-2">Envoyez-nous un message</h2>
            <p className="text-[#5E6F73] mb-8">
              Remplissez le formulaire et nous vous répondrons au plus vite.
            </p>

            {isSubmitted && (
              <div className="mb-6 rounded-2xl bg-[#F8FBFA] border border-[#075D9A]/20 px-5 py-4 text-[#5E6F73]">
                Message reçu. Notre équipe vous répondra rapidement.
              </div>
            )}
            {error && (
              <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#17324D] mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-6 py-3 rounded-full bg-[#F8FBFA] border-2 border-transparent focus:border-[#075D9A] outline-none transition-colors duration-300"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#17324D] mb-2">
                    Adresse email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-6 py-3 rounded-full bg-[#F8FBFA] border-2 border-transparent focus:border-[#075D9A] outline-none transition-colors duration-300"
                    placeholder="contact@exemple.tn"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#17324D] mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-6 py-3 rounded-full bg-[#F8FBFA] border-2 border-transparent focus:border-[#075D9A] outline-none transition-colors duration-300"
                    placeholder="+216 XX XXX XXX"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-[#17324D] mb-2">
                    Sujet *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-6 py-3 rounded-full bg-[#F8FBFA] border-2 border-transparent focus:border-[#075D9A] outline-none transition-colors duration-300 cursor-pointer"
                  >
                    <option value="">Choisir un sujet</option>
                    <option value="general">Question générale</option>
                    <option value="order">Commande</option>
                    <option value="product">Produit</option>
                    <option value="wholesale">Commande professionnelle</option>
                    <option value="press">Presse et média</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#17324D] mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-6 py-4 rounded-3xl bg-[#F8FBFA] border-2 border-transparent focus:border-[#075D9A] outline-none transition-colors duration-300 resize-none"
                  placeholder="Écrivez votre message..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#075D9A] text-white py-4 rounded-full hover:bg-[#B86F3B] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group"
              >
                <span>Envoyer le message</span>
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </form>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Visit Us */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#075D9A] to-[#B86F3B] rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-[#17324D] mb-2">Localisation</h3>
                  <p className="text-[#5E6F73] leading-relaxed">
                    Tunisie<br />
                    Livraison partout en Tunisie
                  </p>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="aspect-video rounded-2xl overflow-hidden bg-[#E9D8BE]">
                <img
                  src="https://images.unsplash.com/photo-1607614372586-72d399dc57b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwaG9tZSUyMGRlY29yJTIwbWVkaXRlcnJhbmVhbnxlbnwxfHx8fDE3ODA0NDEyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Localisation en Tunisie"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#075D9A] to-[#B86F3B] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-[#17324D] mb-4">Disponibilité</h3>
                  <div className="space-y-3 text-[#5E6F73]">
                    <div className="flex justify-between">
                      <span>Lundi - vendredi</span>
                      <span className="font-medium text-[#17324D]">9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Samedi</span>
                      <span className="font-medium text-[#17324D]">10:00 - 16:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimanche</span>
                      <span className="font-medium text-[#17324D]">Fermé</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ CTA */}
            <div className="bg-gradient-to-br from-[#075D9A] to-[#B86F3B] rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-serif mb-3">Questions fréquentes</h3>
              <p className="text-white/90 mb-6">
                Livraison partout en Tunisie, paiement à la livraison, carte bancaire et emballage sécurisé pour chaque pièce.
              </p>
              <button className="bg-white text-[#075D9A] px-8 py-3 rounded-full hover:bg-[#F8FBFA] transition-colors duration-300 font-medium">
                Voir les réponses
              </button>
            </div>
          </motion.div>
        </div>

        {/* Social Media Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-white rounded-3xl p-12 text-center shadow-xl"
        >
          <h2 className="text-3xl font-serif text-[#17324D] mb-4">Suivez notre univers</h2>
          <p className="text-lg text-[#5E6F73] mb-8 max-w-2xl mx-auto">
            Retrouvez nos collections, inspirations de table et nouveautés sur nos réseaux.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="#"
              className="w-14 h-14 bg-gradient-to-br from-[#075D9A] to-[#B86F3B] rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 text-white"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-14 h-14 bg-gradient-to-br from-[#075D9A] to-[#B86F3B] rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 text-white"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-14 h-14 bg-gradient-to-br from-[#075D9A] to-[#B86F3B] rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 text-white"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
